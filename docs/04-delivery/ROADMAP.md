# Delivery Roadmap

Этаптар feature count бойынша емес, тәуекелді азайту және дәлелденетін exit criteria бойынша бөлінеді.

## Жалпы карта

~~~mermaid
flowchart TD
    P0["0. Discovery"] --> P1["1. Foundation"]
    P1 --> P2["2. Private Debt MVP"]
    P2 --> P3["3. Offers & Matching"]
    P3 --> P4["4. Trust & Evidence"]
    P4 --> P5["5. Public Beta KZ"]
    P5 --> P6["6. Business"]
    P6 --> P7["7. Payments"]
    P7 --> P8["8. International"]
~~~

## Phase 0 — Discovery және legal framing

### Deliverables

- product scope;
- business logic;
- state machines;
- calculation policy draft;
- privacy matrix;
- threat model;
- Kazakhstan legal questions;
- clickable UX prototype;
- ADR baseline.

### Exit criteria

- signed/funded айырмашылығы бекітілген;
- marketplace legal gate анықталған;
- MVP-де платформа ақша ұстамайтыны бекітілген;
- блоктаушы сұрақтардың owner-і бар.

### Repository

QaryzLinkDocs.

## Phase 1 — Engineering foundation

### Back

- NestJS modular monolith;
- PostgreSQL/Redis/storage;
- IAM;
- audit/outbox;
- migrations;
- OpenAPI;
- CI/CD;
- observability.

### Front

- Next.js/PWA shell;
- localization KZ/RU;
- auth/onboarding;
- design tokens;
- generated API client;
- error/loading/empty states.

### Admin

- separate auth surface;
- role skeleton;
- audit viewer skeleton.

### Exit criteria

- staging deploy;
- auth + session management;
- end-to-end health flow;
- backup/restore smoke;
- no critical security findings.

## Phase 2 — Private Debt MVP

Scope:

- private record;
- invite by ID/link;
- relationship consent;
- lender terms;
- contract draft;
- mutual confirmation/signing baseline;
- funding evidence;
- funding mutual confirmation;
- interest-free schedule;
- manual payment confirmation;
- closure;
- reminders;
- evidence summary + immutable manifest baseline.

~~~mermaid
flowchart LR
    INV["Invite"] --> AGR["Agree"]
    AGR --> SGN["Sign"]
    SGN --> FND["Confirm funding"]
    FND --> PAY["Track payment"]
    PAY --> CLS["Close"]
~~~

### Exit criteria

- critical E2E flows green;
- private/unconfirmed debt cannot appear as confirmed;
- no cross-user data leak;
- balances replay deterministically;
- KZ/RU full journey.

2026-09-27: backend critical lifecycle + tenant-isolation PostgreSQL harness implementation-ы дайын. GitHub Actions quota/billing gate салдарынан current commit үшін successful runner execution әлі жоқ, сондықтан `critical E2E flows green` және `no cross-user data leak` exit criteria formal түрде жабылған жоқ.

Front KZ/RU presentation coverage landing/auth → discovery/proposal → contract/funding/payment → closure/evidence/dispute → notifications/settings/account lifecycle бойынша implementation деңгейінде аяқталды. Бірақ real authenticated borrower/lender browser journey current main-да әлі орындалмаған, сондықтан `KZ/RU full journey` formal green емес. Acceptance: [Phase 2 critical E2E](PHASE2_CRITICAL_E2E.md) және [Phase 2 KZ/RU journey](PHASE2_KZ_RU_JOURNEY.md).

## Phase 3 — Offers және Matching

- LenderOffer;
- BorrowerRequest;
- applications/proposals;
- negotiation versions;
- deadlines;
- matching explanation;
- privacy-safe search;
- moderation;
- spam/abuse controls.

2026-09-27: LenderOffer backend foundation және borrower OfferApplication slice іске асты. Verified KZ lender PUBLIC offer create/cancel жасай алады; verified borrower privacy-safe browse жасап, existing exact LoanRequest арқылы application береді. Lender ACCEPT concrete Proposal ғана жасайды, borrower кейін Proposal-ды бөлек explicit ACCEPT етеді. Application immutable offer snapshot сақтайды және competing applications winner таңдалғанда supersede болады. Бірақ `PUBLIC_MARKETPLACE_ENABLED=false` default және release preflight true мәнін fail етеді. Automatic matching/ranking/UI әлі жоқ. Boundaries: [Public lender offers](../01-business/PUBLIC_LENDER_OFFERS.md), [Public offer applications](../01-business/PUBLIC_OFFER_APPLICATIONS.md).

### Legal gate

Open/public matching production-да қосылмас бұрын Қазақстан заңгерінің written classification қажет. Gate өтпесе, feature private/closed-network mode-да қалады.

## Phase 4 — Trust және Evidence

- L2 KYC adapter;
- verified claims;
- contract PDF;
- document hashes;
- court/export evidence package (PDF/ZIP, manifest signature, trusted timestamp);
- amendments;
- disputes;
- data export/deletion;
- staff JIT access.

## Phase 5 — Public Beta Kazakhstan

- limited cohort;
- support process;
- fraud monitoring;
- performance/load test;
- incident drill;
- analytics;
- user feedback;
- legal text final review.

### Exit criteria

- uptime және error budget мақсаттары;
- support SLA;
- restore drill;
- incident ownership;
- legal gates passed;
- public terms/privacy published.

## Phase 6 — Business

- organizations;
- memberships/roles;
- authority;
- approval workflow;
- multiple signatories;
- KYB;
- receivables dashboard;
- API/webhooks;
- bulk import/export.

## Phase 7 — Bank/payment integration

- licensed payment/escrow partner;
- transaction confirmation;
- reconciliation;
- refunds/reversals;
- provider risk;
- KYC/AML;
- payment incident runbook.

Платформа ақшаны өзінің операциялық шотында ұстамайды.

## Phase 8 — International

Әр ел үшін:

- legal classification;
- CountryPack;
- contract templates;
- signature mapping;
- identity provider;
- data residency;
- retention;
- local language;
- tax/consumer disclosure;
- support readiness.

## Cross-repository dependency

~~~mermaid
flowchart TD
    DOC["Docs decision"] --> BACK["Back contract/domain"]
    BACK --> API["OpenAPI/client"]
    API --> FRONT["Front feature"]
    API --> ADMIN["Admin control"]
    FRONT --> E2E["Cross-repo E2E"]
    ADMIN --> E2E
~~~

## Definition of Done

Әр feature үшін:

- spec және acceptance criteria;
- domain/state impact;
- privacy/security review;
- API contract;
- migrations;
- tests;
- observability;
- error states;
- KZ/RU content;
- rollback plan;
- documentation;
- no unresolved critical finding.
