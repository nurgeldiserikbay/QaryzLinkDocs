# Contract amendments, N+1 signing and guarded financial transition

Жаңартылған күні: 2026-09-30.

QaryzLink contract amendment lifecycle existing signed/payment history-ді rewrite етпейді. Amendment алдымен immutable proposal + dual-party approval болады, кейін жаңа ContractVersion N+1 ретінде қайта қол қойылады.

## Feature gates

Default:

`CONTRACT_AMENDMENTS_ENABLED=false`

Proposal/list/approval осы gate арқылы басқарылады.

N+1 signing және activation үшін қосымша:

`CONTRACT_SIGNING_ENABLED=true`

қажет. Екі gate те legal/process acceptance аяқталмайынша default-off.

## Amendment purposes

Supported purpose values:

- `OTHER` — non-financial amendment;
- `TERMS_CHANGE` — bounded term/rate amendment;
- `SCHEDULE_CHANGE` — termDays-only repayment maturity change.

Principal және currency financial amendment арқылы өзгермейді.

## Proposal payload

Base request:

```json
{
  "purpose": "OTHER",
  "proposedDocumentHash": "<64 lowercase hex>"
}
```

`TERMS_CHANGE`:

```json
{
  "purpose": "TERMS_CHANGE",
  "proposedDocumentHash": "<64 lowercase hex>",
  "termDays": 60,
  "annualRateBps": 500
}
```

`termDays` немесе `annualRateBps` кемінде біреуі өзгеруі тиіс.

`SCHEDULE_CHANGE`:

```json
{
  "purpose": "SCHEDULE_CHANGE",
  "proposedDocumentHash": "<64 lowercase hex>",
  "termDays": 60
}
```

SCHEDULE_CHANGE annualRateBps қабылдамайды.

Backend current signed ContractVersion termsSnapshot-тан normalized full proposedTermsSnapshot жасайды. Ол amount/currency/policy metadata-ны inherit етеді және тек bounded financial fields-ті өзгертеді. Raw legal text amendment row-ға сақталмайды.

Participant-only amendment response raw snapshot орнына тек:

```json
{
  "proposedFinancialTerms": {
    "termDays": 60,
    "annualRateBps": 500
  }
}
```

түріндегі bounded view береді.

## Proposal and approval invariants

Proposal тек `SIGNED`, `FUNDING_PENDING` немесе `ACTIVE` contract үшін жасалады.

Persisted provenance:

- current signed `baseVersion`;
- `proposedVersion = baseVersion + 1`;
- purpose;
- immutable `proposedDocumentHash`;
- normalized proposedTermsSnapshot тек financial purpose үшін;
- creator relation;
- timestamps/status.

Borrower және lender бөлек explicit approve етеді. Same-party repeated approval idempotent. Екі approval жиналғанда amendment `APPROVED`.

## Start signing

Endpoint:

`POST /api/v1/contracts/:contractId/amendments/:amendmentId/start-signing`

Common checks:

1. exact currentVersion/baseVersion binding;
2. current base ContractVersion `SIGNED`;
3. proposedVersion = currentVersion + 1;
4. deterministic document source;
5. pinned KZ/RU PDF template identity inherited.

### OTHER

OTHER base termsSnapshot-ты өзгеріссіз inherit етеді.

### TERMS_CHANGE / SCHEDULE_CHANGE

Қазіргі financial transition әдейі conservative:

- contract `ACTIVE`;
- funding `CONFIRMED`;
- funding effectiveAt бар;
- Payment table-де осы contract үшін бір де бір repayment row жоқ;
- existing schedule items-та paidMinor = 0;
- principal және currency current contract-пен exact;
- amended maturity date funding effectiveAt + proposed termDays бойынша есептеледі және current UTC date-тен кейін болуы тиіс.

Осы guard-тардың бірі өтпесе:

`CONTRACT_AMENDMENT_TRANSITION_BLOCKED`

fail-closed беріледі.

Бұл first financial slice **already-paid contract-ты қайта есептемейді**. Confirmed, reversed, pending немесе disputed repayment history бар contract financial amendment activation-ға жіберілмейді.

## N+1 document source

New ContractVersion:

- `status=SIGNING`;
- `sourceAmendmentId` сақтайды;
- OTHER үшін base terms;
- financial purpose үшін normalized proposed terms;
- calculationPolicy amendment id/purpose/hash/baseVersion/baseDocumentHash provenance-ін bind етеді;
- documentHash base document hash + amendment document hash + N+1 terms + policy + pinned templates-ті canonical SHA-256 арқылы bind етеді.

Default contract/document routes тек `Contract.currentVersion`-ды көрсетеді. Unsigned N+1 candidate active contract document болып көрінбейді.

Explicit review routes:

