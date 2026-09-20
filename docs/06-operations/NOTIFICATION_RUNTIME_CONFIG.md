# Notification runtime configuration

## Мақсаты

Notification scheduler-дің batch көлемі deployment environment арқылы басқарылады. Backend әдепкіде 50 claim өңдейді, ал рұқсат етілген диапазон 1–100.

| Variable | Default | Шектеу |
|---|---:|---|
| `NOTIFICATION_BATCH_SIZE` | `50` | Бүтін сан, 1–100 |

## Қолданылуы

1. Environment validator `NOTIFICATION_BATCH_SIZE` мәнін тексереді.
2. NotificationsModule тексерілген мәннен scheduler options жасайды.
3. `NotificationSchedulerService.runOnce()` limit берілмесе осы batch size мәнін қолданады.
4. Әдіске explicit limit берілсе, ол бір шақырылымға ғана қолданылады және worker-дің 1–100 guard-ынан өтеуі керек.

~~~mermaid
flowchart TD
    E["Environment"] --> V["Zod validation 1..100"]
    V --> O["Scheduler options"]
    O --> R["runOnce default limit"]
    R --> W["Outbox worker claim"]
~~~

## Deployment ережелері

- Staging үшін `NOTIFICATION_BATCH_SIZE=50` жеткілікті.
- Үлкен мәнді production throughput метрикалары болғанша қоймау керек.
- Бұл параметр provider credential, email address немесе жеке дерек сақтамайды.
- Параметр scheduler-ді өзі іске қоспайды; cron/queue trigger бөлек deployment жұмысы.
- Invalid мәнмен application іске қосылмайды, себебі environment validation fail-fast жұмыс істейді.

## Қауіпсіздік шекарасы

Batch size хабарламаның мазмұнын өзгертпейді және пайдаланушының email, телефон, құжат немесе банк деректерін ашпайды. Нақты provider adapter және monitoring қосылғанда rate limit, retry budget және provider quota бөлек бақыланады.

Backend mapping:

- `src/common/config/environment.ts`
- `src/modules/notifications/application/notification-scheduler.options.ts`
- `src/modules/notifications/application/notification-scheduler.service.ts`
- `.env.example`