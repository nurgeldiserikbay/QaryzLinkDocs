# Серверге орнату

Жаңартылған күні: 2026-09-20.

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
pnpm install --no-frozen-lockfile
pnpm prisma:generate
pnpm prisma:validate
pnpm build
pnpm prisma:migrate:deploy
pnpm start:prod
~~~

DATABASE_URL Prisma generate алдында да ортада болуы керек. Install әзірге dependency resolution жасайды; reproducible frozen lockfile және тексерілген release image public launch алдындағы міндетті жұмыс.
Migration бір release job арқылы, traffic ашылғанға дейін орындалады. Production-да migrate dev, db push немесе migrate reset қолданылмайды.
Build/test үшін production базасын қолданбаңыз. pnpm check нақты integration тесттерін іске қосады: оған бөлек disposable test DB керек.
Процесс supervisor/platform restart policy арқылы бақылансын; shutdown үшін SIGTERM жеткізілсін.

### 2.1 Notification scheduler job

Outbox хабарламаларын бір рет өңдеу үшін application build-тен кейін мына command қолданылады:

~~~bash
pnpm notifications:run
~~~

Бұл command HTTP server ашпайды: `AppModule` application context іске қосылады, `NotificationSchedulerService.runOnce()` бір рет орындалады және context жабылады. API-мен бірдей `DATABASE_URL`, `REDIS_URL`, JWT және notification/SMTP settings керек. Dispatch нәтижесі counters ретінде логталады; bootstrap қатесі non-zero exit code қайтарады. Kubernetes CronJob немесе queue trigger осы command-ті қайталайды. Дайын template: [Notification CronJob](NOTIFICATION_CRONJOB.md). CronJob overlap, Secret және image policy deployment деңгейінде қалады.

## 3. Конфигурация

| Variable | Мақсаты |
|---|---|
| NODE_ENV | staging немесе production |
| HOST / PORT | 0.0.0.0 / 3000 |
| DATABASE_URL | Құпия PostgreSQL connection string |
| REDIS_URL | Startup schema талап ететін URL |
| JWT_ACCESS_SECRET | Кемінде 32 таңбалық криптографиялық кездейсоқ secret; replica-ларда бірдей |
| MAIL_ENABLED | Алғашқы іске қосуда false |
| NOTIFICATION_BATCH_SIZE | 1–100, әдепкісі 50 |
| METRICS_ACCESS_TOKEN | Staging/production-та кемінде 32 таңба; metrics endpoint header token |
| PUBLIC_MARKETPLACE_ENABLED | false |
| PENALTY_ENABLED | false |
| AMOUNT_BASED_COMMISSION_ENABLED | false |

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
- /docs staging-де API келісімшартын көрсетеді.
- CORS қазір origin:false. Бір origin астындағы reverse proxy қолданыңыз немесе бөлек Front домені үшін нақты allowlist іске асырыңыз.
- trustProxy:false. Proxy артында барлық клиент бір IP бюджетіне түсуі мүмкін; trusted proxy CIDR және header тазалау баптауы public launch алдында міндетті.
- DB/Redis порттарын интернетке ашпаңыз; HTTPS-тен басқа ingress тек әкімшілік рұқсатпен.
- Metrics endpoint тек internal ingress арқылы қолжетімді болсын және x-metrics-token header талап етсін.
- Login, refresh, logout, metrics authorization және email workflow-ларын staging-де тексеріңіз.

## 6. Docker және k3s

Репозиторийде Dockerfile бар, бірақ осы email кезеңінің CI-ы контейнер build/start-ты тексермейді. Runtime image қазір Prisma migration файлдарын көшірмейді; оны migration job ретінде пайдалануға болмайды.
Docker/k3s production release алдында жеке migration image/job, runtime smoke test, secret injection, readiness/liveness және trusted ingress баптауы аяқталсын.
Notification CronJob template бар, бірақ нақты namespace, registry digest, Secret және alerting мәндері staging environment-те толтырылып тексерілуі керек.
Әзірге жоғарыдағы Node deployment — бар кодқа сәйкес staging жолы; толық production k3s release дайын деп саналмайды.

## 7. Backup және rollback

Әр schema release алдында backup жасаңыз және бөлек базаға restore тексеріңіз. Backup шифрланған, қолжетімділігі шектелген болсын.
Rollback кезінде бұрын тексерілген application commit/image қайтарылады. Schema артқа автоматты түсірілмейді; үйлесімділік бағаланып, қажет болса forward fix жасалады.
Осы migration email_verifications кестесін қосады; бұрынғы app оны пайдаланбайды. Жаңа verification тарихын жою rollback шарты емес.
Backup retention, restore уақыты және инцидент жауаптысы [owner checklist](OWNER_CHECKLIST.md) бойынша бекітіледі.

## 8. Public launch gate

[Release checklist](RELEASE_CHECKLIST.md) аяқталмайынша бұл нұсқаулық public launch рұқсаты болып саналмайды.
