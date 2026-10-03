# Release и staging

<span class="doc-kicker">READINESS</span>

<div class="doc-lead">Готовность repository-side MVP/tooling не означает, что production acceptance уже фактически пройден.</div>

## Два разных понятия

<div class="system-grid">
<div class="system-card system-card--accent"><h3>Repository readiness</h3><p>Code, tests, CI, runbooks, preflight и acceptance tooling.</p></div>
<div class="system-card"><h3>Environment acceptance</h3><p>Реальный staging, providers, mailbox, storage, scanner, alerts, backup/restore и independent review.</p></div>
<div class="system-card"><h3>Promotion</h3><p>Решение pilot/production только после final approval record.</p></div>
</div>

## Release flow

<div class="flow-strip">
<div class="flow-node"><small>01</small><strong>Exact SHA + digest</strong></div>
<div class="flow-node"><small>02</small><strong>Staging deploy</strong></div>
<div class="flow-node"><small>03</small><strong>Migration/rollback</strong></div>
<div class="flow-node"><small>04</small><strong>Provider tests</strong></div>
<div class="flow-node"><small>05</small><strong>E2E + evidence</strong></div>
<div class="flow-node"><small>06</small><strong>Final approval</strong></div>
</div>

## Что проверяется в реальной среде
- release identity;
- migration;
- rollback rehearsal;
- backup/restore;
- network policy;
- encrypted PII mode;
- log privacy;
- SMTP;
- private storage;
- scanner CLEAN + EICAR;
- external alert delivery;
- Front/Admin E2E;
- notification delivery;
- independent approval.

Полная последовательность: [Final release handoff](/docs/06-operations/FINAL_RELEASE_HANDOFF).
