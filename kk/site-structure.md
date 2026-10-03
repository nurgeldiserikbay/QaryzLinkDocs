# Сайт құрылымы

<span class="doc-kicker">INFORMATION ARCHITECTURE</span>

<div class="doc-lead">QaryzLink үш негізгі interface-тен тұрады: public/user Front, internal Admin және бөлек Backend API.</div>

## Public және user pages

<div class="route-map">
<div class="route-group"><h3>Public</h3><ul><li>/ — landing</li><li>/register</li><li>/login</li><li>/forgot-password</li><li>/reset-password</li><li>/verify-email</li></ul></div>
<div class="route-group"><h3>Authenticated user</h3><ul><li>/dashboard</li><li>/requests/new</li><li>/requests/[id]</li><li>/marketplace</li><li>/notifications</li><li>/settings</li><li>contract / funding / repayment views</li></ul></div>
</div>

## Landing міндеті
Landing өнімді, borrower/lender рөлдерін, lifecycle, privacy/security boundary және FAQ-ты түсіндіреді; register/login CTA береді.

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
Admin public user application емес. Ол health/readiness, aggregate metrics, audit visibility, evidence/storage/notification counters және support-gated moderation үшін.

| Бөлік | Repo |
|---|---|
| Landing / user cabinet | QaryzLinkFront |
| Internal admin | QaryzLinkAdmin |
| API / domain | QaryzLinkBack |
| Docs | QaryzLinkDocs |
