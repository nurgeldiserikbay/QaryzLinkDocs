# Contract amendments

Жаңартылған күні: 2026-09-29.

QaryzLink-та contract amendment foundation тек **pre-signature** кезеңге арналған. Ол already signed, funded немесе active debt-тің financial history-сін қайта жазбайды.

## Scope

Amendment тек мына lifecycle кезінде мүмкін:

- Contract: `PENDING_SIGNATURES`;
- current ContractVersion: `SIGNING`;
- funding әлі жасалмаған.

`SIGNED`, `FUNDING_PENDING`, `ACTIVE`, `COMPLETED`, `DISPUTED` және басқа terminal/financial states бұл foundation арқылы өзгермейді.

Feature default-off:

`CONTRACT_AMENDMENTS_ENABLED=false`

Create және ACCEPT тек explicit enablement кезінде жұмыс істейді. GET history, REJECT және requester WITHDRAW safe-exit ретінде gate өшірілген кезде де қолжетімді.

## Editable terms

Қазіргі foundation тек:

- principal amount;
- term days;
- annual rate bps

өзгертуге мүмкіндік береді.

Client arbitrary terms JSON жібере алмайды. Backend current immutable terms snapshot-ты өзі оқып, server-owned fields-ті сақтайды:

- currency;
- responseHours;
- day-count;
- rounding;
- repayment mode;
- early-repayment rule;
- penalty baseline;
- terms schema metadata.

Amount Int64 positive range-да, term 1–3650 күн, annual rate 0–1,000,000 bps шегінде validation өтеді. Current terms-пен бірдей amendment reject болады.

## Lifecycle

~~~mermaid
stateDiagram-v2
    [*] --> PENDING
    PENDING --> ACCEPTED: counterparty accepts
    PENDING --> REJECTED: counterparty rejects
    PENDING --> WITHDRAWN: requester withdraws
    ACCEPTED --> [*]
    REJECTED --> [*]
    WITHDRAWN --> [*]
~~~

Бір contract-та бір уақытта бір ғана `PENDING` amendment болуы мүмкін. Database partial unique index бұл invariant-ті бекітеді.

Requester өз amendment-ін ACCEPT/REJECT ете алмайды. Counterparty оны WITHDRAW ете алмайды.

## Signing interaction

`PENDING` amendment бар кезде contract signing fail-closed тоқтайды.

REJECT/WITHDRAW:
- current ContractVersion өзгермейді;
- бұрын жасалған signature acknowledgement сақталады;
- amendment terminal history ретінде қалады;
- signing жалғаса алады.

ACCEPT:
1. current ContractVersion contract row lock ішінде қайта тексеріледі;
2. amendment `baseVersion` current version-мен дәл сәйкес болуы тиіс;
3. persisted terms snapshot SHA-256 integrity қайта тексеріледі;
4. old ContractVersion `SUPERSEDED` болады;
5. `currentVersion + 1` жаңа ContractVersion `SIGNING` болып жасалады;
6. principal contract-level current value жаңа amount-қа ауысады;
7. old signatures historical old version-да қалады және жаңа version-ға көшірілмейді;
8. екі тарап жаңа document hash-ке қайта қол қоюы керек.

## Immutable document identity

Accepted version document hash жаңа immutable source-тан есептеледі және мыналарды қамтиды:

- proposal ID;
- borrower/lender internal party binding;
- amended amount/currency/terms snapshot;
- new contract version number;
- amendment ID + base version provenance;
- current version-нан көшірілген KZ/RU PDF template IDs/hashes, егер template pins бар болса.

Amendment acceptance deployment-та кейін өзгерген PDF template config-ті contract-қа retroactive түрде қолданбайды. Current pinned template identity жаңа version-ға көшіріледі.

`calculationPolicy` жаңа version үшін `source=CONTRACT_AMENDMENT`, amendment ID/baseVersion және resulting document hash сақтайды.

## API

Participant-only endpoints:

- `POST /api/v1/contracts/:contractId/amendments`;
- `GET /api/v1/contracts/:contractId/amendments`;
- `POST /api/v1/contracts/:contractId/amendments/:amendmentId/decision`.

Create input financial values + enum reason ғана қабылдайды.

Decision:
- `ACCEPT`;
- `REJECT`;
- `WITHDRAW`.

Response requester-дің internal party ID-сін шығармайды; тек `BORROWER` немесе `LENDER` role көрсетеді.

## Idempotency and concurrency

Contract row transaction lock create/decide/sign races-ті serialise етеді.

Same requester дәл сол reason + same terms-пен pending create-ті қайта жіберсе existing amendment қайтады. Competing different pending request conflict болады.

Terminal decision дәл сол decision-мен retry болса existing result қайтады. Басқа terminal decision conflict болады.

## Privacy and history

Amendment row immutable proposal snapshot/provenance ретінде:

- requested party relation;
- base version;
- reason enum;
- proposed terms snapshot;
- canonical terms hash;
- status;
- accepted version, егер accepted болса;
- timestamps

сақтайды.

User-facing response internal party ID шығармайды. Amendment еркін мәтіндік reason қабылдамайды.

## Бұл foundation не істемейді

Бұл implementation:

- signed contract-ты қайта жазбайды;
- funded/active debt principal немесе schedule-ды өзгерпейді;
- repayment schedule recalculation жасамайды;
- accrued interest/ledger/payment history-ды қайта есептемейді;
- unilateral amendment жасамайды;
- legal novation/restructuring classification бермейді.

Post-sign amendment/restructuring үшін Қазақстан legal/accounting policy, schedule/ledger migration rules, evidence package semantics және explicit bilateral acceptance бөлек дизайн қажет.

## Release gate

`CONTRACT_AMENDMENTS_ENABLED=true` release preflight-та `manual` болып қалады. Staging acceptance кемінде:

- pending amendment signing pause;
- requester/counterparty authorization;
- exact retry behavior;
- ACCEPT v1→v2 supersession;
- old signature жаңа version-ға өтпейтіні;
- document hash provenance;
- pinned PDF template carry-forward;
- REJECT/WITHDRAW current version-ды өзгертпейтіні;
- signed/funded/active contract amendment reject

сценарийлерін тексеруі тиіс.
