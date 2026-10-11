// Verifies the daily privacy log: every entry_hash is the SHA-256 of the entry
// without entry_hash (keys sorted, no spaces), and every prev_hash is the
// entry_hash of the entry before it. Exit code 0 = the chain holds.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';

export const GENESIS = '0'.repeat(64);

export function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

export function entryHash(entry) {
  const { entry_hash: _ignored, ...rest } = entry;
  return createHash('sha256').update(canonical(rest)).digest('hex');
}

export function verifyChain(entries) {
  let prev = GENESIS;
  for (const [i, entry] of entries.entries()) {
    if (entry.prev_hash !== prev) return { ok: false, at: i, reason: 'prev_hash does not match the entry before' };
    if (entryHash(entry) !== entry.entry_hash) return { ok: false, at: i, reason: 'entry_hash does not match the entry' };
    prev = entry.entry_hash;
  }
  return { ok: true, entries: entries.length };
}

function readLog(dir = new URL('./log/', import.meta.url)) {
  return readdirSync(dir).filter((f) => f.endsWith('.json')).sort()
    .map((f) => JSON.parse(readFileSync(new URL(f, dir), 'utf8')));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = verifyChain(readLog());
  console.log(result.ok ? `OK: ${result.entries} entries, chain intact` : `BROKEN at entry ${result.at}: ${result.reason}`);
  process.exit(result.ok ? 0 : 1);
}
