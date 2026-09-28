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

2026-09-27: LenderOffer backend foundation, borrower OfferApplication slice, IN_APP lifecycle notifications және KZ/RU marketplace workspace іске асты. Verified KZ lender PUBLIC offer create/cancel жасай алады; verified borrower privacy-safe browse жасап, өзінің ACTIVE exact LoanRequest-ін таңдайды, deterministic compatibility explanation арқылы amount/term fit reason codes көреді және тек compatible request-пен application береді. Lender ACCEPT concrete Proposal ғана жасайды, borrower кейін Proposal-ды бөлек explicit ACCEPT етеді. Application immutable offer snapshot сақтайды және competing applications winner таңдалғанда supersede болады. Front lender identity/contact көрсетпейді және verification жоғалған participant үшін safe cancel/reject/withdraw әрекеттерін сақтайды. Бірақ `PUBLIC_MARKETPLACE_ENABLED=false` default және release preflight true мәнін fail етеді. Offer pause/resume lifecycle және immutable financial terms versioning те іске асты. Existing applications historical offerVersion snapshot-ын сақтайды, жаңа applications current version-ға байланысады. Compatibility explanation score/rank/recommendation емес. User-driven enum-only offer reporting және aggregate Admin moderation backlog іске асты; automatic sanctions/reputation жоқ. Immutable borrower counter → lender response Proposal negotiation lifecycle және KZ/RU Front UI іске асты. Default-off row-level moderator Resolve/Dismiss workflow те іске асты; automatic sanction жоқ. Automatic matching/ranking, per-staff JIT moderation identity және public rollout әлі жоқ. Boundaries: [Public lender offers](../01-business/PUBLIC_LENDER_OFFERS.md), [Public offer applications](../01-business/PUBLIC_OFFER_APPLICATIONS.md), [Explainable compatibility](../01-business/EXPLAINABLE_COMPATIBILITY.md).

### Legal gate

Open/public matching production-да қосылмас бұрын Қазақстан заңгерінің written classification қажет. Gate өтпесе, feature private/closed-network mode-да қалады.

## Phase 4 — Trust және Evidence

- [x] provider-neutral default-off identity verification boundary;
- [ ] vetted L2 KYC provider adapter + authenticated callback;
- [x] provider-neutral minimal L2 claim persistence/expiry/revocation core;
- [x] participant-only immutable contract document source;
- [x] deterministic KZ/RU technical preview + source/input/render hash integrity boundary;
- [ ] approved KZ/RU contract template + deterministic PDF renderer;
- [x] technical render hashes; final PDF artifact hash binding pending;
- [x] participant-only audited canonical JSON evidence export baseline;
- [x] deterministic evidence bundle manifest + artifact path/size/hash contract;
- [x] bounded deterministic metadata/text ZIP archive + archive SHA-256;
- [ ] selected evidence binary streaming + manifest signature + trusted timestamp + legal-hold policy;
- amendments;
- disputes;
- data export/deletion;
- staff JIT access.

2026-09-28: Phase 4 басталды. Existing immutable schema v1 manifest үшін participant-only canonical JSON export қосылды. Export persisted manifest hash-ін қайта тексереді, mismatch кезінде fail-closed болады және successful export audit event жасайды. Бұл әлі PDF/ZIP, external signature немесе trusted timestamp емес.

Identity foundation minimal L2 claim persistence-ке дейін кеңейді: raw provider reference сақталмайды, hash қана қалады; status VERIFIED/EXPIRED/REVOKED ретінде privacy-safe derive болады; internal record/revoke service future authenticated provider callback-қа дайын. Vetted provider adapter, signed callback және KZ legal/privacy acceptance әлі ашық.

Contract rendering foundation technical deterministic renderer-ге дейін кеңейді: persisted source document hash, canonical render-input hash және actual rendered content hash бөлек беріледі; KZ/RU locale render identity-ге кіреді; Front technical TXT preview/download береді. Бұл approved legal template немесе PDF емес.

Evidence export foundation deterministic ZIP-ке дейін кеңейді: evidence JSON + KZ/RU technical previews және bundle-manifest fixed-order STORE archive-ке жиналады, ZIP bytes жеке SHA-256 алады. Бұл metadata/text v1 ғана; selected evidence binaries, signature/timestamp және legal-hold әлі ашық.

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
