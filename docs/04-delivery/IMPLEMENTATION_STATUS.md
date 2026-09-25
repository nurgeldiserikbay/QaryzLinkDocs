# Implementation status

Жаңартылған күні: 2026-09-25

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
| Funding evidence/confirmation | Backend flow дайын, storage rollout толық емес | Lender metadata, SHA-256, borrower confirmation/dispute, deadline guard; single-use upload intent issuance + consume және expected-size binding қосылды, storage adapter қалды |
| Schedule generation | Дайын | ACTIVE + CONFIRMED guard, ACT/365 Fixed + HALF_UP, versioned inputHash |
| Payment evidence/confirmation/ledger | Backend flow дайын, storage rollout толық емес | Borrower evidence, lender decision, allocation және append-only ledger; single-use upload intent replay protection қосылды |
| Overdue status worker | Дайын | UTC due/overdue materialization, ACTIVE + CONFIRMED guard, idempotent transaction |
| Payment reversal | Дайын | Lender-authorized immutable reversal, signed allocation restore және opposite ledger entries |
| Notifications/outbox | Базалық slice дайын | Payment CONFIRMED/REVERSED оқиғалары, privacy-safe payload және idempotent outbox |
| Notification claim/retry worker | Базалық slice дайын | SKIP LOCKED claim, 5 минут lease, exponential retry және terminal FAILED |
| Delivery adapter boundary | Базалық slice дайын | Provider-neutral port, dispatch service және safe unavailable default |
| Notification recipient resolution | Базалық slice дайын | Party ID → in-app ID or active verified email, no PII in outbox |
| Notification scheduler/orchestrator | Базалық slice дайын | One-shot claim → sequential dispatch → result counters |
| Notification runtime configuration | Базалық slice дайын | Validated NOTIFICATION_BATCH_SIZE, DI options, deployment guide |
| Notification SMTP adapter | Базалық slice дайын | MAIL_ENABLED gate, generic PII-safe templates, fail-closed router |
| Notification scheduler command | Базалық slice дайын | `pnpm notifications:run`, validated AppModule context, aggregate counters және non-zero failure exit |
| Notification email preference | Базалық slice дайын | PrivacySettings opt-out, profile API және enqueue-time EMAIL filtering |
| Notification delivery metrics | Базалық slice дайын | In-process counters, internal JSON snapshot, staging/production token guard |
| Notification Kubernetes scheduler | Deployment template дайын | CronJob Forbid policy, external Secret, immutable image және non-overlap contract |
| Deployment hardening | Template/CI дайын | Immutable digest rendering, bounded migration job, safe rollout, PDB, node spread, rollback және restore runbooks |
| Provider/scheduler | Жоспарда | Push adapter, queue trigger, persistent metrics/alerting және organization routing |
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
5. Funding evidence және 72 сағаттық borrower confirmation — metadata/confirmation flow орындалды; private-storage signed upload adapter, malware scan және retention integration қалды.
6. Deterministic repayment schedule, payment confirmation және reversal — орындалды.
7. Notification outbox, claim/retry worker, provider-neutral dispatch boundary, one-shot orchestrator, token-protected metrics және Kubernetes CronJob template — орындалды; нақты provider rollout, queue trigger, persistent monitoring және alerting.
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

## Evidence upload intent hardening

QaryzLinkBack PR #94 және #97 merged: funding/payment evidence submission енді міндетті single-use upload intent UUID қабылдайды. Intent authenticated user, contract, purpose, objectKey, SHA-256, media type және expected size-қа байланған; expired, mismatched немесе replay intent conditional update арқылы қабылданбайды. Intent consume және evidence persistence бір database transaction ішінде орындалады.

Бұл private object storage толық дайын дегенді білдірмейді. Client-facing intent issuance endpoint орындалды. Signed upload/download adapter, malware scan/quarantine және retention/deletion integration production gate ретінде ашық қалады. EVIDENCE_STORAGE_ENABLED нақты storage operational verification өтпейінше қосылмайды.

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


## Notification delivery boundary

QaryzLinkBack PR #10 merged: NotificationDeliveryPort және dispatch service provider-specific кодты outbox lifecycle-ден бөледі. Сәтті adapter call ғана SENT күйіне жеткізеді; қате retry/FAILED policy-іне өтеді. Әдепкі UnavailableNotificationAdapter сыртқы хабарлама жібермей fail-closed жұмыс істейді.

