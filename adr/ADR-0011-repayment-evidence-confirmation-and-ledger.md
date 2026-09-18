# ADR-0011: Repayment evidence, confirmation and ledger allocation

- Status: Accepted
- Date: 2026-09-18
- Owners: QaryzLink product and backend
- Related: ADR-0009, ADR-0010

## Context

After a repayment schedule exists, the platform must record a borrower's reported repayment without becoming a bank or custodian. A report is not a confirmed payment until the lender reviews it. Confirmed money must reduce schedule balances in a deterministic and auditable way.

## Decision

1. Only the borrower of an ACTIVE contract with CONFIRMED funding can submit repayment evidence.
2. The submission contains amount in minor units, a claimed paidAt timestamp and private evidence metadata. File bytes remain outside the API.
3. A payment starts in AWAITING_CONFIRMATION. Only the lender can CONFIRM or DISPUTE it; a dispute requires a reason.
4. A confirmed payment is immutable. Corrections use a future reversal event; UPDATE and DELETE are not used.
5. Allocation is deterministic across the latest schedule: charge, then interest, then principal, oldest sequence first. MVP charge is zero.
6. Any amount above outstanding schedule items is persisted as unallocated credit on the payment.
7. Confirmation writes payment allocations, updates schedule item paidMinor/status, and appends a balanced pair of obligation ledger entries in one transaction.
8. Payment API responses never expose object keys, email, phone, national identifiers or document contents.
9. Bank APIs, custody, automatic reconciliation, overdue worker and legal collection remain outside this slice.

~~~mermaid
sequenceDiagram
    participant B as Borrower
    participant API as Payment API
    participant S as Private storage
    participant L as Lender
    B->>S: upload receipt out of band
    S-->>B: object key + SHA-256
    B->>API: amount + evidence metadata
    API-->>L: AWAITING_CONFIRMATION
    L->>API: CONFIRM or DISPUTE
    API-->>API: allocation + ledger transaction
    API-->>B: status and balance
~~~

## Consequences

- The platform creates a reviewable audit trail without claiming that it moved money.
- The same payment cannot reduce balances before counterparty confirmation.
- The payment allocation policy can be versioned later for installments, early repayment and legal charges.
- A background worker is still needed to materialize overdue states and notifications.