- `GET /api/v1/contracts/:contractId/versions/:version/document-source`
- `GET /api/v1/contracts/:contractId/versions/:version/document-preview/:locale`
- `GET /api/v1/contracts/:contractId/versions/:version/document-pdf-capability`
- `POST /api/v1/contracts/:contractId/versions/:version/document-pdf/:locale`

## Signature and activation

Endpoint:

`POST /api/v1/contracts/:contractId/amendments/:amendmentId/sign`

Participant reviewed N+1 `documentHash` береді.

- same-party same-hash retry idempotent;
- бірінші signature currentVersion-ды өзгертпейді;
- exact post-activation retry де idempotent;
- екінші participant signature final activation-ды бір transaction ішінде орындайды.

### OTHER final activation

- N+1 → `SIGNED`;
- base → `SUPERSEDED`;
- `Contract.currentVersion=N+1`;
- amendment → `ACTIVATED`.

Funding/schedule/payment/ledger state өзгермейді.

### Financial final activation

Final signature алдында financial guard қайта орындалады. Сондықтан start-signing-нен кейін жаңа repayment пайда болса entire final-sign transaction rollback болады.

Successful financial activation:

1. барлық previous schedule versions оқылады;
2. paidMinor != 0 табылса fail-closed;
3. previous non-cancelled schedule items → `CANCELLED`;
4. жаңа immutable ScheduleVersion жасалады;
5. `sourceContractVersion=N+1`;
6. `sourceAmendmentId=<amendment id>`;
7. inputHash дәл normal schedule generation contract-ымен бірдей:
   - contractId;
   - current/new contractVersion;
   - signed N+1 documentHash;
   - original funding effectiveAt;
   - unchanged principal;
   - proposed termDays/rate;
   - schedule policy version;
8. N+1 → SIGNED, base → SUPERSEDED, currentVersion → N+1, amendment → ACTIVATED.

Жаңа Funding row жасалмайды. Existing funding effectiveAt сақталады.

## Repayment race boundary

Financial amendment `SIGNING` күйінде тұрғанда new repayment evidence:

`PAYMENT_CONFLICT`

арқылы rejected.

Contract row lock payment submission және amendment signing transaction-дарын serialise етеді:

- payment first болса amendment start/final guard payment history-ді көріп block болады;
- amendment SIGNING first болса payment submission financial signing state-ті көріп block болады.

## Schedule source of truth

Generic schedule generation енді original Proposal terms-ті қолданбайды.

Authoritative source:

`Contract.currentVersion -> ContractVersion.termsSnapshot`

Current version міндетті түрде `SIGNED` және documentHash-bound болуы тиіс.

Бұл financial N+1 activation-нан кейін schedule қайта generate шақырылса да same deterministic inputHash арқылы existing amended schedule-ды қайта қолдануға мүмкіндік береді.

## Evidence and closure

New evidence package creation — schema **v6**.

V6 amendment/schedule/accounting/cutover-signing provenance:

- ContractVersion `sourceAmendmentId`;
- amendment purpose/document hash;
- normalized proposedTermsSnapshot;
- borrower/lender approval roles + timestamps;
- activated version metadata;
- ScheduleVersion `sourceContractVersion`;
- ScheduleVersion `sourceAmendmentId`;
- deterministic schedule inputHash;
- immutable post-payment accounting snapshot versions/stateHash;
- snapshot source contract/schedule version + document/input hashes;
- persisted paid/outstanding charge-interest-principal component split;
- confirmed payment total, unallocated credit және unresolved/payment-event counts;
- immutable cutover preview version + exact `accountingSnapshotId`;
- cutover `previewHash` + policyVersion + referenceAt;
- accrued/outstanding/reclassification/unearned interest projection;
- opening principal, proposed maturity және projected future/remaining due;
- ContractVersion `sourceCutoverPreviewId` exact signed N+1 → cutover preview relation;
- N+1 calculationPolicy ішіндегі previewHash/accountingSnapshotId/accountingStateHash/policyVersion/referenceAt binding.

Persisted schema v1/v2/v3/v4/v5 packages retroactive rewrite жасамайды және stored schemaVersion бойынша read/export болады.

Closure exact `Contract.currentVersion` және latest schedule version-ды пайдаланады. Cancelled historical schedule versions evidence history-де қалады.

## Privacy boundary

Amendment API participant-only.

Response/audit:

- userId/partyId/contact data шығармайды;
- approvals/signatures role-only;
- raw legal document сақтамайды;
- audit proposed financial values-ті көшірмейді;
- document/schedule provenance hash/id/version арқылы дәлелденеді.

## Post-payment accounting preview foundation

Repayment history бар approved financial amendment үшін actual activation әлі жабық, бірақ participant deterministic accounting state preview дайындай алады:

- `POST /api/v1/contracts/:contractId/amendments/:amendmentId/accounting-preview`
- `GET /api/v1/contracts/:contractId/amendments/:amendmentId/accounting-previews`

