# Contract amendments foundation

Жаңартылған күні: 2026-09-29.

QaryzLink Phase 4 үшін contract amendment foundation existing signed contract history-ді өзгертпей, жаңа өзгеріс ұсынысын екі тараптың explicit approval-ымен бөлек immutable record ретінде сақтайды.

## Scope

Feature default-off:

`CONTRACT_AMENDMENTS_ENABLED=false`

Қазіргі slice:

- тек `SIGNED`, `FUNDING_PENDING` немесе `ACTIVE` contract үшін amendment proposal жасауға мүмкіндік береді;
- amendment current signed `ContractVersion`-ды `baseVersion` ретінде бекітеді;
- `proposedVersion = baseVersion + 1`;
- raw legal text/PII/terms JSON орнына bounded purpose + immutable SHA-256 `proposedDocumentHash` сақтайды;
- бір proposed version үшін бір amendment қана болады;
- borrower және lender бөлек explicit approve етеді;
- дәл сол party approval қайталанса idempotent no-op;
- екі approval жиналғанда amendment `APPROVED` болады;
- audit trail proposal, each-party approval және final dual approval оқиғаларын сақтайды.

API response party IDs шығармайды. Approval identity тек `BORROWER` / `LENDER` role ретінде беріледі.

## API

Authenticated verified contract participant үшін:

- `POST /api/v1/contracts/:contractId/amendments`
- `GET /api/v1/contracts/:contractId/amendments`
- `POST /api/v1/contracts/:contractId/amendments/:amendmentId/approve`

Create body:

```json
{
  "purpose": "TERMS_CHANGE",
  "proposedDocumentHash": "<64 lowercase hex>"
}
```

Purpose values:

- `TERMS_CHANGE`
- `SCHEDULE_CHANGE`
- `OTHER`

## Invariants

1. Existing signed `ContractVersion` ешқашан mutation алмайды.
2. Amendment proposal existing `Contract.currentVersion`-ды snapshot етеді.
3. Current version signed/document-hash-bound болмаса proposal reject.
4. Contract currentVersion amendment review кезінде өзгерсе approval reject.
5. One-party approval amendment-ті final approved етпейді.
6. Final approval дәл екі contract participant approval-дан кейін ғана.
7. Proposal/approval contract `status`, `currentVersion`, funding, schedule, payments немесе ledger-ді автоматты өзгертпейді.
8. Raw proposed legal document немесе arbitrary terms JSON product DB-ға сақталмайды; SHA-256 hash қана сақталады.
9. `COMPLETED`, `DISPUTED`, `CANCELLED`, `EXPIRED_UNFUNDED` state-терінде жаңа proposal жасалмайды.

## What is intentionally NOT implemented yet

`APPROVED` amendment қазір:

- жаңа `ContractVersion` жасамайды;
- currentVersion-ды ауыстырмайды;
- қайта қол қою flow-ын бастамайды;
- principal/rate/schedule/funding/payment state-ті өзгертпейді;
- evidence package-ке amendment artifact ретінде әлі bind болмайды.

Келесі қауіпсіз slice approved amendment hash-ті immutable ContractVersion N+1 source-қа байлап, екі тараптың жаңа version signature flow-ын existing operational contract state-ті бұзбай жүргізуі тиіс. Financial/schedule effects сол version толық signed болғаннан кейін де бөлек deterministic transition policy талап етеді.

## Release boundary

Feature enabled болса release preflight `contract_amendments=manual` және `amendment_legal_process_acceptance_required` көрсетеді.

Бұл implementation amendment-тің Kazakhstan legal effect-ін автоматты түрде бекітпейді. Legal owner amendment wording, signature effect, effective-time semantics және active repayment schedule transition policy-ді бөлек approve етуі тиіс.