API/backend guide: [NOTIFICATION_DELIVERY](../01-business/NOTIFICATION_DELIVERY.md). ADR: [ADR-0016](../../adr/ADR-0016-provider-neutral-notification-delivery.md).

[CI run 35442859823](https://github.com/nurgeldiserikbay/QaryzLinkBack/actions/runs/35442859823): migration, typecheck, lint, coverage, build және smoke test сәтті өтті.


## Notification scheduler/orchestrator

QaryzLinkBack PR #11: `NotificationSchedulerService.runOnce(limit)` worker claim-дерін delivery service арқылы ретімен dispatch етеді және `claimed/sent/pending/failed` санауыштарын қайтарады. Сервис cron, queue немесе provider credential қоспайды; оны deployment adapter кейін шақырады.

API/backend guide: [NOTIFICATION_SCHEDULER](../01-business/NOTIFICATION_SCHEDULER.md). ADR: [ADR-0017](../../adr/ADR-0017-notification-scheduler-orchestrator.md).

[CI run 35497154574](https://github.com/nurgeldiserikbay/QaryzLinkBack/actions/runs/35497154574): scheduler slice үшін typecheck, lint, coverage және build тексеріледі.


## Notification runtime configuration

QaryzLinkBack PR #12: `NOTIFICATION_BATCH_SIZE` environment variable 1–100 диапазонында тексеріледі, әдепкісі 50. Scheduler limit берілмесе осы мәнді қолданады; invalid configuration startup кезінде fail-fast тоқтайды.

Operations guide: [NOTIFICATION_RUNTIME_CONFIG](../06-operations/NOTIFICATION_RUNTIME_CONFIG.md). ADR: [ADR-0018](../../adr/ADR-0018-deployable-notification-configuration.md).

[CI run 35510328529](https://github.com/nurgeldiserikbay/QaryzLinkBack/actions/runs/35510328529): typecheck, lint, coverage және build сәтті өтті.


## Notification recipient resolution

QaryzLinkBack PR #13: delivery алдында party ID channel-specific ephemeral destination-ға аударылады. IN_APP party ID арқылы, EMAIL тек ACTIVE және verified owner email арқылы шешіледі. Destination жоқ болса provider шақырылмай, claim retry/FAILED policy-іне өтеді.

API/backend guide: [NOTIFICATION_DESTINATIONS](../01-business/NOTIFICATION_DESTINATIONS.md), [NOTIFICATION_DELIVERY](../01-business/NOTIFICATION_DELIVERY.md). ADR: [ADR-0019](../../adr/ADR-0019-notification-recipient-destinations.md).

[CI run 35512393331](https://github.com/nurgeldiserikbay/QaryzLinkBack/actions/runs/35512393331): destination resolver, delivery tests, typecheck, lint, coverage және build сәтті өтті.


## Notification SMTP adapter

QaryzLinkBack PR #14: EMAIL destination-дар `SmtpNotificationAdapter` арқылы generic PII-free мәтінмен жіберіледі. `MAIL_ENABLED=false` кезінде transport құрылмайды; provider errors sanitized, ал IN_APP channel unavailable adapter арқылы fail-closed қалады.

Operations guide: [NOTIFICATION_SMTP](../06-operations/NOTIFICATION_SMTP.md). ADR: [ADR-0020](../../adr/ADR-0020-fail-closed-smtp-notifications.md).

[CI run 35514028534](https://github.com/nurgeldiserikbay/QaryzLinkBack/actions/runs/35514028534): renderer, SMTP adapter, router, typecheck, lint, coverage және build сәтті өтті.


## Notification scheduler command

QaryzLinkBack PR #15: production build құрамына бір реттік `pnpm notifications:run` command қосылды. Ол HTTP server іске қоспай, `AppModule` application context арқылы `NotificationSchedulerService.runOnce()` шақырады, aggregate counters логтайды және күтпеген bootstrap/scheduler қатесінде non-zero exit code қайтарады.

Operations guide: [NOTIFICATION_SCHEDULER](../01-business/NOTIFICATION_SCHEDULER.md), [DEPLOYMENT](../06-operations/DEPLOYMENT.md). ADR: [ADR-0021](../../adr/ADR-0021-one-shot-notification-scheduler-command.md).

[CI run 35514521800](https://github.com/nurgeldiserikbay/QaryzLinkBack/actions/runs/35514521800): migration, typecheck, lint, coverage, build және smoke test сәтті өтті.


## Notification email preference

QaryzLinkBack PR #16: profile privacy settings-ке `emailNotificationsEnabled` қосылды. `false` болса, optional EMAIL intent outbox-қа enqueue кезінде жазылмайды; IN_APP арнасы өзгермейді.

API/business guide: [NOTIFICATION_PREFERENCES](../01-business/NOTIFICATION_PREFERENCES.md), [NOTIFICATION_DESTINATIONS](../01-business/NOTIFICATION_DESTINATIONS.md). ADR: [ADR-0022](../../adr/ADR-0022-optional-email-notification-preference.md).

[CI run 35514976266](https://github.com/nurgeldiserikbay/QaryzLinkBack/actions/runs/35514976266): migration, Prisma validation, typecheck, lint, coverage, build және smoke test сәтті өтті.


## Notification delivery metrics

QaryzLinkBack PR #17 merged: NotificationMetricsService scheduler run-дарын in-process counters ретінде жинайды. GET /api/v1/metrics/notifications endpoint тек runs, claimed, sent, pending, failed және timing snapshot қайтарады; recipient, payload, contact және financial identifiers шығарылмайды.

Operations guide: [NOTIFICATION_METRICS](../06-operations/NOTIFICATION_METRICS.md). ADR: [ADR-0023](../../adr/ADR-0023-notification-delivery-metrics.md).

[CI run 35516744602](https://github.com/nurgeldiserikbay/QaryzLinkBack/actions/runs/35516744602): Prisma format/generate/validate, migration, typecheck, lint, coverage, build және smoke test сәтті өтті.

Бұл in-process baseline process restart кезінде reset болады. Prometheus/OpenTelemetry export, persistent history, alerting және internal ingress authentication кейінгі production hardening кезеңіне қалды.


## Notification metrics security

QaryzLinkBack PR #18 merged: staging және production environment үшін METRICS_ACCESS_TOKEN міндетті болды. GET /api/v1/metrics/notifications endpoint x-metrics-token header-ін timing-safe салыстыру арқылы тексереді және token жоқ/қате болса fail-closed 401 қайтарады.

[CI run 35517874174](https://github.com/nurgeldiserikbay/QaryzLinkBack/actions/runs/35517874174): typecheck, lint, coverage, build және smoke test сәтті өтті. Metrics endpoint-тің ingress арқылы тек internal қолжетімділігі staging acceptance кезінде бөлек тексеріледі.

## Notification Kubernetes scheduler

QaryzLinkDocs-та notification scheduler-ді әр бес минут сайын іске қосатын Kubernetes CronJob template қосылды. concurrencyPolicy: Forbid, backoffLimit: 0, external Secret және immutable image policy бекітілді.

Operations guide: [NOTIFICATION_CRONJOB](../06-operations/NOTIFICATION_CRONJOB.md). ADR: [ADR-0024](../../adr/ADR-0024-notification-kubernetes-cronjob.md).

Бұл template нақты cluster namespace, registry, image digest немесе secret мәндерін қамтымайды. Staging rollout және job alerting әлі release gate болып қалады.


## Notification staging smoke contract

QaryzLinkBack PR #19 merged: CI compiled smoke test енді health, unauthenticated API, metrics token жоқ жағдайындағы 401 және дұрыс METRICS_ACCESS_TOKEN header-імен 200 жауаптарын тексереді.

[CI run 35520106084](https://github.com/nurgeldiserikbay/QaryzLinkBack/actions/runs/35520106084) толық өтті. Staging үшін дәл осы contract [NOTIFICATION_CRONJOB](../06-operations/NOTIFICATION_CRONJOB.md) нұсқаулығындағы HTTP smoke checks арқылы қайталанады. Нақты Secret мәндері Docs-та сақталмайды.

## Foundation hardening update — 2026-09-21

QaryzLinkBack:

- Auth access-token guard бос bearer token, бос user/session identifier, revoked session және session storage failure жағдайларын fail-closed 401 ретінде өңдейді.
- Public health privacy contract тек status, service, timestamp және uptimeSeconds өрістерін бекітеді.
- Metrics endpoint token protection және metrics response-тың PII-сыз operational counters шекарасы тестпен бекітілген.

QaryzLinkFront:

- API client URL normalization, explicit Authorization header және typed 401/503 error mapping тесттері қосылды.
- Client session тек temporary sessionStorage арқылы save/read/clear жасайды; malformed session data discard етіледі.
- Browser metrics token қолданбайтыны contract test арқылы тексерілді.

QaryzLinkAdmin:

- Public health card тек read-only liveness endpoint-ке қосылады.
- Audit модулі live feed-ке қосылмаған, PII hidden және mutation жоқ.
- Health response-та күтпеген identity/secret өрістері болса, Admin fail-closed режиміне өтеді.

QaryzLinkDocs:

- Staging smoke, backup/restore және privacy-safe monitoring runbook-тары қосылды.

Бұл өзгерістер Phase 1 foundation hardening болып саналады. Нақты staging deploy, restore drill және production monitoring execution әлі орындалған жоқ; олар environment owner және адам review талап етеді.


## Backend readiness — 2026-09-21

QaryzLinkBack PR #25 merged at `4c6bae889cc1915afcf99b5ac31da0b2e306631b`: public liveness contract өзгермей, бөлек `GET /api/v1/health/ready` readiness endpoint қосылды. Ол PostgreSQL dependency-ін тексереді, тек coarse `database: up/down` күйін қайтарады және dependency unavailable болса 503 fail-closed response береді. Database error details response-қа шығарылмайды.

[CI run 35596649387](https://github.com/nurgeldiserikbay/QaryzLinkBack/actions/runs/35596649387): Prisma format/generate/validate, migrations, quality checks және compiled smoke test сәтті өтті. Нақты staging readiness probe әлі environment acceptance кезінде тексеріледі.


## Dependency security gates — 2026-09-21

Production dependency audit (`pnpm audit --prod --audit-level=high`) енді Back, Front және Admin CI pipelines ішінде міндетті gate ретінде орындалады.

- QaryzLinkBack PR #26 merged at `391621a`; CI run 35618858948 passed. Audit енгізу барысында high-severity transitive advisories табылып, dependency versions/overrides түзетілді; readiness compiled smoke test те CI-ға қосылды.
- QaryzLinkFront PR #11 merged at `9d32c9b`; CI run 35621178723 passed.
- QaryzLinkAdmin PR #7 merged at `673662e`; CI run 35621228319 passed.

Бұл CI dependency gate-тері staging/production container image scanning, SBOM, secret scanning немесе runtime monitoring орындалды дегенді білдірмейді.


## Supply-chain CI — 2026-09-21

Back, Front және Admin реполарында PR/push және апталық schedule үшін full-history Gitleaks secret scan және CycloneDX SBOM generation қосылды. Барлық алғашқы тексерулер green: Back runs 35622988019/35622987930, Front 35622995911/35622995877, Admin 35623001475/35623001458. Merged commits: Back `779e96b`, Front `b1b0ddc`, Admin `af6c432`.

SBOM artifact upload әдейі өшірулі: retention/access policy әлі бекітілмеген. Container image vulnerability scan және operational security review әлі pending.


## Reproducible backend builds — 2026-09-22

- QaryzLinkBack PR #30 merged at `8c51a5b94610281b9f83a0ff56ce2c755dc65eab`.
- `pnpm-lock.yaml` is committed and pins the pnpm 12.4.2 dependency graph.
- Backend CI and Docker builds use `pnpm install --frozen-lockfile` and fail if manifests drift from the lockfile.
- CI run 35685722942 and Supply Chain Security run 35685722920 passed before merge.
- This does not claim deterministic container bytes across base-image updates; immutable production image digest pinning remains a deployment gate.


## Deployment hardening update — 2026-09-24

QaryzLinkBack PR #60–#72 кезеңінде deployment baseline және production-safety contracts күшейтілді: immutable image digest rendering, compiled maintenance runtime, Kubernetes non-root/seccomp/service-account-token hardening, bounded migration Job, zero-unavailable rolling update + startup probe, PodDisruptionBudget, hostname topology spread, API rollback runbook және isolated PostgreSQL restore-drill runbook қосылды. Тиісті CI және Supply Chain checks green болған өзгерістер main-ге merge жасалды.

Бұл код/configuration readiness қана. Нақты staging deploy, backup restore drill, ingress/TLS, SMTP delivery, object-storage security және monitoring/alerting environment owner тарапынан әлі орындалуы керек.
