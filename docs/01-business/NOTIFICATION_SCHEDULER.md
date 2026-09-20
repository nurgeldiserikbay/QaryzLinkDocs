# Notification scheduler/orchestrator

## Мақсаты

\`NotificationSchedulerService\` outbox worker мен provider-neutral delivery service арасындағы application-level оркестратор болып табылады. Ол бір шақырылымда дайын notification intent-терді claim етеді, әр claim-ді dispatch етеді және нәтижелерді санауыш түрінде қайтарады.

Бұл компонент өзін-өзі cron қоспайды және сыртқы provider-ге тәуелді емес. Кейін Kubernetes CronJob, queue consumer немесе басқа deployment adapter осы бір операцияны шақыра алады.

## Бір реттік workflow

~~~mermaid
flowchart TD
    R["runOnce(limit)"] --> C["worker.claim(limit)"]
    C --> D["delivery.dispatch(claim)"]
    D --> S["SENT"]
    D --> P["PENDING"]
    D --> F["FAILED"]
    S --> O["result counters"]
    P --> O
    F --> O
~~~

1. \`claim(limit)\` due және retry-ready rows-ты \`PROCESSING\` күйіне ауыстырады.
2. Claim-дер бір-бірден, ретімен dispatch етіледі. Бұл provider-ге күтпеген burst жібермеу және нәтижені түсінікті қадағалау үшін таңдалды.
3. Delivery service provider сәтті болғанда \`SENT\`, қате болғанда retry policy арқылы \`PENDING\` немесе terminal \`FAILED\` қайтарады.
4. Orchestrator \`claimed\`, \`sent\`, \`pending\`, \`failed\` санауыштарын қайтарады.

## Қайтарылатын нәтиже

| Өріс | Мағынасы |
|---|---|
| \`claimed\` | Осы іске алынған claim саны |
| \`sent\` | Provider сәтті қабылдаған intent саны |
| \`pending\` | Retry-ге қайта қойылған intent саны |
| \`failed\` | Максималды retry-ден кейін тоқтаған intent саны |

\`claimed = sent + pending + failed\` болуы тиіс, егер әр dispatch қалыпты түрде аяқталса.

## Қауіпсіздік және шекара

- \`NotificationClaim.payload\` privacy-safe metadata ғана қамтиды.
- Сервис email, телефон, құжат, банк дерегін өзі қоспайды.
- Provider credential немесе channel-specific SDK application service-ке енгізілмейді.
- Бірнеше replica қатар шақырса да, worker-дің \`FOR UPDATE SKIP LOCKED\` claim механизмі бір event-ті бір мезетте екі replica-ға бермейді.
- Нақты cron/queue adapter overlap саясатын және metrics/logging-ті deployment деңгейінде анықтауы керек.
- Күтпеген persistence қатесі толық job-ты тоқтатуы мүмкін; мұндай жағдайда lease timeout claim-ді кейін қайта өңдеуге мүмкіндік береді.

## Backend mapping

- \`NotificationOutboxWorker.claim(limit)\`
- \`NotificationDeliveryService.dispatch(claim)\`
- \`NotificationSchedulerService.runOnce(limit)\`
- \`NotificationsModule\` осы үшеуін application boundary ретінде экспорттайды.

Қазіргі default \`UnavailableNotificationAdapter\` fail-closed. Нақты SMTP немесе push adapter және production scheduler кейінгі delivery hardening кезеңіне жатады.
