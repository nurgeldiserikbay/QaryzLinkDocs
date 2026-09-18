# ADR-0008: Immutable contract draft and dual acknowledgement

- Status: Accepted
- Date: 2026-09-18
- Owners: QaryzLink product and backend
- Related: ADR-0003, ADR-0004, ADR-0007

## Context

Private discovery now ends with one accepted proposal. Both parties need to see the same financial terms and acknowledge the same version before the platform can start a funding workflow. The platform is still an assistant: it does not hold money and this step is not presented as a qualified electronic signature or a legal conclusion.

## Decision

1. Only an ACCEPTED proposal without an existing contract can create a contract.
2. Creation stores Contract and immutable ContractVersion 1 in one database transaction.
3. Version 1 contains the accepted terms snapshot, calculation-policy metadata and a canonical SHA-256 documentHash.
4. The contract starts as PENDING_SIGNATURES; its version starts as SIGNING.
5. Only the exact borrower or lender party can acknowledge the version. The request must contain the stored hash.
6. Each party has one unique signature for a version. The method is PLATFORM_ACKNOWLEDGEMENT.
7. The second distinct acknowledgement changes the version to SIGNED and the contract to SIGNED.
8. SIGNED is still separate from FUNDING. Money transfer, evidence and borrower confirmation are the next workflow.
9. Contract reads expose terms and status only to the two parties; email, phone, identity documents and other PII are not returned.
10. Proposal and contract rows are locked during mutations. Database uniqueness protects against duplicate version signatures.

~~~mermaid
sequenceDiagram
    participant P as Accepted Proposal
    participant C as Contract API
    participant DB as PostgreSQL
    participant B as Borrower
    participant L as Lender
    P->>C: POST from-proposal
    C->>DB: lock proposal + create v1/hash
    DB-->>C: PENDING_SIGNATURES
    C-->>B: immutable hash and terms
    C-->>L: immutable hash and terms
    B->>C: POST sign(hash)
    C->>DB: store borrower acknowledgement
    L->>C: POST sign(hash)
    C->>DB: store lender acknowledgement
    DB-->>C: SIGNED
    C-->>B: funding still pending
    C-->>L: funding still pending
~~~

## Alternatives

- Free-form text agreement: rejected because terms cannot be reproduced or hashed deterministically.
- One-sided confirmation: rejected because it would misrepresent the other party's consent.
- Automatic activation after signing: rejected; funding must have independent evidence.
- Custodial platform payment: deferred and legally gated.

## Consequences

- Front can render a simple two-step confirmation without collecting extra PII.
- A retry with the same hash is safe; a different hash is a conflict.
- A later amendment must create a new ContractVersion, never edit version 1.
- Legal enforceability, qualified e-signature status and jurisdiction-specific notices remain release gates.
- Funding evidence and confirmation are the next implementation slice.

## Explicit non-goals

This decision does not claim that a platform acknowledgement is a qualified electronic signature, does not create a debt automatically, and does not transfer or custody money.
