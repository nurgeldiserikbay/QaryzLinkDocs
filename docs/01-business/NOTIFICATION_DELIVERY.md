# Notification delivery port

The delivery boundary separates durable outbox state from external messaging providers.

## Dispatch flow

~~~mermaid
sequenceDiagram
    participant W as Outbox worker
    participant D as Dispatch service
    participant R as Recipient resolver
    participant P as Delivery port
    participant O as Outbox state
    W->>D: claimed event
    D->>R: party ID + channel
    R-->>D: ephemeral destination or null
    D->>P: metadata envelope + destination
    alt provider succeeds
        P-->>D: resolved
        D->>O: mark SENT
    else destination/provider fails
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
- attempt number;
- an ephemeral destination resolved for the current dispatch.

A provider does not receive:

- contact data from the outbox payload;
- unverified or inactive email destinations;
- receipt objects or document contents;
- bank credentials, access tokens or secrets;
- permission to change contracts, schedules or ledger balances.

## Results

| Provider result | Outbox transition |
|---|---|
| Resolves successfully | SENT |
| Throws an error before retry limit | PENDING with backoff |
| Throws after retry limit | FAILED |
| Missing destination | PENDING/FAILED without provider call |
| Default unavailable adapter | PENDING/FAILED through the same policy |

## Operational boundary

Recipient destination resolution, a fail-closed SMTP adapter and optional email preference are now tested backend slices. Actual provider credentials/inbox delivery, organization contact routing, scheduler deployment and monitoring are still required before public pilot.