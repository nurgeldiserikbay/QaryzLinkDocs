# Implementation status

Жаңартылған күні: 2026-09-26

Бұл құжат specification мен нақты код арасындағы қысқа бақылау нүктесі. Толық талаптар өзгермейді; мұнда тек орындалу күйі көрсетіледі.

## Жалпы күй

| Бағыт | Күйі | Нәтиже |
|---|---|---|
| Product және business specification | Дайын | MVP шекарасы, state machine, privacy және calculation rules бекітілді |
| Backend foundation | Дайын | NestJS/Fastify modular monolith, Prisma/PostgreSQL, Docker, CI |
| IAM | Базалық нұсқа дайын | Register, login, refresh token rotation, current-session logout, email verification |
| Profile, privacy және deletion request | Базалық нұсқа дайын | Өз профилін/ privacy баптауларын басқару және retention-aware account deletion request жіберу |
| Database migration | Дайын | Бастапқы schema versioned SQL migration ретінде бекітілді |
| Discovery | Restricted slice дайын | Private request, exact invitation, proposal, atomic acceptance |
| Contract draft/signing | Дайын | Accepted proposal-дан immutable ContractVersion v1, privacy-safe read, dual hash acknowledgement |
| Funding evidence/confirmation | Backend + storage adapter baseline дайын, operational rollout толық емес | Single-use intent, S3-compatible signed PUT/GET, HEAD verification, trusted malware verdict registry, quarantine/orphan cleanup және aggregate metrics бар; external scanner, staging acceptance және retention policy қалды |
| Schedule generation | Дайын | ACTIVE + CONFIRMED guard, ACT/365 Fixed + HALF_UP, versioned inputHash |
| Payment evidence/confirmation/ledger | Backend + storage adapter baseline дайын, operational rollout толық емес | Borrower evidence, lender decision, allocation/ledger, size-bound replay protection және verified CLEAN-object gate бар |
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
| Notification delivery metrics | Persistent aggregate slice дайын | PostgreSQL singleton counters, cross-process scheduler/API snapshot және staging/production token guard |
| Notification Kubernetes scheduler | Deployment template дайын | CronJob Forbid policy, external Secret, immutable image және non-overlap contract |
| Deployment hardening | Template/CI дайын | Immutable digest rendering, bounded migration job, safe rollout, PDB, node spread, rollback және restore runbooks |
| Provider/scheduler | Жоспарда | Push adapter, queue trigger, external metrics collector/alerting және organization routing |
| Front/Admin UI | Front + Admin vertical slices жүріп жатыр | Front-та auth/discovery/contract/lifecycle/settings/account-deletion request; Admin-та liveness, database readiness, evidence-storage, notification-delivery, audit және account-deletion aggregate operations cards бар; identity-level feeds әлі өшірулі |

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

1. Email verification backend және Front verification беті аяқталды; нақты SMTP staging delivery/inbox тексеруі қалды.
2. Invite-only loan request/offer/proposal use cases.
3. Бір ұсынысты қабылдағанда қалған proposal-дарды атомарлы жабу.
4. Contract version және екі тараптың қол қою workflow-ы — орындалды: [contract signing](../01-business/CONTRACT_SIGNING.md).
5. Funding evidence және 72 сағаттық borrower confirmation — metadata/confirmation, S3-compatible signed upload/download, HEAD verification, trusted scan verdict registry және orphan cleanup орындалды; external scanner integration, staging acceptance және consumed-evidence retention policy қалды.
6. Deterministic repayment schedule, payment confirmation және reversal — орындалды.
7. Notification outbox, claim/retry worker, provider-neutral dispatch boundary, one-shot orchestrator, PostgreSQL-backed token-protected aggregate metrics және Kubernetes CronJob template — орындалды; нақты provider rollout, queue trigger, external collector және alerting қалды.
8. Front vertical slice: auth → email verification → private discovery/proposal → read-only contract draft → read-only funding/schedule/payment lifecycle → profile/privacy settings → guarded account-deletion request. Admin vertical slice те басталды: public liveness + server-rendered database readiness + evidence/notification aggregate operations visibility; mutations және identity-level audit feed өшірулі.

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
QaryzLinkFront PR #13 email verification page, fragment token parsing, resend/status және explicit confirm flow қосты; тіркелуден кейін user осы бетке өтеді. Нақты SMTP жеткізу/inbox placement staging-та әлі тексерілмеген; MAIL_ENABLED=false әдепкі күйде.
Шешім мен workflow: [ADR-0006](../../adr/ADR-0006-email-verification.md).
Орнату: [Deployment](../06-operations/DEPLOYMENT.md), [иесінен қажет мәліметтер](../06-operations/OWNER_CHECKLIST.md), [release checklist](../06-operations/RELEASE_CHECKLIST.md).


