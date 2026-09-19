# Notification outbox worker

The worker owns delivery state, not the actual provider integration. It is safe to call from a future scheduler or queue consumer.

## Claim flow

~~~mermaid
sequenceDiagram
    participant W as Worker
    participant DB as PostgreSQL
    W->>DB: claim due rows
    DB-->>W: PROCESSING rows with lease
    W->>DB: provider result
    DB-->>W: SENT or PENDING/FAILED
~~~

The claim transaction uses PostgreSQL row locks with SKIP LOCKED, so parallel workers receive different rows.

## State transitions

~~~mermaid
stateDiagram-v2
    [*] --> PENDING
    PENDING --> PROCESSING: claim
    PROCESSING --> SENT: provider success
    PROCESSING --> PENDING: retryable failure
    PROCESSING --> FAILED: five attempts or terminal failure
    PROCESSING --> FAILED: lease expired at limit
~~~

## Retry rules

| Rule | Value |
|---|---|
| Lease | 5 minutes |
| Maximum attempts | 5 |
| First retry delay | 1 minute |
| Delay growth | Exponential |
| Maximum delay | 1 hour |
| Error storage | Trimmed to 500 characters |

A crashed worker leaves PROCESSING until the lease expires. The next claim run can recover it when attempts remain. If the maximum is already reached, the row is finalized as FAILED.

## Operational boundary

The current backend slice exposes an injectable worker with claim, markSent and markFailed operations. It does not:

- call SMTP, push or SMS providers;
- schedule itself;
- expose an admin retry endpoint;
- move money or change debt balances.

Provider adapters, scheduler deployment, monitoring and an Admin retry UI are later slices.
