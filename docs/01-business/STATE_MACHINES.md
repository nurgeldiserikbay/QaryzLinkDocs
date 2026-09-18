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

## Contract implementation mapping

QaryzLinkBack-тағы нақты MVP mapping: Contract.PENDING_SIGNATURES + ContractVersion.SIGNING → бірінші растау → сол күй → екінші distinct party растауы → Contract.SIGNED + ContractVersion.SIGNED. Бұл transition documentHash дәл келгенде ғана орындалады. SIGNED → ACTIVE тек Funding CONFIRMED болғанда мүмкін.

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

## Funding implementation mapping

QaryzLinkBack-та lender evidence metadata бергенде Funding EVIDENCE_REQUIRED → AWAITING_CONFIRMATION өтеді. Borrower CONFIRM жасаса Funding CONFIRMED және Contract ACTIVE; DISPUTE жасаса Funding DISPUTED және Contract DISPUTED. Deadline mutation кезінде guard-ланады, scheduler кейін қосылады.

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


## Repayment schedule implementation mapping

QaryzLinkBack-та Contract ACTIVE және Funding CONFIRMED болғанда ғана ScheduleVersion жасалады. ACT_365_FIXED_HALF_UP_V1 саясаты бір AT_MATURITY item есептейді; inputHash қайталанса операция idempotent view қайтарады. Payment ledger және overdue worker кейінгі кезең.


## Payment implementation mapping

QaryzLinkBack-та borrower Payment evidence бергенде Payment AWAITING_CONFIRMATION күйіне өтеді. Lender CONFIRM жасаса ғана Payment CONFIRMED болып, charge → interest → principal allocation, ScheduleItem paidMinor/status update және екі ledger entry бір транзакцияда сақталады. DISPUTE schedule balance-ына әсер етпейді. Overdue worker және reversal кейінгі slice.


## Due/overdue implementation mapping

QaryzLinkBack OverdueWorker database UTC күнімен unpaid schedule item-дерді тек ACTIVE + CONFIRMED шарттардан өңдейді. Бүгінгі dueDate DUE, өткен dueDate OVERDUE болады; PAID және CANCELLED күйлері қайта ашылмайды. Worker бір idempotent SQL transaction ретінде орындалады.
