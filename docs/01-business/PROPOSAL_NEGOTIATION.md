# Proposal negotiation

Бұл құжат Private Discovery және Phase 3 Marketplace үшін borrower counter suggestion → lender response Proposal → borrower final ACCEPT negotiation contract-ын сипаттайды.

2026-09-28 күйі: Backend immutable proposal-counter lifecycle және Front KZ/RU negotiation UI іске асқан.

## Негізгі invariant

Borrower counter тікелей қабылданатын contract term емес.

Counter:

- borrower-дің lender Proposal-ға берген immutable suggestion-ы;
- lender оны тікелей ACCEPT етпейді;
- lender жауап бергісі келсе жаңа concrete Proposal жасайды;
- source Proposal SUPERSEDED болады;
- final ACCEPT құқығы қайта borrower-де қалады.

Осылай accepted Proposal terms әрқашан:

1. lender-authored;
2. borrower-explicitly-accepted

болып қалады.

## Flow

~~~mermaid
sequenceDiagram
    participant B as Borrower
    participant Q as QaryzLink
    participant L as Lender

    L->>Q: Proposal v1
    Q-->>B: PENDING Proposal
    B->>Q: Counter suggestion
    Q-->>L: Immutable counter
    alt Lender rejects
        L->>Q: REJECT counter
        Q-->>B: Counter REJECTED
    else Lender responds
        L->>Q: New lender terms
        Q->>Q: Proposal v1 -> SUPERSEDED
        Q->>Q: Create Proposal v2
        Q-->>B: PENDING Proposal v2
        B->>Q: ACCEPT Proposal v2
        Q->>Q: Request -> MATCHED
    else Borrower withdraws
        B->>Q: WITHDRAW counter
        Q-->>L: Counter WITHDRAWN
    end
~~~

## Counter data model

`ProposalCounter`:

- id;
- proposalId;
- status;
- immutable `termsSnapshot`;
- optional `responseProposalId`;
- expiresAt;
- createdAt/updatedAt.

Counter identity/contact fields сақтамайды.

Current statuses:

- `PENDING`;
- `RESPONDED`;
- `REJECTED`;
- `WITHDRAWN`;
- `EXPIRED`;
- `SUPERSEDED`.

## Counter creation

Borrower source Proposal үшін counter жасай алады, егер:

- source Proposal PENDING;
- source Proposal expired емес;
- parent LoanRequest ACTIVE;
- borrower source Proposal participant;
- borrower/lender users ACTIVE;
- borrower/lender email verified;
- тараптар арасында екі бағытта PartyBlock жоқ;
- сол source Proposal үшін басқа active PENDING counter жоқ;
- counter terms source Proposal terms-пен exact бірдей емес;
- daily counter quota аспаған.

Counter terms existing Proposal terms policy-ін қолданады:

- positive KZT minor-unit amount;
- term 1–3650 days;
- annualRateBps technical bound;
- responseHours 1–720.

## Daily quota

Environment:

~~~text
MAX_PROPOSAL_COUNTERS_PER_DAY=10
~~~

Engineering default: 10.

Validation hard max: 50.

Quota borrower account бойынша UTC күн ішінде есептеледі және Discovery command transaction actor row serialization boundary-ын қолданады.

## Idempotency

Create/respond/decision commands existing Discovery idempotency store қолданады.

Same idempotency key + same payload:

- бұрынғы result-ты қайтарады;
- duplicate Counter/Proposal жасамайды;
- duplicate audit row жасамайды.

Same key + different payload conflict болып саналады.

## Safe terminal actions

Counter:

- borrower → WITHDRAW;
- lender → REJECT.

Бұл әрекеттер:

- ақша аудармайды;
- contract жасамайды;
- new Proposal жасамайды;
- email re-verification жоғалған active participant үшін safe terminal action ретінде қолжетімді болып қалады.

Lender RESPOND және borrower CREATE жаңа financial negotiation болғандықтан verified participant талап етеді.

## Lender response

Lender `PENDING` counter-ға жаңа terms береді.

Backend:

1. counter/source Proposal/request state recheck жасайды;
2. parties ACTIVE + verified + unblocked екенін recheck жасайды;
3. lender proposal daily quota-ны қайта тексереді;
4. new lender-authored Proposal жасайды;
5. source Proposal-ды `SUPERSEDED` етеді;
6. Counter-ды `RESPONDED` етеді;
7. `responseProposalId` сақтайды.

