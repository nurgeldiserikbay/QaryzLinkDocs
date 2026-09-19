# ADR-0015: Leased notification outbox worker

- Status: Accepted
- Date: 2026-09-19
- Owners: QaryzLink product/backend

## Context

NotificationOutbox makes delivery intent durable, but a future provider worker needs safe concurrency, retry behavior and recovery after a crashed process. Multiple replicas must not process the same row at the same time.

## Decision

1. Claim due rows in PostgreSQL with a transaction and FOR UPDATE SKIP LOCKED.
2. Mark claimed rows PROCESSING, set a five-minute lease and increment attempts atomically.
3. Reclaim an expired PROCESSING lease only while the maximum five attempts has not been reached.
4. A successful provider call is acknowledged with SENT and clears the lease.
5. A failed attempt returns to PENDING with exponential backoff (starting at one minute and capped at one hour).
6. After five attempts, the row becomes FAILED and retains a bounded, sanitized error message.
7. An expired lease at the maximum attempt count is finalized as FAILED before new claims are returned.
8. The worker is injectable and unscheduled in this slice; Kubernetes CronJob/queue scheduling and provider adapters are separate.

## Alternatives

- In-memory lock: rejected because replicas and restarts would lose ownership.
- Claim without a lease: rejected because a crashed worker would leave rows permanently stuck.
- Infinite retries: rejected because provider outages would create an unbounded queue.

## Consequences

- Delivery will be at-least-once; provider adapters must use the outbox idempotency key.
- Operators can distinguish retryable PENDING rows from terminal FAILED rows.
- A scheduler and monitoring policy are still required before public pilot.
