# Notification outbox

QaryzLink records notification intent without sending messages inside the payment request. This protects the ledger transaction and keeps the platform independent of email/SMS providers.

## Event flow

~~~mermaid
flowchart TD
    P["Payment transaction"] --> O["NotificationOutbox"]
    O --> I["Idempotency key"]
    O --> W["Future delivery worker"]
    W --> C["IN_APP or EMAIL provider"]
    W --> R["Retry / failure status"]
~~~

For the current slice, the payment transaction writes the outbox row and returns. A future worker will claim due rows and deliver them.

## Emitted events

| Event | Recipients | When |
|---|---|---|
| PAYMENT_CONFIRMED | Borrower and lender | Lender confirms repayment |
| PAYMENT_REVERSED | Borrower and lender | Lender reverses confirmed repayment |

Each event carries only opaque IDs and state metadata. It does not include email, phone, document contents, bank credentials or receipt files.

## Outbox record

| Field | Purpose |
|---|---|
| idempotencyKey | Prevents duplicate intent on transaction retries |
| eventType | Versioned business event name |
| aggregateType / aggregateId | Links the event to Payment |
| recipientPartyId | Internal party recipient |
| channel | IN_APP now; EMAIL prepared |
| payload | Small privacy-safe JSON envelope |
| status | PENDING, PROCESSING, SENT or FAILED |
| availableAt / attempts | Future worker scheduling and retry control |

## Guarantees and limits

- The outbox row commits or rolls back with the payment confirmation/reversal.
- Repeating the same event uses the unique idempotency key and does not create a second row.
- Outbox persistence is not message delivery; provider retries and monitoring are still required.
- QaryzLink does not hold money, issue a payment instruction, or make a notification a qualified legal notice.