Prepare endpoint contract және amendment row-ды lock етеді. Payment submit/confirm/reversal да contract lock қолданатындықтан snapshot capture payment mutation-мен race жасамайды.

Snapshot тек `APPROVED` current `TERMS_CHANGE` немесе `SCHEDULE_CHANGE` үшін, ACTIVE + CONFIRMED funding contract-та жасалады.

Current foundation тек қазіргі MVP one-item AT_MATURITY schedule policy-ін қолдайды. Multiple schedule item policy пайда болса, snapshot fail-closed.

Snapshot immutable және versioned:

- бірдей authoritative accounting state → same `stateHash`, existing snapshot қайтарылады;
- кейін payment/reversal/unresolved state өзгерсе → жаңа stateHash және snapshot version;
- old snapshots update/delete болмайды.

Persisted snapshot binds:

- base ContractVersion және exact signed documentHash;
- base ScheduleVersion және inputHash;
- funding effectiveAt/currency;
- scheduled principal/interest/charge;
- current `paidMinor`;
- allocation policy бойынша reconstructed paid charge → interest → principal;
- outstanding charge/interest/principal;
- active CONFIRMED payment total;
- unallocated credit;
- confirmed/reversed payment event count;
- unresolved payment count.

Reconciliation invariant:

`confirmed active payment total = schedule paidMinor + unallocated credit`

Теңдік бұзылса snapshot жасалмайды.

Current response explicitly:

- `policyStatus=PREVIEW_ONLY`;
- `activationEligible=false`;
- `activationReason=POST_PAYMENT_ACCOUNTING_POLICY_PENDING`.

Бұл preview historical PaymentAllocation, ScheduleItem, LedgerEntry, ContractVersion немесе Contract.currentVersion-ды өзгертпейді.

Бұл foundation-ның мақсаты — келесі accounting/legal policy үшін deterministic opening-state evidence беру. Ол earned-vs-unearned interest reclassification немесе effective-date cutover шешімін өздігінен қабылдамайды.

## Post-payment cutover projection foundation

Accounting snapshot review-дан кейін participant actual activation жасамай deterministic cutover projection дайындай алады:

- `POST /api/v1/contracts/:contractId/amendments/:amendmentId/cutover-preview`
- `GET /api/v1/contracts/:contractId/amendments/:amendmentId/cutover-previews`

POST body:

```json
{
  "accountingSnapshotId": "<exact latest snapshot UUID>"
}
```

Caller effective/cutover date бермейді. Projection reference time exact accounting snapshot `capturedAt` болады. Бұл legal effective date емес.

Prepare flow contract/amendment row-ды lock етеді және selected snapshot:

- amendment-тің latest accounting snapshot-ы екенін;
- current signed ContractVersion number/documentHash-пен exact екенін;
- latest ScheduleVersion number/inputHash/items-пен exact екенін;
- current paidMinor және charge→interest→principal reconstructed components-пен exact екенін;
- confirmed payment total/unallocated credit/event counts/unresolved counts-пен exact екенін;
- canonical accounting `stateHash` current DB state-тен қайта есептелген мәнмен exact екенін

қайта тексереді.

Payment/reversal/unresolved state snapshot-тан кейін өзгерсе stale snapshot rejected; алдымен жаңа accounting snapshot қажет.

Current projection policy: `POST_PAYMENT_CUTOVER_PREVIEW_V1`.

Technical calculation:

- elapsed days = funding effective UTC day → snapshot reference UTC day, base termDays-пен capped;
- base ACT/365 half-up formula бойынша accrued interest есептеледі;
- persisted scheduled interest дәл сол base formula-ға сәйкес болмаса fail-closed;
- `earnedInterestSettledMinor = min(paidInterest, accruedInterest)`;
- `outstandingAccruedInterestMinor = max(accruedInterest - paidInterest, 0)`;
- `interestReclassificationCandidateMinor = max(paidInterest - accruedInterest, 0)`;
- `unearnedScheduledInterestMinor = scheduledInterest - accruedInterest`;
- opening principal = accounting snapshot outstanding principal;
- proposed maturity = original funding effective date + proposed total termDays;
- remaining days snapshot reference day → proposed maturity;
- projected future interest proposed rate бойынша тек opening principal-ға есептеледі;
- projected remaining due = outstanding charge + outstanding accrued interest + opening principal + projected future interest.

`interestReclassificationCandidateMinor` **автоматты refund/credit/principal allocation емес**. Existing unallocated credit те projection ішінде автоматты қолданылмайды. Екеуі response-та `creditsNotApplied` ретінде бөлек көрсетіледі.

Projection:

