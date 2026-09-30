# Серверге орнату

Жаңартылған күні: 2026-09-26.

Бұл нұсқаулық қазіргі backend-ті жабық staging ортада іске қосуға арналған. Толық өнім әлі дайын емес: [implementation status](../04-delivery/IMPLEMENTATION_STATUS.md). Front/Admin және қарыз workflow-лары толық аяқталмаған.

## 1. Қажетті орта

- Node.js 24, package.json-дағы pnpm 12.4.2.
- PostgreSQL 17: жеке база, жеке user, сыртқа ашылмаған желі.
- REDIS_URL қазіргі startup schema-да міндетті; auth rate limit PostgreSQL қолданады. Redis болашақ queue үшін жоспарланған.
- HTTPS ingress/reverse proxy, домен және secret store.
- Staging-ке тек команда/VPN қолжетімділігі.

## 2. Native Node deployment

Таңдалған commit-ті checkout жасаңыз; тек сол commit-тің CI нәтижесі жасыл болса жалғастырыңыз. Командалар QaryzLinkBack түбірінде орындалады.

~~~bash
corepack enable
corepack prepare pnpm@12.4.2 --activate
pnpm install --frozen-lockfile
pnpm prisma:generate
pnpm prisma:validate
pnpm build
pnpm prisma:migrate:deploy
pnpm release:preflight
pnpm start:prod
~~~

DATABASE_URL Prisma generate алдында да ортада болуы керек. `pnpm-lock.yaml` repository-де бекітілген; CI және Docker build `--frozen-lockfile` қолданады. Release image immutable digest арқылы render етіледі және production dependency/container security gates-тен өтуі тиіс.
Migration бір release job арқылы, traffic ашылғанға дейін орындалады. Migration аяқталғаннан кейін `pnpm release:preflight` орындалады; `status=fail` болса rollout тоқтайды, `attention` external/manual acceptance әлі бар екенін білдіреді. Команда secret/config мәндерін шығармайды; толық contract: [Release preflight](RELEASE_PREFLIGHT.md). Production-да migrate dev, db push немесе migrate reset қолданылмайды.
Build/test үшін production базасын қолданбаңыз. pnpm check нақты integration тесттерін іске қосады: оған бөлек disposable test DB керек.
Процесс supervisor/platform restart policy арқылы бақылансын; shutdown үшін SIGTERM жеткізілсін.

### 2.1 Notification scheduler job

Outbox хабарламаларын бір рет өңдеу үшін application build-тен кейін мына command қолданылады:

~~~bash
pnpm notifications:run
~~~

Бұл command HTTP server ашпайды: `AppModule` application context іске қосылады, `NotificationSchedulerService.runOnce()` бір рет орындалады және context жабылады. API-мен бірдей `DATABASE_URL`, `REDIS_URL`, JWT және notification/SMTP settings керек. Dispatch нәтижесі counters ретінде логталады; bootstrap қатесі non-zero exit code қайтарады. Kubernetes CronJob немесе queue trigger осы command-ті қайталайды. Canonical deployable template QaryzLinkBack `ops/kubernetes/notification-scheduler-cronjob.yaml` ішінде; operational contract: [Notification CronJob](NOTIFICATION_CRONJOB.md). CronJob overlap, Secret және image policy deployment деңгейінде қалады.

### 2.2 Evidence cleanup job

Expired және ешқашан consume болмаған evidence upload object-терін бір рет тазалау:

~~~bash
pnpm evidence:cleanup:run
~~~

Command evidence storage disabled болса fail етеді, `selected/purged/failed` counters логтайды және partial cleanup error болса non-zero exit code қайтарады. Kubernetes template: `ops/kubernetes/evidence-cleanup-cronjob.yaml`; engineering cadence — сағатына бір рет, `concurrencyPolicy: Forbid`.

Private evidence storage конфигурациясы, S3-compatible signer, malware callback және staging acceptance толық [Evidence storage operations](EVIDENCE_STORAGE.md) нұсқаулығында берілген.

