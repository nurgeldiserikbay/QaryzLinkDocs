# ADR-0014: Transactional notification outbox

- Status: Accepted
- Date: 2026-09-19
- Owners: QaryzLink product/backend

## Context

Payment confirmation and reversal change the obligation ledger. Users need a reliable notification event, but sending email or push inside the payment transaction would make the financial workflow slow and fragile. A failed provider must not roll back a valid ledger operation.

## Decision

1. Persist notification intents in NotificationOutbox in the same database transaction as the payment change.
2. Use a unique idempotencyKey so retries cannot create duplicate events.
3. Store only event metadata and opaque identifiers: event type, aggregate IDs, recipient party ID, channel and status. PII, credentials and receipt contents are excluded.
4. Initial channels are IN_APP and EMAIL; this slice writes IN_APP events only.
5. Payment confirmation emits PAYMENT_CONFIRMED for borrower and lender. Payment reversal emits PAYMENT_REVERSED for both contract participants.
6. Delivery provider, retry worker and scheduler are separate components and do not run in the payment request.

## Alternatives

- Send directly from the HTTP request: rejected because provider failure would couple delivery to the ledger transaction.
- Publish to an external broker first: deferred until operational infrastructure and provider contracts are selected.
- Poll payment tables without an outbox: rejected because events can be missed between the business write and a later read.

## Consequences

- The database is the durable source of notification intent.
- Delivery is at-least-once and must remain idempotent when the worker is added.
- A worker still needs claim, retry, dead-letter and retention rules.
- This does not send messages, certify legal notices, or create a money movement.
