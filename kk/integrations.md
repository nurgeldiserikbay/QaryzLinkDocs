# Интеграциялар және environment variables

<span class="doc-kicker">INTEGRATION MAP</span>

<div class="doc-lead">Кейбір integration runtime үшін міндетті, кейбірі feature gate артында default-off.</div>

## Integration status

<div class="status-matrix">
<div class="status-card"><span class="status status--required">REQUIRED</span><h3>PostgreSQL</h3><p>DATABASE_URL, migrations, backup/restore.</p></div>
<div class="status-card"><span class="status status--required">REQUIRED</span><h3>Redis</h3><p>REDIS_URL current startup config үшін қажет.</p></div>
<div class="status-card"><span class="status status--ready">OPTIONAL</span><h3>SMTP</h3><p>Email verification/reset және notifications.</p></div>
<div class="status-card"><span class="status status--off">DEFAULT-OFF</span><h3>Evidence storage</h3><p>Private S3 + scanner + retention acceptance.</p></div>
<div class="status-card"><span class="status status--off">DEFAULT-OFF</span><h3>Identity provider</h3><p>Provider + legal/privacy acceptance.</p></div>
<div class="status-card"><span class="status status--off">DEFAULT-OFF</span><h3>Contract PDF</h3><p>Approved templates + trusted renderer.</p></div>
<div class="status-card"><span class="status status--off">DEFAULT-OFF</span><h3>Evidence signer</h3><p>KMS/HSM signer acceptance.</p></div>
<div class="status-card"><span class="status status--off">DEFAULT-OFF</span><h3>Timestamp</h3><p>External authority acceptance.</p></div>
<div class="status-card"><span class="status status--required">PRODUCTION</span><h3>Monitoring</h3><p>Metrics + external alert delivery.</p></div>
</div>

## Core backend env

| Variable | Мақсаты | Secret |
|---|---|---:|
| DATABASE_URL | PostgreSQL | Иә |
| REDIS_URL | Redis | Иә/credentialed |
| JWT_ACCESS_SECRET | JWT signing | Иә |
| METRICS_ACCESS_TOKEN | Protected metrics | Иә |
| CORS_ALLOWED_ORIGINS | Browser origins | Жоқ |
| TRUST_PROXY_HOPS | Proxy topology | Жоқ |
| EXPOSE_API_DOCS | Non-prod docs gate | Жоқ |

## Front
~~~text
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
~~~

## Admin
~~~text
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
QARYZLINK_API_BASE_URL=https://api.example.com
METRICS_ACCESS_TOKEN=<secret>
SUPPORT_STAFF_TOKEN=<secret>
~~~

Толық reference: [Environment & integrations](/docs/06-operations/ENV_INTEGRATIONS_REFERENCE).