### 2.3 Account deletion maintenance job

Deletion request retention күйін қайта есептеп, тек `READY` request-терді anonymize ету үшін build-тен кейін:

~~~bash
pnpm accounts:deletion:run
~~~

Command HTTP server ашпайды. Алдымен grace/retention hold қайта есептеледі, содан кейін eligible account-тар anonymize етіледі. Active contractual obligation табылса request `RETENTION_HOLD` күйіне қайтарылады. Kubernetes template: `ops/kubernetes/account-deletion-cronjob.yaml`; engineering cadence күн сайын, `concurrencyPolicy: Forbid`. Production cadence және `ACCOUNT_DELETION_GRACE_DAYS` мәні заңдық retention шешімінен кейін ғана бекітіледі.

## 3. Конфигурация

| Variable | Мақсаты |
|---|---|
| NODE_ENV | staging немесе production |
| HOST / PORT | 0.0.0.0 / 3000 |
| TRUST_PROXY_HOPS | Әдепкі 0; ingress topology/header sanitization verified болғаннан кейін ғана 1–3 |
| CORS_ALLOWED_ORIGINS | Exact comma-separated browser origins; бос болса cross-origin access off |
| EXPOSE_API_DOCS | Staging-де explicit true болуы мүмкін; production-та true startup validation арқылы тыйым салынған |
| DATABASE_URL | Құпия PostgreSQL connection string |
| REDIS_URL | Startup schema талап ететін URL |
| JWT_ACCESS_SECRET | Кемінде 32 таңбалық криптографиялық кездейсоқ secret; replica-ларда бірдей |
| MAIL_ENABLED | Алғашқы іске қосуда false |
| PASSWORD_RESET_URL | MAIL_ENABLED=true кезінде HTTPS Front `/reset-password` URL |
| NOTIFICATION_BATCH_SIZE | 1–100, әдепкісі 50 |
| METRICS_ACCESS_TOKEN | Staging/production-та кемінде 32 таңба; metrics endpoint header token |
| CONTRACT_PDF_ENABLED / CONTRACT_PDF_PROVIDER | Pinned-template PDF renderer gate/provider; legal template + staging acceptance дейін false/unavailable |
| CONTRACT_PDF_REMOTE_URL / TOKEN | HTTPS-only signed renderer endpoint және server-side bearer credential |
| CONTRACT_PDF_EXPECTED_RENDERER_ID / KEY_FINGERPRINT | Pinned renderer identity және Ed25519 SPKI SHA-256 |
| CONTRACT_PDF_KK_TEMPLATE_ID / HASH | Жаңа ContractVersion-ға snapshot болатын KZ template identity |
| CONTRACT_PDF_RU_TEMPLATE_ID / HASH | Жаңа ContractVersion-ға snapshot болатын RU template identity |
| CONTRACT_PDF_REMOTE_TIMEOUT_MS / MAX_BYTES | Remote request timeout және bounded PDF artifact size |
| EVIDENCE_STORAGE_ENABLED | Private evidence storage feature gate; staging/production ғана, [runbook](EVIDENCE_STORAGE.md) талаптарынсыз қоспау |
| EVIDENCE_SEALING_ENABLED / EVIDENCE_SEAL_PROVIDER | Evidence archive signing gate/provider; remote signer + ACTIVE trust-registry acceptance талап етіледі |
| EVIDENCE_TIMESTAMP_ENABLED / EVIDENCE_TIMESTAMP_PROVIDER | External signed time attestation gate/provider; sealing enabled болуы тиіс; RFC3161/qualified status-ты білдірмейді |
| EVIDENCE_TIMESTAMP_REMOTE_URL / TOKEN | HTTPS-only authority endpoint және server-side bearer credential |
| EVIDENCE_TIMESTAMP_EXPECTED_AUTHORITY_ID / KEY_FINGERPRINT | Pinned timestamp authority cryptographic identity |
| EVIDENCE_TIMESTAMP_REMOTE_TIMEOUT_MS | Authority request timeout, 500–10000 ms; default 3000 |
| EVIDENCE_TIMESTAMP_MAX_CLOCK_SKEW_SECONDS | Authority time sanity bound, 30–3600 seconds; default 300 |
| PUBLIC_MARKETPLACE_ENABLED | false |
| PENALTY_ENABLED | false |
| AMOUNT_BASED_COMMISSION_ENABLED | false |
| MAX_OUTGOING_APPLICATIONS_PER_DAY | Public-offer application daily quota; engineering default 10 |
| MAX_MARKETPLACE_REPORTS_PER_DAY | Бір account үшін marketplace offer report daily quota; default 5, validated max 50 |
| SUPPORT_MARKETPLACE_REPORT_TRANSITIONS_ENABLED | false; row-level Resolve/Dismiss support workflow-ды explicit қосады |
| SUPPORT_ACCESS_TOKEN | Support mutations қосылса server-only ≥32 таңбалық secret; browser-ге шықпайды |
| MAX_OFFER_VERSIONS | Бір public offer үшін immutable financial-term history limit; default 20, validated max 100 |
| ACCOUNT_DELETION_GRACE_DAYS | Engineering default 30; production мәні legal retention review-дан кейін бекітіледі |

