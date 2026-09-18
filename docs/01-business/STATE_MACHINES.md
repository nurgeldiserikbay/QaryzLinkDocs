# State Machines

## 1. LenderOffer

~~~mermaid
stateDiagram-v2
    [*] --> DRAFT
    DRAFT --> UNDER_REVIEW: publish
    UNDER_REVIEW --> PUBLISHED: rules passed
    UNDER_REVIEW --> REJECTED: blocked by rule
    PUBLISHED --> PAUSED: lender pauses
    PAUSED --> PUBLISHED: resume
    PUBLISHED --> EXPIRED: expiry reached
    PUBLISHED --> CLOSED: lender closes
    PUBLISHED --> SUPERSEDED: new version
    SUPERSEDED --> [*]
    EXPIRED --> [*]
    CLOSED --> [*]
    REJECTED --> DRAFT: edit
~~~

## 2. BorrowerRequest

~~~mermaid
stateDiagram-v2
    [*] --> DRAFT
    DRAFT --> PUBLISHED
    PUBLISHED --> PAUSED
    PAUSED --> PUBLISHED
    PUBLISHED --> MATCHED
    PUBLISHED --> EXPIRED
    PUBLISHED --> CLOSED
    MATCHED --> CLOSED: contract selected
~~~

MATCHED тек proposal барын білдіреді, қарыз берілгенін білдірмейді.

## 3. Application / Proposal

~~~mermaid
stateDiagram-v2
    [*] --> DRAFT
    DRAFT --> SENT
    SENT --> VIEWED
    VIEWED --> NEGOTIATION
    VIEWED --> ACCEPTED
    VIEWED --> REJECTED
    SENT --> EXPIRED
    VIEWED --> EXPIRED
    NEGOTIATION --> SENT: new version
    ACCEPTED --> CONVERTED_TO_CONTRACT
    CONVERTED_TO_CONTRACT --> [*]
~~~

## 4. Contract / Obligation

~~~mermaid
stateDiagram-v2
    [*] --> CONTRACT_DRAFT
    CONTRACT_DRAFT --> SIGNING_PENDING
    SIGNING_PENDING --> SIGNED_PENDING_FUNDING
    SIGNING_PENDING --> SIGNING_EXPIRED
    SIGNED_PENDING_FUNDING --> ACTIVE: funding confirmed
    SIGNED_PENDING_FUNDING --> FUNDING_DISPUTED
    SIGNED_PENDING_FUNDING --> CANCELLED: funding deadline passed
    FUNDING_DISPUTED --> ACTIVE: resolved as funded
    FUNDING_DISPUTED --> CANCELLED: resolved as not funded
    ACTIVE --> OVERDUE
    ACTIVE --> DISPUTED
    ACTIVE --> COMPLETED
    OVERDUE --> DISPUTED
    OVERDUE --> RESTRUCTURING
    RESTRUCTURING --> ACTIVE: amendment signed
    DISPUTED --> ACTIVE: resolved
    DISPUTED --> COMPLETED: settlement closes
    COMPLETED --> ARCHIVED
~~~

## 5. Funding

~~~mermaid
stateDiagram-v2
    [*] --> DRAFT
    DRAFT --> EVIDENCE_SUBMITTED
    EVIDENCE_SUBMITTED --> CONFIRMED: borrower confirms
    EVIDENCE_SUBMITTED --> DISPUTED: borrower disputes
    EVIDENCE_SUBMITTED --> EXPIRED: confirmation timeout
    DISPUTED --> CONFIRMED: settlement or decision
    DISPUTED --> REJECTED: not funded
~~~

Timeout автоматты CONFIRMED жасамайды.

## 6. Payment

~~~mermaid
stateDiagram-v2
    [*] --> REPORTED
    REPORTED --> PENDING_CONFIRMATION
    PENDING_CONFIRMATION --> CONFIRMED
    PENDING_CONFIRMATION --> DISPUTED
    PENDING_CONFIRMATION --> EXPIRED
    DISPUTED --> CONFIRMED: resolved as paid
    DISPUTED --> REJECTED: resolved as unpaid
    CONFIRMED --> REVERSED: correction event
~~~

Confirmed payment UPDATE/DELETE арқылы өзгертілмейді. Reversal жаңа ledger event жасайды.

## 7. Verification

~~~mermaid
stateDiagram-v2
    [*] --> NOT_STARTED
    NOT_STARTED --> PENDING
    PENDING --> PASSED
    PENDING --> FAILED
    PENDING --> MANUAL_REVIEW
    MANUAL_REVIEW --> PASSED
    MANUAL_REVIEW --> FAILED
    PASSED --> EXPIRED
    PASSED --> REVOKED
    EXPIRED --> PENDING: reverify
~~~

## 8. Dispute

~~~mermaid
stateDiagram-v2
    [*] --> OPEN
    OPEN --> AWAITING_RESPONSE
    AWAITING_RESPONSE --> NEGOTIATION
    NEGOTIATION --> RESOLVED_BY_AGREEMENT
    NEGOTIATION --> MEDIATION
    MEDIATION --> RESOLVED_BY_AGREEMENT
    MEDIATION --> EXTERNAL_PROCESS
    EXTERNAL_PROCESS --> RESOLVED_EXTERNALLY
    OPEN --> WITHDRAWN
    RESOLVED_BY_AGREEMENT --> CLOSED
    RESOLVED_EXTERNALLY --> CLOSED
    WITHDRAWN --> CLOSED
~~~

## 9. Негізгі transition guard-тар

| Transition | Guard |
|---|---|
| Proposal → Accepted | Version active, deadline өтпеген |
| Contract → Signed | Барлық required party нақты hash-қа қол қойған |
| Signed → Active | Funding CONFIRMED |
| Payment → Confirmed | Counterparty немесе trusted provider растады |
| Active → Completed | Outstanding confirmed balance = 0 және unresolved dispute жоқ |
| Consent → Revoked | Future access тоқтайды; legal retention бөлек бағаланады |


## Private discovery states

Қазіргі Prisma mapping: Request ACTIVE + INVITE_ONLY; Proposal PENDING → ACCEPTED/REJECTED/WITHDRAWN/SUPERSEDED; ACCEPT request-ті MATCHED етеді. Expiry stored expiresAt арқылы mutation кезінде guard-ланады, scheduler кейін қосылады.
