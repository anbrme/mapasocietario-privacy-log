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
| `review` | Counts from the 24-hour review of our records, per store. `0` everywhere means no record keeps who searched what. A store that could not be read says `read: false`; it never counts as `0`. |
| `prev_hash` | `entry_hash` of the previous entry. |
| `entry_hash` | SHA-256 of this entry without `entry_hash`, keys sorted. |

When `unchanged` is `false`, the code or settings that decide what we record have changed since the last full test. The entry says so, and stays that way until a new full test has run.

## What the fingerprint covers

- Every deployed line of our code that writes a record: log lines, analytics events, data-store writes (databases, key-value stores, object storage, caches) and logging configuration, in the website, the API worker and the backend (all the code our server's services run, and the service definitions themselves: a new service changes the fingerprint).
- The logging configuration of our server: web server log formats, log rotation, application and database log settings.
- The settings of outside services that could record on our behalf: Google Analytics data collection and retention, Cloudflare log settings.

The fingerprint publishes hashes, not our code.

## What the daily review looks for

The shapes a search leaves when it is recorded: a company page address instead of a page type, a group key or a typed query in a stored address, a search term or a company name in analytics.

## Published exceptions

**ES** · Fuera de estas cinco excepciones, ningún registro guarda qué se consultó junto a quién lo consultó:

1. **Un informe que compras:** el pedido nombra la empresa, para poder entregarlo.
2. **Lo que guardas en tu cuenta:** historias, empresas vigiladas y alertas son tuyas por diseño.
3. **Peticiones rechazadas de máquinas:** se guardan 90 días como registros de seguridad, con lo que pedían.
4. **Contadores del límite de uso del día:** huellas con clave (HMAC-SHA-256) de lo abierto hoy, nunca nombres. La clave cambia cada día UTC y se borra al acabar el día con el contador; Cloudflare puede recuperar ese almacenamiento hasta 30 días.
5. **El recuento de demanda**, que decide qué páginas de empresa mostramos a los buscadores: por cada empresa, el número de días (UTC) en que la abrieron al menos tres visitantes distintos, y el mes del primero. Ni quién, ni a qué hora, ni una serie por días.

**EN** · Outside these five exceptions, no record keeps what was looked up together with who looked it up:

1. **A report you buy:** the order names the company, so that it can be delivered.
2. **What you save to your account:** stories, monitored companies and alerts are yours by design.
3. **Refused machine requests:** kept 90 days as security records, with what they asked for.
4. **Today's usage-limit counters:** keyed fingerprints (HMAC-SHA-256) of what was opened today, never names. The key changes every UTC day and is deleted with the counter at the end of the day; Cloudflare can restore that storage for up to 30 days.
5. **The demand tally**, which decides which company pages we show to search engines: for each company, the number of UTC days on which at least three distinct visitors opened it, and the month of the first. Not who, not when in the day, no day-by-day series.

## Verify the chain

```
node verify.mjs
```

It recomputes every `entry_hash` and checks that each `prev_hash` matches the entry before it. Node 18 or later, no dependencies.

Contact: mapasocietario@ncdata.eu · Nurnberg Consulting SL
