# Deployment

<span class="doc-kicker">SERVER TOPOLOGY</span>

<div class="doc-lead">При deployment Front, Back, Admin и private infrastructure рассматриваются как отдельные security boundaries.</div>

## Рекомендуемая topology

<div class="system-grid">
<div class="system-card system-card--accent"><h3>qaryzlink.kz</h3><p>QaryzLinkFront — public HTTPS.</p></div>
<div class="system-card system-card--accent"><h3>api.qaryzlink.kz</h3><p>QaryzLinkBack — controlled API ingress.</p></div>
<div class="system-card system-card--accent"><h3>admin.qaryzlink.kz</h3><p>QaryzLinkAdmin — restricted origin.</p></div>
<div class="system-card"><h3>PostgreSQL</h3><p>Private network only.</p></div>
<div class="system-card"><h3>Redis</h3><p>Private network only.</p></div>
<div class="system-card"><h3>Object storage</h3><p>Private bucket; signed access only.</p></div>
</div>

## Deployment sequence

<div class="flow-strip">
<div class="flow-node"><small>01</small><strong>Freeze release</strong></div>
<div class="flow-node"><small>02</small><strong>Backup + migrate</strong></div>
<div class="flow-node"><small>03</small><strong>Deploy Back</strong></div>
<div class="flow-node"><small>04</small><strong>Deploy Front/Admin</strong></div>
<div class="flow-node"><small>05</small><strong>Smoke + E2E</strong></div>
<div class="flow-node"><small>06</small><strong>Acceptance</strong></div>
</div>

## Обязательная infra
- HTTPS + TLS;
- PostgreSQL 17;
- Redis;
- secret store;
- backup;
- monitoring/alerting;
- private network policy;
- scheduler/CronJobs.

Canonical runbooks:
- [Backend deployment](/docs/06-operations/DEPLOYMENT)
- [Front deployment](/docs/06-operations/FRONT_DEPLOYMENT)
- [Admin deployment](/docs/06-operations/ADMIN_DEPLOYMENT)