## Front user vertical slice — 2026-09-26

QaryzLinkFront PR #13 merged at `e96dba3`: email verification journey Backend `/api/v1/auth/email/*` contract-ына қосылды. Token URL fragment-тен ғана оқылады, confirm explicit user action арқылы орындалады, 401/400/429/503 күйлері privacy-safe UI state-терге mapped.

QaryzLinkFront PR #14 merged at `ba3221a`: authenticated `/dashboard/settings` page Backend `GET/PATCH /api/v1/profile/me` contract-ын қолданады. User display name/timezone, publicId/contact search visibility, public profile opt-in, analytics consent және optional email notification preference-ін өзі басқарады.

Front-та бұған дейін auth/register, private discovery list/create/detail, exact invitation, role-aware proposal/decision және read-only contract draft бар. QaryzLinkFront PR #15 contract detail бетіне funding күйі, келесі unpaid schedule item және confirmed payment total үшін read-only lifecycle summary қосты.

QaryzLinkFront PR #16 merged at `39213e4`: settings ішіне account deletion request flow қосылды. Destructive action profile save form-нан бөлек, user `ЖОЮ` деп explicit confirmation енгізеді, содан кейін `POST /api/v1/profile/me/deletion-request` шақырылады. Backend request-ті қабылдағанда барлық active session revoke етеді; Front local sessionStorage-ды да дереу тазалап, instant hard-delete емес, grace/retention-aware processing екенін көрсететін accepted state-ке өтеді. UI fixed deletion date уәде етпейді және retained contract/payment/ledger/evidence records туралы ескертеді.

Public marketplace, contract signing mutation, funding/payment mutation және production evidence upload UI legal/operations gate өтпейінше Front-та қосылмайды.


## Admin operations visibility — 2026-09-26

QaryzLinkAdmin PR #9 merged at `8757850`: protected `GET /api/v1/metrics/evidence` counters server-side ғана оқылады. `METRICS_ACCESS_TOKEN` browser code-қа шықпайды; Admin тек active/expired/consumed upload intent, malware verdict totals және orphan age сияқты aggregate көрсеткіштерді қабылдайды. Unexpected user/object/hash fields strict response validation арқылы reject болады.

QaryzLinkBack PR #111 merged at `87ce73a`: notification delivery metrics process-local memory-ден PostgreSQL singleton aggregate snapshot-қа көшті. One-shot `pnpm notifications:run` процесі мен API процесі енді бір counters state-ті бөліседі; migration, PostgreSQL integration test, compiled smoke және container security scan green болды (CI 36237408886, Supply Chain 36237408938).

QaryzLinkAdmin PR #10 merged at `a596ddd`: notification scheduler runs/claimed/sent/pending/failed және last-run timing server-rendered operations card ретінде қосылды. Бұл card Backend #111-ге тәуелді; recipient, payload және contact data Admin contract-ына кірмейді.

QaryzLinkAdmin PR #11 merged at `18d7310`: public `GET /api/v1/health/ready` contract server-side readiness card-қа қосылды. Admin тек `ready/not_ready` және sanitized `database: up/down` күйін қабылдайды; HTTP 503 not-ready state ретінде көрсетіледі, ал күтпеген dependency details немесе status/body mismatch fail-closed reject болады.

QaryzLinkBack PR #112 merged at `53c158a`: protected `GET /api/v1/metrics/audit` aggregate-only audit snapshot қосты. Response тек total event count, соңғы 24 сағат/7 күн counts, соңғы 7 күндегі actorless event count және capture time қайтарады; actorUserId, entityId, requestId, action және payload endpoint contract-ына кірмейді.

QaryzLinkAdmin PR #12 merged at `d7b14bf`: audit placeholder server-rendered aggregate operations card-пен ауыстырылды. Client exact aggregate schema-ны ғана қабылдайды және identity/entity/payload өрістері пайда болса fail-closed reject етеді. METRICS_ACCESS_TOKEN browser bundle-ға шықпайды.

QaryzLinkBack PR #113 merged at `e46cb55`: protected `GET /api/v1/metrics/account-deletions` deletion lifecycle backlog-ты aggregate түрде шығарады. Response REQUESTED, RETENTION_HOLD, READY, COMPLETED counts, oldest pending age және capture time ғана береді; userId, requestId, email/phone және request detail өрістері contract-қа кірмейді.

QaryzLinkAdmin PR #14 merged at `2ebda23`: account deletion retention queue server-rendered operations card ретінде қосылды. Admin identity-level deletion review немесе mutation жасамайды; exact aggregate schema-дан артық identity/request fields fail-closed reject болады.

