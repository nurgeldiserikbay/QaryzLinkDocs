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

### Current private pilot lifecycle

~~~mermaid
stateDiagram-v2
    [*] --> ACTIVE: create private request
    ACTIVE --> MATCHED: one proposal accepted
    ACTIVE --> EXPIRED: expiry reached
    ACTIVE --> CANCELLED: owner closes/deletion lifecycle
    MATCHED --> CANCELLED: superseded/closed lifecycle where applicable
~~~

Current private request is created as `ACTIVE + INVITE_ONLY`; there is no separate publish/review step. `MATCHED` only means one concrete Proposal was accepted. Contract drafting, signing and funding remain separate stages.

### Future public-request lifecycle

A richer public borrower-request product may later use a publication lifecycle such as:

~~~mermaid
stateDiagram-v2
    [*] --> DRAFT
    DRAFT --> ACTIVE: publish after legal/product gate
    ACTIVE --> PAUSED
    PAUSED --> ACTIVE
    ACTIVE --> MATCHED
    ACTIVE --> EXPIRED
    ACTIVE --> CANCELLED
~~~

This future public flow is not the canonical pilot behavior until its API/UI/legal gates are implemented.

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
| Active → Completed | Funding CONFIRMED, schedule outstanding = 0, unresolved payment/dispute және unallocated credit жоқ, екі тарап бірдей final statement hash-ті растаған |
| Consent → Revoked | Future access тоқтайды; legal retention бөлек бағаланады |


## Private discovery states

Қазіргі Prisma mapping: Request ACTIVE + INVITE_ONLY; Proposal PENDING → ACCEPTED/REJECTED/WITHDRAWN/SUPERSEDED; ACCEPT request-ті MATCHED етеді. Expiry stored expiresAt арқылы mutation кезінде guard-ланады, scheduler кейін қосылады.


## Repayment schedule implementation mapping

QaryzLinkBack-та Contract ACTIVE және Funding CONFIRMED болғанда ғана ScheduleVersion жасалады. ACT_365_FIXED_HALF_UP_V1 саясаты бір AT_MATURITY item есептейді; inputHash қайталанса операция idempotent view қайтарады. Payment ledger, overdue worker және reversal implementation mapping төменде сипатталған.


## Payment implementation mapping

QaryzLinkBack-та borrower Payment evidence бергенде Payment AWAITING_CONFIRMATION күйіне өтеді. Lender CONFIRM жасаса ғана Payment CONFIRMED болып, charge → interest → principal allocation, ScheduleItem paidMinor/status update және екі ledger entry бір транзакцияда сақталады. DISPUTE schedule balance-ына әсер етпейді. Overdue worker және reversal backend slice аяқталды; notifications пен scheduler кейінгі slice.


## Due/overdue implementation mapping

QaryzLinkBack OverdueWorker database UTC күнімен unpaid schedule item-дерді тек ACTIVE + CONFIRMED шарттардан өңдейді. Бүгінгі dueDate DUE, өткен dueDate OVERDUE болады; PAID және CANCELLED күйлері қайта ашылмайды. Worker бір idempotent SQL transaction ретінде орындалады.


## Payment reversal implementation mapping

QaryzLinkBack-та lender CONFIRMED repayment үшін ғана POST /api/v1/payments/:paymentId/reverse шақыра алады. Backend original Payment-ті сақтап, status REVERSED етеді және reversalOfId арқылы жаңа REVERSED Payment жасайды. Allocation-дар теріс мәнмен ScheduleItem paidMinor балансын қайтарады; ledger-ге бастапқы бағыттарға қарама-қарсы append-only жазбалар қосылады. Барлық операция бір транзакцияда орындалады.


## Notification implementation mapping

Payment CONFIRMED немесе REVERSED болғанда QaryzLinkBack сол database transaction ішінде екі тарапқа IN_APP NotificationOutbox intent жазады. Event payload тек payment/contract/reversal идентификаторлары мен status metadata-дан тұрады; email, телефон, құжат немесе банк деректері сақталмайды. Unique idempotencyKey duplicate intent-ті басады. Outbox persistence, claim/retry worker, provider-neutral dispatch boundary және one-shot scheduler/orchestrator дайын; default adapter fail-closed, ал нақты provider delivery мен deployment scheduler кейінгі кезеңде орындалады.


## Contract closure implementation mapping

QaryzLinkBack-та participant-only `GET /api/v1/contracts/:contractId/closure` current financial truth-тен deterministic final statement hash есептейді. Closure ready болуы үшін Contract ACTIVE, Funding CONFIRMED, latest schedule бойынша outstanding 0, unresolved payment/dispute және unallocated credit болмауы керек.

Borrower және lender `POST /api/v1/contracts/:contractId/closure/confirm` арқылы дәл сол statement hash-ті бөлек растайды. Confirmation transaction contract row-ды lock етеді және snapshot-ты қайта тексереді. Екінші distinct party сол hash-ті растағанда Contract COMPLETED болып, immutable ClosureCertificate жасалады. Бірінші confirmation-нан кейін financial truth өзгерсе stale hash completion жасай алмайды.
