# Mapa Societario: registro diario de privacidad / daily privacy log

[Español](#español) · [English](#english)

## Español

Cada día publicamos aquí una huella de todo lo que decide qué registra [Mapa Societario](https://mapasocietario.es) y el resultado de una revisión de los registros de las últimas 24 horas. Cada entrada incluye el hash de la anterior: la historia no se puede reescribir sin romper la cadena, y GitHub fecha cada día de forma independiente.

> **Estado:** primera entrada el 12 de octubre de 2026, tras la primera prueba completa. Hasta aproximadamente el 11 de noviembre de 2026, nuestro proveedor de red conserva registros de peticiones de versiones anteriores de nuestra web y aplicación que incluyen el nombre de una empresa en la dirección; la revisión diaria los contabiliza bajo `cloudflare:ncdata.eu`, y Google Analytics se revisa con un día de retraso.

### Qué indica cada entrada

| Campo | Significado |
| --- | --- |
| `date` | El día revisado (UTC). |
| `run_at` | Cuándo se ejecutó la comprobación (UTC). |
| `fingerprint` | SHA-256 del conjunto de código y configuración que determina qué se registra (descrito más abajo), tal como estaba desplegado ese día. |
| `baseline_test` | La fecha de la última prueba completa y la huella sobre la que se ejecutó. |
| `unchanged` | `true` cuando la huella de hoy coincide con la de la última prueba completa. |
| `review` | Recuentos de la revisión de los registros de las últimas 24 horas, por almacén. Un `0` en todos significa que ningún registro guarda quién buscó qué. Un almacén que no se pudo leer indica `read: false`; nunca se contabiliza como `0`. |
| `prev_hash` | El `entry_hash` de la entrada anterior. |
| `entry_hash` | SHA-256 de esta entrada sin `entry_hash`, con las claves ordenadas. |

Cuando `unchanged` es `false`, el código o la configuración que determinan qué registramos han cambiado desde la última prueba completa. La entrada lo indica y seguirá haciéndolo hasta que se ejecute una nueva prueba completa.

### Qué abarca la huella

- Cada línea desplegada de nuestro código que escribe un registro: líneas de log, eventos de analítica, escrituras en almacenes de datos (bases de datos, almacenes clave-valor, almacenamiento de objetos y cachés) y configuración de registros, en la web, el worker de la API y el backend (todo el código que ejecutan los servicios de nuestro servidor y las propias definiciones de esos servicios: un servicio nuevo cambia la huella).
- La configuración de registros de nuestro servidor: formatos de los registros del servidor web, rotación de registros y configuración de los registros de las aplicaciones y las bases de datos.
- La configuración de servicios externos que podrían registrar datos en nuestro nombre: recogida y conservación de datos de Google Analytics y configuración de registros de Cloudflare.

La huella publica hashes, no nuestro código.

### Qué busca la revisión diaria

Los rastros que deja una búsqueda cuando se registra: la dirección de una página de empresa en lugar de un tipo de página, una clave de grupo o una consulta escrita en una dirección almacenada, un término de búsqueda o el nombre de una empresa en los datos de analítica.

### Excepciones publicadas

Fuera de estas seis excepciones, ningún registro guarda qué se consultó junto a quién lo consultó:

1. **Un informe que compras:** el pedido nombra la empresa, para poder prepararlo y entregarlo. Se guarda cifrada en nuestros servidores; una persona de nuestro equipo solo la consulta si el pedido necesita cuentas anuales gestionadas a mano o si nos pides ayuda, y cada consulta queda anotada en el pedido.
2. **Lo que guardas tú:** tus historias se guardan solo en tu navegador, o en el archivo que descargas, y no nos llegan. Las empresas vigiladas y las alertas que activas se guardan en tu cuenta, porque son tuyas por diseño.
3. **Lo que nos envías:** las solicitudes de verificación y los mensajes de contacto contienen lo que escribiste.
4. **Peticiones rechazadas de máquinas:** se guardan 90 días como registros de seguridad, con lo que pedían.
5. **Contadores del límite de uso del día:** huellas con clave (HMAC-SHA-256) de lo abierto hoy, nunca nombres. La clave cambia cada día UTC y se borra al acabar el día con el contador; Cloudflare puede recuperar ese almacenamiento hasta 30 días.
6. **El recuento de demanda**, que decide qué páginas de empresa mostramos a los buscadores: por cada empresa, el número de días (UTC) en que la abrieron al menos tres visitantes distintos, y el mes del primero. Ni quién, ni a qué hora, ni una serie por días.

### Cómo verificar la cadena

```sh
node verify.mjs
```

El programa vuelve a calcular cada `entry_hash` y comprueba que cada `prev_hash` coincide con el de la entrada anterior. Requiere Node 18 o posterior, sin dependencias.

Contacto: mapasocietario@ncdata.eu · Nurnberg Consulting SL

---

## English

Every day we publish here a fingerprint of everything that decides what [Mapa Societario](https://mapasocietario.es) records, and the result of a review of the last 24 hours of records. Each entry carries the hash of the previous one: the history cannot be rewritten without breaking the chain, and GitHub timestamps each day independently.

> **Status:** first entry 12 October 2026, after the first full test. Until about 11 November 2026 our network provider still holds request records from older versions of our site and app that name a company in the address; the daily review counts them under `cloudflare:ncdata.eu`, and Google Analytics is reviewed a day late.

### What an entry says

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

### What the fingerprint covers

- Every deployed line of our code that writes a record: log lines, analytics events, data-store writes (databases, key-value stores, object storage, caches) and logging configuration, in the website, the API worker and the backend (all the code our server's services run, and the service definitions themselves: a new service changes the fingerprint).
- The logging configuration of our server: web server log formats, log rotation, application and database log settings.
- The settings of outside services that could record on our behalf: Google Analytics data collection and retention, Cloudflare log settings.

The fingerprint publishes hashes, not our code.

### What the daily review looks for

The shapes a search leaves when it is recorded: a company page address instead of a page type, a group key or a typed query in a stored address, a search term or a company name in analytics.

### Published exceptions

Outside these six exceptions, no record keeps what was looked up together with who looked it up:

1. **A report you buy:** the order names the company, so that the report can be prepared and delivered. It is stored encrypted on our servers; a person on our team looks at it only if the order needs annual accounts handled by hand or you ask us for help, and every look is recorded in the order.
2. **What you save yourself:** your stories are kept only in your browser, or in the file you download, and never reach us. The companies you monitor and the alerts you switch on are kept in your account, because they are yours by design.
3. **What you send us:** verification requests and contact messages hold what you wrote.
4. **Refused machine requests:** kept 90 days as security records, with what they asked for.
5. **Today's usage-limit counters:** keyed fingerprints (HMAC-SHA-256) of what was opened today, never names. The key changes every UTC day and is deleted with the counter at the end of the day; Cloudflare can restore that storage for up to 30 days.
6. **The demand tally**, which decides which company pages we show to search engines: for each company, the number of UTC days on which at least three distinct visitors opened it, and the month of the first. Not who, not when in the day, no day-by-day series.

### Verify the chain

```sh
node verify.mjs
```

It recomputes every `entry_hash` and checks that each `prev_hash` matches the entry before it. Node 18 or later, no dependencies.

Contact: mapasocietario@ncdata.eu · Nurnberg Consulting SL