QaryzLinkBack PR #114 merged at `1eaf8e5`: account anonymization кезінде deleted `publicId` және password placeholder енді internal userId-ден deterministic SHA-256 арқылы туындамайды. Оның орнына cryptographically random opaque token қолданылады, сондықтан retained internal user identifier мен anonymized external placeholder арасында қажетсіз корреляция қалмайды.

QaryzLinkBack PR #115 merged at `ff50158`: compiled application smoke test notifications, evidence, audit және account-deletion metrics endpoint-терін толық қамтиды. Әр endpoint token-сыз 401, valid `METRICS_ACCESS_TOKEN`-мен 200 беруі тиіс; authorized JSON ішінде email, phone, userId, objectKey, sha256, entityId, requestId немесе payload field-тері болмауы CI gate арқылы тексеріледі.

QaryzLinkBack PR #116 merged at `9e0a57c`: `accounts:deletion:run` one-shot maintenance command notification/evidence command-тарымен бір failure contract-қа келтірілді. Command aggregate readiness/anonymization result-ін structured түрде логтайды, application context-ті жабады және bootstrap/processor қатесінде sanitized error + non-zero exit code береді.

QaryzLinkBack PR #117 merged at `d89699b`: compiled `accounts:deletion:run` command CI smoke gate-ке қосылды. Алғашқы smoke successful result stdout-та observable емес екенін тапты; command machine-readable aggregate JSON stdout contract-ына түзетілді, failure generic stderr + non-zero exit күйінде қалды. Empty migrated CI database-та `evaluated=0` және `completed=0` runtime smoke арқылы бекітілді.

QaryzLinkBack PR #122 merged at `e7a2866`: compiled HTTP security smoke fresh account privacy defaults-тың closed күйін, account deletion request-тің 202 REQUESTED contract-ын және deletion request-тен кейін сол active bearer session-ның дереу 401 болуын end-to-end тексереді.

Support/incident/dispute operational baseline Docs-та `INCIDENT_RESPONSE.md` және `SUPPORT_AND_DISPUTES.md` runbook-тарымен толықтырылды. Нақты support owner/channel, legal escalation contact және response target public pilot алдында owner тарапынан бекітіледі.

Admin mutations, identity-level audit feed, contract/funding/payment management әрекеттері әлі өшірулі. Бұл кезең operational visibility ғана.


## HTTP/browser hardening — 2026-09-26

QaryzLinkBack PR #118 merged at `7147af8`: reverse-proxy client IP trust енді explicit `TRUST_PROXY_HOPS` арқылы 0–3 hop диапазонында басқарылады. Әдепкі 0 кезінде Fastify `trustProxy=false` болып қалады; forged `X-Forwarded-For`/Forwarded header auth rate-limit identity-ін өзгерте алмайды. Compiled HTTP smoke әр login attempt-та forged IP-ді ауыстырып, соған қарамастан transport-IP budget sixth attempt-те 429 беретіні тексерілді. Non-zero hop тек staging ingress topology/header sanitization acceptance-тен кейін қойылады.

QaryzLinkBack PR #119 merged at `4d100d1`: compiled application smoke synthetic exact CORS allowlist-пен іске қосылып, тек configured origin үшін `Access-Control-Allow-Origin`/credentials header барын және бөтен origin үшін allow-origin жоқ екенін тексереді.

QaryzLinkBack PR #121 merged at `6d352d5`: `EXPOSE_API_DOCS` validated configuration-ға кірді және production-та true болса startup fail-fast тоқтайды. Staging explicit opt-in жасай алады; production Swagger exposure environment flag арқылы кездейсоқ қосылмайды.

QaryzLinkFront PR #17 merged at `c3c89e7` және QaryzLinkAdmin PR #16 merged at `bf4b4e9`: browser CSP `connect-src` generic `https:` рұқсатынан exact public API origin allowlist-ке тарылды. Production-та `'self'` + `NEXT_PUBLIC_API_BASE_URL` origin ғана; Admin server-only `QARYZLINK_API_BASE_URL` және `METRICS_ACCESS_TOKEN` browser CSP-ге кірмейді.

QaryzLinkFront PR #18 merged at `f60bf6c` және QaryzLinkAdmin PR #17 merged at `a1c6372`: CI production Next server-ді нақты іске қосып, HTTP response-та CSP exact API origin, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` және `X-Powered-By` жоқтығын runtime smoke арқылы тексереді. Synthetic API origin тек екінші production build/smoke қадамына scoped, сондықтан API client unit tests өз deterministic local configuration-мен қалады.


## Funding evidence және borrower confirmation

QaryzLinkBack PR #3 merged: signed contract енді Funding EVIDENCE_REQUIRED жасайды. Lender private object key + SHA-256 metadata береді, borrower CONFIRM/DISPUTE шешімін сақтайды. CONFIRMED болғанда ғана Contract ACTIVE болады.

