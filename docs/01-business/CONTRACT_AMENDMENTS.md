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

New evidence package creation — schema **v3**.

V3 amendment/schedule provenance:

- ContractVersion `sourceAmendmentId`;
- amendment purpose/document hash;
- normalized proposedTermsSnapshot;
- borrower/lender approval roles + timestamps;
- activated version metadata;
- ScheduleVersion `sourceContractVersion`;
- ScheduleVersion `sourceAmendmentId`;
- deterministic schedule inputHash.

Persisted schema v1/v2 packages retroactive rewrite жасамайды және stored schemaVersion бойынша read/export болады.

Closure exact `Contract.currentVersion` және latest schedule version-ды пайдаланады. Cancelled historical schedule versions evidence history-де қалады.

## Privacy boundary

Amendment API participant-only.

Response/audit:

- userId/partyId/contact data шығармайды;
- approvals/signatures role-only;
- raw legal document сақтамайды;
- audit proposed financial values-ті көшірмейді;
- document/schedule provenance hash/id/version арқылы дәлелденеді.

## Intentionally pending

Бұл slice:

- repayment history бар contract terms-ін қайта есептемейді;
- already-paid allocation migration жасамайды;
- principal/currency өзгерісін қолдамайды;
- installment/multi-item rescheduling жасамайды;
- effectiveAt-ты funding start-тан басқа датаға ауыстырмайды;
- late fees/penalty recalculation жасамайды;
- amendment withdrawal/cancellation legal semantics-ын бекітпейді;
- Kazakhstan legal effect/signature wording approval-ын алмастырмайды.

Келесі кеңейту қажет болса, already-paid financial amendment бөлек accounting policy ретінде жасалуы тиіс: historical allocations immutable, opening balance snapshot, effective-date cutover, interest accrual split және ledger reconciliation.

## Release boundary

`CONTRACT_AMENDMENTS_ENABLED=true` release preflight-та manual legal/process acceptance болып қалады.

N+1 signing үшін `CONTRACT_SIGNING_ENABLED=true` де қажет.

Production enablement алдында staging acceptance financial amendment scenario-ларын нақты PostgreSQL data-мен тексеруі тиіс.
