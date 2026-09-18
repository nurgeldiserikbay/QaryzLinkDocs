# Payment reversal

Payment reversal is a controlled correction of a repayment record. It does not mean that QaryzLink received, stored, or returned money.

## Business rule

A lender can reverse only its own confirmed repayment. The reason is required, and the action is atomic:

~~~mermaid
flowchart TD
    A["Confirmed payment"] --> G{"Lender + reason + status valid?"}
    G -->|No| E["Reject"]
    G -->|Yes| R["Create REVERSED event"]
    R --> S["Restore schedule allocation"]
    S --> L["Append opposite ledger entries"]
    L --> H["Keep original history"]
~~~

The source record keeps its identifiers and evidence. The new record points back with reversalOfId; both records are visible to authorized contract participants.

## State behavior

~~~mermaid
stateDiagram-v2
    [*] --> AWAITING_CONFIRMATION
    AWAITING_CONFIRMATION --> CONFIRMED
    CONFIRMED --> REVERSED: lender correction
    REVERSED --> [*]
~~~

- AWAITING_CONFIRMATION, DISPUTED, EXPIRED and REVERSED payments cannot be reversed.
- Reversal allocations use a negative amount to restore each affected schedule item.
- Ledger entries are append-only: each original debit/credit is mirrored with the opposite direction.
- The original payment is not deleted and its evidence remains available under normal consent/access rules.
- The operation runs in one transaction; if schedule or ledger restoration fails, no partial reversal remains.

## Endpoint

POST /api/v1/payments/:paymentId/reverse

~~~json
{ "reason": "Duplicate repayment evidence" }
~~~

Successful response:

~~~json
{
  "id": "new-reversal-id",
  "reversalOfId": "original-payment-id",
  "status": "REVERSED"
}
~~~

A caller receives a generic not-found response when the payment is outside their permitted contract scope. A lender-only violation returns a conflict/forbidden domain error according to the API error mapping.

## Limits

This slice is an internal obligation ledger correction. It does not:

- initiate a bank transfer or refund;
- act as a payment institution, bank, MFO, collection agency, or court;
- certify a qualified electronic signature;
- notify a user through an outbox yet.

Notifications, external payment adapters, and a deployment scheduler are separate roadmap items.
