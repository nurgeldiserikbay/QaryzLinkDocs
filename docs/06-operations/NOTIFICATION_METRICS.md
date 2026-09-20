# Notification delivery metrics

## Мақсаты

Backend notification scheduler әр іске қосылғанда delivery lifecycle нәтижелерін privacy-safe operational counters ретінде жинайды.

Endpoint:

~~~text
GET /api/v1/metrics/notifications
~~~

Response ішінде тек counters және соңғы run timing бар:

~~~json
{
  "runs": 3,
  "claimed": 12,
  "sent": 9,
  "pending": 2,
  "failed": 1,
  "lastRunAt": "2026-09-20T10:00:00.000Z",
  "lastRunDurationMs": 84
}
~~~

## Құпиялылық шекарасы

Metrics ешқашан мына деректерді қайтармайды немесе жинамайды:

- recipient party ID;
- email немесе phone;
- notification payload;
- contract, payment немесе ledger ID;
- құжат, банк немесе ақша сомасы.

Endpoint internal operations ingress арқылы ғана қолжетімді болуы тиіс. Оны public Internet-ке ашу үшін бөлек authentication, authorization және rate-limit шешімі қажет.

## Lifecycle

~~~mermaid
flowchart LR
    C["Claim"] --> D["Dispatch"]
    D --> S["SENT/PENDING/FAILED"]
    S --> M["In-process counters"]
    M --> E["Internal JSON endpoint"]
~~~

NotificationMetricsService counters-ті memory ішінде ұстайды. Process restart болғанда counters нөлденеді. Бұл slice Prometheus немесе persistent operational store емес; production monitoring adapter-і кейінгі кезеңде қосылады.

## Scheduler semantics

- Бір runOnce execution metrics ішінде бір runs ретінде саналады.
- claimed — worker қайтарған claim саны.
- sent, pending, failed — dispatch нәтижелерінің counters-і.
- lastRunDurationMs — бір реттік scheduler execution уақыты.
- Бір scheduler run ішіндегі dispatch sequential тәртіпте қалады.
- Metrics жазылуы payment, contract немесе outbox transaction-ына әсер етпейді.

## Deployment

pnpm notifications:run command metrics-ті жаңартады, бірақ scheduler-ді өзі қайталамайды. Kubernetes CronJob немесе queue trigger кейін осы command-ті шақырғанда endpoint-тегі counters жаңарады.

Ұсынылатын staging тексерісі:

1. API-ды іске қосу;
2. GET /api/v1/metrics/notifications арқылы бастапқы нөлдік snapshot оқу;
3. notification scheduler command орындау;
4. counters және lastRunDurationMs жаңарғанын тексеру;
5. payload немесе recipient деректерінің response-та жоқ екенін растау.

## Backend mapping

- src/modules/notifications/application/notification-metrics.service.ts
- src/modules/notifications/application/notification-scheduler.service.ts
- src/modules/notifications/http/notification-metrics.controller.ts
- GET /api/v1/metrics/notifications

Толық архитектуралық шешім: [ADR-0023](../../adr/ADR-0023-notification-delivery-metrics.md).
