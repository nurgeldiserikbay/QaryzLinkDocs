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
- [x] release config/preflight requires versioned L2 provider contract + callback-auth + privacy/residency + legal-classification references;
- [x] vendor-neutral signed remote L2 session adapter + authenticated correlated VERIFIED callback foundation;
- [x] vendor-neutral signed REVOKED callback + hashed revocation tombstone/out-of-order protection;
- [ ] vetted L2 KYC provider selection + provider-specific API/event mapping + staging/privacy/legal acceptance;
- [x] provider-neutral minimal L2 claim persistence/expiry/revocation core;
- [x] participant-only immutable contract document source;
- [x] deterministic KZ/RU technical preview + source/input/render hash integrity boundary;
- [x] immutable KZ/RU PDF template identity snapshot + signed documentHash binding + signed remote renderer boundary;
- [x] release config/preflight requires versioned PDF template approval + legal sign-off + visual/font policy references;
- [ ] actual approved KZ/RU legal template content + visual/legal acceptance;
- [x] participant verified PDF artifact download foundation;
- [x] technical render hashes + verified KZ/RU PDF artifact hash/source/template/renderer binding into full ZIP v2;
- [x] participant-only audited canonical JSON evidence export baseline;
- [x] deterministic evidence bundle manifest + artifact path/size/hash contract;
- [x] bounded deterministic metadata/text ZIP archive + archive SHA-256;
- [x] provider-neutral Ed25519 seal payload + backend signature verification + default-off capability boundary;
- [x] pinned HTTPS remote Ed25519 signer adapter + ZIP v1/v2 domain-separated seal;
- [x] application signing key trust registry + controlled activation/retirement/revocation;
- [x] release config/preflight requires versioned KMS/HSM deployment + IAM + key ceremony + key lifecycle references;
- [ ] actual KMS/HSM gateway + external IAM/key ceremony/provider lifecycle acceptance;
- [x] application-level contract evidence legal-hold foundation;
- [x] release-preflight/config boundary requires versioned retention + storage lifecycle policy references when evidence storage is enabled;
- [ ] jurisdiction retention periods + external storage lifecycle provider/legal acceptance;
- [x] bounded frozen-manifest evidence binary ZIP v2 + storage byte verification;
- [ ] large archive true streaming/ZIP64 if load requirements demand it;
- [x] external signed time attestation foundation;
- [x] release config/preflight requires versioned timestamp standards + trust + revocation + legal-classification references;
- [ ] RFC3161/qualified TSA + certificate/revocation + jurisdiction legal acceptance;
- [x] default-off contract amendment proposal + dual-party approval + immutable proposed-document hash foundation;
- [x] approved non-financial `OTHER` amendment → ContractVersion N+1 signing/currentVersion activation;
- [x] guarded pre-payment `TERMS_CHANGE` / `SCHEDULE_CHANGE` → normalized N+1 terms + schedule replacement/provenance;
- [x] post-payment immutable accounting snapshot/preview foundation + reconciliation/stateHash/history;
- [x] deterministic post-payment cutover projection + accrued/paid-interest split + opening-balance projection;
- [x] cutover-pinned post-payment N+1 signing + SIGNED_PENDING_ACTIVATION freeze;
- [x] immutable post-payment activation plan + replacement-schedule candidate + unapplied-credit flags;
- [x] default-off zero-ledger-adjustment post-payment activation + immutable historical schedules + evidence schema v8;
- [ ] post-payment activation requiring reclassification/unallocated-credit ledger policy + Kazakhstan legal/staging acceptance;
- disputes;
- [x] default-off audited participant own-data export foundation (account/profile/privacy/contact + role-scoped contract/payment summaries);
- [x] retention-aware account deletion/anonymization foundation;
- [ ] full legal data-subject export scope + Front downloadable UX + Kazakhstan privacy/staging acceptance;
- staff JIT access.

2026-09-28: Phase 4 басталды. Existing immutable schema v1 manifest үшін participant-only canonical JSON export қосылды. Export persisted manifest hash-ін қайта тексереді, mismatch кезінде fail-closed болады және successful export audit event жасайды. Бұл әлі PDF/ZIP, external signature немесе trusted timestamp емес.

Identity foundation minimal L2 claim persistence және signed remote integration foundation-ға дейін кеңейді: start random opaque subjectRef қолданады, signed provider session response pinned Ed25519 identity арқылы verify болады, session correlation raw subject орнына hash сақтайды, authenticated + signed VERIFIED callback one-time completion/replay protection-пен minimal claim-ға atomically map болады. Signed REVOKED callback + hashed tombstone foundation provider-neutral түрде дайын; vetted provider selection, provider-specific API/event mapping, KZ legal/privacy және staging acceptance әлі ашық.

Contract rendering foundation technical deterministic renderer-ге дейін кеңейді: persisted source document hash, canonical render-input hash және actual rendered content hash бөлек беріледі; KZ/RU locale render identity-ге кіреді; Front technical TXT preview/download береді. Бұл approved legal template немесе PDF емес.

