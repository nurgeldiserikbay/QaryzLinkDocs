# Notification delivery metrics

## Мақсаты

Backend notification scheduler әр іске қосылғанда delivery lifecycle нәтижелерін privacy-safe aggregate counters ретінде PostgreSQL-де сақтайды. Бұл counters one-shot scheduler процесі аяқталғаннан кейін де сақталады және бөлек API процесінен оқылады.

Endpoint:

~~~text
GET /api/v1/metrics/notifications
x-metrics-token: <METRICS_ACCESS_TOKEN>
~~~

Response ішінде тек aggregate counters және соңғы run timing бар:

~~~json
{
  "runs": 3,
  "claimed": 12,
  "sent": 9,
  "pending": 2,
  "failed": 1,
  "lastRunAt": "2026-09-26T10:00:00.000Z",
  "lastRunDurationMs": 84
}
~~~

## Құпиялылық шекарасы

Metrics ешқашан мына деректерді жинамайды немесе response-қа шығармайды:

- recipient party ID;
- email немесе phone;
- notification payload;
- contract, payment немесе ledger ID;
- құжат, банк немесе ақша сомасы.

Staging және production environment-терінде `METRICS_ACCESS_TOKEN` міндетті. Endpoint `x-metrics-token` мәнін timing-safe салыстырады және token жоқ/қате болса 401 fail-closed қайтарады. Endpoint internal operations ingress ішінде қалуы керек.

## Persistence lifecycle

~~~mermaid
flowchart LR
    C["Claim"] --> D["Dispatch"]
    D --> S["SENT/PENDING/FAILED"]
    S --> P["PostgreSQL singleton aggregate"]
    P --> E["Protected metrics endpoint"]
    E --> A["Admin / monitoring collector"]
~~~

`NotificationMetricsService` бір ғана `notification_metrics` row-ын пайдаланады. Әр scheduler run атомарлы upsert арқылы:

- `runs` мәнін +1 арттырады;
- `claimed/sent/pending/failed` counters-ын increment жасайды;
- `lastRunAt` және `lastRunDurationMs` мәндерін жаңартады.

Per-run event history сақталмайды. Сондықтан operational counters persistent, бірақ historical time-series емес. Бұл шешім PII жинамай-ақ one-shot CronJob пен API процесі арасындағы process boundary мәселесін жабады.

## Scheduler semantics

- Бір `runOnce` execution metrics ішінде бір `runs` ретінде саналады.
- `claimed` — worker қайтарған claim саны.
- `sent`, `pending`, `failed` — dispatch нәтижелерінің aggregate counters-і.
- `lastRunDurationMs` — соңғы scheduler execution уақыты.
- Бір scheduler run ішіндегі dispatch sequential тәртіпте қалады.
- Metrics write dispatch аяқталғаннан кейін awaited болады.
- Metrics persistence қатесі scheduler command-ті non-zero failure-ға жеткізеді; бұған дейін persisted болған outbox delivery state кері қайтарылмайды.
- Snapshot row жоқ болса endpoint нөлдік counters қайтарады.

## Deployment

`pnpm notifications:run` command counters-ты PostgreSQL-де жаңартады. Kubernetes CronJob іске қосқан процесс аяқталғаннан кейін API `GET /api/v1/metrics/notifications` сол persisted snapshot-ты оқи алады.

Admin үшін:

- `QARYZLINK_API_BASE_URL` — server-only Backend origin;
- `METRICS_ACCESS_TOKEN` — server-only secret;
- token ешқашан `NEXT_PUBLIC_*` variable ретінде берілмеуі керек.

Ұсынылатын staging тексерісі:

1. migration-дарды қолдану;
2. API readiness-ті тексеру;
3. valid metrics token арқылы бастапқы snapshot оқу;
4. `pnpm notifications:run` немесе CronJob орындау;
5. API процесін restart жасамай-ақ counters жаңарғанын тексеру;
6. API процесін restart жасап, counters сақталғанын тексеру;
7. payload, recipient, contact және financial identifiers response-та жоқ екенін растау;
8. token жоқ және қате token үшін 401 жауаптарын тексеру.

## Monitoring шекарасы

PostgreSQL aggregate snapshot production monitoring stack-тің өзі емес. Әлі қажет:

- Prometheus/OpenTelemetry немесе басқа collector/export;
- alert thresholds;
- dashboard history/time-series;
- internal ingress/network acceptance;
- production alert routing.

## Backend mapping

- `prisma/migrations/20260926160000_persistent_notification_metrics/migration.sql`
- `src/modules/notifications/application/notification-metrics.service.ts`
- `src/modules/notifications/application/notification-scheduler.service.ts`
- `src/modules/notifications/http/notification-metrics.controller.ts`
- `GET /api/v1/metrics/notifications`

Архитектуралық шешім: [ADR-0023](../../adr/ADR-0023-notification-delivery-metrics.md).
