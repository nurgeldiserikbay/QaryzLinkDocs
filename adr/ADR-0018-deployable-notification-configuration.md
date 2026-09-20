# ADR-0018: Deployable notification scheduler configuration

- Status: Accepted
- Date: 2026-09-20
- Owners: QaryzLink maintainers

## Context

One-shot notification scheduler дайын болғанымен, batch көлемі кодтағы тұрақты 50 мәніне байланып тұрды. Deployment ортасында әр provider quota, database capacity және rollout кезеңіне қарай claim көлемін қауіпсіз басқару қажет.

## Decision

`NOTIFICATION_BATCH_SIZE` environment variable енгізіледі.

- default: 50;
- minimum: 1;
- maximum: 100;
- startup кезінде Zod арқылы fail-fast validation;
- NotificationsModule validated value-ді scheduler options ретінде inject етеді;
- explicit `runOnce(limit)` мәні бір шақырылым үшін ғана default-ты override етеді.

Бұл өзгеріс cron, queue, SMTP/push provider немесе ақша аудару механизмін қоспайды.

## Alternatives

- 50 мәнін кодта қалдыру: deployment tuning және provider quota-ға бейімделу мүмкіндігі жоқ.
- ConfigService-ті scheduler service ішінде тікелей оқу: application service environment API-іне тығыз байланысады және unit test қиындайды.
- Database-да runtime setting сақтау: migration, access control және operational state күрделілігін ерте қосады.

## Consequences

Оң әсері:

- Staging және production batch көлемі кодты өзгертпей басқарылады.
- Invalid configuration application іске қосылғанға дейін анықталады.
- Scheduler application contract provider-neutral күйде қалады.

Шектеулері:

- Batch size throughput немесе delivery success-ті өзі өлшемейді.
- Нақты provider rate limit, metrics және deployment trigger келесі кезеңдерде қосылады.
- Жоғары batch size database lock/latency қаупін арттыруы мүмкін; production мәні load test арқылы таңдалады.

## Verification

Backend PR #12 және CI run 35510328529:

- TypeScript strict typecheck;
- ESLint static analysis;
- unit test және coverage;
- production build.