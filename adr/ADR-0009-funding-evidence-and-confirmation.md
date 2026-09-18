# ADR-0009: Manual funding evidence and two-sided confirmation

- Status: Accepted
- Date: 2026-09-18
- Owners: QaryzLink product and backend
- Related: ADR-0003, ADR-0008

## Context

After both parties acknowledge a contract, the platform must distinguish a signed obligation from the fact that money was actually transferred. QaryzLink does not hold or move money in the Kazakhstan-first MVP, so the transfer is reported by the lender and confirmed by the borrower.

## Decision

1. When the second party signs, the contract becomes SIGNED and a Funding record is created as EVIDENCE_REQUIRED.
2. The lender submits only evidence metadata: private object-storage key, media type and SHA-256. File bytes are uploaded out of band.
3. The evidence hash is normalized and duplicate hashes are idempotent.
4. The lender submission starts AWAITING_CONFIRMATION and a separate confirmation deadline.
5. Only the exact borrower can choose CONFIRM or DISPUTE. A dispute requires a reason.
6. CONFIRM atomically changes Funding to CONFIRMED and Contract to ACTIVE.
7. DISPUTE atomically changes Funding to DISPUTED and Contract to DISPUTED.
8. An overdue confirmation changes Funding to CONFIRMATION_OVERDUE and Contract to EXPIRED_UNFUNDED; it never auto-confirms.
9. Funding confirmations are persisted with party, decision, reason and timestamp. Evidence object keys are never returned in the public API view.
10. Bank transfer integration, custody, automatic reconciliation and legal enforcement remain outside this slice.

~~~mermaid
sequenceDiagram
    participant L as Lender
    participant API as Funding API
    participant S as Private storage
    participant B as Borrower
    L->>S: upload receipt out of band
    S-->>L: object key + SHA-256
    L->>API: submit metadata
    API-->>B: AWAITING_CONFIRMATION
    B->>API: CONFIRM or DISPUTE
    API-->>L: status and audit result
    API-->>B: status and audit result
~~~

## Consequences

- The system preserves an auditable evidence trail without custody of funds.
- A borrower can reject an incorrect or missing transfer before the obligation becomes ACTIVE.
- A scheduled worker is still needed later to materialize overdue states without a user mutation.
- Storage access, retention, malware scanning and signed download URLs require the Documents/Operations slice.
- This workflow is evidence management, not proof of legal enforceability by itself.