- immutable;
- versioned;
- one exact accounting snapshot → one projection;
- retry idempotent;
- amendment document hash + proposed terms + snapshot ID/stateHash + policy inputs/outputs-ты `previewHash` арқылы bind етеді.

Response explicitly:

- `policyStatus=PREVIEW_ONLY`;
- `activationEligible=false`;
- `activationReason=POST_PAYMENT_CUTOVER_POLICY_PENDING`.

Бұл endpoint ContractVersion, ScheduleVersion, PaymentAllocation, LedgerEntry, currentVersion немесе payment state-ке mutation жасамайды.

Толық architecture decision: [ADR-0027](../../adr/ADR-0027-post-payment-amendment-cutover-preview.md).

## Post-payment cutover-pinned signing foundation

Actual post-payment activation әлі жабық, бірақ reviewed cutover projection-нан N+1 signing candidate жасауға болады.

Dedicated gate:

`CONTRACT_POST_PAYMENT_AMENDMENT_SIGNING_ENABLED=false`

Ол тек `CONTRACT_AMENDMENTS_ENABLED=true` және `CONTRACT_SIGNING_ENABLED=true` болса ғана қосыла алады. Release preflight enabled state-ті manual accounting/legal acceptance ретінде көрсетеді.

Endpoint:

`POST /api/v1/contracts/:contractId/amendments/:amendmentId/start-post-payment-signing`

Body:

```json
{
  "cutoverPreviewId": "<exact latest cutover preview UUID>"
}
```

Start flow contract + amendment row-ды lock етеді және selected preview:

- exact amendment-ке тиесілі;
- latest cutover preview;
- latest accounting snapshot-қа bound;
- current signed ContractVersion/documentHash-пен exact;
- latest schedule/payment component state-пен exact;
- recomputed accounting stateHash-пен exact;
- recomputed cutover previewHash/policyVersion-пен exact

екенін қайта тексереді.

Successful start:

- ContractVersion N+1 `SIGNING`;
- `sourceAmendmentId=<amendment id>`;
- `sourceCutoverPreviewId=<exact cutover preview id>`;
- N+1 calculationPolicy previewHash + accountingSnapshotId + accountingStateHash + cutover policyVersion + referenceAt-ты bind етеді;
- N+1 documentHash осы cutover provenance-ті де bind етеді.

Same exact preview retry idempotent. Басқа preview ID-мен retry `CONTRACT_CONFLICT`.

Financial amendment `SIGNING` немесе `SIGNED_PENDING_ACTIVATION` кезінде repayment evidence, lender confirm/dispute және reversal `PAYMENT_CONFLICT` арқылы frozen болады. Бұл pinned accounting state-ті signing арасында өзгермеу үшін қажет.

Post-payment N+1 үшін:

- first signature — тек signature;
- second signature — N+1 → `SIGNED`, amendment → `SIGNED_PENDING_ACTIVATION`;
- base ContractVersion `SIGNED` күйінде қалады;
- `Contract.currentVersion` өзгермейді;
- ScheduleVersion/PaymentAllocation/LedgerEntry өзгермейді;
- activation audit емес, `CONTRACT_AMENDMENT_POST_PAYMENT_FULLY_SIGNED` audit жазылады.

Бұл state actual accounting activation-ға consent/document provenance береді, бірақ reclassification/opening-balance/ledger mutation жасамайды.

## Intentionally pending

Бұл slice:

- repayment history бар contract үшін signed N+1 candidate жасай алады, бірақ actual N+1 activation жасамайды;
- already-paid allocation reclassification/migration жасамайды;
- principal/currency өзгерісін қолдамайды;
- installment/multi-item rescheduling жасамайды;
- effectiveAt-ты funding start-тан басқа датаға ауыстырмайды;
- late fees/penalty recalculation жасамайды;
- amendment withdrawal/cancellation legal semantics-ын бекітпейді;
- Kazakhstan legal effect/signature wording approval-ын алмастырмайды.

Келесі кеңейту бөлек accounting policy ретінде жасалуы тиіс: historical allocations immutable қалады, latest accounting snapshot + cutover preview exact-state pin болады, ал reclassification candidate-ті credit/refund/principal ретінде қолдану, legal effective-date semantics, opening-balance ledger transition және reconciliation explicit policy арқылы ғана жасалады.

## Release boundary

`CONTRACT_AMENDMENTS_ENABLED=true` release preflight-та manual legal/process acceptance болып қалады.

N+1 signing үшін `CONTRACT_SIGNING_ENABLED=true` де қажет. Post-payment signing үшін бұларға қосымша `CONTRACT_POST_PAYMENT_AMENDMENT_SIGNING_ENABLED=true` керек және preflight оны бөлек manual accounting/legal acceptance ретінде көрсетеді.

Production enablement алдында staging acceptance financial amendment scenario-ларын нақты PostgreSQL data-мен тексеруі тиіс.
