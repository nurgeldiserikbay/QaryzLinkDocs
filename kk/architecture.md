# Архитектура

<span class="doc-kicker">SYSTEM ARCHITECTURE</span>

<div class="doc-lead">QaryzLink бастапқыда modular monolith: domain boundaries нақты, бірақ ерте microservice complexity жоқ.</div>

## System map

<div class="system-grid">
<div class="system-card system-card--accent"><h3>QaryzLinkFront</h3><p>Next.js public landing + authenticated user app.</p></div>
<div class="system-card system-card--accent"><h3>QaryzLinkAdmin</h3><p>Next.js restricted operational console.</p></div>
<div class="system-card system-card--accent"><h3>QaryzLinkBack</h3><p>NestJS/Fastify API, domain, workers, integrations.</p></div>
<div class="system-card"><h3>PostgreSQL</h3><p>Transactional source of truth.</p></div>
<div class="system-card"><h3>Redis</h3><p>Runtime dependency / future queues.</p></div>
<div class="system-card"><h3>Object Storage</h3><p>Private evidence binaries + signed access.</p></div>
<div class="system-card"><h3>SMTP</h3><p>Email verification/reset/notifications.</p></div>
<div class="system-card"><h3>Monitoring</h3><p>Privacy-safe metrics + alerts.</p></div>
<div class="system-card"><h3>External providers</h3><p>Identity, PDF, signer, timestamp, scanner.</p></div>
</div>

## Backend layers

<div class="layer-stack">
<div class="layer-row"><strong>API</strong><span>Controllers, DTO, auth guards, rate limits</span></div>
<div class="layer-row"><strong>Application</strong><span>Use-cases, orchestration, transactions</span></div>
<div class="layer-row"><strong>Domain</strong><span>Business invariants, state transitions, calculations</span></div>
<div class="layer-row"><strong>Persistence</strong><span>Prisma/PostgreSQL repositories</span></div>
<div class="layer-row"><strong>Integration</strong><span>SMTP, storage, scanner, PDF, signer, identity provider</span></div>
<div class="layer-row"><strong>Operations</strong><span>CronJobs, migrations, preflight, metrics, acceptance tooling</span></div>
</div>

Толық: [System architecture](/docs/02-architecture/SYSTEM_ARCHITECTURE).
