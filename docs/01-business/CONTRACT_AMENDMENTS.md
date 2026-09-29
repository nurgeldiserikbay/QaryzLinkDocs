# Contract amendments and N+1 signing foundation

Жаңартылған күні: 2026-09-29.

QaryzLink Phase 4 contract amendment lifecycle existing signed history-ді өзгертпейді. Amendment алдымен immutable proposal + dual-party approval ретінде сақталады; қауіпсіз non-financial `OTHER` amendment ғана кейін жеке `ContractVersion N+1` signing flow-ға өте алады.

## Feature gates

Default:

`CONTRACT_AMENDMENTS_ENABLED=false`

Proposal/list/approval осы gate арқылы басқарылады.

N+1 signing бастау және sign mutation үшін қосымша:

`CONTRACT_SIGNING_ENABLED=true`

қажет. Екі gate те legal/process acceptance аяқталмайынша default-off қалады.

## Proposal and approval

Proposal тек `SIGNED`, `FUNDING_PENDING` немесе `ACTIVE` contract үшін жасалады.

Persisted fields:

- current signed `baseVersion`;
- `proposedVersion = baseVersion + 1`;
- bounded purpose;
- immutable SHA-256 `proposedDocumentHash`;
- creator party relation;
- timestamps/status.

Raw legal text, arbitrary terms JSON, contact/identity data amendment row-ға сақталмайды.

Borrower және lender бөлек explicit approve етеді. Same-party repeated approval idempotent. Екі approval жиналғанда amendment `APPROVED` болады.

## N+1 signing activation

`APPROVED` amendment үшін:

`POST /api/v1/contracts/:contractId/amendments/:amendmentId/start-signing`

қолданылады.

Қазіргі implementation тек `purpose=OTHER` үшін activation жасайды.

`TERMS_CHANGE` және `SCHEDULE_CHANGE`:

- proposal/dual approval деңгейінде сақтала алады;
- бірақ N+1 activation кезінде `CONTRACT_AMENDMENT_TRANSITION_PENDING` fail-closed болады;
- deterministic schedule/payment/principal/rate transition policy дайын болғанша current contract state-ке әсер етпейді.

Safe `OTHER` activation:

1. contract және amendment row transaction lock алады;
2. amendment exact currentVersion-ға байланғанын тексереді;
3. base ContractVersion `SIGNED` және documentHash бар болуы тиіс;
4. base `termsSnapshot` өзгеріссіз көшіріледі;
5. base calculation policy жаңа amendment provenance metadata-мен immutable түрде wrap болады;
6. pinned KZ/RU PDF template IDs/hashes base version-нан көшіріледі;
7. deterministic N+1 `documentHash` base document hash + amendment hash + version/source metadata + inherited terms/policy/templates-ті canonical түрде bind етеді;
8. new ContractVersion `SIGNING`, `sourceAmendmentId=<amendment id>`;
9. amendment `SIGNING`.

Repeated start exact existing signing candidate-ті қайтарады; duplicate ContractVersion жасамайды.

## N+1 document review

Default current document routes енді ең үлкен version-ды емес, дәл `Contract.currentVersion`-ды алады. Сондықтан unsigned N+1 active contract document ретінде кездейсоқ көрінбейді.

Signing candidate participant-only explicit version routes арқылы оқылады:

- `GET /api/v1/contracts/:contractId/versions/:version/document-source`
- `GET /api/v1/contracts/:contractId/versions/:version/document-preview/:locale`
- `GET /api/v1/contracts/:contractId/versions/:version/document-pdf-capability`
- `POST /api/v1/contracts/:contractId/versions/:version/document-pdf/:locale`

Current-version existing routes өзгермейді.

## N+1 signatures and activation

Participant:

`POST /api/v1/contracts/:contractId/amendments/:amendmentId/sign`

body-да reviewed immutable N+1 `documentHash` береді.

Invariants:

- signature hash exact candidate ContractVersion.documentHash-пен match болуы тиіс;
- same party same hash retry idempotent;
- бірінші signature `Contract.currentVersion`-ды өзгертпейді;
- екінші participant signature келгенде ғана:
  - N+1 version → `SIGNED`;
  - base version → `SUPERSEDED`;
  - `Contract.currentVersion = N+1`;
  - amendment → `ACTIVATED`;
  - `activatedAt` сақталады.

Бұл transition contract `status`, funding, schedule, payments немесе ledger state-ті өзгертпейді және жаңа Funding/Schedule row жасамайды.

## Evidence and closure binding

Amendment-aware жаңа evidence package manifest — schema **v2**.

V2 canonical manifest:

- барлық ContractVersion history;
- әр version үшін `sourceAmendmentId`;
- amendment id/baseVersion/proposedVersion/purpose/proposedDocumentHash/status;
- borrower/lender approval roles + timestamps;
- activated version number/status/documentHash/signedAt

сақтайды.

Existing persisted evidence schema v1 package-тер immutable күйінде read/export болады; олар retroactive v2-ге rewrite жасалмайды.

Closure final statement contract-тың ең үлкен draft/signing version-ын емес, дәл `Contract.currentVersion`-ды қолданады. Сондықтан unsigned amendment candidate closure document hash-ке түспейді.

## API

Authenticated verified contract participant үшін:

- `POST /api/v1/contracts/:contractId/amendments`
- `GET /api/v1/contracts/:contractId/amendments`
- `POST /api/v1/contracts/:contractId/amendments/:amendmentId/approve`
- `POST /api/v1/contracts/:contractId/amendments/:amendmentId/start-signing`
- `POST /api/v1/contracts/:contractId/amendments/:amendmentId/sign`

Create body:

```json
{
  "purpose": "OTHER",
  "proposedDocumentHash": "<64 lowercase hex>"
}
```

Purpose values:

- `TERMS_CHANGE`
- `SCHEDULE_CHANGE`
- `OTHER`

## Privacy and audit boundary

API response party IDs шығармайды; approvals/signatures тек `BORROWER` / `LENDER` role ретінде көрсетіледі.

Audit events proposal, approval, signing start, each-party N+1 signature және final activation-ды сақтайды. Raw legal text/contact data audit payload-қа кірмейді.

## Still intentionally pending

Бұл foundation әлі:

- actual amendment legal text/template content-ті QaryzLink ішінде сақтамайды;
- `TERMS_CHANGE` немесе `SCHEDULE_CHANGE` financial effects қолданбайды;
- principal/rate/schedule/payment/ledger recalculation жасамайды;
- amendment withdrawal/cancellation legal semantics-ын бекітпейді;
- Kazakhstan amendment legal effect/signature wording/staging acceptance-ті автоматты түрде жаппайды.

Келесі business-sensitive slice: approved TERMS/SCHEDULE amendment үшін deterministic calculation/schedule transition, already-paid allocation invariants, effective-time rules және legal approval.

## Release boundary

`CONTRACT_AMENDMENTS_ENABLED=true` release preflight-та `contract_amendments=manual` / `amendment_legal_process_acceptance_required` береді.

N+1 signing үшін `CONTRACT_SIGNING_ENABLED=true` де қажет және existing signing legal gate manual күйінде қалады.
