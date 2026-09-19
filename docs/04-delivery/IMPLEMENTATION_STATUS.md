# Implementation status

Жаңартылған күні: 2026-09-19

Бұл құжат specification мен нақты код арасындағы қысқа бақылау нүктесі. Толық талаптар өзгермейді; мұнда тек орындалу күйі көрсетіледі.

## Жалпы күй

| Бағыт | Күйі | Нәтиже |
|---|---|---|
| Product және business specification | Дайын | MVP шекарасы, state machine, privacy және calculation rules бекітілді |
| Backend foundation | Дайын | NestJS/Fastify modular monolith, Prisma/PostgreSQL, Docker, CI |
| IAM | Базалық нұсқа дайын | Register, login, refresh token rotation, current-session logout, email verification |
| Profile және privacy settings | Базалық нұсқа дайын | Өз профилін оқу және privacy баптауларын өзгерту |
| Database migration | Дайын | Бастапқы schema versioned SQL migration ретінде бекітілді |
| Discovery | Restricted slice дайын | Private request, exact invitation, proposal, atomic acceptance |
| Contract draft/signing | Дайын | Accepted proposal-дан immutable ContractVersion v1, privacy-safe read, dual hash acknowledgement |
| Funding evidence/confirmation | Дайын | Lender metadata, SHA-256, borrower confirmation/dispute, deadline guard |
| Schedule generation | Дайын | ACTIVE + CONFIRMED guard, ACT/365 Fixed + HALF_UP, versioned inputHash |
| Payment evidence/confirmation/ledger | Дайын | Borrower evidence, lender decision, allocation және append-only ledger |
| Overdue status worker | Дайын | UTC due/overdue materialization, ACTIVE + CONFIRMED guard, idempotent transaction |
| Payment reversal | Дайын | Lender-authorized immutable reversal, signed allocation restore және opposite ledger entries |
| Notifications/outbox | Базалық slice дайын | Payment CONFIRMED/REVERSED оқиғалары, privacy-safe payload және idempotent outbox |
| Notification claim/retry worker | Базалық slice дайын | SKIP LOCKED claim, 5 минут lease, exponential retry және terminal FAILED |
| Provider/scheduler | Жоспарда | IN_APP/EMAIL adapter, deployment scheduler және monitoring |
| Front/Admin UI | Жоспарда | Backend contract тұрақтанған сайын вертикаль slice бойынша жасалады |

## Қазіргі backend slice

~~~mermaid
flowchart TD
    R["Register"] --> U["User + Person party"]
    U --> P["Private profile defaults"]
    L["Login"] --> A["Short-lived access token"]
    L --> T["Rotating refresh session"]
    A --> M["GET/PATCH own profile"]
    T --> A
~~~

Қауіпсіздік шешімдері:

- password built-in Node.js `scrypt` арқылы hash болады;
- refresh token дерекқорда ашық түрде сақталмайды;
- JWT secret configuration іске қосылғанда тексеріледі;
- жаңа профильдің public көрінуі әдепкіде өшірулі;
- domain қателері тұрақты API error code-тарымен қайтарылады.

## Quality gate

Әр push пен pull request-та GitHub Actions мыналарды орындайды:

1. PostgreSQL service-ін іске қосады;
2. Prisma schema-ны generate және validate етеді;
3. барлық versioned migration-ды бос базаға қолданады;
4. TypeScript strict typecheck орындайды;
5. ESLint complexity, nesting және файл ұзындығы шектерін тексереді;
6. unit test пен coverage threshold-тарды тексереді;
7. production build жасайды.

2026-09-17: 47 test өтті, оның 10-ы нақты PostgreSQL integration тесті. Coverage конфигурациясына кірген код: lines 99.38%, branches 96.55%, functions 100%. Бұл бүкіл backend немесе HTTP e2e coverage көрсеткіші емес.

## Келесі орындалу реті

~~~mermaid
flowchart LR
    A["IAM hardening"] --> D["Private discovery"]
    D --> C["Contract draft"]
    C --> F["Funding evidence"]
    F --> S["Schedule"]
    S --> UI["Front vertical slice"]
~~~

