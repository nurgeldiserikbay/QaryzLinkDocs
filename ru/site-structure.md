# Структура сайта

<span class="doc-kicker">INFORMATION ARCHITECTURE</span>

<div class="doc-lead">QaryzLink состоит из трёх основных интерфейсных частей: public/user Front, internal Admin и отдельного Backend API.</div>

## Public и user pages

<div class="route-map">
<div class="route-group"><h3>Public</h3><ul><li>/ — landing</li><li>/register</li><li>/login</li><li>/forgot-password</li><li>/reset-password</li><li>/verify-email</li></ul></div>
<div class="route-group"><h3>Authenticated user</h3><ul><li>/dashboard</li><li>/requests/new</li><li>/requests/[id]</li><li>/marketplace</li><li>/notifications</li><li>/settings</li><li>contract / funding / repayment views</li></ul></div>
</div>

## Задача landing
Landing объясняет продукт, роли borrower/lender, lifecycle, privacy/security boundary, FAQ и даёт CTA на регистрацию/вход.

## User journey

<div class="flow-strip">
<div class="flow-node"><small>01</small><strong>Register</strong></div>
<div class="flow-node"><small>02</small><strong>Verify email</strong></div>
<div class="flow-node"><small>03</small><strong>Create request</strong></div>
<div class="flow-node"><small>04</small><strong>Invite / match</strong></div>
<div class="flow-node"><small>05</small><strong>Agreement</strong></div>
<div class="flow-node"><small>06</small><strong>Manage lifecycle</strong></div>
</div>

## Admin
Admin не является публичным приложением. Он нужен для health/readiness, aggregate metrics, audit visibility, evidence/storage/notification counters и support-gated moderation.

| Часть | Repo |
|---|---|
| Landing / user cabinet | QaryzLinkFront |
| Internal admin | QaryzLinkAdmin |
| API / domain | QaryzLinkBack |
| Docs | QaryzLinkDocs |
