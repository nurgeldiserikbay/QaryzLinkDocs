# Notification delivery port

The delivery boundary separates durable outbox state from external messaging providers.

## Dispatch flow

~~~mermaid
sequenceDiagram
    participant W as Outbox worker
    participant D as Dispatch service
    participant P as Delivery port
    participant O as Outbox state
    W->>D: claimed event
    D->>P: deliver metadata envelope
    alt provider succeeds
        P-->>D: resolved
        D->>O: mark SENT
    else provider fails
        P-->>D: error
        D->>O: mark PENDING or FAILED
    end
~~~

The default adapter is intentionally unavailable. This prevents a staging or production deployment from claiming successful delivery without a configured provider.

## Contract

A provider receives:

- event ID and type;
- aggregate type and opaque aggregate ID;
- recipient party ID;
- channel;
- metadata-only payload;
- attempt number.

A provider does not receive:

- email or phone unless a later adapter explicitly resolves consented contact data;
- receipt objects or document contents;
- bank credentials, access tokens or secrets;
- permission to change contracts, schedules or ledger balances.

## Results

| Provider result | Outbox transition |
|---|---|
| Resolves successfully | SENT |
| Throws an error before retry limit | PENDING with backoff |
| Throws after retry limit | FAILED |
| Default unavailable adapter | PENDING/FAILED through the same policy |

## Operational boundary

This slice provides a tested adapter contract and safe default. SMTP/push implementation, secret management, templates, consent-aware recipient resolution, scheduler deployment and monitoring are still required before public pilot.
