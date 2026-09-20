# ADR-0017: One-shot notification scheduler/orchestrator

- Status: Accepted
- Date: 2026-09-20
- Owners: QaryzLink maintainers

## Context

Outbox intent-терін claim ететін worker және provider-neutral delivery boundary дайын. Бірақ оларды шақыратын application-level операция қажет. Multi-replica backend ішінде модульге жасырын cron қосу duplicate execution, deploy кезінде жоғалған job және operational бақылаудың әлсіз болуына әкелуі мүмкін.

## Decision

\`NotificationSchedulerService.runOnce(limit)\` енгізіледі.

Ол:

1. \`NotificationOutboxWorker.claim(limit)\` арқылы due claim-дерді алады;
2. әр claim-ді \`NotificationDeliveryService.dispatch\` арқылы ретімен орындайды;
3. \`claimed\`, \`sent\`, \`pending\`, \`failed\` санауыштарын қайтарады;
4. өзін-өзі schedule етпейді, provider SDK немесе credential білмейді.

Deployment кейін осы әдісті Kubernetes CronJob, queue consumer немесе басқа explicit scheduler шақыра алады. Қатар орындалатын шақырылымдарға worker-дің PostgreSQL lease және \`SKIP LOCKED\` қорғанысы қолданылады.

## Alternatives

- Backend module ішінде \`@nestjs/schedule\` cron қосу: replica саны мен deploy lifecycle-ін application-ға байлайды.
- Бірден queue framework қосу: provider және infrastructure таңдауы дәлелденбей тұрып operational күрделілікті арттырады.
- Әр provider adapter-ге claim logic енгізу: outbox lifecycle мен channel-specific code-ты араластырады.

## Consequences

Оң әсері:

- Scheduler trigger-і deployment-ке ауыстырылатын таза application contract болады.
- Unit test нәтижесі deterministic санауыштармен тексеріледі.
- Provider unavailable болса, delivery service retry/FAILED күйін өз policy-імен сақтайды.
- Бірнеше replica-да race condition worker қабатында шектеледі.

Шектеулері:

- Нақты cron/queue, metrics, alert және graceful shutdown әлі бөлек іске асуы керек.
- Қазіргі default adapter provider бапталмаса fail-closed жұмыс істейді.
- Dispatch әдейі sequential; throughput қажет болса кейін explicit bounded concurrency policy енгізіледі.

## Verification

Backend PR #11:

- scheduler unit tests;
- existing worker/delivery tests;
- strict typecheck, ESLint, coverage және production build CI арқылы тексеріледі.