Borrower counter snapshot new Proposal-ға автоматты accepted terms ретінде көшірілмейді. Lender response terms authoritative new Proposal terms болып саналады.

## Source Proposal terminal semantics

Source Proposal:

- ACCEPT;
- REJECT;
- WITHDRAW;
- competing Proposal winner нәтижесінде SUPERSEDED

болса, source-қа байланған PENDING counter-лар да `SUPERSEDED` болады.

Бұл stale negotiation history-дің active болып қалмауын қамтамасыз етеді.

## Competing Proposal semantics

LoanRequest бір басқа Proposal-ды ACCEPT етсе:

- winner Proposal ACCEPTED;
- request MATCHED;
- қалған PENDING proposals SUPERSEDED;
- loser proposals-қа байланған PENDING counters SUPERSEDED.

Counter final acceptance race-ын жасай алмайды.

## Privacy boundary

Counter history endpoint тек request/proposal participant-қа қолжетімді.

Response:

- proposalId;
- viewerRole;
- counter id;
- status;
- termsSnapshot;
- responseProposalId;
- expiresAt;
- createdAt.

Response-та мыналар жоқ:

- borrower/lender userId;
- partyId;
- publicId;
- displayName;
- email;
- phone;
- legal identity;
- block relationship.

Unauthorized/non-participant privacy-safe not-found shape алады.

## Audit boundary

Negotiation command audit action names:

- `DISCOVERY_PROPOSAL_COUNTER_CREATE`;
- `DISCOVERY_PROPOSAL_COUNTER_DECISION`;
- `DISCOVERY_PROPOSAL_COUNTER_RESPOND`.

Audit payload existing Discovery command contract бойынша aggregate result status-пен шектеледі.

Financial terms, contact немесе identity audit payload-қа көшірілмейді.

## HTTP API

Borrower create:

~~~text
POST /api/v1/discovery/proposals/:proposalId/counters
Idempotency-Key: <uuid>
~~~

History:

~~~text
GET /api/v1/discovery/proposals/:proposalId/counters
~~~

Borrower withdraw / lender reject:

~~~text
POST /api/v1/discovery/proposal-counters/:counterId/decision
Idempotency-Key: <uuid>

{ "decision": "WITHDRAW" | "REJECT" }
~~~

Lender response:

~~~text
POST /api/v1/discovery/proposal-counters/:counterId/respond
Idempotency-Key: <uuid>
~~~

`ACCEPT` counter decision intentionally жоқ.

## Front behavior

Request detail visible Proposal card ішінде negotiation panel бар.

Borrower:

- PENDING Proposal үшін counter form көреді;
- form source Proposal terms-пен prefill болады;
- exact no-op counter Front-та blocked;
- existing PENDING counter болса жаңа form шықпайды;
- PENDING counter-ды WITHDRAW жасай алады.

Lender:

- PENDING counter history көреді;
- REJECT жасай алады;
- жаңа Proposal terms-пен RESPOND жасай алады.

Both:

- immutable counter history көреді;
- terminal Proposal-дарда history read-only қалады;
- responseProposalId қысқа reference ретінде көрінеді;
- identity/contact field көрсетілмейді.

KZ/RU journey catalog exact parity сақтайды.

## Нені бұл feature жасамайды

- free-text negotiation chat;
- counter-ды тікелей ACCEPT;
- automatic bargaining;
- recommended interest rate;
- ranking/scoring;
- AI-generated financial terms;
- public lender identity;
- automatic contract/funding.

## Acceptance

Backend implementation tests:

- borrower counter create;
- lender response → new Proposal;
- borrower final ACCEPT;
- participant-only history;
- unrelated-user isolation;
- block relationship recheck;
- safe withdraw/reject;
- one pending counter per source Proposal;
- no-op rejection;
- daily quota;
- idempotent replay;
- source terminal cleanup;
- competing Proposal cleanup;
- HTTP DTO ownership-field rejection.

Front implementation tests:

- counter list API;
- create/respond/decision idempotency headers;
- KZ/RU catalog parity;
- existing request-detail mobile auth smoke remains in suite.

Current automated GitHub Actions execution quota/billing gate салдарынан actual runner evidence әлі pending.
