# ADR-0013: Immutable payment reversal

- Status: Accepted
- Date: 2026-09-18
- Owners: QaryzLink product/backend

## Context

A lender may need to correct a confirmed repayment record (for example, duplicate evidence or an incorrectly confirmed payment). The platform must preserve the audit trail and must not imply that QaryzLink moved or held money.

## Decision

1. Only the lender/payee who confirmed the repayment may request a reversal.
2. The source payment must be CONFIRMED; a disputed, awaiting, expired, or already reversed payment cannot be reversed.
3. The original payment row is retained and transitions to REVERSED; it is never deleted or rewritten.
4. The system creates a separate REVERSED payment linked with reversalOfId.
5. The reversal records negative allocations, restores the schedule item's paid balance, and appends opposite debit/credit ledger entries in one database transaction.
6. A human-readable reason of at least three characters is mandatory.
7. Reversal is a bookkeeping correction only. It does not transfer, custody, refund, or settle money.

## Alternatives

- Update/delete the original payment: rejected because it destroys evidence and audit history.
- Let either party reverse: rejected because the lender is the confirming authority in the current MVP.
- Automatically reverse after a timeout: rejected until a legal and operational policy exists.

## Consequences

- Payment history remains explainable and idempotent.
- Schedule balances can be recomputed from signed allocations.
- A notification/outbox event and external bank refund integration remain separate future slices.
- The flow is not a qualified electronic signature, debt collection, or court filing.

## API

POST /api/v1/payments/:paymentId/reverse

Request:

~~~json
{ "reason": "Duplicate repayment evidence" }
~~~

The response contains status REVERSED and reversalOfId. Access is scoped to the authenticated lender and the contract participants.