API guide: [FUNDING_EVIDENCE](../01-business/FUNDING_EVIDENCE.md). ADR: [ADR-0009](../../adr/ADR-0009-funding-evidence-and-confirmation.md).

## Evidence upload intent hardening

QaryzLinkBack PR #94 және #97 merged: funding/payment evidence submission енді міндетті single-use upload intent UUID қабылдайды. Intent authenticated user, contract, purpose, objectKey, SHA-256, media type және expected size-қа байланған; expired, mismatched немесе replay intent conditional update арқылы қабылданбайды. Intent consume және evidence persistence бір database transaction ішінде орындалады.

QaryzLinkBack PR #99 provider-neutral signed upload authorization boundary қосты: intent response storage adapter configured болса қысқа мерзімді PUT URL/headers береді; әдепкі adapter deliberately unavailable және 503 EVIDENCE_STORAGE_UNAVAILABLE арқылы fail-closed қалады.

QaryzLinkBack PR #100 storage object verification boundary қосты: evidence persistence алдында authenticated scope prefix, SHA-256, media type, expected size және malware scan `CLEAN` күйі тексеріледі. Missing/mismatched/non-clean object fail-closed қабылданбайды; inspector provider қатесі 503 EVIDENCE_STORAGE_UNAVAILABLE болады.

QaryzLinkBack PR #101 persisted funding/payment evidence үшін participant-only signed download boundary қосты. Тек verified active borrower/lender қысқа мерзімді GET authorization ала алады; outsider және unknown evidence privacy-safe бірдей `EVIDENCE_NOT_FOUND` береді.

QaryzLinkBack PR #102 concrete dependency-free AWS Signature V4 S3-compatible PUT/GET signer қосты. PR #103 signed HEAD inspection арқылы content type, content length, expected SHA-256/size metadata-ны тексереді және trusted malware verdict болмаса fail-closed қалады. PR #104 objectKey + SHA-256 бойынша PostgreSQL malware verdict registry және token-protected callback қосты; stale/replayed callback CLEAN/INFECTED күйін төмендете алмайды. PR #105 expired unconsumed upload object-терін қауіпсіз жоятын cleanup service қосты. PR #106 one-shot cleanup command пен hardened Kubernetes CronJob template арқылы осы cleanup-ты operational schedule-ге шығарды. PR #107 signed download алдында current malware verdict-ті қайта тексереді, сондықтан кейін INFECTED/FAILED/PENDING болған persisted evidence жаңа GET authorization ала алмайды. PR #108 trusted INFECTED verdict сақталғаннан кейін private object-ті дереу purge етеді; delete уақытша сәтсіз болса scanner 503 алып retry жасай алады, ал verdict fail-closed күйде қалады. PR #109 protected `/api/v1/metrics/evidence` endpoint арқылы expired orphan backlog, consumed/unconsumed intent және CLEAN/INFECTED/FAILED verdict aggregate counters-ын PII-сыз monitoring-ке шығарады. PR #110 scanner callback verdict-ін issued upload intent-ке exact objectKey + SHA-256 бойынша байлап, never-issued және expired-unconsumed object verdict-терін fail-closed reject етеді; consumed evidence later re-scan үшін сақталады.

Бұл private object storage production-ready дегенді білдірмейді. Нақты bucket/least-privilege credential, external scanner/event integration, staging end-to-end acceptance, metrics collector/alert thresholds және consumed evidence retention/deletion policy environment/legal gate ретінде ашық қалады. Operations guide: [EVIDENCE_STORAGE](../06-operations/EVIDENCE_STORAGE.md). `EVIDENCE_STORAGE_ENABLED` осы acceptance өтпейінше production-да қосылмайды.

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

QaryzLinkBack PR #17 бастапқы privacy-safe metrics contract-ын қосты. QaryzLinkBack PR #111 оны PostgreSQL-backed singleton aggregate snapshot-қа ауыстырды: one-shot scheduler процесі жазған runs, claimed, sent, pending, failed және timing counters API процесінен restart-тан кейін де оқылады. Recipient, payload, contact және financial identifiers сақталмайды және endpoint арқылы шығарылмайды.

Operations guide: [NOTIFICATION_METRICS](../06-operations/NOTIFICATION_METRICS.md). ADR: [ADR-0023](../../adr/ADR-0023-notification-delivery-metrics.md).