1. Email verification backend аяқталды; Front verification беті және нақты SMTP staging тексеруі қалды.
2. Invite-only loan request/offer/proposal use cases.
3. Бір ұсынысты қабылдағанда қалған proposal-дарды атомарлы жабу.
4. Contract version және екі тараптың қол қою workflow-ы — орындалды: [contract signing](../01-business/CONTRACT_SIGNING.md).
5. Funding evidence және 72 сағаттық borrower confirmation.
6. Deterministic repayment schedule, payment confirmation және reversal — орындалды.
7. Notification outbox persistence және claim/retry worker — орындалды; provider adapter, deployment scheduler және monitoring.
8. Осы API-ларға сәйкес Front, кейін Admin интерфейстері.

## Production-ға жіберілмейтін мүмкіндіктер

Қазақстан бойынша құқықтық қорытынды жасалғанша public marketplace, penalty/late fee, automated enforcement, platform custody және amount-based commission өшірулі қалады.

## Session logout

`POST /api/v1/auth/logout` Bearer token арқылы ағымдағы сессияны тоқтатады (204).
Әр қорғалған сұраныста session owner, revokedAt, expiresAt және User.status тексеріледі.
Тоқтатылған session-мен қайталанған HTTP сұраныс 401 қайтарады. Revoke дерекқор операциясы идемпотентті.
[CI run 35220576826](https://github.com/nurgeldiserikbay/QaryzLinkBack/actions/runs/35220576826): migration, typecheck, lint, 34 test және build сәтті өтті.

Қосымша архитектуралық талдау: [Graphify қолдану тәртібі](GRAPHIFY.md).

## Auth hardening аяқталды

Shared PostgreSQL rate limit, atomic refresh rotation және forged forwarded header қорғанысы қосылды. Толық шешім: [ADR-0005](../../adr/ADR-0005-auth-concurrency-and-rate-limits.md).

[CI run 35244669259](https://github.com/nurgeldiserikbay/QaryzLinkBack/actions/runs/35244669259): Prisma format/validate, migration, typecheck, lint, 47 test және build өтті. Бұл тарихи auth кезеңінің нәтижесі; email verification келесі кезеңде қосылды.

## Email verification аяқталды

[CI run 35305836411](https://github.com/nurgeldiserikbay/QaryzLinkBack/actions/runs/35305836411), commit 8483592cb17c7c736cd48593bb0425c82edd3b83:
Prisma format/generate/validate, үш migration, TypeScript, ESLint, 18 файлдағы 73 test және production build өтті.
Coverage конфигурациясына кірген код: lines/statements 99.47%, branches 97.19%, functions 100%; бұл толық HTTP e2e coverage емес.

Бір реттік 15 минуттық token, атомарлы confirm, resend лимиті және SMTP adapter қосылды.
Нақты SMTP жеткізу және Front verification беті әлі тексерілмеген; MAIL_ENABLED=false әдепкі күйде.
Шешім мен workflow: [ADR-0006](../../adr/ADR-0006-email-verification.md).
Орнату: [Deployment](../06-operations/DEPLOYMENT.md), [иесінен қажет мәліметтер](../06-operations/OWNER_CHECKLIST.md), [release checklist](../06-operations/RELEASE_CHECKLIST.md).


## Funding evidence және borrower confirmation

QaryzLinkBack PR #3 merged: signed contract енді Funding EVIDENCE_REQUIRED жасайды. Lender private object key + SHA-256 metadata береді, borrower CONFIRM/DISPUTE шешімін сақтайды. CONFIRMED болғанда ғана Contract ACTIVE болады.

API guide: [FUNDING_EVIDENCE](../01-business/FUNDING_EVIDENCE.md). ADR: [ADR-0009](../../adr/ADR-0009-funding-evidence-and-confirmation.md).

## Contract draft және dual acknowledgement

QaryzLinkBack PR #2 merged: accepted proposal-дан immutable ContractVersion v1 жасалады, тараптар дәл сол SHA-256 hash-ті acknowledgement ретінде растайды, екінші растауда ғана Contract.SIGNED болады. Бұл заңды qualified e-signature емес және ақша аударымын растамайды.

API guide: [CONTRACT_SIGNING](../01-business/CONTRACT_SIGNING.md). ADR: [ADR-0008](../../adr/ADR-0008-contract-draft-and-dual-acknowledgement.md).

## Private discovery

Backend branch `gpt/private-discovery`-де request/invitation/proposal workflow, idempotency receipts, PostgreSQL locks, privacy checks және HTTP validation бар. 97 test өткен baseline-ға discovery тесттері қосылды. Public marketplace, negotiation, contract және funding әлі production-ready емес.

ADR: [ADR-0007](../../adr/ADR-0007-private-discovery.md). API guide: [PRIVATE_DISCOVERY](../01-business/PRIVATE_DISCOVERY.md).


## Repayment schedule generation

QaryzLinkBack PR #4: Funding CONFIRMED болғаннан кейін ScheduleVersion және бір AT_MATURITY ScheduleItem жасалады. Есептеу ACT_365_FIXED_HALF_UP_V1 арқылы integer minor units-та орындалады; бір inputHash қайта сұралса, сол нұсқа қайтарылады.

API guide: [REPAYMENT_SCHEDULE](../01-business/REPAYMENT_SCHEDULE.md). ADR: [ADR-0010](../../adr/ADR-0010-deterministic-repayment-schedule.md).


## Repayment payment ledger

QaryzLinkBack PR #5 merged: borrower төлем дәлелін және amount/paidAt metadata береді, lender CONFIRM немесе DISPUTE жасайды. CONFIRMED төлем latest ScheduleVersion item-деріне charge → interest → principal ретімен бөлінеді; артық сома payment.unallocatedMinor ретінде сақталады. PaymentAllocation және екі жақты obligation ledger бір транзакцияда жасалады.

API guide: [PAYMENT_LEDGER](../01-business/PAYMENT_LEDGER.md). ADR: [ADR-0011](../../adr/ADR-0011-repayment-evidence-confirmation-and-ledger.md).


## Due/overdue worker

QaryzLinkBack PR #6 merged: OverdueWorker database UTC date арқылы unpaid schedule items-ті DUE немесе OVERDUE күйіне ауыстырады. PAID және CANCELLED қайта ашылмайды. Worker injectable service ретінде берілген; multi-replica API ішіндегі cron әдейі қосылмаған.

API guide: [OVERDUE_WORKER](../01-business/OVERDUE_WORKER.md). ADR: [ADR-0012](../../adr/ADR-0012-idempotent-overdue-status-materialization.md).


## Payment reversal

QaryzLinkBack PR #7 merged: lender тек CONFIRMED төлемді міндетті себеппен кері жаза алады. Original payment жойылмайды; REVERSED event reversalOfId арқылы байланысады. Signed allocation кесте балансын қалпына келтіреді, ал ledger-ге қарама-қарсы жазбалар бір транзакцияда қосылады. Бұл операция ақша аудару/қайтару емес.

API guide: [PAYMENT_REVERSAL](../01-business/PAYMENT_REVERSAL.md). ADR: [ADR-0013](../../adr/ADR-0013-immutable-payment-reversal.md).

[CI run 35368226481](https://github.com/nurgeldiserikbay/QaryzLinkBack/actions/runs/35368226481): Prisma migration, typecheck, lint, coverage, build және smoke test сәтті өтті.


## Notification outbox

QaryzLinkBack PR #8 merged: payment CONFIRMED және REVERSED операцияларымен бір транзакцияда privacy-safe NotificationOutbox intent жасалады. Бірегей idempotencyKey қайталап орындағанда duplicate event жасалуына жол бермейді. Қазіргі slice хабарлама жібермейді; provider adapter, claim/retry worker және scheduler бөлек кезеңде қосылады.

API/backend guide: [NOTIFICATION_OUTBOX](../01-business/NOTIFICATION_OUTBOX.md). ADR: [ADR-0014](../../adr/ADR-0014-transactional-notification-outbox.md).

[CI run 35426502155](https://github.com/nurgeldiserikbay/QaryzLinkBack/actions/runs/35426502155): migration, typecheck, lint, coverage, build және smoke test сәтті өтті.


## Notification claim/retry worker

QaryzLinkBack PR #9 merged: NotificationOutboxWorker due rows-ты PostgreSQL FOR UPDATE SKIP LOCKED арқылы атомарлы claim етеді. PROCESSING lease бес минут; қайта іске қосылған worker stale lease-ті қалпына келтіреді. Әрекет саны 5-тен аспайды, retry delay 1 минуттан басталып бір сағатқа дейін өседі; шектен асқан event FAILED болады. Worker provider немесе scheduler шақырмайды.

API/backend guide: [NOTIFICATION_WORKER](../01-business/NOTIFICATION_WORKER.md). ADR: [ADR-0015](../../adr/ADR-0015-leased-notification-outbox-worker.md).

[CI run 35439072635](https://github.com/nurgeldiserikbay/QaryzLinkBack/actions/runs/35439072635): migration, typecheck, lint, coverage, build және smoke test сәтті өтті.
