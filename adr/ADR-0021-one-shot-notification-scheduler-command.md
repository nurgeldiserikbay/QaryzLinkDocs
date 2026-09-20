# ADR-0021: One-shot notification scheduler command

- Status: Accepted
- Date: 2026-09-20
- Owners: QaryzLink maintainers

## Context

The application-level `NotificationSchedulerService.runOnce(limit)` is provider-neutral, but deployment still needs a concrete executable entrypoint. A scheduler that only exists as an injectable service is difficult to run from a CronJob without importing HTTP server bootstrap code.

## Decision

Add `src/notification-scheduler.main.ts` as a Nest application-context command.

The command:

1. boots the existing `AppModule` with the same validated environment;
2. resolves `NotificationSchedulerService`;
3. runs one `runOnce()` call using `NOTIFICATION_BATCH_SIZE` when no explicit limit is supplied;
4. logs only aggregate counters;
5. closes the Nest application context in a `finally` block;
6. sets a non-zero process exit code when bootstrap or scheduler execution fails.

The compiled command is exposed as:

~~~bash
pnpm notifications:run
~~~

The command does not create a recurring schedule, hold provider credentials, or move money. Kubernetes CronJob, queue consumer, or another deployment trigger remains responsible for invocation and overlap policy.

## Alternatives

- Start the HTTP server and call an internal endpoint: adds network exposure and couples a batch job to ingress.
- Add `@nestjs/schedule` inside the API: couples scheduling to replica lifecycle and deploy restarts.
- Run Prisma SQL directly from a shell script: bypasses application delivery and retry boundaries.

## Consequences

- CronJob/queue deployment has a stable, testable executable boundary.
- The same configuration validation and dependency graph are used by API and scheduler.
- Scheduler failures are visible through non-zero process status.
- Delivery-level provider errors remain inside outbox retry/FAILED policy and are represented by aggregate counters.

## Verification

Backend PR #15:

- compiled command included in production build;
- existing typecheck, ESLint, coverage, integration migration and smoke-test CI gates passed;
- CI run [35514521800](https://github.com/nurgeldiserikbay/QaryzLinkBack/actions/runs/35514521800).
