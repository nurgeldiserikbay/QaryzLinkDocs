# Phase 2 critical E2E acceptance

Бұл құжат Private Debt MVP үшін critical backend journey және tenant-isolation acceptance boundary-ін бекітеді.

2026-09-27 күйі: automated PostgreSQL harness кодқа қосылған, бірақ GitHub Actions quota/billing gate салдарынан оның жаңа run-ы runner step-теріне жетпеді. Сондықтан бұл құжат **implemented test contract** болып саналады; successful execution evidence әлі pending.

## Critical lifecycle

Real PostgreSQL integration harness мына тізбекті бір scenario ішінде орындайды:

~~~mermaid
flowchart LR
    R["Private request"] --> I["Exact lender invite"]
    I --> P["Lender proposal"]
    P --> A["Borrower accepts"]
    A --> C["Contract draft"]
    C --> S["Dual signature"]
    S --> F["Funding evidence"]
    F --> FC["Borrower confirms funding"]
    FC --> RS["Generate schedule"]
    RS --> PE["Borrower repayment evidence"]
    PE --> PC["Lender confirms payment"]
    PC --> L["Ledger + allocation"]
    L --> CR["Dual closure confirmation"]
    CR --> CC["ClosureCertificate"]
    CC --> EP["Immutable EvidencePackage"]
~~~

## Test environment boundary

Harness production object storage-ды enable етпейді.

Evidence flow үшін:

- real scoped `EvidenceUploadIntent` rows жасалады;
- intent contract/user/purpose/object metadata бойынша real repository consumer арқылы атомарлы consume болады;
- object-storage verifier ғана test-only no-op adapter-мен ауыстырылады.

Осылайша business transaction, evidence intent replay boundary және relational integrity нақты PostgreSQL арқылы өтеді, бірақ external storage/scanner staging acceptance-і жалған түрде green деп саналмайды.

## Lifecycle assertions

Scenario мыналарды тексереді:

- accepted proposal-дан immutable Contract draft жасалады;
- borrower және lender бірдей document hash-ті растайды;
- екі signature-дан кейін Contract SIGNED және Funding жасалады;
- lender funding evidence тіркейді;
- borrower funding-ті CONFIRM етеді;
- Contract ACTIVE болады;
- deterministic schedule жасалады;
- repayment дәл total due сомасына тең;
- lender repayment-ті CONFIRM етеді;
- payment `CONFIRMED`, `unallocatedMinor = 0`;
- schedule item `PAID`;
- append-only ledger sequence `1, 2`;
- closure final statement borrower/lender тарапынан бірдей hash-пен расталады;
- Contract `COMPLETED`;
- ClosureCertificate бар;
- EvidencePackage бір рет жасалады;
- repeated package create existing package-ті қайтарады;
- manifest hash 64-char SHA-256 format-ында.

## Tenant isolation assertions

Үшінші verified user нақты contract ID-ды білсе де:

| Resource | Expected result |
|---|---|
| Contract detail | `CONTRACT_NOT_FOUND` |
| Funding detail | `FUNDING_NOT_FOUND` |
| Schedule detail | `SCHEDULE_NOT_FOUND` |
| Payment list | empty list, unknown contract-пен бірдей shape |
| Closure | `CLOSURE_NOT_FOUND` |
| Evidence summary | `EVIDENCE_PACKAGE_NOT_FOUND` |
| Evidence package read/create | `EVIDENCE_PACKAGE_NOT_FOUND` |

Мақсат — resource existence-ті outsider-ға role-specific detail арқылы ашпау.

## Evidence privacy assertions

Participant-facing lifecycle response және immutable manifest:

- funding/payment evidence SHA-256 hash-тарын сақтай алады;
- evidence storage `objectKey` мәндерін шығармайды;
- borrower/lender user ID-лерін manifest-ке қоспайды;
- raw evidence bytes, email/phone немесе dispute description қоспайды.

## Notification isolation

Test lifecycle нәтижесінде durable outbox-та:

- `PAYMENT_CONFIRMED`;
- `CONTRACT_CLOSURE_READY`;
- `CONTRACT_COMPLETED`

event-тері contract тараптарына ғана түсуі тексеріледі.

Payload-та `email`, `phone`, `objectKey`, `description` тәрізді sensitive field атаулары болмауы тиіс.

## Compiled HTTP smoke

CI compiled application smoke unauthenticated caller үшін мына participant endpoints 401 қайтаруын тексереді:

- closure;
- evidence summary;
- evidence package;
- funding;
- schedule;
- payments.

Бұл PostgreSQL business integration test-ті алмастырмайды; ол transport-level authentication boundary-ді толықтырады.

## Cleanup isolation

Integration fixture тек өзі жасаған party ID-лерге қатысты downstream contract rows-ты өшіреді.

Жалпы display name немесе global synthetic selector қолданылмайды. Бұл parallel PostgreSQL tests бір-бірінің fixture деректерін жоймауы үшін қажет.

## Authenticated staging browser smoke

QaryzLinkFront-та manual-only Playwright staging harness бар.

Workflow:

`.github/workflows/staging-browser-e2e.yml`

Ол mock API емес, нақты deployed Front URL-ға жүреді және verified participant credentials қолданады.

Required repository configuration:

- variable `E2E_STAGING_BASE_URL`;
- secret `E2E_STAGING_EMAIL`;
- secret `E2E_STAGING_PASSWORD`.

Current smoke:

- real login form → authenticated dashboard;
- verified participant private dashboard/session boundary;
- Settings authenticated access;
- RU locale persistence;
- 390px mobile viewport horizontal-overflow guard.

Credentials source code-қа жазылмайды және test output-қа әдейі шығарылмайды.

Бұл harness full borrower↔lender debt lifecycle-ты алмастырмайды. Ол real deployed auth/session/browser path үшін first acceptance gate. Full two-party lifecycle бөлек scenario ретінде әлі pending.

QaryzLinkFront PR #66 merged at `564a2ad`. CI run `36701747708` quality job-ты runner step-теріне жеткізбеді: `runner_id=0`, `steps=[]`; сондықтан staging smoke әлі actual successful execution evidence емес.

## Exit criteria interpretation

Phase 2 үшін:

- **harness implemented** — yes;
- **critical lifecycle successful run on current code** — pending Actions runner;
- **cross-user backend isolation successful run** — pending Actions runner;
- **authenticated staging browser smoke harness** — implemented, execution pending;
- **full KZ/RU borrower↔lender browser journey** — pending;
- **staging object storage/scanner acceptance** — pending.

Сондықтан Phase 2 әлі formal түрде `critical E2E flows green` exit criterion-ін жапқан жоқ.

## Required acceptance evidence

Quota/billing gate шешілгеннен кейін кемінде:

1. QaryzLinkBack PR/main commit үшін full quality workflow green;
2. Prisma migrations green;
3. strict typecheck/lint green;
4. PostgreSQL integration suite green, соның ішінде Phase 2 critical spec;
5. production build green;
6. compiled HTTP smoke green;
7. нәтижедегі commit SHA мен workflow run implementation status-қа жазылады.

Одан кейін ғана backend critical journey green деп белгіленеді.
