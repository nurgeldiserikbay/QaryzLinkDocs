# Деректер базасы

<span class="doc-kicker">DATA MODEL / ERD OVERVIEW</span>

<div class="doc-lead">PostgreSQL — QaryzLink transactional source of truth. Төмендегі карта негізгі domain entity-лерді түсіндіреді.</div>

## Негізгі entity картасы

<div class="entity-map">
<div class="entity-card"><code>User</code><p>Account және auth ownership.</p></div>
<div class="entity-card"><code>Profile</code><p>Party metadata және privacy settings.</p></div>
<div class="entity-card"><code>BorrowerRequest</code><p>Matching/request parameters.</p></div>
<div class="entity-card"><code>Proposal</code><p>Lender terms versions.</p></div>
<div class="entity-card"><code>ContractVersion</code><p>Accepted terms snapshot.</p></div>
<div class="entity-card"><code>FundingAttempt</code><p>Funding evidence + confirmation.</p></div>
<div class="entity-card"><code>ScheduleVersion</code><p>Repayment schedule version.</p></div>
<div class="entity-card"><code>ScheduleItem</code><p>Due date, amounts, status.</p></div>
<div class="entity-card"><code>PaymentRecord</code><p>Payment claim + confirmation.</p></div>
<div class="entity-card"><code>LedgerEntry</code><p>Confirmed allocation event.</p></div>
<div class="entity-card"><code>Evidence</code><p>Private artifact metadata/hash.</p></div>
<div class="entity-card"><code>Dispute</code><p>Disagreement lifecycle.</p></div>
<div class="entity-card"><code>NotificationOutbox</code><p>Transactional delivery intent.</p></div>
<div class="entity-card"><code>Consent/Privacy</code><p>Visibility/disclosure grants.</p></div>
<div class="entity-card"><code>Audit</code><p>Operational/security trace.</p></div>
<div class="entity-card"><code>ClosureCertificate</code><p>Final closure snapshot.</p></div>
</div>

## Relationship summary

<div class="flow-strip">
<div class="flow-node"><small>1</small><strong>User/Profile</strong></div>
<div class="flow-node"><small>2</small><strong>Request</strong></div>
<div class="flow-node"><small>3</small><strong>Proposal</strong></div>
<div class="flow-node"><small>4</small><strong>Contract</strong></div>
<div class="flow-node"><small>5</small><strong>Schedule + Ledger</strong></div>
<div class="flow-node"><small>6</small><strong>Closure</strong></div>
</div>

## Data invariants
- confirmed rows history ретінде жойылмайды;
- versioned terms overwrite емес, жаңа version;
- correction reversal арқылы;
- evidence binary storage-да, DB-де metadata/hash;
- calculations policy version және rounding rule сақтайды.

Толық ERD: [Data model](/docs/02-architecture/DATA_MODEL).
