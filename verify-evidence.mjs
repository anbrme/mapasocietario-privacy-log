#!/usr/bin/env node
// Verifies the whole evidence chain of the daily privacy log, beside
// verify.mjs (which it reuses for the daily chain):
//   1. the daily entries chain (every entry_hash and prev_hash);
//   2. every hourly file a daily entry anchors: its lines chain from that
//      day's entry, and their count and last hash match the anchor; the
//      latest day's file, not yet anchored, chains too;
//   3. every RFC 3161 token in timestamps/: `openssl ts -verify` over the
//      entry's entry_hash, against the authority's root in timestamps/certs/;
//      a day without a token is named;
//   4. the baselines history: baseline.json is the latest in baselines/.
// Exit code 0 = everything checked holds; 1 = something failed; 2 = tokens
// could not be checked (openssl missing). Node 18 or later and openssl.
//
// What this does not establish: that every possible logging location was
// inspected. It checks that the published reports are intact, linked and
// timestamped, as the README explains.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { entryHash, verifyChain } from './verify.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const TSAS = ['freetsa', 'digicert'];
const at = (...parts) => join(ROOT, ...parts);
const listing = (dir) => (existsSync(at(dir)) ? readdirSync(at(dir)) : []);
const readJson = (...parts) => JSON.parse(readFileSync(at(...parts), 'utf8'));
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

const out = [];
let failed = false;
let unchecked = false;
const fail = (line) => { failed = true; out.push(line); };

function readEntries() {
  return listing('log').filter((n) => /^\d{4}-\d{2}-\d{2}\.json$/.test(n)).sort().map((n) => readJson('log', n));
}

function readHourly(date) {
  const file = at('hourly', `${date}.jsonl`);
  if (!existsSync(file)) return null;
  return readFileSync(file, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
}

function hourlyChain(lines, anchorHash) {
  let prev = anchorHash;
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].prev_hash !== prev) return `line ${i}: prev_hash does not match the line before`;
    if (entryHash(lines[i]) !== lines[i].entry_hash) return `line ${i}: entry_hash does not match the line`;
    prev = lines[i].entry_hash;
  }
  return null;
}

function checkHourly(entries) {
  const byDate = new Map(entries.map((e) => [e.date, e]));
  const anchored = new Set();
  for (const e of entries.filter((x) => x.hourly)) {
    const { date, lines: count, last_hash: last } = e.hourly;
    anchored.add(date);
    const lines = readHourly(date);
    const anchor = byDate.get(date);
    if (!lines) { fail(`hourly ${date}: FAILED, anchored by ${e.date} but the file is missing`); continue; }
    if (!anchor) { fail(`hourly ${date}: FAILED, anchored by ${e.date} but there is no entry for ${date}`); continue; }
    const broken = hourlyChain(lines, anchor.entry_hash);
    if (broken) { fail(`hourly ${date}: FAILED, ${broken}`); continue; }
    if (lines.length !== count || lines[lines.length - 1]?.entry_hash !== last) {
      fail(`hourly ${date}: FAILED, the file does not match its anchor in ${e.date} (${plural(lines.length, 'line')}, anchor says ${count})`);
      continue;
    }
    out.push(`hourly ${date}: OK, ${plural(lines.length, 'line')}, anchored by ${e.date}`);
  }
  const latest = entries[entries.length - 1];
  const open = latest && !anchored.has(latest.date) ? readHourly(latest.date) : null;
  if (open) {
    const broken = hourlyChain(open, latest.entry_hash);
    if (broken) fail(`hourly ${latest.date}: FAILED, ${broken}`);
    else out.push(`hourly ${latest.date}: OK, ${plural(open.length, 'line')}, not yet anchored (its timestamps come with the next daily entry)`);
  }
}

function tokenHolds(file, digest, tsa) {
  try {
    const stdout = execFileSync('openssl', ['ts', '-verify', '-digest', digest, '-in', file, '-CAfile', at('timestamps', 'certs', `${tsa}.pem`)], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    });
    return /Verification: OK/.test(stdout);
  } catch (error) {
    if (error.code === 'ENOENT') throw error;
    return false;
  }
}

function checkTimestamps(entries) {
  const present = new Set(listing('timestamps').filter((n) => n.endsWith('.tsr')));
  const stampedDates = [...present].map((n) => n.slice(0, 10)).sort();
  if (!stampedDates.length) { out.push('timestamps: none yet'); return; }
  const first = stampedDates[0];
  const earlier = entries.filter((e) => e.date < first);
  if (earlier.length) out.push(`timestamps: ${plural(earlier.length, 'earlier day')} before the first token (${first})`);
  for (const e of entries.filter((x) => x.date >= first)) {
    const parts = TSAS.map((tsa) => {
      const name = `${e.date}.${tsa}.tsr`;
      if (!present.has(name)) return `${tsa} MISSING`;
      return `${tsa} ${tokenHolds(at('timestamps', name), e.entry_hash, tsa) ? 'OK' : 'FAILED'}`;
    });
    const line = `timestamps ${e.date}: ${parts.join(', ')}`;
    if (parts.some((p) => p.endsWith('FAILED'))) fail(line); else out.push(line);
  }
}

const sameJson = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function checkBaselines() {
  const history = listing('baselines').filter((n) => n.endsWith('.json')).map((n) => readJson('baselines', n))
    .sort((a, b) => String(a.set_at).localeCompare(String(b.set_at)));
  if (!history.length) { out.push('baselines: no history yet'); return; }
  const latest = history[history.length - 1];
  const current = existsSync(at('baseline.json')) ? readJson('baseline.json') : null;
  if (!current || !sameJson(current, latest)) {
    fail(`baselines: FAILED, baseline.json is not the latest in the history (${latest.set_at})`);
    return;
  }
  const noReason = history.filter((b) => !b.reason).length;
  out.push(`baselines: OK, ${history.length} in the history, baseline.json is the latest${noReason ? ` (${noReason} without a reason, set before reasons were required)` : ''}`);
}

const entries = readEntries();
const daily = verifyChain(entries);
if (daily.ok) out.push(`daily chain: OK, ${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`);
else fail(`daily chain: FAILED at entry ${daily.at}: ${daily.reason}`);
checkHourly(entries);
try {
  checkTimestamps(entries);
} catch {
  unchecked = true;
  out.push('timestamps: NOT CHECKED, openssl was not found');
}
checkBaselines();

out.push(`RESULT: ${failed ? 'FAILED' : unchecked ? 'INCOMPLETE' : 'OK'}`);
process.stdout.write(`${out.join('\n')}\n`);
process.exitCode = failed ? 1 : unchecked ? 2 : 0;
