# Mapa Societario: daily privacy log

**ES** · Cada día publicamos aquí una huella de todo lo que decide qué registra [Mapa Societario](https://mapasocietario.es) y el resultado de una revisión de los registros de las últimas 24 horas. Cada entrada incluye el hash de la anterior: la historia no se puede reescribir sin romper la cadena, y GitHub fecha cada día de forma independiente.

**EN** · Every day we publish here a fingerprint of everything that decides what [Mapa Societario](https://mapasocietario.es) records, and the result of a review of the last 24 hours of records. Each entry carries the hash of the previous one: the history cannot be rewritten without breaking the chain, and GitHub timestamps each day independently.

> **Status:** setting up. The first entry is published after the first full test.

## What an entry says

| Field | Meaning |
| --- | --- |
| `date` | The day checked (UTC). |
| `run_at` | When the check ran (UTC). |
| `fingerprint` | SHA-256 of the recording surface (below), as deployed that day. |
| `baseline_test` | The date of the last full test, and the fingerprint it ran against. |
| `unchanged` | `true` when today's fingerprint equals the one the last full test ran against. |
| `review` | Counts from the 24-hour review of our records, per store. `0` everywhere means no record keeps what was searched. |
| `prev_hash` | `entry_hash` of the previous entry. |
| `entry_hash` | SHA-256 of this entry without `entry_hash`, keys sorted. |

When `unchanged` is `false`, the code or settings that decide what we record have changed since the last full test. The entry says so, and stays that way until a new full test has run.

## What the fingerprint covers

- Every deployed line of our code that writes a record: log lines, analytics events and logging configuration, in the website, the API worker and the backend.
- The logging configuration of our server: web server log formats, log rotation, application and database log settings.
- The settings of outside services that could record on our behalf: Google Analytics data collection and retention, Cloudflare log settings.

The fingerprint publishes hashes, not our code.

## What the daily review looks for

The shapes a search leaves when it is recorded: a company page address instead of a page type, a group key or a typed query in a stored address, a search term or a company name in analytics.

## Verify the chain

```
node verify.mjs
```

It recomputes every `entry_hash` and checks that each `prev_hash` matches the entry before it. Node 18 or later, no dependencies.

Contact: mapasocietario@ncdata.eu · Nurnberg Consulting SL