Amendment signing foundation `OTHER` және guarded pre-payment financial amendment-ке дейін кеңейді. TERMS_CHANGE/SCHEDULE_CHANGE normalized term/rate snapshot сақтайды; principal/currency өзгермейді. Financial N+1 тек ACTIVE + CONFIRMED funding + zero repayment history + future maturity кезінде signing-ке өтеді. Екінші signature transaction ішінде previous unpaid schedule items CANCELLED болып, sourceContractVersion/sourceAmendmentId-bound жаңа ScheduleVersion жасалады; repayment submission financial SIGNING кезінде blocked. Generic schedule generation original Proposal емес, exact signed Contract.currentVersion termsSnapshot-ты қолданады. Post-payment extension actual activation-ды ашпай, immutable versioned accounting snapshots және deterministic cutover projections қосты. Snapshot one-item schedule state-ті charge→interest→principal бойынша component split-ке реконструкциялайды, confirmed payments = paidMinor + unallocated credit reconciliation fail-closed, same stateHash idempotent, payment/reversal өзгерсе жаңа snapshot version жасалады. Cutover projection latest exact snapshot-ты current DB stateHash/components-пен қайта verify етеді, snapshot capturedAt-ты technical reference ретінде қолданады, ACT/365 бойынша accrued interest пен historical paid-interest айырмасын `interestReclassificationCandidateMinor` ретінде ғана көрсетеді және credit/refund ретінде автоматты қолданбайды. Opening principal мен proposed remaining future interest бөлек projection болады. Cutover-pinned post-payment signing exact latest preview/stateHash-ті N+1 calculationPolicy/documentHash/sourceCutoverPreviewId арқылы bind етеді. Екі signature аяқталғанда amendment SIGNED_PENDING_ACTIVATION болады; currentVersion/schedule/ledger untouched және payment evidence/decision/reversal frozen. Signed pending state үстіне immutable activation-plan foundation қосылды: exact signed N+1 documentHash + cutover previewHash + accounting stateHash қайта verify/bind болады; replacement schedule opening principal + outstanding accrued interest + projected future interest + charge бойынша reconcile жасалады. Interest reclassification candidate және unallocated credit әдейі unapplied қалады, requiresLedgerAdjustment flag арқылы explicit policy requirement көрсетіледі. Zero-adjustment plan үшін default-off safe activation foundation қосылды: exact latest plan толық field-by-field reverify болады, historical schedules/allocations/ledger untouched, жаңа schedule sourceActivationPlanId арқылы plan-ға байланады, base SUPERSEDED/currentVersion N+1/amendment ACTIVATED болады және ledger adjustment жазылмайды. Overdue/reminder/payment flows latest schedule boundary-ын сақтайды; superseded schedule allocation reversal blocked. Evidence schema v8; persisted v1-v7 packages rewrite болмайды. Reclassification/unallocated-credit ledger policy және legal/staging acceptance әлі pending.

Own-data export foundation authenticated participant-ке default-off deterministic JSON береді: own contact values PII protection layer арқылы ашылады, contract/payment summaries role-only, counterparty IDs/PII және password/session/token/ciphertext/objectKey payload-қа кірмейді. Successful export hash/count metadata-мен audit болады. Deletion request sessions-ды immediately revoke ететіндіктен current ordering export-before-deletion ретінде құжатталды. Full statutory scope, downloadable Front UX және Kazakhstan privacy/staging acceptance әлі pending.

Evidence export foundation deterministic ZIP-ке дейін кеңейді: evidence JSON + KZ/RU technical previews және bundle-manifest fixed-order STORE archive-ке жиналады, ZIP bytes жеке SHA-256 алады. Provider-neutral Ed25519 seal foundation archive/evidence/bundle hashes-ты domain-separated canonical payload-қа байлайды және provider signature-ны Backend қайта verify етеді. Production signer intentionally unavailable/default-off. Contract-level legal-hold foundation application cleanup-ты active hold кезінде тоқтатады және scoped support/audit boundary береді. Bounded full binary ZIP v2 frozen manifest evidence-ті consumed intent + CLEAN malware verdict + exact storage size/mediaType/SHA-256 арқылы қайта тексеріп direct ZIP body береді. Pinned HTTPS remote Ed25519 signer adapter ZIP v1/v2 үшін қосылды: redirect/timeout/response-size bounds, expected key ID/SPKI fingerprint pinning және Backend local signature verification бар. Application-side signing key trust registry бір ACTIVE key invariant, controlled rotation/revocation, historical lifecycle lookup және release-preflight maintenance guard береді. External signed time attestation foundation provider-neutral remote Ed25519 authority adapter-мен қосылды: nonce, subject-hash binding, pinned authority identity/key, bounded clock-skew және Backend local verification бар. Бұл RFC3161/qualified legal timestamp емес. Нақты KMS/HSM gateway/external IAM/key ceremony acceptance, RFC3161/qualified TSA legal acceptance, jurisdiction retention periods, external storage lifecycle acceptance және production load acceptance әлі ашық.

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