Secret-терді репозиторийге, screenshot-қа немесе чатқа енгізбеңіз. Жергілікті docker-compose.yml development парольдерін қолданады; production config ретінде пайдаланылмайды.

## 4. Email қосу

Front verification беті дайын болғанда ғана MAIL_ENABLED=true орнатыңыз.

| Variable | Мысал/шарт |
|---|---|
| SMTP_HOST | Провайдер host-ы |
| SMTP_PORT | 587 STARTTLS немесе провайдердің 465 implicit TLS порты |
| SMTP_SECURE | 587 үшін false; 465 үшін true |
| SMTP_USER / SMTP_PASSWORD | Secret store-дағы SMTP credential |
| SMTP_FROM | Провайдерде расталған sender email |
| EMAIL_VERIFICATION_URL | https://app.example.com/verify-email |

DNS sender verification, SPF/DKIM/DMARC провайдер бойынша бапталады. Credentials берудің орнына оларды сервердің secret settings-іне енгізіңіз.
Тестті өзіңіз бақылайтын mailbox арқылы орындаңыз: request → хат → login → confirm → status true.
CI нақты SMTP delivery немесе inbox placement-ті тексермейді.
Notification SMTP adapter осы settings-ті тек EMAIL channel үшін қолданады және generic PII-free template жібереді. `privacy.emailNotificationsEnabled=false` болса, optional EMAIL intent enqueue кезінде жасалмайды. IN_APP delivery әзірге fail-closed. Толық нұсқа: [Notification SMTP](NOTIFICATION_SMTP.md), [Notification preferences](../01-business/NOTIFICATION_PREFERENCES.md).
API: [backend README](https://github.com/nurgeldiserikbay/QaryzLinkBack#email-растау), [ADR-0006](../../adr/ADR-0006-email-verification.md).

## 5. Ingress және тексеру

- /api/v1/health арқылы HTTP қолжетімділігін тексеріңіз; бұл жалғыз тексеру бүкіл жүйенің дайындығын дәлелдемейді.
- `/docs` тек `EXPOSE_API_DOCS=true` болған non-production ортада ашылады; production configuration бұл мәнді true қабылдамайды.
- CORS әдепкіде fail-closed: `CORS_ALLOWED_ORIGINS` бос болса cross-origin browser access өшірулі. Бөлек Front/Admin origin қажет болса тек exact HTTP(S) origin-дерді comma-separated allowlist ретінде беріңіз; wildcard, path, query және credential бар origin қабылданбайды.
- `TRUST_PROXY_HOPS=0` әдепкіде forwarded client identity-ді толық елемейді. Ingress proxy chain және header sanitization staging-та тексерілгеннен кейін ғана нақты hop санын 1–3 етіп қойыңыз. Hop саны topology-мен дәл сәйкес келуі тиіс; direct API ingress restricted болуы керек.
- DB/Redis порттарын интернетке ашпаңыз; HTTPS-тен басқа ingress тек әкімшілік рұқсатпен.
- Metrics endpoint тек internal ingress арқылы қолжетімді болсын және x-metrics-token header талап етсін.
- Internal support endpoints public ingress-тен бөлек restricted болуы тиіс. Marketplace review enable болса x-support-token server-side ғана жіберіледі; Front/browser бұл token-ды ешқашан алмайды.
- Login, refresh, logout, metrics authorization және email workflow-ларын staging-де тексеріңіз.

## 6. Docker және k3s

Қазіргі Dockerfile runtime image-ке compiled app-пен бірге Prisma schema/migrations және `prisma.config.ts` көшіреді. CI backend image-ті build етеді және HIGH/CRITICAL vulnerability scan орындайды. `ops/kubernetes/migration-job.yaml` сол API release-пен бір immutable image digest қолданатын bounded migration Job береді; API deployment `/api/v1/health` startup/liveness және `/api/v1/health/ready` readiness probe қолданады.

Notification, account-deletion және evidence-cleanup CronJob template-тері бар. Бірақ нақты namespace, registry digest, Secret/ConfigMap, ingress/TLS және alerting мәндері staging environment-те render/deploy етіліп тексерілуі керек. Code/config readiness production acceptance орындалды дегенді білдірмейді.

## 7. Backup және rollback

Әр schema release алдында backup жасаңыз және бөлек базаға restore тексеріңіз. Backup шифрланған, қолжетімділігі шектелген болсын.
Rollback кезінде бұрын тексерілген application commit/image қайтарылады. Schema артқа автоматты түсірілмейді; үйлесімділік бағаланып, қажет болса forward fix жасалады.
Осы migration email_verifications кестесін қосады; бұрынғы app оны пайдаланбайды. Жаңа verification тарихын жою rollback шарты емес.
Backup retention, restore уақыты және инцидент жауаптысы [owner checklist](OWNER_CHECKLIST.md) бойынша бекітіледі.

## 8. Public launch gate

[Release checklist](RELEASE_CHECKLIST.md) аяқталмайынша бұл нұсқаулық public launch рұқсаты болып саналмайды.

## Ephemeral auth retention cleanup

Expired/consumed email-verification records және expired auth rate-limit buckets үшін one-shot command:

~~~bash
pnpm auth:retention:run
~~~

Kubernetes template: `ops/kubernetes/auth-retention-cronjob.yaml`. Engineering default күн сайын 03:41. Job session, contract, payment, ledger немесе persisted evidence rows-ты жоймайды. Command aggregate deleted counters ғана stdout-қа шығарады және unexpected failure кезінде non-zero exit береді.

## PII contact migration and key rotation commands

PII dual-mode backfill:

~~~bash
pnpm pii:contacts:backfill
~~~

Controlled encryption-key re-encryption:

~~~bash
pnpm pii:contacts:reencrypt
~~~

Бұл екі command автоматты CronJob ретінде орнатылмайды. Backfill migration window кезінде, re-encryption тек controlled key rotation кезінде қолмен орындалады. Key rotation sequence және old-key retirement шарттары `PII_KEY_ROTATION.md` ішінде.

## PII plaintext retirement command

Legacy plaintext values-ты bounded түрде тазалау үшін:

~~~bash
pnpm pii:contacts:scrub-plaintext
~~~

Бұл command default-off: `PII_CONTACT_STORAGE_MODE=encrypted` және `PII_PLAINTEXT_SCRUB_ENABLED=true` қажет. Batch size `PII_PLAINTEXT_SCRUB_BATCH_SIZE` арқылы 1–500 аралығында шектеледі. Command schema column-дарын жоймайды және CronJob ретінде орнатылмайды. Толық preconditions: `PII_PLAINTEXT_RETIREMENT.md`.