[CI run 35516744602](https://github.com/nurgeldiserikbay/QaryzLinkBack/actions/runs/35516744602): Prisma format/generate/validate, migration, typecheck, lint, coverage, build және smoke test сәтті өтті.

Aggregate snapshot process restart кезінде жоғалмайды және scheduler/API арасында ортақ PostgreSQL арқылы көрінеді. Per-run historical telemetry әдейі сақталмайды; Prometheus/OpenTelemetry export, external collector/alerting және internal ingress acceptance кейінгі production hardening кезеңіне қалады.


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

- Public health card read-only liveness endpoint-ке қосылады; бөлек server-rendered readiness card тек sanitized database `up/down` күйін көрсетеді.
- Evidence-storage және notification-delivery metrics server component арқылы ғана оқылады; `METRICS_ACCESS_TOKEN` browser bundle-ға шықпайды.
- Metrics clients exact aggregate schema-ны ғана қабылдайды; күтпеген identity/object/payload өрістері fail-closed reject болады.
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

## GitHub Actions quota optimization — 2026-09-26

QaryzLinkBack PR #123 merged at `9e4cd2a`, QaryzLinkFront PR #21 merged at `5ca2b84`, QaryzLinkAdmin PR #20 merged at `390fa94`.

PR quality checks енді docs-only өзгерістерде skip болады және жаңа commit келгенде superseded run cancel етіледі. Supply-chain secret/SBOM workflow әр PR-да емес, main push + weekly/manual режимінде жүреді. Backend Docker+Trivy image scan weekly/manual ғана. Front/Admin security smoke `pnpm check` жасаған configured production build-ті қайта қолданады, екінші Next build жойылды.

CycloneDX SBOM 14 күндік Actions artifact ретінде сақталады. Осы өзгерістер merge кезінде GitHub Actions runner account billing/free-usage gate салдарынан job-тарды бастамады; quota қайта ашылғанда бір successful main/manual run acceptance evidence ретінде қажет.

Front/Admin initial pnpm lockfile әлі жоқ; олардағы frozen install бөлек pending reproducibility gate болып қалды.

## Ephemeral auth retention — 2026-09-26

QaryzLinkBack PR #124 merged at `73dea46`: daily one-shot cleanup expired/consumed email-verification records және expired auth rate-limit buckets-ты ғана жояды. Session, contract, payment, ledger және persisted evidence history өзгермейді. Kubernetes CronJob template пен aggregate-only command output қосылды.

Бұл өзгеріс GitHub Actions free-quota/billing gate job-тарды бастатпай тұрған кезде merge жасалды; automated verification pending. Retention boundaries `DATA_RETENTION.md` ішінде бекітілді. Full PII database encryption және legal retention periods әлі ашық release gate.

## Auth retention operations visibility — 2026-09-26

QaryzLinkBack PR #125 merged at `f7b2443`: protected `/api/v1/metrics/auth-retention` endpoint expired email-verification және expired auth rate-limit backlog counts-ты aggregate түрде береді. Identity, email, token немесе request details response-қа кірмейді; endpoint `METRICS_ACCESS_TOKEN` арқылы қорғалған.

QaryzLinkAdmin PR #22 merged at `1301fe0`: auth-retention backlog server-rendered read-only card ретінде қосылды. Client exact aggregate schema-ны ғана қабылдайды және identity/contact field пайда болса fail-closed reject етеді.

QaryzLinkBack PR #126 merged at `7887425`: quota қайта ашылғанда compiled metrics smoke жаңа auth-retention endpoint-ті де authorization/privacy contract-пен тексереді.

QaryzLinkAdmin PR #23 merged at `8d84c60`: Admin README current retention operations visibility-мен синхрондалды.

Бұл slice GitHub Actions account free-quota/billing gate салдарынан automated run орындалмай тұрған кезде merge жасалды; verification pending.

## PII encryption groundwork — 2026-09-26

QaryzLinkBack PR #127 merged at `39a9da2`: ADR-0026 implementation-ының isolated crypto primitive-і қосылды. Utility AES-256-GCM random nonce, record/field-bound AAD, versioned key ID және бөлек HMAC-SHA-256 blind lookup hash береді.

Бұл primitive әзірге Prisma schema, register/login, email verification немесе profile path-қа қосылмаған. Сондықтан production data behavior өзгермейді. Automated CI GitHub Actions free-quota/billing gate салдарынан pending; келесі кезең additive schema + dual-write migration болады және verification қайта ашылғанша big-bang cutover жасалмайды.

## PII additive storage phase — 2026-09-26

QaryzLinkBack PR #128 merged at `dda0797`: ADR-0026 Phase A additive schema енгізілді. `users` table-ға nullable `emailCiphertext`, `emailLookupHash`, `phoneCiphertext`, `phoneLookupHash`, ал email verification record-қа nullable encrypted email field қосылды. Existing plaintext columns және current auth behavior өзгермейді.

`PII_CONTACT_STORAGE_MODE` әдепкіде `plaintext`. `dual` немесе `encrypted` режимін таңдағанда active key id, versioned keyring және бөлек 32-byte blind-lookup key міндетті түрде validated; key material толық емес болса startup fail-closed.

Account anonymization болашақ encrypted/hash contact columns-ды да тазалайды. Automated CI GitHub Actions quota/billing gate салдарынан pending; additive migration + plaintext default арқасында бұл кезең behavior-preserving болып қалады.

## PII key rotation operations — 2026-09-26

QaryzLinkBack PR #137 merged at `22fff98`: bounded manual re-encryption command old-key user email/phone және active verification ciphertext-терін current active encryption key-ге ауыстырады. Lookup hash өзгермейді; result aggregate-only, partial failure retryable.

QaryzLinkBack PR #138 merged at `ead3504`: protected aggregate key-rotation backlog endpoint қосылды. PR #139 merged at `76e2d0b`: plaintext compatibility mode explicit `enabled=false` күйін қайтарады, сондықтан zero backlog retirement-ready деп қате оқылмайды.

QaryzLinkAdmin PR #25 merged at `62c1120`: old-key user/verification backlog read-only card ретінде көрінеді; contact/key/ciphertext fields client schema-да қабылданбайды.

Operational sequence `PII_KEY_ROTATION.md` runbook-ында бекітілді. Automated CI GitHub Actions quota/billing gate салдарынан pending; encrypted-mode staging acceptance және plaintext retirement әлі release gate болып қалады.

## PII plaintext retirement readiness — 2026-09-26

QaryzLinkBack PR #140 merged at `2d15c6e`: protected aggregate retirement readiness endpoint current storage mode, plaintext user/verification row counts және missing encrypted-copy counts береді. `readyToScrub=true` тек encrypted mode және zero missing encrypted copies кезінде болады.

QaryzLinkAdmin PR #26 merged at `3052470`: retirement readiness read-only card ретінде көрсетіледі; contact/identity fields exact schema contract арқылы reject болады.

`PII_PLAINTEXT_RETIREMENT.md` destructive phase-ты екіге бөледі: алдымен bounded plaintext value scrub, кейін бөлек legacy compatibility/schema column removal. Automated CI/staging acceptance орындалмайынша destructive command/migration әдейі енгізілмейді.

## Manual browser E2E harness — 2026-09-26

QaryzLinkFront PR #23 merged at `5f8e4b3`: Playwright Chromium manual-only suite landing privacy/trust copy, login navigation және 390px mobile horizontal-overflow smoke тексереді.

QaryzLinkAdmin PR #27 merged at `f3d6505`: manual-only Chromium suite read-only operations heading, disabled admin mutations, fail-closed/not-configured rendering және mobile overflow smoke тексереді.

Екі репода да browser workflow тек `workflow_dispatch` арқылы іске қосылады; PR/push кезінде автоматты түрде Actions минуттарын жұмсамайды. `@playwright/test` version 1.63.0 pin етілді. Actual browser execution GitHub Actions free-quota/billing gate ашылғаннан кейін орындалады.

## PII gated plaintext scrub — 2026-09-26

QaryzLinkBack PR #141 merged at `ebb87d2`: encrypted-mode final migration phase үшін explicit default-off bounded scrub command қосылды. `PII_PLAINTEXT_SCRUB_ENABLED=true` болмаса command fail-closed; batch 1–500.

User email/phone plaintext тек сол field-тің ciphertext + blind lookup hash екеуі де болғанда ғана null болады. Incomplete field сақталады және remaining backlog-та көрінеді. Retirement readiness енді deleted user және stale verification plaintext rows-ты да есептейді, сондықтан schema-drop алдында жалған zero болмайды.

Tooling implementation дайын, бірақ actual destructive scrub execution, plaintext column removal және automated verification әлі staging/CI gate болып қалады.

## Runtime error/log privacy hardening — 2026-09-26

QaryzLinkBack PR #144 merged at `7c81e94`: notification outbox `lastError` arbitrary provider message-терді енді сақтамайды; тек approved generic operational messages allowlist арқылы өтеді, қалғаны `Notification delivery failed` болып нормализацияланады.

Notification scheduler және evidence cleanup one-shot command-тары raw exception message орнына aggregate JSON success output және generic PII-free failure stderr қолданады. Notification scheduler empty-DB compiled command smoke CI-ға қосылды.

GitHub Actions free-quota/billing gate салдарынан automated execution pending. Staging-та actual log observation — password/token/email/SMTP response/document data жоқ екенін human acceptance арқылы әлі тексеру керек.

## Durable in-app notifications — 2026-09-26

QaryzLinkBack PR #146 merged at `3b66ce9`: IN_APP notifications durable outbox row арқылы нақты delivery path алды. Matching recipient/channel adapter success болғаннан кейін row SENT күйіне өтеді және authenticated `GET /api/v1/notifications/in-app` endpoint latest 50 metadata rows-ты ғана қайтарады. Payload/contact data inbox response-қа кірмейді.

QaryzLinkFront PR #24 merged at `9517af0`: authenticated read-only notifications page қосылды. Front тек event type, aggregate type/id және sentAt metadata оқиды; notification payload немесе қарсы тарап contact data сұралмайды.

Automated verification GitHub Actions free-quota/billing gate салдарынан pending. Нақты SMTP provider acceptance және push channel әлі бөлек release gate.

## Neutral dispute intake — 2026-09-27

QaryzLinkBack PR #147 merged at `aefcade`: placeholder DisputesModule participant-only neutral intake/read slice-қа ауыстырылды. Additive `dispute_cases` schema бір contract-қа бір case сақтайды; тек borrower/lender party case аша/оқи алады; 5–1000 таңбалық description bounded; opener party id response-қа шықпайды; audit payload description сақтамайды; contract/payment/ledger автоматты өзгермейді.

QaryzLinkFront PR #26 merged at `8d0cd99`: contract detail бетіне dispute panel қосылды. Existing case read-only көрсетіледі, case жоқ болса bounded description арқылы ашылады. Load error fail-closed, duplicate race existing case-ті қайта оқиды.

Support/admin status transitions әлі intentionally absent: нақты support owner/process және legal handling бекітілгеннен кейін ғана қосылады. Automated CI GitHub Actions quota/billing gate салдарынан pending.

## Dispute counterparty notification — 2026-09-27

QaryzLinkBack PR #148 merged at `0c9a08a`: dispute case ашылған транзакцияда қарсы contract party үшін idempotent durable `DISPUTE_OPENED` IN_APP notification enqueue болады. Event payload тек contract/dispute identifiers және status қамтиды; dispute description, contact немесе opener identity notification payload-қа кірмейді. Policy `DISPUTE_OPENED` event-ін EMAIL арнасына жіберуге тыйым салады.

QaryzLinkFront PR #27 merged at `cc3fbdc`: notifications inbox `DISPUTE_OPENED` event-ін `Дау ашылды` label-ымен көрсетеді және empty-state dispute events-ті түсіндіреді.

Automated verification GitHub Actions free-quota/billing gate салдарынан pending.

## In-app notification read state — 2026-09-27

QaryzLinkBack PR #149 merged at `a017317`: `notification_outbox` үшін nullable `readAt` қосылды. Authenticated user тек өзінің SENT/IN_APP notification row-ын idempotent mark-read ете алады; non-owned және missing row бірдей generic 404 boundary қолданады. Inbox response metadata-only болып қалады және payload/contact data шығармайды.

QaryzLinkFront PR #28 merged at `bbfdcff`: private notifications inbox unread count, unread visual state және explicit `Оқылды` action алды. 401 auth-required state-ке қайтады, басқа error privacy-safe generic UI күйінде қалады.

Automated verification GitHub Actions free-quota/billing gate салдарынан pending.

## Dispute operations visibility — 2026-09-27

QaryzLinkBack PR #150 merged at `87518f7`: protected `/api/v1/metrics/disputes` aggregate endpoint OPEN/WAITING_USER/WAITING_INTERNAL/RESOLVED/CLOSED counts, oldest active age және capture time ғана қайтарады. Description, contract ID, opener identity немесе case payload response contract-ына кірмейді.

QaryzLinkAdmin PR #28 merged at `516cafd`: dispute lifecycle server-rendered read-only operations card ретінде қосылды. Exact response schema unexpected case-content/identity fields-ті reject етеді; `METRICS_ACCESS_TOKEN` browser-ға шықпайды.

Monitoring source contract dispute backlog signal-ымен толықтырылды. Support/admin status mutations әлі intentionally disabled; actual support owner/process бекітілгеннен кейін ғана қосылады. Automated CI Actions quota gate салдарынан pending.

## Exact in-app unread count — 2026-09-27

QaryzLinkBack PR #151 merged at `d0007af`: authenticated `/api/v1/notifications/in-app/unread-count` caller-дың personal party scope-ында барлық unread SENT/IN_APP rows-ты санайды. Response тек `{ count }`; payload/contact data жоқ.

QaryzLinkFront PR #29 merged at `323b00a`: inbox latest-50 list-пен бірге exact unread count алады, сондықтан 50-ден көп unread notification болғанда UI undercount жасамайды. Visible notification mark-read болғанда total count local state-та қауіпсіз азаяды.

Automated verification GitHub Actions quota gate салдарынан pending.

## In-app mark-all-read — 2026-09-27

QaryzLinkBack PR #152 merged at `01442ba`: authenticated mark-all-read mutation caller-дың personal party scope-ындағы unread SENT/IN_APP rows-ты ғана update етеді және aggregate updated count қайтарады.

QaryzLinkFront PR #30 merged at `b6a18cf`: inbox summary бір әрекетпен барлық unread notification-ды оқылды деп белгілейді; bulk/per-item actions UI-де serialized, exact unread total success кезінде 0 болады.

Payload/contact data бұл flow-ға қосылмайды. Automated verification GitHub Actions quota gate салдарынан pending.

## Gated dispute support transitions — 2026-09-27

QaryzLinkBack PR #153 merged at `6c38b00`: internal support dispute lifecycle mutation boundary қосылды. Ол default-off `SUPPORT_DISPUTE_TRANSITIONS_ENABLED=false` gate және бөлек `SUPPORT_ACCESS_TOKEN` арқылы қорғалған; status transition state machine conservative және row-level lock арқылы serialized.

Әр нақты transition audit event жасайды, payload тек from/to status сақтайды; dispute description/contact/payment content жоқ. Admin mutation UI әдейі қосылған жоқ. Нақты support owner/process, internal ingress және staging acceptance бекітілмейінше production enablement release gate болып қалады.

Automated CI GitHub Actions free-quota/billing gate салдарынан pending.

## Dispute status notifications and password recovery — 2026-09-27

QaryzLinkBack PR #155 merged at `bf92b72`: approved support status transition кезінде borrower және lender party-ға privacy-safe durable IN_APP `DISPUTE_STATUS_CHANGED` event enqueue етіледі. Front PR #32 merged at `5d276d5`: inbox жаңа event-ті `Дау күйі өзгерді` label-ымен көрсетеді.

QaryzLinkBack PR #154 password-reset core-ды қосты. QaryzLinkBack PR #156 merged at `d88e7d4`: enumeration-safe public request/confirm endpoints, TLS SMTP reset mailer, HTTPS `PASSWORD_RESET_URL`, stricter reset rate limit және expired/consumed challenge cleanup қосылды. Successful confirm барлық active session-ды revoke етеді.

QaryzLinkFront PR #33 merged at `6786b03`: login recovery link, generic request page және URL fragment token қолданатын reset-confirm page қосылды; token оқылғаннан кейін address bar-дан өшіріледі.

Automated CI GitHub Actions quota/billing gate салдарынан pending; нақты SMTP inbox және browser acceptance әлі release gate.

## Account security operations — 2026-09-27

QaryzLinkBack PR #157 merged at `3e84a20` және QaryzLinkAdmin PR #29 merged at `d303418`: auth-retention aggregate snapshot/card енді expired/consumed password-reset challenge backlog-ты да identity/token деректерін шығармай көрсетеді.

QaryzLinkBack PR #158 merged at `25b5759`: authenticated `POST /api/v1/auth/logout-all` барлық active session-ды current user scope ішінде revoke етеді және `ALL_SESSIONS_REVOKED` audit event-те тек aggregate revoked count сақтайды.

QaryzLinkFront PR #34 merged at `fdcdf11`: Settings ішіне `Барлық құрылғылардан шығу` security control қосылды; success кезінде server sessions revoke болып, local sessionStorage тазаланып login-ге redirect болады.

Automated CI GitHub Actions quota/billing gate салдарынан pending.

## Active session management — 2026-09-27

QaryzLinkBack PR #159 merged at `979d8ce`: authenticated user latest 50 active session metadata-ны (`createdAt`, `lastUsedAt`, `expiresAt`, current flag) көре алады және нақты owned session-ды selective revoke ете алады. Backend IP, user-agent, device name немесе browser fingerprint жинамайды. Foreign/already-revoked session mutation audit event жасамайды; successful revoke PII-free `SESSION_REVOKED` audit event қалдырады.

QaryzLinkFront PR #35 merged at `3625f49`: Settings security card active session list және per-session revoke control алды. Current session revoke кезінде local sessionStorage тазаланып login-ге redirect болады. Front exact session response schema-ны ғана қабылдайды; unexpected IP/device/user-agent тәрізді tracking fields fail-closed reject етіледі.

Automated verification GitHub Actions free-quota/billing gate салдарынан pending.

## Authenticated password change — 2026-09-27

QaryzLinkBack PR #160 merged at `ea6b1be`: authenticated `POST /api/v1/auth/password/change` current password-ты тексереді, existing password policy-ді қолданады және current password reuse-қа тыйым салады. Sensitive mutation transaction current session әлі active екенін қайта тексереді; success кезінде password atomically жаңарып, барлық active session revoke болады, outstanding password-reset challenge жойылады және PII-free `PASSWORD_CHANGED` audit event тек aggregate revoked-session count сақтайды.

QaryzLinkFront PR #36 merged at `7a0df68`: Settings ішінде current/new/confirm password security card қосылды. Success кезінде local sessionStorage тазаланып login-ге redirect болады; current-password, policy және expired-session errors privacy-safe UI хабарламаларымен өңделеді.

Automated verification GitHub Actions free-quota/billing gate салдарынан pending.
