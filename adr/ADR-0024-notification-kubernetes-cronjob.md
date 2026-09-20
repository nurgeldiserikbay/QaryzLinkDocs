# ADR-0024: Notification scheduler Kubernetes CronJob

- **Status:** Accepted
- **Date:** 2026-09-20
- **Owners:** QaryzLink maintainers

## Context

NotificationSchedulerService бір реттік runOnce execution ретінде дайын. Backend process ішінде cron қосу multi-replica deployment үшін қолайсыз: lifecycle, overlap және retry саясатын application server-мен араластырады.

## Decision

Notification scheduler Kubernetes CronJob арқылы сырттан шақырылады.

Негізгі policy:

- әр бес минут сайын іске қосылу;
- concurrencyPolicy: Forbid;
- backoffLimit: 0;
- application retry outbox worker-де қалады;
- runtime secrets external Secret арқылы беріледі;
- image immutable digest-пен бекітіледі;
- scheduler Kubernetes API token қолданбайды.

Manifest QaryzLinkDocs-та template ретінде сақталады. Нақты namespace, registry, image digest және Secret deployment environment-те толтырылады.

## Alternatives

1. NestJS ішінде setInterval немесе framework cron қосу — бірнеше replica кезінде duplicate scheduling және operational coupling қаупін арттырады.
2. Queue provider-ді қазір қосу — нақты provider мен operational budget таңдалмай тұрып қосымша тәуелділік енгізеді.
3. Kubernetes Job-ті backoff-пен қайталау — application retry policy-імен қабаттасып, delivery attempt санын түсіндіруді қиындатады.

## Consequences

### Positive

- API replica-лары мен scheduler lifecycle-і бөлек қалады.
- Kubernetes overlap policy және job history арқылы operation көрінеді.
- Outbox worker-дің idempotent claim/retry semantics сақталады.
- Secrets кодқа немесе Docs-қа кірмейді.

### Negative

- Kubernetes deployment capability қажет.
- Alerting және job failure notification бөлек бапталады.
- CronJob provider-neutral queue adapter емес; queue migration кейін жеке шешім болады.

## Security and legal boundary

Бұл ADR тек notification scheduler deployment-ін сипаттайды. Платформа ақша сақтамайды немесе аудармайды, debt collection, scoring, public marketplace және legal adjudication қоспайды. Private invite-only MVP шекарасы сақталады.
