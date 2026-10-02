# Implementation status

Жаңартылған күні: 2026-10-01

Бұл құжат specification мен нақты код арасындағы қысқа бақылау нүктесі. Толық талаптар өзгермейді; мұнда тек орындалу күйі көрсетіледі.

## Жалпы күй

| Бағыт | Күйі | Нәтиже |
|---|---|---|
| Product және business specification | Дайын | MVP шекарасы, state machine, privacy және calculation rules бекітілді |
| Backend foundation | Дайын | NestJS/Fastify modular monolith, Prisma/PostgreSQL, Docker, CI |
| IAM | Базалық нұсқа + staging email-verification tooling дайын | Register, login, refresh token rotation, current-session logout, email verification; Back #245 controlled mailbox-пен request/confirm/replay acceptance flow-ын privacy-safe түрде тексереді |
| Profile, privacy және deletion request | Базалық нұсқа дайын | Өз профилін/ privacy баптауларын басқару және retention-aware account deletion request жіберу |
| Database migration | Дайын | Бастапқы schema versioned SQL migration ретінде бекітілді |
| Discovery | Private slice дайын + Phase 3 dark workspace | Private request/invite/proposal/acceptance + immutable borrower counter negotiation; default-off public offer lifecycle/version history + compatibility explanation + application → concrete Proposal + bounded reporting + support-gated human review |
| Contract draft/signing | Дайын | Accepted proposal-дан immutable ContractVersion v1, privacy-safe read, dual hash acknowledgement |
| Funding evidence/confirmation | Backend + storage adapter baseline дайын, operational rollout толық емес | Single-use intent, S3-compatible signed PUT/GET, HEAD verification, trusted malware verdict registry, quarantine/orphan cleanup және aggregate metrics бар; external scanner, staging acceptance және retention policy қалды |
| Schedule generation | Дайын | ACTIVE + CONFIRMED guard, ACT/365 Fixed + HALF_UP, versioned inputHash |
| Payment evidence/confirmation/ledger | Backend + Front participant flow дайын, operational rollout толық емес | Borrower evidence, bounded partial/full repayment amount, lender decision, allocation/ledger, PARTIALLY_PAID→PAID transition, size-bound replay protection және verified CLEAN-object gate бар |
| Overdue status worker | Дайын | UTC due/overdue materialization, ACTIVE + CONFIRMED guard, idempotent transaction |
| Repayment reminders | Дайын | Latest schedule due/overdue borrower reminders, per-event/channel idempotency, IN_APP + email preference boundary |
| Payment reversal | Backend + Front correction path дайын | Lender-authorized immutable reversal, ACTIVE-only closure guard, signed allocation restore, opposite ledger entries, mandatory correction reason және KZ/RU participant UI бар |
| Contract closure | Дайын | Zero-balance readiness, dual final-statement confirmation, stale-hash guard, immutable closure certificate және lifecycle notifications |
| Evidence summary / manifest | Phase 4 technical export baseline кеңейді | Immutable JSON + deterministic ZIP v1/v2, bounded binary archive, detached seal v1/v2 және participant-only court-export readiness/seal guard бар; approved legal PDF, actual KMS/HSM, trusted TSA және retention/storage staging acceptance әлі pending |
| Phase 2 critical E2E | Current-main CI green | Real PostgreSQL lifecycle/evidence privacy/cross-user isolation/notification isolation + funding/payment dispute invariants dedicated `test:phase2-critical` gate арқылы current Backend main commit-те successful; metadata-only acceptance artifact retained |
| KZ/RU user journey | KK + RU full two-party staging harness дайын, execution pending | Бір reusable request→invite→proposal→contract→dual signing→funding→schedule→partial repayment→remaining repayment→dual closure→evidence manifest flow KK және RU үшін бөлек serialized staging test ретінде бар. Actual successful staging run әлі орындалмады |
| Notifications/outbox | Базалық slice дайын | Payment/dispute/repayment және closure lifecycle оқиғалары, privacy-safe payload және idempotent outbox |
| Notification claim/retry worker | Базалық slice дайын | SKIP LOCKED claim, 5 минут lease, exponential retry және terminal FAILED |
| Delivery adapter boundary | Базалық slice дайын | Provider-neutral port, dispatch service және safe unavailable default |
| Notification recipient resolution | Базалық slice дайын | Party ID → in-app ID or active verified email, no PII in outbox |
| Notification scheduler/orchestrator | Базалық slice дайын | One-shot claim → sequential dispatch → result counters |
| Notification runtime configuration | Базалық slice дайын | Validated NOTIFICATION_BATCH_SIZE, DI options, deployment guide |
| Notification SMTP adapter | Базалық slice + mailbox acceptance tooling дайын | MAIL_ENABLED gate, generic PII-safe templates, fail-closed router; Back #245 нақты controlled staging mailbox delivery/verification evidence үшін provider-neutral two-phase harness береді |
| Notification scheduler command | Базалық slice дайын | `pnpm notifications:run`, validated AppModule context, aggregate counters және non-zero failure exit |
| Notification email preference | Базалық slice дайын | PrivacySettings opt-out, profile API және enqueue-time EMAIL filtering |
| Notification delivery metrics | Persistent aggregate slice дайын | PostgreSQL singleton counters, cross-process scheduler/API snapshot және staging/production token guard |
| Notification Kubernetes scheduler | Canonical template + live-cluster/alert-source tooling дайын | Backend `ops/kubernetes/notification-scheduler-cronjob.yaml` immutable digest render-ге кіреді; Forbid overlap, start/active deadlines, external ConfigMap/Secret және hardened pod contract бар. Back #241 read-only staging harness 4 CronJob rollout/runtime policy және optional observed success-ты тексереді; Back #244 synthetic failed Job Kubernetes alert source-ты Secret/ConfigMap/service-account credential-сіз шығарады |
| Deployment hardening | Template/CI + rehearsal + live-cluster acceptance tooling дайын | Immutable digest rendering, bounded migration job, privacy-safe release preflight, safe rollout, PDB/node spread, previous-app-on-release-schema rollback compatibility rehearsal және synthetic no-PII backup/restore rehearsal бар. Back #242 live Deployment digest/probe/replica/rollout policy-ін read-only тексереді; нақты staging/provider execution әлі pending |
| Provider/scheduler | Acceptance contract/template дайын, provider pending | Push adapter/queue trigger және нақты external metrics collector әлі pending; monitoring signal contract пен versioned provider acceptance record threshold/routing/privacy/staging evidence талаптарын бекітеді |
| Front/Admin UI | Front critical MVP interaction coverage кеңейді | Front-та auth/discovery/contract signing/funding/schedule/repayment/closure/evidence/dispute/notifications/settings/security/account lifecycle mutation/read flows және privacy-safe L2 identity status KZ/RU coverage бар; Admin aggregate operations cards бар; raw identity-level feeds өшірулі |

## 2026-10-01 completion snapshot

Repository checklist interpretation:

- Delivery Roadmap implementation checklist: **37/45 = 82.2%** complete.
- Release checklist: **146/188 = 77.7%** checked.
- Staging acceptance: **1/246 = 0.4%** checked; бұл кодтың 0.4% ғана дайын дегенді білдірмейді — checklist нақты staging/provider/legal execution evidence-ін әдейі алдын ала green қылмайды.

Back #241 live background-job rollout acceptance tooling қосты: staging namespace-та notification scheduler, account deletion, evidence cleanup және auth retention CronJob-тарының exact immutable release digest, enabled schedule, `concurrencyPolicy: Forbid`, runtime command/deadline/backoff policy және optional `lastSuccessfulTime` state-ін read-only тексереді. PR CI толық green, merge commit `517ca50` current-main CI `36865554878` және Supply Chain Security `36865554752` арқылы successful. Actual staging run және failed-Job paging бөлек acceptance болып қалады.

Back #242 live API orchestrator acceptance tooling қосты: `qaryzlink-back` Deployment exact immutable digest, controller observed generation, all desired updated/available replicas, `maxUnavailable=0`/`maxSurge=1`, exact `/api/v1/health/ready` readinessProbe және bounded `kubectl rollout status` contract-ын тексереді. Merge commit `4bb4f4d` current-main CI `36866462060` және Supply Chain Security `36866461923` арқылы successful; actual staging run бөлек evidence талап етеді.

Back #243 staging metrics ingress isolation tooling қосты: separate public/internal exact HTTPS origin талап етеді, public ingress-та `/api/v1/metrics/*` application-ға жетпей 403/404 болуы тиіс, internal origin token-protected 200 + `Cache-Control: no-store` береді. Existing runtime smoke барлық 10 aggregate metrics endpoint-ке дейін кеңейді және metrics ingress scenario release-bound `Staging Core Acceptance` workflow-қа төртінші gate ретінде кірді. Merge commit `4fc48b6` current-main CI `36887226608` және Supply Chain Security `36887226599` арқылы successful. Actual staging firewall/ingress review әлі open acceptance болып қалады.

Back #244 bounded synthetic failed-Job alert-source probe қосты: operator explicit acknowledgement береді, probe live `qaryzlink-back` immutable image digest-ке bind болады, application Secret/ConfigMap немесе service-account token алмайды, `backoffLimit=0`, 60s active deadline, bounded TTL және deterministic `exit 42` арқылы Kubernetes `Failed=True` source signal-ын тексереді. Merge commit `24fa552` current-main CI `36891674238` және Supply Chain Security `36891674422` арқылы successful. External provider alert delivery/paging бұл probe pass болғанмен автоматты green болмайды; нақты staging destination evidence бөлек қажет.

Back #245 SMTP/email-verification staging acceptance tooling қосты: request phase dedicated unverified staging account-пен `verified=false` тексереді және verification email request үшін HTTP 204 талап етеді; operator controlled mailbox delivery-ді тексереді; confirm phase mailbox-тен алынған exact 43-character token-ды қабылдатып `verified=true` және consumed-token replay HTTP 400 болуын талап етеді. Session cleanup және temp secret files privacy-safe, retained output email/password/token/base URL/response body шығармайды. Merge commit `5250108` current-main CI `36893771287` және Supply Chain Security `36893771226` арқылы successful. SPF/DKIM/DMARC, production sender ownership және нақты provider SLA әлі external acceptance.

Back #246 password-reset SMTP/mailbox staging tooling қосты: request phase dedicated account current password-ын дәлелдеп reset request үшін HTTP 202 + accepted=true талап етеді; confirm phase controlled mailbox token-мен reset жасап pre-reset session revoke, old password reject, temporary new password accept, consumed-token replay reject және original staging password restoration-ды тексереді. Temporary password restore-дан кейін жарамсыз болуы және final session revoke та тексеріледі. Бірінші CI run-да static secret-leak grep false-positive болды; guard variable-output pattern-ге тарылтылып қайта тексерілді. Merge commit `ac2f666` current-main CI `36964643329` және Supply Chain Security `36964643425` арқылы successful. Actual mailbox/browser execution, SPF/DKIM/DMARC және provider SLA бөлек acceptance болып қалады.

Back #247 PII encrypted-mode staging gate қосты: internal aggregate metrics арқылы migration `mode=encrypted` + backlog 0/0, key-rotation enabled + old-key backlog 0/0, plaintext-retirement missing encrypted copies 0/0 + `readyToScrub=true`, exact privacy-safe response shape және `Cache-Control: no-store` талап етіледі. Harness staging encrypted mode-та dedicated account email lookup/login/session smoke-ты да орындайды және unified release-bound `Staging Core Acceptance` workflow-қа жеке scenario ретінде қосылған. Merge commit `0fbe56e` current-main CI `36971188826` және Supply Chain Security `36971188783` арқылы successful. Бұл tooling destructive plaintext scrub/drop-қа approval бермейді; actual encrypted-mode staging execution әлі open.

Back #248 private evidence storage/scanner provider acceptance tooling қосты: dedicated verified staging participant upload intent алады, signed PUT authorization exact SHA-256/media type/size metadata-мен bind екенін тексереді, real private object upload жасайды және callback token-ды өзі қолданбай external scanner/event/callback path aggregate CLEAN немесе INFECTED verdict counter-ын өсіргенін күтеді. INFECTED acceptance standardized non-malicious EICAR test signature үшін explicit acknowledgement талап етеді. Probe contract evidence-ті commit етпейді, сондықтан contract state өзгермейді; expired unconsumed intent normal cleanup-қа қалады. Merge commit `ec8478f` current-main CI `36972686187` (47/47 steps) және Supply Chain Security `36972686129` арқылы successful. Actual bucket IAM/lifecycle, persisted download, infected-object physical deletion latency және full browser evidence journey әлі open.

Back #249 isolated backup/restore rehearsal-ды encrypted PII-мен күшейтті: әр run сайын synthetic encryption/lookup key және password жасалады; fixture plaintext email сақтамайды, тек AES-256-GCM ciphertext + blind index + valid scrypt hash сақтайды. pg_dump/restore кейін current app `PII_CONTACT_STORAGE_MODE=encrypted` күйінде blind-index email login және `/profile/me` ciphertext decrypt flow-ын тексереді. Merge commit `3c131e8` current-main CI `36978034232` және Supply Chain Security `36978034274` арқылы successful. Retained artifact email/password/key/ciphertext/backup bytes сақтамайды. Бұл real provider backup/PITR немесе RTO/RPO acceptance емес; олар әлі open.

Back #250 migration rollback rehearsal-ды encrypted PII contract-пен күшейтеді: release migrations isolated PostgreSQL-ға қолданылады, release helper synthetic encrypted contact row жасайды, previous known-good app сол release schema-да `PII_CONTACT_STORAGE_MODE=encrypted` күйінде іске қосылып blind-index email login және `/profile/me` decrypt smoke-ты өтуі тиіс. Merge commit `2d12f42` current-main CI `36978871638` және Supply Chain Security `36978871626` арқылы successful. Reverse database migration әлі әдейі орындалмайды. Бұл tooling actual staging migration Job/rollback execution evidence-ін алмастырмайды.

Back #251 full evidence ZIP v2 staging/load tooling қосты: synthetic ZIP builder орнына actual participant-only `archive-with-binaries` endpoint concurrent шақырылады, сондықтан persisted evidence loader real consumed-intent + trusted CLEAN scanner boundary арқылы өтеді. Harness ZIP content type, size, entry count, deterministic SHA-256, latency және client RSS budgets-ті тексереді; Kubernetes wrapper live `qaryzlink-back` Deployment-ті exact immutable digest-ке bind етіп API container memory telemetry-ін load кезінде sampling жасайды. Merge commit `4b8d132` current-main CI `36980398040` және Supply Chain Security `36980397919` арқылы successful. Actual near-limit real staging profile орындалмайынша production load acceptance open қалады.

Back #252 real binary ZIP staging load-ты release-bound manual GitHub workflow-пен operationalized етті: exact deployed commit, immutable image digest және explicit non-production acknowledgement талап етіледі; staging URL repository variable-дан, dedicated participant/password/disposable contract ID secrets-тен алынады. 14-day artifact тек release binding, configured budgets және aggregate harness result сақтайды; URL/email/password/token/contract ID/response body/PII сақталмайды. Merge commit `20cd9cc` current-main CI `36994309587` және Supply Chain Security `36994309564` арқылы successful. Kubernetes server-memory wrapper evidence әлі operator cluster boundary-де бөлек орындалады.

Back #253 real staging migration Job acceptance tooling қосты: explicit `STAGING_MIGRATION_JOB_ACK=true`, live `qaryzlink-back` Deployment exact immutable digest binding, unique one-shot `prisma migrate deploy`, canonical ConfigMap/Secret references, disabled service-account token, `backoffLimit=0`, bounded deadline/TTL және exactly one successful pod/exit code 0 талап етіледі. Harness migration logs, namespace, pod name, image digest, DB identifiers немесе Secret values шығармайды. Merge commit `cd084ec` current-main CI `36994894484` және Supply Chain Security `36994894573` арқылы successful. Actual environment run бөлек open және same-release Migration Rollback Rehearsal evidence-пен жұпталуы тиіс.

Back #255 staging log privacy collection harness қосты: explicit acknowledgement және exact live release digest binding-пен барлық current `app=qaryzlink-back` pod/all-container logs bounded `--since` window үшін temp-only directory-ға жиналады; partial/unreadable pod coverage fail-closed. Existing privacy scanner matched content-ті шығармай category/count/line-number metadata ғана береді, raw logs exit кезінде жойылады және retained artifact-қа кірмейді. Actual staging scan pass бөлек open.

Monitoring externalization үшін `MONITORING_PROVIDER_ACCEPTANCE.md` versioned template қосылды. Ол collector/network boundary, required alert classes, threshold ownership, privacy-safe alert payload, on-call routing/escalation және real staging test alert evidence-ін нақты provider таңдалмай тұрып құрылымдайды; template өзі approval емес.

Roadmap-та қалған 8 тармақтың басым бөлігі external/legal acceptance: vetted KYC provider, approved legal templates, actual KMS/HSM, retention/lifecycle policy acceptance, RFC3161/qualified TSA, post-payment ledger application legal/accounting policy және full statutory data-export scope. Purely technical conditional item — large archive streaming/ZIP64, ол load evidence талап етсе ғана міндетті.

QaryzLinkFront authenticated staging browser smoke harness PR #66 арқылы `564a2ad` commit-ке merge болды. Real login/dashboard/settings + RU mobile overflow smoke дайын, бірақ Actions runner/quota мәселесі себебінен actual staging execution pending.

Private Debt MVP browser gap жабылды. Backend contract response participant identity-ді ашпай `viewerRole=BORROWER|LENDER` қайтарады (Back #213, `3c643db`). Front #67 (`ca09808`) exact immutable documentHash signing, lender funding evidence signed upload және borrower funding decision UI қосты. Front #68 (`070a1f7`) schedule generation, borrower full-current-outstanding repayment evidence және lender payment decision UI қосты. Front #69 (`f4890e2`) екі isolated browser context-пен request-тен immutable evidence manifest-ке дейін real-staging lifecycle harness қосты.

Front CI runs `36710630674`, `36711186784`, `36711825055` quality job-тары `runner_id=0`, `steps=[]`/null күйінде тоқтады; application typecheck/lint/test/build орындалмаған. Front #70 (`69da13b`) full lifecycle-ды KK және RU-ға parameterize етті; CI `36712583763` та `steps=null` күйінде runner алмады. Front #71 (`6c6c1cd`) authenticated traces-ты өшіріп, metadata-only per-scenario acceptance artifact қосты; CI `36713175109` та runner step алмады. Сондықтан core browser flow implementation complete болғанымен formal Phase 2 green status нақты successful runner + staging execution шыққанша берілмейді.

Deployment recovery automation да кеңейді. Back #215 (`1f82f74`) manual migration/rollback compatibility rehearsal қосты: selected release migrations isolated PostgreSQL-ға forward apply болады, previous known-good ref сол migrated schema үстінде build/start/readiness smoke өтеді; reverse migration жоқ. Back #216 (`0a6969c`) synthetic no-PII source DB → custom-format pg_dump → separate restore DB → exact bounded counters → current app readiness rehearsal қосты; dump bytes artifact retention алдында жойылады. CI runs `36719762124` және `36720220403` та `steps=null` болып runner алмады. Сондықтан automation implemented, real environment evidence pending.

Release preflight staging execution contract та release bundle-ға қосылды. Back #227 (`c26a3ac`) `qaryzlink-release-preflight` Kubernetes Job manifest-ін қосты: API/migration-мен exact same immutable image digest, same ConfigMap/Secret, `backoffLimit=0`, 300s deadline, 24h TTL, no service-account token, read-only root filesystem. Existing release renderer оны автоматты түрде render етеді, CI manifest invariants тексереді. Actual staging Job execution және `manual` checks owner evidence әлі release acceptance ретінде ашық.

Staging log privacy acceptance tooling қосылды. Back #228 (`4ff3ac1`) line-streaming scanner арқылы auth/session secrets, password, email, signed URL credential, evidence object key/URL, SMTP response field, raw document/evidence content және private-key markers-ді fail-closed анықтайды. Output matched content-ті қайтармайды: category/count/line number metadata ғана. Unit tests және CI smoke secret value output-қа шықпайтынын тексереді. Actual staging API/worker/CronJob logs scan + manual review әлі acceptance ретінде ашық.

Staging auth/session acceptance harness қосылды. Back #230 (`e07a287`) dedicated verified account-пен login → privacy-safe session inventory → refresh rotation → old refresh replay 401 → rotated access check → logout → access/refresh revoke жолын manual workflow арқылы тексереді. Credential/token/response temp files mode-700 directory ішінде ғана болып, run соңында жойылады; retained artifact URL/email/password/token/body сақтамайды. Network-free fake-curl regression test replay қабылданса fail етеді. Register/email verification осы harness-тан бөлек SMTP inbox acceptance ретінде ашық.

Repayment UX partial-payment capability-ге дейін кеңейді. Front #72 (`e39b936`) KZT input-ты floating-point қолданбай minor units-ке parse етеді, `0 < amount <= current outstanding` шегін evidence upload басталмай тұрып тексереді және full outstanding-ты default ретінде қояды. Front #73 (`abc6cb7`) KK/RU staging lifecycle-да 1 ₸ partial repayment → lender confirm → exact remaining balance → final repayment → closure жолын тексереді. CI runs `36721129983` және `36721497464` та `steps=null` болып runner алмады; implementation merged, execution evidence pending.

Evidence ZIP production-load decision үшін synthetic bounded acceptance harness қосылды. Back #218 (`7584474`) deterministic ZIP_STORE_V2 үшін configurable payload/object/iteration profile, max RSS және max single-build latency budget өлшейді; нәтиже archive hash + aggregate measurement қана сақтайды. Manual workflow synthetic metadata-only artifact-ті 14 күн сақтайды және budget бұзылса `STREAMING_OR_ZIP64_REVIEW_REQUIRED` береді. CI run `36729385648` quality job `steps=null` күйінде runner алмады. Сондықтан harness implemented, actual load acceptance және streaming/ZIP64 decision pending.

Payment correction/dispute path hardened. Back #217 (`ccdaeca`) payment reversal-ды тек `ACTIVE` contract-та рұқсат етеді, сондықтан `COMPLETED` contract-тың ClosureCertificate/schedule/ledger күйі кейіннен divergence жасамайды. Front #74 (`d695e98`) lender-only confirmed-payment reversal UI және mandatory 3–1000 character correction reason қосты; нақты bank refund автоматты емес екені explicit көрсетіледі. Front #75 (`e4e93d4`) KK/RU staging lifecycle ішінде partial confirm → reversal → exact outstanding restore → қайта partial/final repayment → closure және completed contract-та reversal control жоқ екенін тексереді. Front #76 (`eee7b28`) Funding және Payment DISPUTE action-дарын Backend policy-ге сәйкестендіріп, mandatory reason жіберетін етті. Related CI runs `36722287955`, `36722949425`, `36723254464`, `36723656898` runner step алмады (`steps=null`), сондықтан execution evidence pending.

Admin browser acceptance privacy evidence Front-пен бірдей policy-ге келтірілді. Admin #33 (`22aea52`) Playwright trace retention-ды өшіріп, scenario title/status + repository/commit/run metadata ғана жазатын custom reporter қосты. Кейін review кезінде workflow reporter файлын upload етпейтіні табылды: Admin #38 (`ab4377f`) `admin-browser-scenarios.json` artifact-ін 14 күнге нақты retain ететін gate қосты; current-main CI `36850183051` successful. Credentials, token, response body, row identifiers немесе PII artifact-қа кірмейді. Actual Admin browser execution әлі pending.

Backend Phase 2 formal acceptance evidence gate бұрыннан implementation-да бар және енді status-та да бекітілді. Back #214 (`d520de0`) migrations-тан кейін focused real-PostgreSQL `test:phase2-critical` орындайды, private-debt lifecycle/evidence privacy/cross-user isolation/notification isolation coverage-ті CI gate етеді және 14 күнге metadata-only acceptance artifact сақтайды. CI run `36713566757` runner алмады (`steps=null`), сондықтан implementation ready, successful current-main execution pending.

Dispute browser acceptance coverage қосылды. Front #77 (`83416c2`) existing two-user staging harness үстіне екі serialized scenario қосты: KK funding dispute borrower mandatory reason-пен `DISPUTED` күйіне өтіп contract activation/schedule action-дарын блоктайды; RU repayment dispute lender mandatory reason-пен payment-ті `DISPUTED` күйінде қалдырады, allocation жасамайды және further repayment/closure-ды блоктайды. Workflow metadata scenario suite осы екі case-пен кеңейді; trace әлі off және artifact metadata-only. CI run `36734508787` quality job `steps=null` күйінде runner алмады, сондықтан successful staging execution pending.

Backend Phase 2 PostgreSQL gate dispute invariants-пен кеңейді. Back #219 (`34012f6`) reusable signed-contract/evidence-intent fixture қосып, funding dispute кезінде contract `DISPUTED`, scheduleCount=0 және ledgerCount=0 болуын; payment dispute кезінде allocations=[], ledgerCount=0, schedule paidMinor өзгермеуін және closure ready=false болуын нақты PostgreSQL үстінде тексереді. `test:phase2-critical` енді lifecycle және dispute integration specs-ті бірге орындайды; acceptance artifact coverage metadata-ға funding-dispute/payment-dispute қосылды. CI run `36735316221` quality job `steps=null` күйінде runner алмады, сондықтан successful current-main execution pending.

Notification scheduler deployment drift жабылды. Back #220 (`196e55a`) canonical `ops/kubernetes/notification-scheduler-cronjob.yaml` manifest-ін release bundle-ға қосты: 5-minute engineering cadence, `concurrencyPolicy: Forbid`, bounded starting/active deadlines, `backoffLimit: 0`, no service-account token, read-only root filesystem және exact immutable release digest placeholder. Backend CI manifest invariants бұл contract-ты тексереді, ал `ops/render-release.sh` жаңа manifest-ті автоматты түрде release output-қа енгізеді. Docs reference copy canonical Backend manifest-пен синхрондалды. CI run `36736516498` runner алмады (`steps=null`); actual staging rollout/failed-Job alerting әлі pending.

Real staging runtime smoke foundation қосылды. Back #221 (`f730f5c`) manual `Staging Runtime Smoke` workflow және `ops/staging-runtime-smoke.sh` қосты. Harness HTTPS liveness/readiness/database-ready, unauthenticated private discovery 401 boundary және 8 aggregate metrics endpoint үшін missing-token 401, wrong-token 401, valid-token 200 + `Cache-Control: no-store` contract-ын тексереді. Retained artifact URL/token/response body/PII сақтамайды; тек run metadata және aggregate pass/fail бар. Main CI real staging-ке бармайды, тек shell/static validation жасайды. Бұл implementation actual staging readiness/metrics acceptance-ті автоматты green қылмайды.

Runtime-smoke integration hardening аяқталды. Back #222 (`5c2a702`) fake-`curl` арқылы network-free success/fail-closed regression tests қосты. Review барысында екі integration defect табылып түзетілді: Back #223 (`817fdf1`) malformed CI YAML validation block-ын қалпына келтірді, Back #224 (`5812cdb`) test fixture ішіндегі shell `${...}` expansions-ты TypeScript template literal үшін дұрыс escape етті. Back #225 (`c8cf263`) smoke gate-ті security headers + exact approved Front CORS + unapproved-origin deny checks-пен кеңейтті; `STAGING_ALLOWED_FRONT_ORIGIN` exact HTTPS origin болуы тиіс. Acceptance artifact Front origin-ді де сақтамайды. Actual ingress/proxy/runtime execution әлі staging evidence талап етеді.

CI workflow integrity қайта harden етілді. Back #233 (`fe0c85a`) `ci.yml` соңына accidental қосылып қалған malformed one-space staging-smoke fragment пен duplicated Kubernetes/render/application blocks-ты алып тастады. GitHub PR check қайтадан `quality` check-run жасай алды, яғни workflow parse restored; runner/quota blocker салдарынан job steps әлі орындалмады. Сол PR API deployment readinessProbe-ты `/api/v1/health/ready` path-іне source manifest және rendered release bundle CI invariants арқылы pin етті. Нақты staging orchestrator probe execution әлі бөлек acceptance item.

Production pilot scope fail-closed governance қосылды. Back #226 (`12ab1b1`) deployment profile-ды `kz-personal-private-debt-v1` enum-ына pin етеді; басқа profile environment validation-нан өтпейді. Production boot үшін versioned `PILOT_SCOPE_APPROVAL_ID` міндетті, ал release preflight approval reference бар болса да automatic green емес, `manual` acceptance береді. Back #229 (`48341b0`) defense-in-depth ретінде `PUBLIC_MARKETPLACE_ENABLED`, `PENALTY_ENABLED` немесе `AMOUNT_BASED_COMMISSION_ENABLED=true` болса production environment validation-ның өзін fail-fast етті; staging-та controlled testing рұқсат. Бұл implementation pilot scope-ты өзі бекітпейді және deployed values acceptance-ін алмастырмайды; owner/legal approval әлі ашық gate.

Release config drift guard қосылды. Back #232 (`f10f4ff`) deployment env snapshot-ты source етпей оқитын privacy-safe checker қосты: exact `PILOT_SCOPE_PROFILE=kz-personal-private-debt-v1`, present versioned `PILOT_SCOPE_APPROVAL_ID` және marketplace/penalty/amount-based-commission flags=false болуы міндетті. Duplicate governance keys немесе unsupported profile fail-closed. Output approval ID value-ін шығармайды, aggregate pass metadata ғана береді. Vitest және CI safe/fail smoke coverage бар. Бұл actual deployed ConfigMap/Secret acceptance-ін алмастырмайды.

Staging forwarded-header spoof acceptance harness main-ға кірді. Back #231 (`6412a9b`) manual `Staging Proxy Spoof Smoke` workflow қосты: бір random nonexistent email үшін caller-controlled `X-Forwarded-For`, `X-Real-IP` және `Forwarded` мәндерін әр attempt-та ауыстырып, password-reset pair rate-limit budget бөлінбейтінін тексереді; алғашқы 3 request 202, төртіншісі 429 + `Retry-After` болуы тиіс. Retained artifact URL/email/header values/response body сақтамайды, тек metadata-only outcome береді. Fake-curl regression test bypass жағдайында fail-closed болады. Бұл harness implementation ғана; нақты ingress/header sanitization staging execution әлі pending.

Front/Admin dependency reproducibility gate жабылды. Front #78 (`f5540e9`) және Admin #34 (`1de24b8`) manual lockfile-candidate workflow енгізгеннен кейін runner қайта қолжетімді болды. Front #79 (`9305434`) және Admin #35 (`90710d7`) reviewed `pnpm-lock.yaml`-ды main-ге commit етті, exact Node 24 + `pnpm@12.4.2` contract-ын сақтап, CI install-ды `pnpm install --frozen-lockfile` режиміне бекітті. Екі PR-дың `quality` checks-і successful (`36815531516`, `36815531773`). Front #80 (`0fdd155`) және Admin #36 (`1ecf1da`) CI-ды main push-қа да қосты; merged main quality runs `36841541302` және `36841501797` successful. Сол өзгерістер release candidate main commit-терінің өзін тексеретін тұрақты gate береді.

Court/export technical fail-closed guard main-ға кірді. Back #234 (`4c73a4f`) participant-only capability және `court-export-seal` endpoint қосты: ZIP v2 binary archive support, remote-signed PDF provider, PDF template/legal/visual/font approval refs, evidence signer deployment/IAM/key-ceremony/lifecycle refs, trusted timestamp + timestamp governance және retention/storage lifecycle refs толық болмаса operation unavailable/503 болып қалады. Бұл technical readiness guard actual approved PDF, KMS/HSM немесе TSA/legal acceptance-ті green деп есептемейді. #234 quality run `36821578344` толық green болды.

SBOM retention acceptance жабылды. Current main supply-chain runs Back `36841447314` (`0340cf8`), Front `36841540997` (`0fdd155`) және Admin `36841502025` (`1ecf1da`) successful: secret scan + CycloneDX generation green, commit-bound SBOM artifacts 2026-10-15-ке дейін retained. Backend #235 (`4f41449`) оған дейін Gitleaks generic-api-key false-positive берген non-secret test ceremony reference-ті қауіпсіз test reference-ке ауыстырды.

Merged-main quality verification үш repo-ға да қосылды. Back #237 (`0340cf8`), Front #80 (`0fdd155`) және Admin #36 (`1ecf1da`) quality workflow-тарын `main` push-қа қосты. Main runs: Back `36841447349` толық SUCCESS — migrations, Phase 2 PostgreSQL acceptance, `pnpm check`, operational/privacy/staging-script/Kubernetes/release-render/compiled-app smoke; Front `36841541302` SUCCESS; Admin `36841501797` SUCCESS. Осы evidence Phase 2 current-main CI gate-ін жабады, бірақ real staging browser/provider acceptance-ті алмастырмайды.

Staging acceptance orchestration hardening аяқталды. Back #238 (`8e1ca4f`) manual `Staging Core Acceptance` workflow қосты: explicit non-production acknowledgement талап етеді, operator-provided deployed Backend commit-ті selected workflow SHA-мен exact салыстырады, immutable `sha256:...` image digest форматын тексереді және existing runtime + verified-account auth/session + forwarded-header spoof suites-ті бір run ішінде орындайды. 14-day artifact тек environment/time/repository/commit/image/run/scenario/result metadata сақтайды; URL/origin/email/password/token/header values/response body/PII сақталмайды. Current-main CI `36849677702` және supply-chain `36849677677` successful. Бұл implementation actual staging execution емес.

Browser acceptance reproducibility және release identity де harden етілді. Front #81 (`24228c4`) және Admin #37 (`a84d8af`) manual Playwright workflows-ты committed `pnpm-lock.yaml` + `--frozen-lockfile` режиміне көшірді. Front #82 (`d719d8c`) authenticated staging browser run үшін exact deployed Front commit, Backend commit, immutable Backend image digest және non-production acknowledgement талап етеді; retained evidence осы release identity-ді metadata-only түрде bind етеді. Front current-main CI `36850300325`/supply-chain `36850300315`, Admin current-main CI `36850183051`/supply-chain `36850183043` green. Real KZ/RU staging browser run әлі pending.

Acceptance workflow drift-ке қарсы CI invariants қосылды. Front #83 (`ddeb685`) manual/staging browser workflows үшін frozen install, exact HTTPS staging origin, release identity inputs, trace-off және metadata-only retention contract-ын main/PR CI-мен қорғайды; current-main CI `36851482758` successful. Admin #39 (`7adbde5`) manual browser reporter/frozen-install/trace-off/artifact retention contract-ын CI invariant етті. Back #239 (`8cb03d3`) synthetic Evidence Archive Load workflow-ты explicit `release_commit_sha == GITHUB_SHA` binding-пен күшейтті; Back #240 (`ff0dc09`) migration rollback + backup/restore rehearsal workflows үшін frozen installs, no reverse migration, pg_dump/pg_restore, backup-byte deletion, readiness және metadata-only retention invariants қосты. Back current-main CI `36851783467` successful.

Admin real-staging read-only browser acceptance harness қосылды. Admin #40 (`b06ef0f`) dedicated staging Playwright config/spec және manual workflow қосты: exact HTTPS Admin origin, exact deployed Admin commit, Backend commit, immutable Backend image digest және explicit non-production acknowledgement талап етіледі. Browser scenario moderation/support mutation жасамайды; liveness, readiness, evidence/notification/audit aggregate cards және mobile overflow-ды тексереді. Trace off, artifact 14-day metadata-only; metrics/support credential-дар browser-ға берілмейді және deployment-та server-only болып қалады. Current-main CI `36855331121` және supply-chain `36855331141` successful; actual staging execution әлі pending.

Frontend/Admin outbound API origin hardening қосылды. Admin #41 (`0582abe`) барлық server-only readiness/metrics/support calls үшін бір `QARYZLINK_API_BASE_URL` validator енгізді: production-та exact HTTPS origin міндетті, credentials/path/query/fragment/HTTP reject болады; development localhost HTTP рұқсат. Current-main CI `36856384156` және supply-chain `36856384256` successful. Front #84 (`2c8e6b6`) CSP және browser API client-ті ортақ public-API validator-ға көшірді: production `NEXT_PUBLIC_API_BASE_URL` міндетті exact HTTPS origin, ал implicit production localhost fallback жойылды; development/test localhost fallback сақталды. Current-main CI `36856766934` және supply-chain `36856766952` successful. Actual staging ingress/TLS acceptance бөлек ашық қалады.

Pilot scope approval process үшін versioned record template қосылды: `docs/06-operations/PILOT_SCOPE_APPROVAL.md`. Ол proposed Kazakhstan natural-person private-debt boundary, explicit exclusions, provider/legal/privacy dependencies, deployment assertions, material-change versioning және product/legal/privacy/security sign-off fields береді. Құжаттың болуы approval емес; `Approval ID` және reviewer fields PENDING күйінде қалады, сондықтан product/legal release gate әлі жабылған жоқ.

KYC provider selection жұмысы үшін `docs/06-operations/KYC_PROVIDER_ACCEPTANCE.md` versioned acceptance record қосылды. Template нақты vendor-дың session API, VERIFIED/REVOKED event mapping, callback/signature trust, key rotation/revocation, data minimization/residency, retention, legal/privacy classification, incident ownership және staging scenarios-ын generic `remote-signed-l2` boundary-ға байланыстырады. Provider decision/governance IDs/key fingerprint/reviewer fields әдейі PENDING; vetted vendor selection release gate әлі жабылған жоқ.

KZ/RU legal contract PDF approval process үшін `docs/06-operations/CONTRACT_TEMPLATE_ACCEPTANCE.md` қосылды. Record exact template IDs/hashes, independent SHA-256, legal wording review, deterministic font/embedding policy, visual/pagination fixtures, renderer identity/key және ZIP v2 evidence-chain assertions-ын байланыстырады. Governance IDs/reviewers/staging references PENDING; actual approved legal artifacts release gate әлі ашық.


Remaining Phase 4 external/legal decisions үшін бес versioned review packet дайындалды: `EVIDENCE_SIGNER_ACCEPTANCE.md`, `TIMESTAMP_AUTHORITY_ACCEPTANCE.md`, `RETENTION_LIFECYCLE_ACCEPTANCE.md`, `ACCOUNT_DATA_EXPORT_ACCEPTANCE.md`, `LEDGER_ADJUSTMENT_POLICY_ACCEPTANCE.md`. Олар current config/preflight references, provider/accounting/privacy decision matrix, staging scenarios және reviewer sign-off fields-ті бір жерге жинайды. Барлық нақты provider/policy/reviewer мәндері `PENDING`; template presence approval немесе production acceptance емес.


## Phase 4 Trust & Evidence басталуы — 2026-09-28

Existing immutable EvidencePackage schema v1 өзгертілмей, participant-only canonical JSON export қосылды. Backend export алдында persisted manifest-ті қайта hash етеді; stored `manifestHash` сәйкес болмаса fail-closed. Successful export `EVIDENCE_PACKAGE_EXPORTED` audit event жасайды, бірақ manifest content audit payload-қа көшірілмейді. Front KZ/RU contract evidence panel user action арқылы JSON файлды жүктейді.

Canonical JSON export үстіне deterministic bundle manifest foundation қосылды: immutable evidence manifest және KZ/RU technical contract previews stable archive path/size/SHA-256 metadata арқылы бір bundle hash-ке байланысады. ClosureCertificate contract document hash render source hash-пен қайта тексеріледі. Front bundle manifest JSON download жасап, artifact count + bundle hash көрсетеді.

QaryzLinkBack PR #184 merged at `76f9a59`, QaryzLinkFront PR #55 merged at `0e0cdad`. CI runs `36455112812` және `36455120153` quality job құрғанымен runner step орындамады; automated verification pending.

Bundle manifest үстіне bounded deterministic metadata/text ZIP archive қосылды: fixed timestamps, STORE method, lexical order, CRC32 және whole-archive SHA-256. Front explicit ZIP download және archive hash/count/size көрсетеді.

QaryzLinkBack PR #185 merged at `d167663`, QaryzLinkFront PR #56 merged at `b61aeb0`. CI runs `36456180490` және `36456185321` quality job құрғанымен runner step орындамады; automated verification pending.

Deterministic ZIP үстіне provider-neutral Ed25519 seal foundation қосылды: canonical domain-separated payload archive/bundle/evidence hashes-ты байланыстырады; external signer result Backend ішінде public key арқылы қайта verify болады; key fingerprint/signature hash audit metadata-ға ғана түседі. Production signer default-off, Front unavailable capability-ді ғана көрсетеді.

QaryzLinkBack PR #186 merged at `c2d2a1e`, QaryzLinkFront PR #57 merged at `aad8056`. CI runs `36461356114` және `36461359027` quality job құрғанымен runner step орындамады; automated verification pending.

Contract-level evidence legal-hold foundation қосылды: enum-only reason, scoped support read/write, one-active-hold DB invariant, idempotent hold/release және cleanup query exclusion. Active hold expired/unconsumed object storage deletion-ға дейін contract-ты selection-нан алып тастайды.

QaryzLinkBack PR #187 merged at `b5c7f11`. CI run `36464196233` quality job құрғанымен runner step орындамады; automated verification pending.

Bounded full binary archive v2 қосылды: тек immutable manifest-те frozen evidence таңдалады; persisted row + consumed upload intent + CLEAN malware verdict қайта байланысады; S3 bytes chunk-by-chunk оқылып size/mediaType/SHA-256 бойынша тексеріледі; final ZIP direct binary response ретінде беріледі. Existing metadata ZIP v1 өзгермейді.

QaryzLinkBack PR #188 merged at `d390b71`, QaryzLinkFront PR #58 merged at `253ff44`. CI runs `36470173599` және `36470182893` quality job құрғанымен runner step орындамады; automated verification pending.

Pinned remote Ed25519 signer adapter қосылды: HTTPS-only endpoint, bearer secret, redirect/timeout/response-size bounds, pinned key ID/SPKI SHA-256 fingerprint және Backend local detached-signature verification. Seal payload ZIP v1/v2 үшін бөлек domain/purpose қолданады, сондықтан v1 signature v2 archive-ке replay болмайды.

Application-side signing key trust registry енді configured identity-дің DB-де ACTIVE болуын талап етеді. Controlled one-shot commands жаңа key-ді activation жасайды, бұрынғы ACTIVE key-ді RETIRED күйге ауыстырады немесе explicit REVOKED етеді. Participant historical key status-ты contract-scoped endpoint арқылы оқи алады. Maintenance flag release preflight-та enabled қалса fail етеді. Бұл registry actual KMS/HSM gateway-дің орнын баспайды.

QaryzLinkBack PR #189 merged at `ba3d1ea`, QaryzLinkFront PR #59 merged at `e68d354`. CI runs `36516530077` және `36516534678` quality job құрғанымен runner step орындамады; automated verification pending.

QaryzLinkBack PR #190 merged at `6d9090d`, QaryzLinkFront PR #60 merged at `2f454c3`. CI runs `36520601061` және `36520607376` quality job құрғанымен runner step орындамады; automated verification pending.

External signed time attestation foundation қосылды: timestamp subject seal payload/archive/signer/signature hashes-ты байлайды; remote authority nonce, signed generatedAt/serial және pinned Ed25519 identity арқылы Backend-та қайта verify болады. Timestamp required режимде authority failure seal-ды audit-ке дейін fail-closed тоқтатады. Бұл RFC3161/qualified timestamp емес.

QaryzLinkBack PR #191 merged at `427d70d`, QaryzLinkFront PR #61 merged at `48c4032`. CI runs `36523556368` және `36523562198` quality job құрғанымен runner step орындамады; automated verification pending.

Contract PDF foundation immutable template snapshot пен signed remote renderer boundary-ға дейін кеңейді: жаңа contract version KZ/RU template ID/hash-ті creation кезінде pin етеді; legacy contracts retroactive template алмайды; Backend PDF bytes/hash/size/source/template/render-input және renderer Ed25519 attestation-ін independently verify етеді. Front participant current locale verified PDF жасай/жүктей алады. Actual legal wording/template approval және visual/legal acceptance әлі ашық.

QaryzLinkBack PR #192 merged at `6218e73`, QaryzLinkFront PR #62 merged at `e9dcd26`. CI runs `36542155035` және `36536087948` quality job құрғанымен runner step орындамады; automated Prisma/typecheck/lint/test/build verification pending.

Verified contract PDF evidence binding ZIP v2-ге қосылды: archive assembly KZ/RU pinned-template PDF artifact-терін verified renderer арқылы қайта құрады, ClosureCertificate source hash-пен сәйкестігін тексереді және PDF bytes + template/source/render-input/renderer attestation metadata-ны bundle hash chain-ге қосады. Standalone PDF export audit internal archive build кезінде жасалмайды; ZIP v1 өзгермейді.

QaryzLinkBack PR #193 merged at `d3a85da`, QaryzLinkDocs PR #112 merged at `ec21597`. Back CI run `36565733456` conclusion=failure көрсеткенімен quality job-та `steps=[]` және `runner_id=0`; application code орындалмаған. Сондықтан automated typecheck/lint/test/build verification әлі pending.

Evidence retention/lifecycle release boundary қосылды: evidence storage үшін versioned `EVIDENCE_RETENTION_POLICY_ID` және `EVIDENCE_STORAGE_LIFECYCLE_POLICY_ID` references енгізілді. Staging-та missing references release preflight structured `fail` береді; production-та storage enabled болса missing references config validation кезінде fail-fast тоқтайды. References бар болса preflight оларды әдейі `manual` қалдырады, сондықтан legal/provider approval жалған green болмайды. Provider lifecycle persisted/consumed evidence және active legal hold object-терін destructive expiry-ден қорғауы staging acceptance gate болып қалды.

QaryzLinkBack PR #194 merged at `d5178cd`, QaryzLinkDocs PR #114 merged at `e4e1466`. Back CI run `36570269381` conclusion=failure көрсеткенімен quality job-та `steps=[]`, `runner_id=0`; application code орындалмаған. Automated typecheck/lint/test/build verification әлі pending.

KMS/HSM signer operations release gate қосылды: production sealing енді approved signer deployment, least-privilege IAM policy, independent key ceremony және provider-side key lifecycle policy үшін төрт versioned non-secret reference талап етеді. Staging-та refs жоқ болса release preflight `evidence_signer_operations=fail`; production-та refs жоқ sealing config startup кезінде fail-fast. Төртеуі де configured болса check `manual` болып қалады, сондықтан actual KMS/HSM/IAM/ceremony/provider acceptance жалған green болмайды. Staging checklist rotation/revocation/compromise drill және old-key disable/delete timing acceptance-пен толықты.

QaryzLinkBack PR #195 merged at `b0433fa`, QaryzLinkDocs PR #116 merged at `1e4d2e5`. Back CI run `36577193686` conclusion=failure көрсеткенімен quality job-та `steps=[]`, `runner_id=0`; application code орындалмаған. Automated typecheck/lint/test/build verification әлі pending.

Trusted timestamp governance release gate қосылды: production timestamping standards profile, authority trust policy, revocation/long-term validation policy және Kazakhstan legal classification үшін төрт versioned non-secret reference талап етеді. Staging-та refs жоқ болса release preflight `evidence_timestamp_governance=fail`; production-та refs жоқ timestamp config startup кезінде fail-fast. References толық болса check `manual` болып қалады және current `remote-ed25519-attestation` adapter RFC3161/QTSA деп саналмайды. Actual standards-based adapter/provider/certificate/revocation/legal acceptance бөлек ашық gate.

QaryzLinkBack PR #196 merged at `24a854e`, QaryzLinkDocs PR #118 merged at `ca87d85`. Back CI run `36581747405` conclusion=failure көрсеткенімен quality job-та `steps=[]`, `runner_id=0`; application code орындалмаған. Automated typecheck/lint/test/build verification әлі pending.

Identity/KYC provider governance release gate қосылды: production identity verification енді vetted provider contract/profile, authenticated callback/replay policy, privacy/data-residency policy және Kazakhstan legal classification үшін төрт versioned non-secret reference талап етеді. Staging-та refs жоқ болса `identity_provider_governance=fail`; production-та refs жоқ enablement config fail-fast. References толық болса governance check `manual`, бірақ current adapter әлі `UnavailableIdentityVerificationProvider`, сондықтан жалпы identity verification `provider_adapter_unavailable` болып release-ті блоктайды. Actual provider adapter/callback/session correlation және privacy/legal staging acceptance әлі ашық.

QaryzLinkBack PR #197 merged at `e179229`, QaryzLinkDocs PR #120 merged at `971ac80`. Back CI run `36588116059` conclusion=failure көрсеткенімен quality job-та `steps=[]`, `runner_id=0`; application code орындалмаған. Automated typecheck/lint/test/build verification әлі pending.

Contract PDF governance release gate қосылды: production PDF rendering енді approved KZ/RU template artifact set, Kazakhstan legal sign-off, visual/pagination acceptance және deterministic font embedding policy үшін төрт versioned non-secret reference талап етеді. Staging-та refs жоқ болса `contract_pdf_governance=fail`; production-та refs жоқ PDF config startup кезінде fail-fast. References толық болса governance check `manual` болып қалады, сондықтан template ID/hash өздігінен legal/visual approval болып саналмайды. Staging checklist final PDF→ZIP v2 binding already complete екенін де жаңартты.

QaryzLinkBack PR #198 merged at `7e647ca`, QaryzLinkDocs PR #122 merged at `7c63389`. Back CI run `36589322745` conclusion=failure көрсеткенімен quality job-та `steps=[]`, `runner_id=0`; application code орындалмаған. Automated typecheck/lint/test/build verification әлі pending.

Vendor-neutral signed L2 identity integration foundation қосылды: verification start random 128-bit opaque subjectRef қолданады және provider-ге application user ID/profile PII жібермейді; DB session correlation raw subject орнына SHA-256 hash сақтайды. Remote session response configured provider code + pinned Ed25519 SPKI fingerprint + detached signature арқылы Backend-та verify болады. Internal callback deployment token және signed `QARYZLINK_IDENTITY_CALLBACK_V1` payload-ты бірге талап етеді; provider code/key, clock skew және session correlation fail-closed тексеріледі. VERIFIED claim write + one-time session completion бір transaction ішінде орындалады; exact signed replay idempotent, altered replay rejected. Бұл generic adapter нақты KYC vendor vetting емес: provider-specific API/revocation mapping, KZ privacy/legal және staging acceptance әлі ашық.

QaryzLinkBack PR #199 merged at `7e2adfc`, QaryzLinkDocs PR #124 merged at `b374b3e`. Back CI run `36602159162` conclusion=failure көрсеткенімен quality job-та `steps=[]`, `runner_id=0`; application code орындалмаған. Automated Prisma/typecheck/lint/test/build verification әлі pending.

Signed identity revocation lifecycle қосылды: provider `QARYZLINK_IDENTITY_REVOCATION_V1` callback-ты deployment token + pinned Ed25519 key арқылы береді; raw provider reference product DB-ға сақталмай, provider namespace-пен SHA-256 tombstone ретінде persist болады. REVOKED event VERIFIED event-тен бұрын келсе кейінгі stale verification blocked, ал revocation-нан кейінгі жаңа `verifiedAt` re-verification-ға жол береді. VERIFIED/REVOKED concurrent mutation providerCode + referenceHash-derived PostgreSQL advisory transaction lock арқылы serialise болады. Same/older revocation retries idempotent; later revocation tombstone-ды алға жылжытып matching active claim-ды revoke етеді.

QaryzLinkBack PR #200 merged at `791e8fb`, QaryzLinkDocs PR #126 merged at `ab89619`. Back CI run `36605492182` conclusion=failure көрсеткенімен quality job-та `steps=[]`, `runner_id=0`; application code орындалмаған. Automated Prisma/typecheck/lint/test/build verification әлі pending.

Contract amendment proposal/approval foundation қосылды: feature default-off; тек SIGNED/FUNDING_PENDING/ACTIVE contract үшін current signed version-ға байланған next-version amendment proposal жасалады. Product DB raw legal text/terms JSON сақтамайды — purpose, base/proposed version және immutable proposed-document SHA-256 ғана сақталады. Borrower/lender approvals бөлек explicit action, duplicate same-party approval idempotent, екі approval жиналғанда amendment APPROVED болады. Proposal/approval existing ContractVersion, contract currentVersion/status, funding, schedule, payments немесе ledger-ге mutation жасамайды. Release preflight enabled amendment feature-ді manual legal/process acceptance ретінде көрсетеді. Approved amendment → ContractVersion N+1 activation/signing, evidence binding және deterministic financial/schedule transition әлі бөлек pending slice.

QaryzLinkBack PR #201 merged at `46a8512`, QaryzLinkDocs PR #128 merged at `3371848`. Back CI run `36610594361` conclusion=failure көрсеткенімен quality job-та `steps=[]`, `runner_id=0`; application code орындалмаған. Automated Prisma/typecheck/lint/test/build verification әлі pending.

Approved non-financial `OTHER` amendment N+1 signing/evidence continuation қосылды. Dual-approved amendment exact current signed base version-нан deterministic ContractVersion N+1 `SIGNING` source жасайды; source base document hash + amendment proposedDocumentHash + inherited terms/calculation policy + pinned PDF template identity-лерді bind етеді. Default contract/document/closure reads unsigned newer candidate-ті емес, exact `Contract.currentVersion`-ды қолданады; participant candidate-ті explicit version source/preview/PDF routes арқылы review етеді. Бірінші signature currentVersion немесе financial state-ті өзгертпейді; екінші participant signature N+1→SIGNED, base→SUPERSEDED, amendment→ACTIVATED және currentVersion→N+1 жасайды. Contract status/funding/schedule/payment/ledger өзгермейді. Exact start/sign replay activation-нан кейін де idempotent. TERMS_CHANGE/SCHEDULE_CHANGE N+1 activation deterministic financial/schedule transition policy дайын болғанша fail-closed.

New evidence package creation amendment provenance үшін schema v2 қолданады: ContractVersion sourceAmendmentId, amendment proposal hash/status, role-only approvals және activated-version metadata canonical manifest-ке кіреді. Existing persisted schema v1 packages retroactive rewrite болмайды және бұрынғы stored schemaVersion бойынша export болады.

QaryzLinkBack PR #202 merged at `be32e2d`, QaryzLinkDocs PR #130 merged at `92e64cd`. Back CI run `36615138764` conclusion=failure көрсеткенімен quality job-та `steps=[]`, `runner_id=0`; application code орындалмаған. Automated Prisma/typecheck/lint/test/build verification әлі pending.

Guarded pre-payment financial amendment transition қосылды. TERMS_CHANGE/SCHEDULE_CHANGE proposal current signed ContractVersion terms-інен normalized bounded proposedTermsSnapshot жасайды; principal/currency өзгермейді, participant API тек proposedFinancialTerms ретінде termDays/annualRateBps көрсетеді. Financial N+1 start-signing тек ACTIVE + CONFIRMED funding + funding effectiveAt + zero Payment rows + future amended maturity жағдайында өтеді. Start кезінде proposed terms N+1 documentHash-ке bind болады. Financial amendment SIGNING кезінде new repayment evidence PAYMENT_CONFLICT арқылы тоқтайды; contract row lock payment/amendment race-ті serialise етеді.

Екінші participant signature кезінде financial guard қайта орындалады. Successful transition previous unpaid schedule items-ті CANCELLED етеді, signed N+1 documentHash/current contract version/proposed terms-пен same deterministic schedule-input contract арқылы жаңа ScheduleVersion жасайды, sourceContractVersion=N+1 және sourceAmendmentId сақтайды, содан кейін N+1→SIGNED, base→SUPERSEDED, currentVersion→N+1 және amendment→ACTIVATED бір transaction ішінде өтеді. Funding қайта жасалмайды, original funding effectiveAt сақталады. Generic schedule generation original Proposal terms емес, exact SIGNED Contract.currentVersion.termsSnapshot қолданады. Repayment history бар contract үшін financial amendment әлі fail-closed; already-paid allocation/accrual cutover бөлек pending accounting/legal slice.

New evidence package creation financial amendment/schedule provenance үшін schema v3 қолданады: normalized proposedTermsSnapshot, ScheduleVersion sourceContractVersion/sourceAmendmentId және deterministic inputHash canonical manifest-ке кіреді. Existing persisted schema v1/v2 packages retroactive rewrite болмайды және stored schemaVersion бойынша read/export болады.

QaryzLinkBack PR #203 merged at `c263e6b`, QaryzLinkDocs PR #132 merged at `128e1e3`. Back CI run `36619683267` conclusion=failure, бірақ quality job-та `steps=[]`, `runner_id=0`; Prisma/typecheck/lint/test/build орындалмаған. Container local clone да network/DNS қолжетімсіз болғандықтан орындалмады. Automated verification pending, source-level consistency review жасалды.

Post-payment financial amendment accounting preview foundation қосылды. APPROVED current TERMS_CHANGE/SCHEDULE_CHANGE үшін ACTIVE + CONFIRMED funding contract participant immutable versioned accounting snapshot дайындай алады. Capture payment submit/confirm/reversal қолданатын contract row lock-пен serialise болады. Current one-item schedule paidMinor charge→interest→principal policy бойынша deterministic component split-ке реконструкцияланады; confirmed active payment total = schedule paidMinor + unallocated credit reconciliation бұзылса fail-closed. Exact same accounting state same stateHash/snapshot-ты қайтарады, payment/reversal/unresolved state өзгерсе жаңа snapshot version жасалады. Historical snapshots update/delete болмайды және participant-only history endpoint арқылы оқылады.

Accounting snapshot source signed ContractVersion documentHash, latest ScheduleVersion inputHash, funding effectiveAt, scheduled/paid/outstanding component amounts, confirmed payment total, unallocated credit және payment/unresolved counts-ты bind етеді. Response explicit PREVIEW_ONLY, activationEligible=false және POST_PAYMENT_ACCOUNTING_POLICY_PENDING береді; ContractVersion/ScheduleVersion/PaymentAllocation/LedgerEntry/currentVersion mutation жоқ. Actual earned/unearned interest cutover және post-payment N+1 activation әлі pending accounting/legal slice.

New evidence package creation accounting snapshot history үшін schema v4 қолданады; persisted v1/v2/v3 packages retroactive rewrite болмайды. Schedule docs/ADR runtime source current signed ContractVersion.termsSnapshot екенін нақтылап жаңартылды.

QaryzLinkBack PR #204 merged at `5a52e27`, QaryzLinkDocs PR #134 merged at `f145da6`. Back CI run `36623766478` conclusion=failure, бірақ quality job-та `steps=[]`, `runner_id=0`; application code орындалмаған. Automated Prisma/typecheck/lint/test/build verification pending; source-level lint/schema/index-length/consistency review жасалды.

Participant own-data export foundation қосылды. `POST /api/v1/profile/me/data-export` default-off және REPEATABLE READ transaction ішінде account/profile/privacy/deletion + participant contract/payment summaries snapshot-ын шығарады. Own email/phone PII protection layer арқылы ғана ашылады; internal userId/partyId, counterparty party IDs/PII, password/session/token, ciphertext/lookup hashes, evidence objectKey/signed URL және provider raw references response-қа кірмейді. Contract/payment summaries own role-ды ғана көрсетеді. Canonical `dataHash` generatedAt-тан тәуелсіз, successful export audit payload тек schemaVersion/dataHash/counts сақтайды.

Production enablement `ACCOUNT_DATA_EXPORT_POLICY_ID` versioned reviewed policy reference талап етеді; missing policy startup және release preflight-та fail болады. Enabled+configured feature preflight-та manual privacy/export scope acceptance болып қалады. Deletion request active sessions-ды immediately revoke ететіндіктен current documented UX ordering export-before-deletion. Full statutory scope, additional record categories, third-party redaction policy және Kazakhstan privacy/staging acceptance әлі pending. Front downloadable UX және dedicated export rate limits орындалды.

QaryzLinkBack PR #205 merged at `55f7811`, QaryzLinkDocs PR #136 merged at `ad56ab4`. Back CI run `36626198958` conclusion=failure, бірақ quality job-та `steps=[]`, `runner_id=0`; application code орындалмаған. Automated verification pending; source-level privacy/config/DI/lint consistency review жасалды.

Front own-data export UX аяқталды. Settings ішінде explicit JSON export action deletion-нің алдында орналасқан. Successful export толық own-data snapshot-ты файлға жүктейді, ал UI contact data-ны қайта render етпей тек dataHash, contract/payment counts және generated date көрсетеді. KZ/RU copy current v1 scope-ты және қарсы тарап PII/secrets/ciphertext/storage/provider raw identifiers excluded екенін, сондай-ақ deletion request active sessions-ды revoke ететіндіктен export-before-deletion ordering-ті түсіндіреді. Backend feature default-off болса Front 503-ті unavailable күйі ретінде көрсетеді.

QaryzLinkFront PR #64 merged at `f2d924a`. Front CI run `36700471542` conclusion=failure, quality job `runner_id=0`, `steps=[]`, execution ~2s; typecheck/lint/test/build басталмаған. Merge алдында authenticated POST route, no-request-body contract, explicit-click download, no-PII-on-screen summary, default-off/session/error states және locale parity source-level review жасалды.

Own-data export dedicated abuse/rate-limit boundary қосылды. Authenticated user үшін HMAC-hashed PostgreSQL buckets қолданылады: 1 export/minute және 5 exports/hour. Limit exceeded болса Backend bounded `429 ACCOUNT_DATA_EXPORT_RATE_LIMITED` + `Retry-After` қайтарады; raw user ID rate bucket key-де сақталмайды. Existing export payload, privacy scope және success audit contract өзгермейді. Front осы 429-ды KZ/RU explicit throttling state ретінде көрсетеді.

QaryzLinkBack PR #212 merged at `ddffffd`, QaryzLinkFront PR #65 merged at `4772038`. Бұл slice жаңа external dependency қоспайды және existing `auth_rate_buckets` storage-ты қайта қолданады.

Post-payment financial amendment cutover projection foundation қосылды. Participant APPROVED current financial amendment үшін exact latest accountingSnapshotId беріп immutable cutover preview дайындай алады. Backend contract/amendment row lock ішінде selected snapshot-тың current signed ContractVersion/documentHash, latest ScheduleVersion/inputHash/item values, confirmed/unresolved payment counts, confirmed totals/unallocated credit, charge→interest→principal reconstructed components және canonical accounting stateHash-пен әлі exact екенін қайта тексереді. State өзгерсе old snapshot stale болып reject болады және жаңа accounting snapshot қажет.

`POST_PAYMENT_CUTOVER_PREVIEW_V1` snapshot capturedAt-ты тек technical reference day ретінде қолданады; caller arbitrary effective date бермейді. Existing ACT/365 half-up formula арқылы base accrued interest есептеледі, historical paid-interest immutable қалады. paidInterest accrued interest-тен артық болса айырма `interestReclassificationCandidateMinor` ретінде ғана көрсетіледі — refund, credit, principal allocation немесе ledger mutation автоматты жасалмайды. Existing unallocated credit те `creditsNotApplied` ішінде бөлек қалады. Opening principal existing outstanding principal-дан алынады; proposed maturity original funding effectiveAt + proposed total termDays, future interest proposed rate бойынша remaining days/opening principal арқылы projection болады. Projected remaining due unapplied candidate/credit-ті шегермейді.

Cutover previews immutable/versioned, one exact accounting snapshot → one preview, retry idempotent және amendment document hash + proposed terms + accounting snapshot ID/stateHash + policy inputs/outputs canonical `previewHash`-пен bind болады. Participant-only POST/GET history API қосылды. Response explicit `PREVIEW_ONLY`, `activationEligible=false`, `POST_PAYMENT_CUTOVER_POLICY_PENDING`. Actual post-payment N+1 activation әлі жабық: reclassification treatment, legal effective-date semantics және opening-balance ledger transition policy pending.

New evidence package creation cutover projection provenance үшін schema v5 қолданады; persisted v1/v2/v3/v4 packages retroactive rewrite болмайды. ADR-0027 projection-ды legal/accounting activation-нан бөлек decision ретінде бекітеді.

QaryzLinkBack PR #207 merged at `43ef5ad`, QaryzLinkDocs PR #139 merged at `7ab68da`. Back CI run `36664145914` conclusion=failure, бірақ quality job-та `steps=[]`, `runner_id=0`; Prisma/typecheck/lint/test/build орындалмаған. Automated verification pending; source-level schema/relation/index-bound/line-limit/evidence compatibility review жасалды.

Post-payment cutover-pinned N+1 signing foundation қосылды. Dedicated `CONTRACT_POST_PAYMENT_AMENDMENT_SIGNING_ENABLED=false` gate amendments/signing gates-ке тәуелді және release preflight enabled state-ті manual accounting/legal acceptance ретінде көрсетеді. `POST /api/v1/contracts/:contractId/amendments/:amendmentId/start-post-payment-signing` exact latest cutoverPreviewId талап етеді. Start contract/amendment row lock ішінде cutover preview-дің latest accounting snapshot/current signed ContractVersion/latest schedule/payment state/canonical stateHash-пен әлі exact екенін және deterministic previewHash/policyVersion-ды қайта verify етеді.

Successful start ContractVersion N+1 `SIGNING` жасайды және `sourceCutoverPreviewId` сақтайды. N+1 calculationPolicy + documentHash selected previewHash, accountingSnapshotId, accountingStateHash, cutover policyVersion және referenceAt-ты bind етеді. Same exact preview retry idempotent, басқа preview retry conflict. Financial amendment `SIGNING` немесе `SIGNED_PENDING_ACTIVATION` кезінде repayment evidence, lender confirm/dispute және reversal толық frozen болады.

Post-payment N+1 first signature currentVersion/schedule/payment/ledger-ді өзгертпейді. Екінші signature N+1→SIGNED және amendment→SIGNED_PENDING_ACTIVATION ғана жасайды. Base ContractVersion signed күйде қалады, currentVersion ауыспайды, жаңа ScheduleVersion/PaymentAllocation/LedgerEntry жасалмайды. Actual reclassification/opening-balance/ledger activation әлі бөлек pending slice. New evidence package creation cutover-pinned ContractVersion provenance үшін schema v6 қолданады; persisted v1-v5 packages retroactive rewrite болмайды.

QaryzLinkBack PR #208 merged at `c713e5a`, QaryzLinkDocs PR #141 merged at `655ef7a`. Back CI run `36667322058` conclusion=failure, бірақ quality job-та `steps=[]`, `runner_id=0`; Prisma/typecheck/lint/test/build орындалмаған. Automated verification pending; source-level schema/migration/DI/line-limit/idempotency/evidence compatibility review жасалды.

Post-payment activation-plan foundation қосылды. `SIGNED_PENDING_ACTIVATION` amendment exact signed N+1 ContractVersion, sourceCutoverPreview және current accounting stateHash-пен fresh DB state-ке қайта verify болады. `POST_PAYMENT_ACTIVATION_PLAN_V1` replacement schedule candidate opening principal + outstanding accrued interest + projected future interest + outstanding charge бойынша deterministic құрылады және planned total cutover `projectedRemainingDueMinor`-мен exact reconcile болуы тиіс. Interest reclassification candidate және existing unallocated credit plan ішінде әдейі unapplied қалады; олардың кемінде бірі бар болса `requiresLedgerAdjustment=true`.

Activation plan immutable/versioned және signed N+1 documentHash, cutover previewHash, accounting snapshot/stateHash, referenceAt, schedule components/date және unapplied credit candidates-ті `planHash` арқылы bind етеді. Same exact plan retry idempotent, participant-only POST/GET history API бар. Response `PLAN_ONLY`, `activationEligible=false`, `POST_PAYMENT_ACTIVATION_POLICY_PENDING`; currentVersion, base version, ScheduleVersion, PaymentAllocation және LedgerEntry mutation жасалмайды. New evidence package creation activation-plan provenance үшін schema v7 қолданады; persisted v1-v6 packages retroactive rewrite болмайды.

QaryzLinkBack PR #209 merged at `0b78890`, QaryzLinkDocs PR #143 merged at `8a814bd`. Back CI run `36670067273` conclusion=failure, бірақ quality job-та `steps=[]`, `runner_id=0`; application code орындалмаған. Automated Prisma/typecheck/lint/test/build verification pending; source-level schema/migration/DI/idempotency/evidence compatibility review жасалды.

Zero-ledger-adjustment post-payment safe activation foundation қосылды. Dedicated `CONTRACT_POST_PAYMENT_AMENDMENT_ACTIVATION_ENABLED=false` gate amendments + contract signing + post-payment signing parent gates-ке тәуелді және release preflight enabled state-ті manual accounting/legal acceptance ретінде көрсетеді. `activate-post-payment` exact latest immutable activationPlanId талап етеді; signed N+1/cutover/accounting state fresh DB state-пен қайта verify болады және stored plan-ның барлық source/schedule/credit fields deterministic rebuilt plan-пен exact салыстырылады.

Activation тек `requiresLedgerAdjustment=false`, interest reclassification candidate=0 және unallocated credit=0 болғанда жүреді. Successful transaction historical ScheduleVersion/PaymentAllocation/LedgerEntry rows-ты өзгертпейді; activation-plan-bound жаңа ScheduleVersion жасайды, base version-ды SUPERSEDED етеді, currentVersion=N+1 және amendment=ACTIVATED жасайды. Ledger adjustment entry жазылмайды. Generic schedule generation currentVersion-ға bound activation schedule-ды authoritative қайтарады; overdue worker тек latest schedule version-ды materialize етеді. Superseded schedule allocation-ына байланған confirmed payment reversal automatic түрде blocked, сондықтан opening balance post-activation үнсіз өзгермейді.

ActivationPlan response accounting eligibility-ді көрсетеді: zero-adjustment plan `activationEligible=true`, adjustment-required plan `POST_PAYMENT_LEDGER_ADJUSTMENT_REQUIRED`. Actual endpoint availability feature gate/legal acceptance-ке бөлек тәуелді. New evidence package creation activated ScheduleVersion `sourceActivationPlanId` provenance үшін schema v8 қолданады; persisted v1-v7 packages retroactive rewrite болмайды.

QaryzLinkBack PR #210 merged at `431c488`, QaryzLinkDocs PR #145 merged at `d25da87`. Back CI run `36671611175` conclusion=failure, бірақ quality job-та `steps=[]`, `runner_id=0`; Prisma/typecheck/lint/test/build орындалмаған. Automated verification pending; source-level schema/migration/config/preflight/DI/max-lines/idempotency/payment-reversal/schedule/evidence review жасалды.

Post-payment ledger adjustment preview foundation қосылды. `requiresLedgerAdjustment=true` latest activation plan үшін participant immutable/versioned plan дайындай алады; source activationPlanId/planHash, signed ContractVersion/documentHash, cutover preview/hash, accounting snapshot/stateHash, currency, separate interest-reclassification және unallocated-credit components, replacement schedule және canonical adjustmentPlanHash bind болады. Same exact source state idempotent; stale accounting/cutover/activation state fail-closed.

Бұл stage ешқандай LedgerEntry/PaymentAllocation/ScheduleVersion/currentVersion mutation жасамайды. Response `PREVIEW_ONLY`, `applicationEligible=false`, `POST_PAYMENT_LEDGER_ADJUSTMENT_POLICY_PENDING`. Audit adjustment amount-тарды қайталамайды; тек plan/source hashes және component-presence metadata сақтайды. New evidence packages schema v9 арқылы ledger-adjustment-plan provenance-ін bind етеді; persisted v1-v8 rewrite болмайды. Actual credit/refund/reclassification application әлі бөлек accounting/legal policy ретінде pending.

QaryzLinkBack PR #211 merged at `35291e4`, QaryzLinkDocs ADR-0028 / PR #147 merged at `efa737c`. Back CI run `36698466387` conclusion=failure, бірақ quality job `runner_id=0`, `steps=[]`, execution ~2s және log blob жоқ; application quality steps басталмаған. Merge алдында source-level Prisma relation/migration, controller DI/tests, deterministic domain/view/service, participant scope, idempotency/stale-state, audit minimization және evidence v9 compatibility review жасалды.

Front-та post-payment ledger adjustment review UI қосылды. Contract detail current `SIGNED_PENDING_ACTIVATION` amendment-ті ғана қарайды, latest activation plan `requiresLedgerAdjustment=true` болса panel ашады және existing ledger preview-ды exact activationPlanId + planHash бойынша ғана қабылдайды. Preview жоқ болса participant immutable preview жасай алады; бұл financial application емес. UI interest reclassification candidate пен unallocated credit-ті бөлек, replacement schedule және provenance hashes-пен көрсетеді; `PREVIEW ONLY / қолданылмаған` boundary KZ/RU мәтінінде анық берілген.

QaryzLinkFront PR #63 merged at `71aa8c7`. Front CI run `36699905667` conclusion=failure, бірақ quality job `runner_id=0`, `steps=[]`, execution ~3s; typecheck/lint/test/build басталмаған. Merge алдында API route contract, locale-key parity, current-plan provenance filter, default-off hidden state, auth/error/loading states және no-application UX source-level review жасалды.

Бұл baseline court-ready package емес: vetted L2 KYC provider selection/provider-specific API/event mapping/KZ privacy-legal staging acceptance, actual approved KZ/RU legal template content/visual acceptance, actual KMS/HSM signer deployment/external IAM/key ceremony acceptance, RFC3161/qualified TSA legal acceptance, jurisdiction retention periods, external bucket lifecycle acceptance және production load acceptance әлі Phase 4 backlog-та.

## Қазіргі backend slice

~~~mermaid
flowchart TD
    R["Register"] --> U["User + Person party"]
    U --> P["Private profile defaults"]
    L["Login"] --> A["Short-lived access token"]
    L --> T["Rotating refresh session"]
    A --> M["GET/PATCH own profile"]
    T --> A
~~~

Қауіпсіздік шешімдері:

- password built-in Node.js `scrypt` арқылы hash болады;
- refresh token дерекқорда ашық түрде сақталмайды;
- JWT secret configuration іске қосылғанда тексеріледі;
- жаңа профильдің public көрінуі әдепкіде өшірулі;
- domain қателері тұрақты API error code-тарымен қайтарылады.

## Quality gate

Әр push пен pull request-та GitHub Actions мыналарды орындайды:

1. PostgreSQL service-ін іске қосады;
2. Prisma schema-ны generate және validate етеді;
3. барлық versioned migration-ды бос базаға қолданады;
4. TypeScript strict typecheck орындайды;
5. ESLint complexity, nesting және файл ұзындығы шектерін тексереді;
6. unit test пен coverage threshold-тарды тексереді;
7. production build жасайды.

2026-09-17: 47 test өтті, оның 10-ы нақты PostgreSQL integration тесті. Coverage конфигурациясына кірген код: lines 99.38%, branches 96.55%, functions 100%. Бұл бүкіл backend немесе HTTP e2e coverage көрсеткіші емес.

## Келесі орындалу реті

~~~mermaid
flowchart LR
    A["IAM hardening"] --> D["Private discovery"]
    D --> C["Contract draft"]
    C --> F["Funding evidence"]
    F --> S["Schedule"]
    S --> UI["Front vertical slice"]
~~~

1. Email verification backend және Front verification беті аяқталды; нақты SMTP staging delivery/inbox тексеруі қалды.
2. Invite-only loan request/offer/proposal use cases.
3. Бір ұсынысты қабылдағанда қалған proposal-дарды атомарлы жабу.
4. Contract version және екі тараптың қол қою workflow-ы — орындалды: [contract signing](../01-business/CONTRACT_SIGNING.md).
5. Funding evidence және 72 сағаттық borrower confirmation — metadata/confirmation, S3-compatible signed upload/download, HEAD verification, trusted scan verdict registry және orphan cleanup орындалды; external scanner integration, staging acceptance және consumed-evidence retention policy қалды.
6. Deterministic repayment schedule, payment confirmation және reversal — орындалды.
7. Notification outbox, claim/retry worker, provider-neutral dispatch boundary, one-shot orchestrator, PostgreSQL-backed token-protected aggregate metrics және Kubernetes CronJob template — орындалды; нақты provider rollout, queue trigger, external collector және alerting қалды.
8. Front vertical slice: auth → email verification → private discovery/proposal → read-only contract draft → read-only funding/schedule/payment lifecycle → profile/privacy settings → guarded account-deletion request. Admin vertical slice те басталды: public liveness + server-rendered database readiness + evidence/notification aggregate operations visibility; mutations және identity-level audit feed өшірулі.

## Production-ға жіберілмейтін мүмкіндіктер

Қазақстан бойынша құқықтық қорытынды жасалғанша public marketplace, penalty/late fee, automated enforcement, platform custody және amount-based commission өшірулі қалады.

## Session logout

`POST /api/v1/auth/logout` Bearer token арқылы ағымдағы сессияны тоқтатады (204).
Әр қорғалған сұраныста session owner, revokedAt, expiresAt және User.status тексеріледі.
Тоқтатылған session-мен қайталанған HTTP сұраныс 401 қайтарады. Revoke дерекқор операциясы идемпотентті.
[CI run 35220576826](https://github.com/nurgeldiserikbay/QaryzLinkBack/actions/runs/35220576826): migration, typecheck, lint, 34 test және build сәтті өтті.

Қосымша архитектуралық талдау: [Graphify қолдану тәртібі](GRAPHIFY.md).

## Auth hardening аяқталды

Shared PostgreSQL rate limit, atomic refresh rotation және forged forwarded header қорғанысы қосылды. Толық шешім: [ADR-0005](../../adr/ADR-0005-auth-concurrency-and-rate-limits.md).

[CI run 35244669259](https://github.com/nurgeldiserikbay/QaryzLinkBack/actions/runs/35244669259): Prisma format/validate, migration, typecheck, lint, 47 test және build өтті. Бұл тарихи auth кезеңінің нәтижесі; email verification келесі кезеңде қосылды.

## Email verification аяқталды

[CI run 35305836411](https://github.com/nurgeldiserikbay/QaryzLinkBack/actions/runs/35305836411), commit 8483592cb17c7c736cd48593bb0425c82edd3b83:
Prisma format/generate/validate, үш migration, TypeScript, ESLint, 18 файлдағы 73 test және production build өтті.
Coverage конфигурациясына кірген код: lines/statements 99.47%, branches 97.19%, functions 100%; бұл толық HTTP e2e coverage емес.

Бір реттік 15 минуттық token, атомарлы confirm, resend лимиті және SMTP adapter қосылды.
QaryzLinkFront PR #13 email verification page, fragment token parsing, resend/status және explicit confirm flow қосты; тіркелуден кейін user осы бетке өтеді. Нақты SMTP жеткізу/inbox placement staging-та әлі тексерілмеген; MAIL_ENABLED=false әдепкі күйде.
Шешім мен workflow: [ADR-0006](../../adr/ADR-0006-email-verification.md).
Орнату: [Deployment](../06-operations/DEPLOYMENT.md), [иесінен қажет мәліметтер](../06-operations/OWNER_CHECKLIST.md), [release checklist](../06-operations/RELEASE_CHECKLIST.md).


## Front user vertical slice — 2026-09-26

QaryzLinkFront PR #13 merged at `e96dba3`: email verification journey Backend `/api/v1/auth/email/*` contract-ына қосылды. Token URL fragment-тен ғана оқылады, confirm explicit user action арқылы орындалады, 401/400/429/503 күйлері privacy-safe UI state-терге mapped.

QaryzLinkFront PR #14 merged at `ba3221a`: authenticated `/dashboard/settings` page Backend `GET/PATCH /api/v1/profile/me` contract-ын қолданады. User display name/timezone, publicId/contact search visibility, public profile opt-in, analytics consent және optional email notification preference-ін өзі басқарады.

Front-та бұған дейін auth/register, private discovery list/create/detail, exact invitation, role-aware proposal/decision және read-only contract draft бар. QaryzLinkFront PR #15 contract detail бетіне funding күйі, келесі unpaid schedule item және confirmed payment total үшін read-only lifecycle summary қосты.

QaryzLinkFront PR #16 merged at `39213e4`: settings ішіне account deletion request flow қосылды. Destructive action profile save form-нан бөлек, user `ЖОЮ` деп explicit confirmation енгізеді, содан кейін `POST /api/v1/profile/me/deletion-request` шақырылады. Backend request-ті қабылдағанда барлық active session revoke етеді; Front local sessionStorage-ды да дереу тазалап, instant hard-delete емес, grace/retention-aware processing екенін көрсететін accepted state-ке өтеді. UI fixed deletion date уәде етпейді және retained contract/payment/ledger/evidence records туралы ескертеді.

Public marketplace, contract signing mutation, funding/payment mutation және production evidence upload UI legal/operations gate өтпейінше Front-та қосылмайды.


## Admin operations visibility — 2026-09-26

QaryzLinkAdmin PR #9 merged at `8757850`: protected `GET /api/v1/metrics/evidence` counters server-side ғана оқылады. `METRICS_ACCESS_TOKEN` browser code-қа шықпайды; Admin тек active/expired/consumed upload intent, malware verdict totals және orphan age сияқты aggregate көрсеткіштерді қабылдайды. Unexpected user/object/hash fields strict response validation арқылы reject болады.

QaryzLinkBack PR #111 merged at `87ce73a`: notification delivery metrics process-local memory-ден PostgreSQL singleton aggregate snapshot-қа көшті. One-shot `pnpm notifications:run` процесі мен API процесі енді бір counters state-ті бөліседі; migration, PostgreSQL integration test, compiled smoke және container security scan green болды (CI 36237408886, Supply Chain 36237408938).

QaryzLinkAdmin PR #10 merged at `a596ddd`: notification scheduler runs/claimed/sent/pending/failed және last-run timing server-rendered operations card ретінде қосылды. Бұл card Backend #111-ге тәуелді; recipient, payload және contact data Admin contract-ына кірмейді.

QaryzLinkAdmin PR #11 merged at `18d7310`: public `GET /api/v1/health/ready` contract server-side readiness card-қа қосылды. Admin тек `ready/not_ready` және sanitized `database: up/down` күйін қабылдайды; HTTP 503 not-ready state ретінде көрсетіледі, ал күтпеген dependency details немесе status/body mismatch fail-closed reject болады.

QaryzLinkBack PR #112 merged at `53c158a`: protected `GET /api/v1/metrics/audit` aggregate-only audit snapshot қосты. Response тек total event count, соңғы 24 сағат/7 күн counts, соңғы 7 күндегі actorless event count және capture time қайтарады; actorUserId, entityId, requestId, action және payload endpoint contract-ына кірмейді.

QaryzLinkAdmin PR #12 merged at `d7b14bf`: audit placeholder server-rendered aggregate operations card-пен ауыстырылды. Client exact aggregate schema-ны ғана қабылдайды және identity/entity/payload өрістері пайда болса fail-closed reject етеді. METRICS_ACCESS_TOKEN browser bundle-ға шықпайды.

QaryzLinkBack PR #113 merged at `e46cb55`: protected `GET /api/v1/metrics/account-deletions` deletion lifecycle backlog-ты aggregate түрде шығарады. Response REQUESTED, RETENTION_HOLD, READY, COMPLETED counts, oldest pending age және capture time ғана береді; userId, requestId, email/phone және request detail өрістері contract-қа кірмейді.

QaryzLinkAdmin PR #14 merged at `2ebda23`: account deletion retention queue server-rendered operations card ретінде қосылды. Admin identity-level deletion review немесе mutation жасамайды; exact aggregate schema-дан артық identity/request fields fail-closed reject болады.

QaryzLinkBack PR #114 merged at `1eaf8e5`: account anonymization кезінде deleted `publicId` және password placeholder енді internal userId-ден deterministic SHA-256 арқылы туындамайды. Оның орнына cryptographically random opaque token қолданылады, сондықтан retained internal user identifier мен anonymized external placeholder арасында қажетсіз корреляция қалмайды.

QaryzLinkBack PR #115 merged at `ff50158`: compiled application smoke test notifications, evidence, audit және account-deletion metrics endpoint-терін толық қамтиды. Әр endpoint token-сыз 401, valid `METRICS_ACCESS_TOKEN`-мен 200 беруі тиіс; authorized JSON ішінде email, phone, userId, objectKey, sha256, entityId, requestId немесе payload field-тері болмауы CI gate арқылы тексеріледі.

QaryzLinkBack PR #116 merged at `9e0a57c`: `accounts:deletion:run` one-shot maintenance command notification/evidence command-тарымен бір failure contract-қа келтірілді. Command aggregate readiness/anonymization result-ін structured түрде логтайды, application context-ті жабады және bootstrap/processor қатесінде sanitized error + non-zero exit code береді.

QaryzLinkBack PR #117 merged at `d89699b`: compiled `accounts:deletion:run` command CI smoke gate-ке қосылды. Алғашқы smoke successful result stdout-та observable емес екенін тапты; command machine-readable aggregate JSON stdout contract-ына түзетілді, failure generic stderr + non-zero exit күйінде қалды. Empty migrated CI database-та `evaluated=0` және `completed=0` runtime smoke арқылы бекітілді.

QaryzLinkBack PR #122 merged at `e7a2866`: compiled HTTP security smoke fresh account privacy defaults-тың closed күйін, account deletion request-тің 202 REQUESTED contract-ын және deletion request-тен кейін сол active bearer session-ның дереу 401 болуын end-to-end тексереді.

Support/incident/dispute operational baseline Docs-та `INCIDENT_RESPONSE.md` және `SUPPORT_AND_DISPUTES.md` runbook-тарымен толықтырылды. Нақты support owner/channel, legal escalation contact және response target public pilot алдында owner тарапынан бекітіледі.

Admin mutations, identity-level audit feed, contract/funding/payment management әрекеттері әлі өшірулі. Бұл кезең operational visibility ғана.


## HTTP/browser hardening — 2026-09-26

QaryzLinkBack PR #118 merged at `7147af8`: reverse-proxy client IP trust енді explicit `TRUST_PROXY_HOPS` арқылы 0–3 hop диапазонында басқарылады. Әдепкі 0 кезінде Fastify `trustProxy=false` болып қалады; forged `X-Forwarded-For`/Forwarded header auth rate-limit identity-ін өзгерте алмайды. Compiled HTTP smoke әр login attempt-та forged IP-ді ауыстырып, соған қарамастан transport-IP budget sixth attempt-те 429 беретіні тексерілді. Non-zero hop тек staging ingress topology/header sanitization acceptance-тен кейін қойылады.

QaryzLinkBack PR #119 merged at `4d100d1`: compiled application smoke synthetic exact CORS allowlist-пен іске қосылып, тек configured origin үшін `Access-Control-Allow-Origin`/credentials header барын және бөтен origin үшін allow-origin жоқ екенін тексереді.

QaryzLinkBack PR #121 merged at `6d352d5`: `EXPOSE_API_DOCS` validated configuration-ға кірді және production-та true болса startup fail-fast тоқтайды. Staging explicit opt-in жасай алады; production Swagger exposure environment flag арқылы кездейсоқ қосылмайды.

QaryzLinkFront PR #17 merged at `c3c89e7` және QaryzLinkAdmin PR #16 merged at `bf4b4e9`: browser CSP `connect-src` generic `https:` рұқсатынан exact public API origin allowlist-ке тарылды. Production-та `'self'` + `NEXT_PUBLIC_API_BASE_URL` origin ғана; Admin server-only `QARYZLINK_API_BASE_URL` және `METRICS_ACCESS_TOKEN` browser CSP-ге кірмейді.

QaryzLinkFront PR #18 merged at `f60bf6c` және QaryzLinkAdmin PR #17 merged at `a1c6372`: CI production Next server-ді нақты іске қосып, HTTP response-та CSP exact API origin, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` және `X-Powered-By` жоқтығын runtime smoke арқылы тексереді. Synthetic API origin тек екінші production build/smoke қадамына scoped, сондықтан API client unit tests өз deterministic local configuration-мен қалады.


## Funding evidence және borrower confirmation

QaryzLinkBack PR #3 merged: signed contract енді Funding EVIDENCE_REQUIRED жасайды. Lender private object key + SHA-256 metadata береді, borrower CONFIRM/DISPUTE шешімін сақтайды. CONFIRMED болғанда ғана Contract ACTIVE болады.

API guide: [FUNDING_EVIDENCE](../01-business/FUNDING_EVIDENCE.md). ADR: [ADR-0009](../../adr/ADR-0009-funding-evidence-and-confirmation.md).

## Evidence upload intent hardening

QaryzLinkBack PR #94 және #97 merged: funding/payment evidence submission енді міндетті single-use upload intent UUID қабылдайды. Intent authenticated user, contract, purpose, objectKey, SHA-256, media type және expected size-қа байланған; expired, mismatched немесе replay intent conditional update арқылы қабылданбайды. Intent consume және evidence persistence бір database transaction ішінде орындалады.

QaryzLinkBack PR #99 provider-neutral signed upload authorization boundary қосты: intent response storage adapter configured болса қысқа мерзімді PUT URL/headers береді; әдепкі adapter deliberately unavailable және 503 EVIDENCE_STORAGE_UNAVAILABLE арқылы fail-closed қалады.

QaryzLinkBack PR #100 storage object verification boundary қосты: evidence persistence алдында authenticated scope prefix, SHA-256, media type, expected size және malware scan `CLEAN` күйі тексеріледі. Missing/mismatched/non-clean object fail-closed қабылданбайды; inspector provider қатесі 503 EVIDENCE_STORAGE_UNAVAILABLE болады.

QaryzLinkBack PR #101 persisted funding/payment evidence үшін participant-only signed download boundary қосты. Тек verified active borrower/lender қысқа мерзімді GET authorization ала алады; outsider және unknown evidence privacy-safe бірдей `EVIDENCE_NOT_FOUND` береді.

QaryzLinkBack PR #102 concrete dependency-free AWS Signature V4 S3-compatible PUT/GET signer қосты. PR #103 signed HEAD inspection арқылы content type, content length, expected SHA-256/size metadata-ны тексереді және trusted malware verdict болмаса fail-closed қалады. PR #104 objectKey + SHA-256 бойынша PostgreSQL malware verdict registry және token-protected callback қосты; stale/replayed callback CLEAN/INFECTED күйін төмендете алмайды. PR #105 expired unconsumed upload object-терін қауіпсіз жоятын cleanup service қосты. PR #106 one-shot cleanup command пен hardened Kubernetes CronJob template арқылы осы cleanup-ты operational schedule-ге шығарды. PR #107 signed download алдында current malware verdict-ті қайта тексереді, сондықтан кейін INFECTED/FAILED/PENDING болған persisted evidence жаңа GET authorization ала алмайды. PR #108 trusted INFECTED verdict сақталғаннан кейін private object-ті дереу purge етеді; delete уақытша сәтсіз болса scanner 503 алып retry жасай алады, ал verdict fail-closed күйде қалады. PR #109 protected `/api/v1/metrics/evidence` endpoint арқылы expired orphan backlog, consumed/unconsumed intent және CLEAN/INFECTED/FAILED verdict aggregate counters-ын PII-сыз monitoring-ке шығарады. PR #110 scanner callback verdict-ін issued upload intent-ке exact objectKey + SHA-256 бойынша байлап, never-issued және expired-unconsumed object verdict-терін fail-closed reject етеді; consumed evidence later re-scan үшін сақталады.

Бұл private object storage production-ready дегенді білдірмейді. Нақты bucket/least-privilege credential, external scanner/event integration, staging end-to-end acceptance, metrics collector/alert thresholds және consumed evidence retention/deletion policy environment/legal gate ретінде ашық қалады. Operations guide: [EVIDENCE_STORAGE](../06-operations/EVIDENCE_STORAGE.md). `EVIDENCE_STORAGE_ENABLED` осы acceptance өтпейінше production-да қосылмайды.

## Contract draft және dual acknowledgement

QaryzLinkBack PR #2 merged: accepted proposal-дан immutable ContractVersion v1 жасалады, тараптар дәл сол SHA-256 hash-ті acknowledgement ретінде растайды, екінші растауда ғана Contract.SIGNED болады. Бұл заңды qualified e-signature емес және ақша аударымын растамайды.

API guide: [CONTRACT_SIGNING](../01-business/CONTRACT_SIGNING.md). ADR: [ADR-0008](../../adr/ADR-0008-contract-draft-and-dual-acknowledgement.md).

## Private discovery

Backend branch `gpt/private-discovery`-де request/invitation/proposal workflow, idempotency receipts, PostgreSQL locks, privacy checks және HTTP validation бар. 97 test өткен baseline-ға discovery тесттері қосылды. Public marketplace, negotiation, contract және funding әлі production-ready емес.

ADR: [ADR-0007](../../adr/ADR-0007-private-discovery.md). API guide: [PRIVATE_DISCOVERY](../01-business/PRIVATE_DISCOVERY.md).


## Repayment schedule generation

QaryzLinkBack PR #4: Funding CONFIRMED болғаннан кейін ScheduleVersion және бір AT_MATURITY ScheduleItem жасалады. Есептеу ACT_365_FIXED_HALF_UP_V1 арқылы integer minor units-та орындалады; бір inputHash қайта сұралса, сол нұсқа қайтарылады.

API guide: [REPAYMENT_SCHEDULE](../01-business/REPAYMENT_SCHEDULE.md). ADR: [ADR-0010](../../adr/ADR-0010-deterministic-repayment-schedule.md).


## Repayment payment ledger

QaryzLinkBack PR #5 merged: borrower төлем дәлелін және amount/paidAt metadata береді, lender CONFIRM немесе DISPUTE жасайды. CONFIRMED төлем latest ScheduleVersion item-деріне charge → interest → principal ретімен бөлінеді; артық сома payment.unallocatedMinor ретінде сақталады. PaymentAllocation және екі жақты obligation ledger бір транзакцияда жасалады.

API guide: [PAYMENT_LEDGER](../01-business/PAYMENT_LEDGER.md). ADR: [ADR-0011](../../adr/ADR-0011-repayment-evidence-confirmation-and-ledger.md).


## Due/overdue worker

QaryzLinkBack PR #6 merged: OverdueWorker database UTC date арқылы unpaid schedule items-ті DUE немесе OVERDUE күйіне ауыстырады. PAID және CANCELLED қайта ашылмайды. Worker injectable service ретінде берілген; multi-replica API ішіндегі cron әдейі қосылмаған.

API guide: [OVERDUE_WORKER](../01-business/OVERDUE_WORKER.md). ADR: [ADR-0012](../../adr/ADR-0012-idempotent-overdue-status-materialization.md).


## Payment reversal

QaryzLinkBack PR #7 merged: lender тек CONFIRMED төлемді міндетті себеппен кері жаза алады. Original payment жойылмайды; REVERSED event reversalOfId арқылы байланысады. Signed allocation кесте балансын қалпына келтіреді, ал ledger-ге қарама-қарсы жазбалар бір транзакцияда қосылады. Бұл операция ақша аудару/қайтару емес.

API guide: [PAYMENT_REVERSAL](../01-business/PAYMENT_REVERSAL.md). ADR: [ADR-0013](../../adr/ADR-0013-immutable-payment-reversal.md).

[CI run 35368226481](https://github.com/nurgeldiserikbay/QaryzLinkBack/actions/runs/35368226481): Prisma migration, typecheck, lint, coverage, build және smoke test сәтті өтті.


## Notification outbox

QaryzLinkBack PR #8 merged: payment CONFIRMED және REVERSED операцияларымен бір транзакцияда privacy-safe NotificationOutbox intent жасалады. Бірегей idempotencyKey қайталап орындағанда duplicate event жасалуына жол бермейді. Қазіргі slice хабарлама жібермейді; provider adapter, claim/retry worker және scheduler бөлек кезеңде қосылады.

API/backend guide: [NOTIFICATION_OUTBOX](../01-business/NOTIFICATION_OUTBOX.md). ADR: [ADR-0014](../../adr/ADR-0014-transactional-notification-outbox.md).

[CI run 35426502155](https://github.com/nurgeldiserikbay/QaryzLinkBack/actions/runs/35426502155): migration, typecheck, lint, coverage, build және smoke test сәтті өтті.


## Notification claim/retry worker

QaryzLinkBack PR #9 merged: NotificationOutboxWorker due rows-ты PostgreSQL FOR UPDATE SKIP LOCKED арқылы атомарлы claim етеді. PROCESSING lease бес минут; қайта іске қосылған worker stale lease-ті қалпына келтіреді. Әрекет саны 5-тен аспайды, retry delay 1 минуттан басталып бір сағатқа дейін өседі; шектен асқан event FAILED болады. Worker provider немесе scheduler шақырмайды.

API/backend guide: [NOTIFICATION_WORKER](../01-business/NOTIFICATION_WORKER.md). ADR: [ADR-0015](../../adr/ADR-0015-leased-notification-outbox-worker.md).

[CI run 35439072635](https://github.com/nurgeldiserikbay/QaryzLinkBack/actions/runs/35439072635): migration, typecheck, lint, coverage, build және smoke test сәтті өтті.


## Notification delivery boundary

QaryzLinkBack PR #10 merged: NotificationDeliveryPort және dispatch service provider-specific кодты outbox lifecycle-ден бөледі. Сәтті adapter call ғана SENT күйіне жеткізеді; қате retry/FAILED policy-іне өтеді. Әдепкі UnavailableNotificationAdapter сыртқы хабарлама жібермей fail-closed жұмыс істейді.

API/backend guide: [NOTIFICATION_DELIVERY](../01-business/NOTIFICATION_DELIVERY.md). ADR: [ADR-0016](../../adr/ADR-0016-provider-neutral-notification-delivery.md).

[CI run 35442859823](https://github.com/nurgeldiserikbay/QaryzLinkBack/actions/runs/35442859823): migration, typecheck, lint, coverage, build және smoke test сәтті өтті.


## Notification scheduler/orchestrator

QaryzLinkBack PR #11: `NotificationSchedulerService.runOnce(limit)` worker claim-дерін delivery service арқылы ретімен dispatch етеді және `claimed/sent/pending/failed` санауыштарын қайтарады. Сервис cron, queue немесе provider credential қоспайды; оны deployment adapter кейін шақырады.

API/backend guide: [NOTIFICATION_SCHEDULER](../01-business/NOTIFICATION_SCHEDULER.md). ADR: [ADR-0017](../../adr/ADR-0017-notification-scheduler-orchestrator.md).

[CI run 35497154574](https://github.com/nurgeldiserikbay/QaryzLinkBack/actions/runs/35497154574): scheduler slice үшін typecheck, lint, coverage және build тексеріледі.


## Notification runtime configuration

QaryzLinkBack PR #12: `NOTIFICATION_BATCH_SIZE` environment variable 1–100 диапазонында тексеріледі, әдепкісі 50. Scheduler limit берілмесе осы мәнді қолданады; invalid configuration startup кезінде fail-fast тоқтайды.

Operations guide: [NOTIFICATION_RUNTIME_CONFIG](../06-operations/NOTIFICATION_RUNTIME_CONFIG.md). ADR: [ADR-0018](../../adr/ADR-0018-deployable-notification-configuration.md).

[CI run 35510328529](https://github.com/nurgeldiserikbay/QaryzLinkBack/actions/runs/35510328529): typecheck, lint, coverage және build сәтті өтті.


## Notification recipient resolution

QaryzLinkBack PR #13: delivery алдында party ID channel-specific ephemeral destination-ға аударылады. IN_APP party ID арқылы, EMAIL тек ACTIVE және verified owner email арқылы шешіледі. Destination жоқ болса provider шақырылмай, claim retry/FAILED policy-іне өтеді.

API/backend guide: [NOTIFICATION_DESTINATIONS](../01-business/NOTIFICATION_DESTINATIONS.md), [NOTIFICATION_DELIVERY](../01-business/NOTIFICATION_DELIVERY.md). ADR: [ADR-0019](../../adr/ADR-0019-notification-recipient-destinations.md).

[CI run 35512393331](https://github.com/nurgeldiserikbay/QaryzLinkBack/actions/runs/35512393331): destination resolver, delivery tests, typecheck, lint, coverage және build сәтті өтті.


## Notification SMTP adapter

QaryzLinkBack PR #14: EMAIL destination-дар `SmtpNotificationAdapter` арқылы generic PII-free мәтінмен жіберіледі. `MAIL_ENABLED=false` кезінде transport құрылмайды; provider errors sanitized, ал IN_APP channel unavailable adapter арқылы fail-closed қалады.

Operations guide: [NOTIFICATION_SMTP](../06-operations/NOTIFICATION_SMTP.md). ADR: [ADR-0020](../../adr/ADR-0020-fail-closed-smtp-notifications.md).

[CI run 35514028534](https://github.com/nurgeldiserikbay/QaryzLinkBack/actions/runs/35514028534): renderer, SMTP adapter, router, typecheck, lint, coverage және build сәтті өтті.


## Notification scheduler command

QaryzLinkBack PR #15: production build құрамына бір реттік `pnpm notifications:run` command қосылды. Ол HTTP server іске қоспай, `AppModule` application context арқылы `NotificationSchedulerService.runOnce()` шақырады, aggregate counters логтайды және күтпеген bootstrap/scheduler қатесінде non-zero exit code қайтарады.

Operations guide: [NOTIFICATION_SCHEDULER](../01-business/NOTIFICATION_SCHEDULER.md), [DEPLOYMENT](../06-operations/DEPLOYMENT.md). ADR: [ADR-0021](../../adr/ADR-0021-one-shot-notification-scheduler-command.md).

[CI run 35514521800](https://github.com/nurgeldiserikbay/QaryzLinkBack/actions/runs/35514521800): migration, typecheck, lint, coverage, build және smoke test сәтті өтті.


## Notification email preference

QaryzLinkBack PR #16: profile privacy settings-ке `emailNotificationsEnabled` қосылды. `false` болса, optional EMAIL intent outbox-қа enqueue кезінде жазылмайды; IN_APP арнасы өзгермейді.

API/business guide: [NOTIFICATION_PREFERENCES](../01-business/NOTIFICATION_PREFERENCES.md), [NOTIFICATION_DESTINATIONS](../01-business/NOTIFICATION_DESTINATIONS.md). ADR: [ADR-0022](../../adr/ADR-0022-optional-email-notification-preference.md).

[CI run 35514976266](https://github.com/nurgeldiserikbay/QaryzLinkBack/actions/runs/35514976266): migration, Prisma validation, typecheck, lint, coverage, build және smoke test сәтті өтті.


## Notification delivery metrics

QaryzLinkBack PR #17 бастапқы privacy-safe metrics contract-ын қосты. QaryzLinkBack PR #111 оны PostgreSQL-backed singleton aggregate snapshot-қа ауыстырды: one-shot scheduler процесі жазған runs, claimed, sent, pending, failed және timing counters API процесінен restart-тан кейін де оқылады. Recipient, payload, contact және financial identifiers сақталмайды және endpoint арқылы шығарылмайды.

Operations guide: [NOTIFICATION_METRICS](../06-operations/NOTIFICATION_METRICS.md). ADR: [ADR-0023](../../adr/ADR-0023-notification-delivery-metrics.md).

[CI run 35516744602](https://github.com/nurgeldiserikbay/QaryzLinkBack/actions/runs/35516744602): Prisma format/generate/validate, migration, typecheck, lint, coverage, build және smoke test сәтті өтті.

Aggregate snapshot process restart кезінде жоғалмайды және scheduler/API арасында ортақ PostgreSQL арқылы көрінеді. Per-run historical telemetry әдейі сақталмайды; Prometheus/OpenTelemetry export, external collector/alerting және internal ingress acceptance кейінгі production hardening кезеңіне қалады.


## Notification metrics security

QaryzLinkBack PR #18 merged: staging және production environment үшін METRICS_ACCESS_TOKEN міндетті болды. GET /api/v1/metrics/notifications endpoint x-metrics-token header-ін timing-safe салыстыру арқылы тексереді және token жоқ/қате болса fail-closed 401 қайтарады.

[CI run 35517874174](https://github.com/nurgeldiserikbay/QaryzLinkBack/actions/runs/35517874174): typecheck, lint, coverage, build және smoke test сәтті өтті. Metrics endpoint-тің ingress арқылы тек internal қолжетімділігі staging acceptance кезінде бөлек тексеріледі.

## Notification Kubernetes scheduler

QaryzLinkDocs-та notification scheduler-ді әр бес минут сайын іске қосатын Kubernetes CronJob template қосылды. concurrencyPolicy: Forbid, backoffLimit: 0, external Secret және immutable image policy бекітілді.

Operations guide: [NOTIFICATION_CRONJOB](../06-operations/NOTIFICATION_CRONJOB.md). ADR: [ADR-0024](../../adr/ADR-0024-notification-kubernetes-cronjob.md).

Бұл template нақты cluster namespace, registry, image digest немесе secret мәндерін қамтымайды. Staging rollout және job alerting әлі release gate болып қалады.


## Notification staging smoke contract

QaryzLinkBack PR #19 merged: CI compiled smoke test енді health, unauthenticated API, metrics token жоқ жағдайындағы 401 және дұрыс METRICS_ACCESS_TOKEN header-імен 200 жауаптарын тексереді.

[CI run 35520106084](https://github.com/nurgeldiserikbay/QaryzLinkBack/actions/runs/35520106084) толық өтті. Staging үшін дәл осы contract [NOTIFICATION_CRONJOB](../06-operations/NOTIFICATION_CRONJOB.md) нұсқаулығындағы HTTP smoke checks арқылы қайталанады. Нақты Secret мәндері Docs-та сақталмайды.

## Foundation hardening update — 2026-09-21

QaryzLinkBack:

- Auth access-token guard бос bearer token, бос user/session identifier, revoked session және session storage failure жағдайларын fail-closed 401 ретінде өңдейді.
- Public health privacy contract тек status, service, timestamp және uptimeSeconds өрістерін бекітеді.
- Metrics endpoint token protection және metrics response-тың PII-сыз operational counters шекарасы тестпен бекітілген.

QaryzLinkFront:

- API client URL normalization, explicit Authorization header және typed 401/503 error mapping тесттері қосылды.
- Client session тек temporary sessionStorage арқылы save/read/clear жасайды; malformed session data discard етіледі.
- Browser metrics token қолданбайтыны contract test арқылы тексерілді.

QaryzLinkAdmin:

- Public health card read-only liveness endpoint-ке қосылады; бөлек server-rendered readiness card тек sanitized database `up/down` күйін көрсетеді.
- Evidence-storage және notification-delivery metrics server component арқылы ғана оқылады; `METRICS_ACCESS_TOKEN` browser bundle-ға шықпайды.
- Metrics clients exact aggregate schema-ны ғана қабылдайды; күтпеген identity/object/payload өрістері fail-closed reject болады.
- Audit модулі live feed-ке қосылмаған, PII hidden және mutation жоқ.
- Health response-та күтпеген identity/secret өрістері болса, Admin fail-closed режиміне өтеді.

QaryzLinkDocs:

- Staging smoke, backup/restore және privacy-safe monitoring runbook-тары қосылды.

Бұл өзгерістер Phase 1 foundation hardening болып саналады. Нақты staging deploy, restore drill және production monitoring execution әлі орындалған жоқ; олар environment owner және адам review талап етеді.


## Backend readiness — 2026-09-21

QaryzLinkBack PR #25 merged at `4c6bae889cc1915afcf99b5ac31da0b2e306631b`: public liveness contract өзгермей, бөлек `GET /api/v1/health/ready` readiness endpoint қосылды. Ол PostgreSQL dependency-ін тексереді, тек coarse `database: up/down` күйін қайтарады және dependency unavailable болса 503 fail-closed response береді. Database error details response-қа шығарылмайды.

[CI run 35596649387](https://github.com/nurgeldiserikbay/QaryzLinkBack/actions/runs/35596649387): Prisma format/generate/validate, migrations, quality checks және compiled smoke test сәтті өтті. Нақты staging readiness probe әлі environment acceptance кезінде тексеріледі.


## Dependency security gates — 2026-09-21

Production dependency audit (`pnpm audit --prod --audit-level=high`) енді Back, Front және Admin CI pipelines ішінде міндетті gate ретінде орындалады.

- QaryzLinkBack PR #26 merged at `391621a`; CI run 35618858948 passed. Audit енгізу барысында high-severity transitive advisories табылып, dependency versions/overrides түзетілді; readiness compiled smoke test те CI-ға қосылды.
- QaryzLinkFront PR #11 merged at `9d32c9b`; CI run 35621178723 passed.
- QaryzLinkAdmin PR #7 merged at `673662e`; CI run 35621228319 passed.

Бұл CI dependency gate-тері staging/production container image scanning, SBOM, secret scanning немесе runtime monitoring орындалды дегенді білдірмейді.


## Supply-chain CI — 2026-09-21

Back, Front және Admin реполарында PR/push және апталық schedule үшін full-history Gitleaks secret scan және CycloneDX SBOM generation қосылды. Барлық алғашқы тексерулер green: Back runs 35622988019/35622987930, Front 35622995911/35622995877, Admin 35623001475/35623001458. Merged commits: Back `779e96b`, Front `b1b0ddc`, Admin `af6c432`.

SBOM artifact upload әдейі өшірулі: retention/access policy әлі бекітілмеген. Container image vulnerability scan және operational security review әлі pending.


## Reproducible backend builds — 2026-09-22

- QaryzLinkBack PR #30 merged at `8c51a5b94610281b9f83a0ff56ce2c755dc65eab`.
- `pnpm-lock.yaml` is committed and pins the pnpm 12.4.2 dependency graph.
- Backend CI and Docker builds use `pnpm install --frozen-lockfile` and fail if manifests drift from the lockfile.
- CI run 35685722942 and Supply Chain Security run 35685722920 passed before merge.
- This does not claim deterministic container bytes across base-image updates; immutable production image digest pinning remains a deployment gate.


## Deployment hardening update — 2026-09-24

QaryzLinkBack PR #60–#72 кезеңінде deployment baseline және production-safety contracts күшейтілді: immutable image digest rendering, compiled maintenance runtime, Kubernetes non-root/seccomp/service-account-token hardening, bounded migration Job, zero-unavailable rolling update + startup probe, PodDisruptionBudget, hostname topology spread, API rollback runbook және isolated PostgreSQL restore-drill runbook қосылды. Тиісті CI және Supply Chain checks green болған өзгерістер main-ге merge жасалды.

Бұл код/configuration readiness қана. Нақты staging deploy, backup restore drill, ingress/TLS, SMTP delivery, object-storage security және monitoring/alerting environment owner тарапынан әлі орындалуы керек.

## GitHub Actions quota optimization — 2026-09-26

QaryzLinkBack PR #123 merged at `9e4cd2a`, QaryzLinkFront PR #21 merged at `5ca2b84`, QaryzLinkAdmin PR #20 merged at `390fa94`.

PR quality checks енді docs-only өзгерістерде skip болады және жаңа commit келгенде superseded run cancel етіледі. Supply-chain secret/SBOM workflow әр PR-да емес, main push + weekly/manual режимінде жүреді. Backend Docker+Trivy image scan weekly/manual ғана. Front/Admin security smoke `pnpm check` жасаған configured production build-ті қайта қолданады, екінші Next build жойылды.

CycloneDX SBOM 14 күндік Actions artifact ретінде сақталады. Осы өзгерістер merge кезінде GitHub Actions runner account billing/free-usage gate салдарынан job-тарды бастамады; quota қайта ашылғанда бір successful main/manual run acceptance evidence ретінде қажет.

Front/Admin initial pnpm lockfile әлі жоқ; олардағы frozen install бөлек pending reproducibility gate болып қалды.

## Ephemeral auth retention — 2026-09-26

QaryzLinkBack PR #124 merged at `73dea46`: daily one-shot cleanup expired/consumed email-verification records және expired auth rate-limit buckets-ты ғана жояды. Session, contract, payment, ledger және persisted evidence history өзгермейді. Kubernetes CronJob template пен aggregate-only command output қосылды.

Бұл өзгеріс GitHub Actions free-quota/billing gate job-тарды бастатпай тұрған кезде merge жасалды; automated verification pending. Retention boundaries `DATA_RETENTION.md` ішінде бекітілді. Full PII database encryption және legal retention periods әлі ашық release gate.

## Auth retention operations visibility — 2026-09-26

QaryzLinkBack PR #125 merged at `f7b2443`: protected `/api/v1/metrics/auth-retention` endpoint expired email-verification және expired auth rate-limit backlog counts-ты aggregate түрде береді. Identity, email, token немесе request details response-қа кірмейді; endpoint `METRICS_ACCESS_TOKEN` арқылы қорғалған.

QaryzLinkAdmin PR #22 merged at `1301fe0`: auth-retention backlog server-rendered read-only card ретінде қосылды. Client exact aggregate schema-ны ғана қабылдайды және identity/contact field пайда болса fail-closed reject етеді.

QaryzLinkBack PR #126 merged at `7887425`: quota қайта ашылғанда compiled metrics smoke жаңа auth-retention endpoint-ті де authorization/privacy contract-пен тексереді.

QaryzLinkAdmin PR #23 merged at `8d84c60`: Admin README current retention operations visibility-мен синхрондалды.

Бұл slice GitHub Actions account free-quota/billing gate салдарынан automated run орындалмай тұрған кезде merge жасалды; verification pending.

## PII encryption groundwork — 2026-09-26

QaryzLinkBack PR #127 merged at `39a9da2`: ADR-0026 implementation-ының isolated crypto primitive-і қосылды. Utility AES-256-GCM random nonce, record/field-bound AAD, versioned key ID және бөлек HMAC-SHA-256 blind lookup hash береді.

Бұл primitive әзірге Prisma schema, register/login, email verification немесе profile path-қа қосылмаған. Сондықтан production data behavior өзгермейді. Automated CI GitHub Actions free-quota/billing gate салдарынан pending; келесі кезең additive schema + dual-write migration болады және verification қайта ашылғанша big-bang cutover жасалмайды.

## PII additive storage phase — 2026-09-26

QaryzLinkBack PR #128 merged at `dda0797`: ADR-0026 Phase A additive schema енгізілді. `users` table-ға nullable `emailCiphertext`, `emailLookupHash`, `phoneCiphertext`, `phoneLookupHash`, ал email verification record-қа nullable encrypted email field қосылды. Existing plaintext columns және current auth behavior өзгермейді.

`PII_CONTACT_STORAGE_MODE` әдепкіде `plaintext`. `dual` немесе `encrypted` режимін таңдағанда active key id, versioned keyring және бөлек 32-byte blind-lookup key міндетті түрде validated; key material толық емес болса startup fail-closed.

Account anonymization болашақ encrypted/hash contact columns-ды да тазалайды. Automated CI GitHub Actions quota/billing gate салдарынан pending; additive migration + plaintext default арқасында бұл кезең behavior-preserving болып қалады.

## PII key rotation operations — 2026-09-26

QaryzLinkBack PR #137 merged at `22fff98`: bounded manual re-encryption command old-key user email/phone және active verification ciphertext-терін current active encryption key-ге ауыстырады. Lookup hash өзгермейді; result aggregate-only, partial failure retryable.

QaryzLinkBack PR #138 merged at `ead3504`: protected aggregate key-rotation backlog endpoint қосылды. PR #139 merged at `76e2d0b`: plaintext compatibility mode explicit `enabled=false` күйін қайтарады, сондықтан zero backlog retirement-ready деп қате оқылмайды.

QaryzLinkAdmin PR #25 merged at `62c1120`: old-key user/verification backlog read-only card ретінде көрінеді; contact/key/ciphertext fields client schema-да қабылданбайды.

Operational sequence `PII_KEY_ROTATION.md` runbook-ында бекітілді. Automated CI GitHub Actions quota/billing gate салдарынан pending; encrypted-mode staging acceptance және plaintext retirement әлі release gate болып қалады.

## PII plaintext retirement readiness — 2026-09-26

QaryzLinkBack PR #140 merged at `2d15c6e`: protected aggregate retirement readiness endpoint current storage mode, plaintext user/verification row counts және missing encrypted-copy counts береді. `readyToScrub=true` тек encrypted mode және zero missing encrypted copies кезінде болады.

QaryzLinkAdmin PR #26 merged at `3052470`: retirement readiness read-only card ретінде көрсетіледі; contact/identity fields exact schema contract арқылы reject болады.

`PII_PLAINTEXT_RETIREMENT.md` destructive phase-ты екіге бөледі: алдымен bounded plaintext value scrub, кейін бөлек legacy compatibility/schema column removal. Automated CI/staging acceptance орындалмайынша destructive command/migration әдейі енгізілмейді.

## Manual browser E2E harness — 2026-09-26

QaryzLinkFront PR #23 merged at `5f8e4b3`: Playwright Chromium manual-only suite landing privacy/trust copy, login navigation және 390px mobile horizontal-overflow smoke тексереді.

QaryzLinkAdmin PR #27 merged at `f3d6505`: manual-only Chromium suite read-only operations heading, disabled admin mutations, fail-closed/not-configured rendering және mobile overflow smoke тексереді.

Екі репода да browser workflow тек `workflow_dispatch` арқылы іске қосылады; PR/push кезінде автоматты түрде Actions минуттарын жұмсамайды. `@playwright/test` version 1.63.0 pin етілді. Actual browser execution GitHub Actions free-quota/billing gate ашылғаннан кейін орындалады.

## PII gated plaintext scrub — 2026-09-26

QaryzLinkBack PR #141 merged at `ebb87d2`: encrypted-mode final migration phase үшін explicit default-off bounded scrub command қосылды. `PII_PLAINTEXT_SCRUB_ENABLED=true` болмаса command fail-closed; batch 1–500.

User email/phone plaintext тек сол field-тің ciphertext + blind lookup hash екеуі де болғанда ғана null болады. Incomplete field сақталады және remaining backlog-та көрінеді. Retirement readiness енді deleted user және stale verification plaintext rows-ты да есептейді, сондықтан schema-drop алдында жалған zero болмайды.

Tooling implementation дайын, бірақ actual destructive scrub execution, plaintext column removal және automated verification әлі staging/CI gate болып қалады.

## Runtime error/log privacy hardening — 2026-09-26

QaryzLinkBack PR #144 merged at `7c81e94`: notification outbox `lastError` arbitrary provider message-терді енді сақтамайды; тек approved generic operational messages allowlist арқылы өтеді, қалғаны `Notification delivery failed` болып нормализацияланады.

Notification scheduler және evidence cleanup one-shot command-тары raw exception message орнына aggregate JSON success output және generic PII-free failure stderr қолданады. Notification scheduler empty-DB compiled command smoke CI-ға қосылды.

GitHub Actions free-quota/billing gate салдарынан automated execution pending. Staging-та actual log observation — password/token/email/SMTP response/document data жоқ екенін human acceptance арқылы әлі тексеру керек.

## Durable in-app notifications — 2026-09-26

QaryzLinkBack PR #146 merged at `3b66ce9`: IN_APP notifications durable outbox row арқылы нақты delivery path алды. Matching recipient/channel adapter success болғаннан кейін row SENT күйіне өтеді және authenticated `GET /api/v1/notifications/in-app` endpoint latest 50 metadata rows-ты ғана қайтарады. Payload/contact data inbox response-қа кірмейді.

QaryzLinkFront PR #24 merged at `9517af0`: authenticated read-only notifications page қосылды. Front тек event type, aggregate type/id және sentAt metadata оқиды; notification payload немесе қарсы тарап contact data сұралмайды.

Automated verification GitHub Actions free-quota/billing gate салдарынан pending. Нақты SMTP provider acceptance және push channel әлі бөлек release gate.

## Neutral dispute intake — 2026-09-27

QaryzLinkBack PR #147 merged at `aefcade`: placeholder DisputesModule participant-only neutral intake/read slice-қа ауыстырылды. Additive `dispute_cases` schema бір contract-қа бір case сақтайды; тек borrower/lender party case аша/оқи алады; 5–1000 таңбалық description bounded; opener party id response-қа шықпайды; audit payload description сақтамайды; contract/payment/ledger автоматты өзгермейді.

QaryzLinkFront PR #26 merged at `8d0cd99`: contract detail бетіне dispute panel қосылды. Existing case read-only көрсетіледі, case жоқ болса bounded description арқылы ашылады. Load error fail-closed, duplicate race existing case-ті қайта оқиды.

Support/admin status transitions әлі intentionally absent: нақты support owner/process және legal handling бекітілгеннен кейін ғана қосылады. Automated CI GitHub Actions quota/billing gate салдарынан pending.

## Dispute counterparty notification — 2026-09-27

QaryzLinkBack PR #148 merged at `0c9a08a`: dispute case ашылған транзакцияда қарсы contract party үшін idempotent durable `DISPUTE_OPENED` IN_APP notification enqueue болады. Event payload тек contract/dispute identifiers және status қамтиды; dispute description, contact немесе opener identity notification payload-қа кірмейді. Policy `DISPUTE_OPENED` event-ін EMAIL арнасына жіберуге тыйым салады.

QaryzLinkFront PR #27 merged at `cc3fbdc`: notifications inbox `DISPUTE_OPENED` event-ін `Дау ашылды` label-ымен көрсетеді және empty-state dispute events-ті түсіндіреді.

Automated verification GitHub Actions free-quota/billing gate салдарынан pending.

## In-app notification read state — 2026-09-27

QaryzLinkBack PR #149 merged at `a017317`: `notification_outbox` үшін nullable `readAt` қосылды. Authenticated user тек өзінің SENT/IN_APP notification row-ын idempotent mark-read ете алады; non-owned және missing row бірдей generic 404 boundary қолданады. Inbox response metadata-only болып қалады және payload/contact data шығармайды.

QaryzLinkFront PR #28 merged at `bbfdcff`: private notifications inbox unread count, unread visual state және explicit `Оқылды` action алды. 401 auth-required state-ке қайтады, басқа error privacy-safe generic UI күйінде қалады.

Automated verification GitHub Actions free-quota/billing gate салдарынан pending.

## Dispute operations visibility — 2026-09-27

QaryzLinkBack PR #150 merged at `87518f7`: protected `/api/v1/metrics/disputes` aggregate endpoint OPEN/WAITING_USER/WAITING_INTERNAL/RESOLVED/CLOSED counts, oldest active age және capture time ғана қайтарады. Description, contract ID, opener identity немесе case payload response contract-ына кірмейді.

QaryzLinkAdmin PR #28 merged at `516cafd`: dispute lifecycle server-rendered read-only operations card ретінде қосылды. Exact response schema unexpected case-content/identity fields-ті reject етеді; `METRICS_ACCESS_TOKEN` browser-ға шықпайды.

Monitoring source contract dispute backlog signal-ымен толықтырылды. Support/admin status mutations әлі intentionally disabled; actual support owner/process бекітілгеннен кейін ғана қосылады. Automated CI Actions quota gate салдарынан pending.

## Exact in-app unread count — 2026-09-27

QaryzLinkBack PR #151 merged at `d0007af`: authenticated `/api/v1/notifications/in-app/unread-count` caller-дың personal party scope-ында барлық unread SENT/IN_APP rows-ты санайды. Response тек `{ count }`; payload/contact data жоқ.

QaryzLinkFront PR #29 merged at `323b00a`: inbox latest-50 list-пен бірге exact unread count алады, сондықтан 50-ден көп unread notification болғанда UI undercount жасамайды. Visible notification mark-read болғанда total count local state-та қауіпсіз азаяды.

Automated verification GitHub Actions quota gate салдарынан pending.

## In-app mark-all-read — 2026-09-27

QaryzLinkBack PR #152 merged at `01442ba`: authenticated mark-all-read mutation caller-дың personal party scope-ындағы unread SENT/IN_APP rows-ты ғана update етеді және aggregate updated count қайтарады.

QaryzLinkFront PR #30 merged at `b6a18cf`: inbox summary бір әрекетпен барлық unread notification-ды оқылды деп белгілейді; bulk/per-item actions UI-де serialized, exact unread total success кезінде 0 болады.

Payload/contact data бұл flow-ға қосылмайды. Automated verification GitHub Actions quota gate салдарынан pending.

## Gated dispute support transitions — 2026-09-27

QaryzLinkBack PR #153 merged at `6c38b00`: internal support dispute lifecycle mutation boundary қосылды. Ол default-off `SUPPORT_DISPUTE_TRANSITIONS_ENABLED=false` gate және бөлек `SUPPORT_ACCESS_TOKEN` арқылы қорғалған; status transition state machine conservative және row-level lock арқылы serialized.

Әр нақты transition audit event жасайды, payload тек from/to status сақтайды; dispute description/contact/payment content жоқ. Admin mutation UI әдейі қосылған жоқ. Нақты support owner/process, internal ingress және staging acceptance бекітілмейінше production enablement release gate болып қалады.

Automated CI GitHub Actions free-quota/billing gate салдарынан pending.

## Dispute status notifications and password recovery — 2026-09-27

QaryzLinkBack PR #155 merged at `bf92b72`: approved support status transition кезінде borrower және lender party-ға privacy-safe durable IN_APP `DISPUTE_STATUS_CHANGED` event enqueue етіледі. Front PR #32 merged at `5d276d5`: inbox жаңа event-ті `Дау күйі өзгерді` label-ымен көрсетеді.

QaryzLinkBack PR #154 password-reset core-ды қосты. QaryzLinkBack PR #156 merged at `d88e7d4`: enumeration-safe public request/confirm endpoints, TLS SMTP reset mailer, HTTPS `PASSWORD_RESET_URL`, stricter reset rate limit және expired/consumed challenge cleanup қосылды. Successful confirm барлық active session-ды revoke етеді.

QaryzLinkFront PR #33 merged at `6786b03`: login recovery link, generic request page және URL fragment token қолданатын reset-confirm page қосылды; token оқылғаннан кейін address bar-дан өшіріледі.

Automated CI GitHub Actions quota/billing gate салдарынан pending; нақты SMTP inbox және browser acceptance әлі release gate.

## Account security operations — 2026-09-27

QaryzLinkBack PR #157 merged at `3e84a20` және QaryzLinkAdmin PR #29 merged at `d303418`: auth-retention aggregate snapshot/card енді expired/consumed password-reset challenge backlog-ты да identity/token деректерін шығармай көрсетеді.

QaryzLinkBack PR #158 merged at `25b5759`: authenticated `POST /api/v1/auth/logout-all` барлық active session-ды current user scope ішінде revoke етеді және `ALL_SESSIONS_REVOKED` audit event-те тек aggregate revoked count сақтайды.

QaryzLinkFront PR #34 merged at `fdcdf11`: Settings ішіне `Барлық құрылғылардан шығу` security control қосылды; success кезінде server sessions revoke болып, local sessionStorage тазаланып login-ге redirect болады.

Automated CI GitHub Actions quota/billing gate салдарынан pending.

## Active session management — 2026-09-27

QaryzLinkBack PR #159 merged at `979d8ce`: authenticated user latest 50 active session metadata-ны (`createdAt`, `lastUsedAt`, `expiresAt`, current flag) көре алады және нақты owned session-ды selective revoke ете алады. Backend IP, user-agent, device name немесе browser fingerprint жинамайды. Foreign/already-revoked session mutation audit event жасамайды; successful revoke PII-free `SESSION_REVOKED` audit event қалдырады.

QaryzLinkFront PR #35 merged at `3625f49`: Settings security card active session list және per-session revoke control алды. Current session revoke кезінде local sessionStorage тазаланып login-ге redirect болады. Front exact session response schema-ны ғана қабылдайды; unexpected IP/device/user-agent тәрізді tracking fields fail-closed reject етіледі.

Automated verification GitHub Actions free-quota/billing gate салдарынан pending.

## Authenticated password change — 2026-09-27

QaryzLinkBack PR #160 merged at `ea6b1be`: authenticated `POST /api/v1/auth/password/change` current password-ты тексереді, existing password policy-ді қолданады және current password reuse-қа тыйым салады. Sensitive mutation transaction current session әлі active екенін қайта тексереді; success кезінде password atomically жаңарып, барлық active session revoke болады, outstanding password-reset challenge жойылады және PII-free `PASSWORD_CHANGED` audit event тек aggregate revoked-session count сақтайды.

QaryzLinkFront PR #36 merged at `7a0df68`: Settings ішінде current/new/confirm password security card қосылды. Success кезінде local sessionStorage тазаланып login-ге redirect болады; current-password, policy және expired-session errors privacy-safe UI хабарламаларымен өңделеді.

Automated verification GitHub Actions free-quota/billing gate салдарынан pending.


## Dual-confirm contract closure — 2026-09-27

QaryzLinkBack PR #161 merged at `e351f77`: participant-only contract closure flow қосылды. Backend current contract/schedule/payment truth-тен deterministic final statement hash есептейді және Contract ACTIVE + Funding CONFIRMED + schedule outstanding = 0 + unresolved payment/dispute жоқ + unallocated credit жоқ guards-ын талап етеді.

Borrower және lender дәл сол final statement hash-ті бөлек растайды. Confirmation contract row lock ішінде snapshot-ты қайта тексереді; екінші distinct party бірдей hash-ті растағанда Contract `COMPLETED` болады және immutable `ClosureCertificate` contract/schedule hashes пен aggregate financial totals-ты snapshot ретінде сақтайды. Бірінші confirmation-нан кейін financial truth өзгерсе stale hash completion жасай алмайды.

QaryzLinkFront PR #37 merged at `45d074a`: contract detail бетіне final statement panel қосылды. UI total due/paid/outstanding, statement hash, 0/2–2/2 confirmation progress және closure certificate күйін көрсетеді; blocker reason-дарды backend contract-ынан алады және payment alone-ды debt closure деп көрсетпейді.

Толық contract: [Contract closure](../01-business/CONTRACT_CLOSURE.md).

Backend және Front PR workflow run-дары GitHub Actions quota/billing gate салдарынан runner step-теріне жетпей failure күйіне түсті: quality job жасалды, бірақ 0 step орындалды. Сондықтан бұл runs code/test failure ретінде саналмайды; автоматты quality verification quota қалпына келгенде қайта орындалуы тиіс.


## Repayment due/overdue reminders — 2026-09-27

QaryzLinkBack PR #162 merged at `50c4f93`: existing one-shot notification runtime енді delivery batch алдында due/overdue status materialization жасайды және latest schedule version бойынша borrower reminder intents генерациялайды.

MVP cadence deliberately bounded: әр ScheduleItem/channel үшін due күні бір `REPAYMENT_DUE`, ал overdue болғанда бір `REPAYMENT_OVERDUE` event. Stable idempotency key repeated scheduler runs кезінде duplicate row жасатпайды. Generator тек ACTIVE Contract + CONFIRMED Funding + outstanding latest schedule item-ді қарайды.

IN_APP intent әр eligible reminder үшін жасалады; EMAIL existing `emailNotificationsEnabled` preference boundary арқылы skip бола алады. Payload contractId, scheduleItemId, dueDate және DUE/OVERDUE state-пен шектеледі; amount, email/phone, evidence, bank data және dispute description outbox payload-қа кірмейді. Email renderer де generic subject/body ғана береді.

QaryzLinkFront PR #38 merged at `22b5826`: metadata-only inbox `REPAYMENT_DUE`, `REPAYMENT_OVERDUE` және `SCHEDULE_ITEM` labels-ын көрсетеді. Notification payload Front-қа әлі шығарылмайды.

Толық contract: [Repayment reminders](../01-business/REPAYMENT_REMINDERS.md).

Backend PR #162 және Front PR #38 workflow run-дары GitHub Actions quota/billing gate салдарынан runner step-теріне жетпей failure болды: quality jobs 0 step орындады. Бұл code/test failure емес; quota қалпына келгенде automated quality verification қайта іске қосылуы керек.


## Closure lifecycle notifications — 2026-09-27

QaryzLinkBack PR #163 merged at `7158fb5`: `CONTRACT_CLOSURE_READY` және `CONTRACT_COMPLETED` notification events қосылды.

Ready-to-close notification GET endpoint side effect-і емес. Existing notification runtime бұрын readiness intent алмаған ACTIVE + CONFIRMED candidate contracts-ты bounded 500-row scan арқылы қарайды, full closure guards-ты қайта есептейді және eligible contract үшін borrower/lender-ға IN_APP + preference-controlled EMAIL intents жасайды. Бір explicit closure confirmation да дәл сол readiness intents-ті idempotent түрде қамтамасыз етеді, сондықтан counterparty scheduler run-ды күтпейді.

Completion кезінде Contract `COMPLETED`, immutable ClosureCertificate, audit event және екі тарапқа completion notification intents бір transaction ішінде жазылады. Payload readiness үшін contractId/status, completion үшін contractId/certificateId/status metadata-мен шектеледі; amount, contact, bank/evidence немесе dispute content outbox-қа қосылмайды.

QaryzLinkFront PR #39 merged at `7c872e3`: metadata-only inbox жаңа closure event-терді `Қарызды жабуды растауға болады` және `Қарыз жабылды` label-дарымен көрсетеді.

Backend PR #163 және Front PR #39 GitHub Actions quality jobs quota/billing gate салдарынан runner step-теріне жетпей failure болды: екі job та 0 step орындады. Бұл code/test failure емес; automated quality verification quota қалпына келгенде қайта орындалуы тиіс.


## Evidence summary and immutable manifest — 2026-09-27

QaryzLinkBack PR #164 merged at `fa3b270`: participant-only evidence summary және completed contract үшін immutable evidence manifest baseline қосылды.

`GET /api/v1/contracts/:contractId/evidence-summary` contract versions/signatures, funding evidence/confirmations, schedule, payments/evidence, ledger, dispute және closure coverage-тың aggregate metadata-сын береді.

`POST /api/v1/contracts/:contractId/evidence-package` тек Contract `COMPLETED` және ClosureCertificate бар кезде бір package жасайды; repeated call existing package-ті қайтарады. Package `schemaVersion=1`, canonical JSON manifest және SHA-256 `manifestHash` сақтайды. Contract row lock + unique contract/certificate constraints concurrent duplicate creation-ды тежейді.

Manifest contract/signature hashes, funding/payment evidence SHA-256, confirmation roles/decisions, schedules, allocations, ledger, dispute status, closure confirmation/certificate және privacy-safe contract audit action/timestamp timeline-ын snapshot етеді. Storage object key, signed URL, contact/identity, confirmation reasons, dispute description, ledger metadata және audit actor ID кірмейді. Participant party IDs manifest ішінде BORROWER/LENDER role labels-пен алмастырылады.

Canonical serialization object keys-ті deterministic lexical order-мен жазады және database arrays unique business order немесе timestamp+ID secondary order арқылы тұрақтандырылған. Privacy regression test storage/reason/description/audit actor secrets manifest-ке өтпейтінін бекітеді.

QaryzLinkFront PR #40 merged at `e992bb1`: contract detail Evidence Summary panel coverage counts, dispute/closure күйі және package metadata көрсетеді. Closure completed болғанда user immutable manifest жасай алады; UI raw manifest-ті әдейі discard етеді және тек schema version/hash/createdAt көрсетеді.

Толық contract: [Evidence summary and immutable manifest](../01-business/EVIDENCE_SUMMARY.md).

Бұл Phase 2 baseline court-ready PDF/ZIP export емес. PDF/ZIP, selected raw evidence binaries, manifest signing, trusted timestamp және jurisdiction-specific export Phase 4 Trust & Evidence scope-ында қалады.

Backend PR #164 соңғы quality run және Front PR #40 quality run GitHub Actions quota/billing gate салдарынан 0 step орындады. Сондықтан automated Prisma/typecheck/lint/test/build verification pending және quota қалпына келгенде қайта жүргізілуі керек.


## Phase 2 critical lifecycle and isolation harness — 2026-09-27

QaryzLinkBack PR #165 merged at `ac34914`: real PostgreSQL critical integration harness Private Debt MVP lifecycle-ін request/invite → proposal/accept → contract draft → dual signing → funding evidence/confirmation → schedule → exact repayment confirmation → ledger → dual closure → immutable evidence package ретімен тексереді.

Evidence storage operational rollout-ын жалған түрде green қылмау үшін external object verifier test-only no-op adapter-мен ауыстырылады, бірақ scoped one-time `EvidenceUploadIntent` rows нақты database-та жасалып, funding/payment repositories арқылы atomically consume болады.

Harness мыналарды assert етеді:
- exact repayment кейін `unallocatedMinor=0`, schedule item `PAID`, ledger sequence 1/2;
- Contract `COMPLETED`, ClosureCertificate бар;
- EvidencePackage create idempotent және SHA-256 manifest hash бар;
- participant outputs/manifest evidence `objectKey` және user ID шығармайды;
- unrelated verified user contract/funding/schedule/closure/evidence resources-қа кіре алмайды, payment list unknown contract-пен бірдей empty shape береді;
- PAYMENT_CONFIRMED / CONTRACT_CLOSURE_READY / CONTRACT_COMPLETED outbox events тек contract тараптарына арналған және sensitive payload field-тері жоқ.

Compiled HTTP smoke closure, evidence summary/package, funding, schedule және payment participant endpoints-тің unauthenticated request үшін 401 болуын да тексереді.

Fixture cleanup тек сол test жасаған party ID-лермен шектеледі; parallel PostgreSQL tests үшін global synthetic selector қолданылмайды.

PR #165 workflow run `36331025648` GitHub Actions quota/billing gate салдарынан quality job құрғанымен 0 step орындады. Сондықтан harness **implemented**, бірақ current code үшін successful PostgreSQL/typecheck/lint/build execution evidence pending. Phase 2 `critical E2E flows green` exit criterion әлі formal жабылған жоқ.

Толық acceptance contract: [Phase 2 critical E2E](PHASE2_CRITICAL_E2E.md).


## KZ/RU Phase 2 journey localization — 2026-09-27

QaryzLinkFront үш incremental slice арқылы Private Debt MVP user-facing presentation-ды KZ/RU режиміне көшірді.

PR #41 merged at `348023f`: app-wide locale provider, persistent `qaryzlink.locale`, document lang sync, ҚАЗ/РУС switcher, landing/login/register/dashboard/new-request foundation. Негізгі catalog 83/83 key parity.

PR #42 merged at `07d89bc`: request/proposal/invite/decision/contract-draft, contract detail, funding/schedule/payment lifecycle, closure, evidence және dispute panels locale-aware болды. Critical journey catalog 149/149 key parity; financial/status helpers KZ default-ты сақтай отырып RU presentation алды.

PR #43 merged at `4c9772d`: email verification, password recovery/reset, notification inbox, profile/privacy settings, password change, active sessions және account deletion KZ/RU болды. Account lifecycle catalog 135/135 key parity; destructive deletion confirmation KZ-де `ЖОЮ`, RU-де `УДАЛИТЬ`.

Playwright implementation RU locale persistence, 390px overflow және request/contract/account lifecycle unauthenticated safe-state routes-ты қамтиды. Бірақ Front #41/#42/#43 quality runs GitHub Actions quota/billing gate салдарынан quality job құрғанымен 0 step орындады. Manual-only Browser E2E де current main үшін actual runner-де орындалмады.

Сондықтан `KZ/RU full journey` үшін **presentation implementation coverage ready**, бірақ real authenticated borrower/lender staging/browser execution evidence pending. Formal Phase 2 exit criterion әлі жабылған жоқ.

Толық acceptance contract: [Phase 2 KZ/RU journey](PHASE2_KZ_RU_JOURNEY.md).


## Privacy-safe release preflight — 2026-09-27

QaryzLinkBack PR #166 merged at `a359c0d`: compiled `pnpm release:preflight` one-shot command қосылды.

Command staging/production environment, live PostgreSQL readiness, CORS presence, PII mode және product/operations feature gates-ті secret-free aggregate JSON ретінде бағалайды. Development/test environment, unavailable database немесе public marketplace/penalty/amount-based commission enablement `fail` береді.

TRUST_PROXY_HOPS topology, SMTP inbox/provider, evidence storage/scanner, enabled contract-signing legal gate және support mutation process автоматты `pass` болмайды; олар `manual` болып қалады. Осылайша preflight external staging acceptance-ті жалған green етпейді.

CI compiled command-ты staging-like config + disposable PostgreSQL-пен smoke жасауға және output ішінде secret-like field атауы шықпауына арналған gate алды. PR #166 workflow run `36334974547` GitHub Actions quota/billing gate салдарынан quality job құрғанымен 0 step орындады, сондықтан current main үшін actual compiled preflight run evidence pending.

Runbook: [Release preflight](../06-operations/RELEASE_PREFLIGHT.md).


## Phase 3 public lender offer foundation — 2026-09-27

QaryzLinkBack PR #167 merged at `272d69c`.

Existing `LoanOffer` schema негізінде default-off public marketplace foundation қосылды:

- verified active KZ personal lender public offer жасайды;
- amount/term/rate/response bounds domain policy арқылы тексеріледі;
- per-lender `MAX_ACTIVE_PUBLIC_OFFERS` concurrent create кезінде user-row serialization арқылы сақталады;
- create/cancel idempotent discovery command және privacy-safe audit event жасайды;
- active owner cancel қауіпсіздік әрекеті ретінде қайта email verification талап етпейді;
- verified borrower amount/term бойынша privacy-safe browse жасай алады;
- own offers, expired offers және екі бағыттағы PartyBlock relationship browse-тан жасырылады;
- browse lender userId/partyId/publicId/email/phone/display name шығармайды;
- compiled HTTP smoke unauthenticated `/api/v1/discovery/offers` үшін 401 boundary қосады.

Environment default-та `PUBLIC_MARKETPLACE_ENABLED=false`. Release preflight-та marketplace/penalty/amount-based commission restricted feature тобының кез келгені true болса `fail`. Сондықтан бұл merge staging/production marketplace enablement емес.

PR #167 workflow run `36335973418` quality job құрғанымен GitHub Actions quota/billing gate салдарынан 0 step орындады. Automated PostgreSQL/typecheck/lint/build evidence pending.

Толық contract: [Public lender offers](../01-business/PUBLIC_LENDER_OFFERS.md).


## Phase 3 public offer applications — 2026-09-27

QaryzLinkBack PR #168 merged at `49dfd02`.

New `OfferApplication` lifecycle public LoanOffer мен existing exact borrower LoanRequest арасында versioned bridge береді. Application immutable identity-free offer snapshot сақтайды. Lender ACCEPT current mutable offer terms-ін емес, application snapshot-ын қолданып concrete Proposal жасайды; Contract автоматты түрде жасалмайды. Borrower Proposal-ды existing explicit decision flow арқылы кейін бөлек ACCEPT етеді.

Participant inbox borrower/lender role, financial request metadata, offer snapshot, status және optional proposalId ғана шығарады; userId/partyId/publicId/displayName/email/phone response-қа кірмейді. Block state application create және lender ACCEPT алдында қайта тексеріледі. Daily application quota concurrent commands кезінде serialized.

Offer cancellation pending applications-ды SUPERSEDED етеді; borrower бір Proposal-ды қабылдағанда rival PENDING/ACCEPTED applications SUPERSEDED болады. Winning application ACCEPTED history ретінде қалады.

Migration: `20260927193000_offer_applications`. Config: `MAX_OUTGOING_APPLICATIONS_PER_DAY` default 10.

PR #168 workflow run `36336963501` GitHub Actions quota/billing gate салдарынан quality job құрғанымен 0 step орындады. Automated Prisma/typecheck/lint/PostgreSQL/build evidence pending.

Feature `PUBLIC_MARKETPLACE_ENABLED=false` gate артында қалады және release preflight enabled marketplace-ті legal approval-ға дейін fail етеді.

Толық contract: [Public offer applications](../01-business/PUBLIC_OFFER_APPLICATIONS.md).


## Phase 3 application lifecycle notifications — 2026-09-27

QaryzLinkBack PR #169 merged at `2be3c4f`: OfferApplication create/accept/reject/withdraw state changes durable IN_APP outbox event-терімен transactionally байланыстырылды.

Routing:
- CREATED → lender;
- ACCEPTED / REJECTED → borrower;
- WITHDRAWN → lender.

Payload тек applicationId, offerId, requestId және status сақтайды. Amount/rate/term, user/party/publicId, display name және contact data жоқ. Event-тер email channel-ға жіберілмейді; notification policy оларды IN_APP-only деп бекітеді. Command replay outbox idempotency арқылы duplicate event жасамайды.

QaryzLinkFront PR #44 merged at `cbc0eaf`: inbox KZ/RU режимінде осы төрт event пен OFFER_APPLICATION target label-ын көрсетеді. Front raw outbox payload-ты әлі оқымайды.

Backend PR #169 workflow run `36337328028` және Front PR #44 run `36337396219` Actions quota/billing gate салдарынан quality job құрғанымен 0 step орындады. Automated verification pending.


## Phase 3 marketplace Front workspace — 2026-09-27

QaryzLinkFront PR #45 merged at `bbd07ec`.

`/dashboard/marketplace` default-off Phase 3 workspace қосылды:

- Dashboard navigation-та KZ/RU Marketplace link;
- verified lender bounded public offer create;
- own offer list және safe ACTIVE offer cancel;
- expired own offer effective presentation;
- verified borrower identity-free public offer browse;
- offer amount/term range-іне сәйкес ACTIVE private requests ғана application selector-да көрсетіледі;
- borrower application create;
- participant application inbox;
- lender ACCEPT/REJECT және borrower WITHDRAW;
- optional proposalId presentation;
- responsive 390px mobile layout;
- KZ/RU marketplace catalog exact parity.

Privacy boundary:

- public offer UI lender userId/partyId/publicId/displayName/email/phone алмайды және көрсетпейді;
- application UI borrower/lender identity fields көрсетпейді;
- opaque offer snapshot supported financial term fields-ке narrow жасалады;
- Front filtering UX ғана; backend ownership/range/block/expiry guards authoritative.

Verification-loss boundary backend contract-пен сәйкестендірілді: unverified active user жаңа publish/browse немесе lender ACCEPT жасай алмайды, бірақ existing own offer cancel және safe application REJECT/WITHDRAW actions workspace-та жоғалмайды.

PR #45 сонымен бірге бұрынғы Front compatibility bug-ты түзетті: Backend `GET /discovery/requests` `{ items, nextCursor }` pagination shape қайтарады, ал Front raw array күтетін. `listDiscoveryRequests()` енді `page.items` unwrap етеді; Dashboard пен marketplace request selection current Backend contract-пен сәйкес.

Front PR #45 workflow run `36340201581` quality job құрғанымен GitHub Actions quota/billing gate салдарынан 0 step орындады. Сондықтан typecheck/lint/unit/build/browser automated evidence pending.

Feature әлі `PUBLIC_MARKETPLACE_ENABLED=false` default gate артында. Release preflight deployed marketplace enablement-ті legal approval-ға дейін `fail` етеді. Front implementation бұл gate-ті айналып өтпейді.


## Phase 3 public offer pause/resume — 2026-09-27

QaryzLinkBack PR #170 merged at `e0e548d`.

Public lender offer lifecycle енді reversible `PAUSED` күйін қолданады:

- owner ACTIVE offer-ды idempotent PAUSE жасай алады;
- PAUSE safe deactivation болғандықтан email re-verification талап етпейді;
- paused offer public browse және жаңа application-нан шығады;
- existing PENDING applications сақталады;
- lender ACCEPT paused offer кезінде blocked;
- owner PAUSED offer-ды terminal CANCEL жасай алады, сонда pending applications `SUPERSEDED`;
- RESUME verified owner-ды, unexpired offer-ды және current active-offer quota-ны талап етеді;
- resume quota user-row serialized command boundary ішінде қайта тексеріледі;
- pause/resume auth endpoints compiled 401 smoke list-ке қосылды;
- audit/idempotency regression status-only payload boundary-ын тексереді.

QaryzLinkFront PR #46 merged at `c914918`:

- own offer card ACTIVE / PAUSED / EXPIRED / CANCELLED effective state көрсетеді;
- ACTIVE → Pause/Cancel;
- PAUSED → Resume/Cancel;
- unverified owner terminal Cancel-ды жоғалтпайды, Resume үшін verification guidance алады;
- linked own offer PAUSED/expired/cancelled екені белгілі болса lender application ACCEPT Front-та disabled;
- unverified lender ACCEPT те disabled;
- KZ/RU marketplace catalog 75/75 key parity.

Backend PR #170 workflow run `36340663952` және Front PR #46 run `36340860165` quality job құрғанымен GitHub Actions quota/billing gate салдарынан 0 step орындады. Automated PostgreSQL/typecheck/lint/build/browser verification pending.

Marketplace әлі `PUBLIC_MARKETPLACE_ENABLED=false` default gate артында және release preflight legal approval-ға дейін deployed enablement-ті `fail` етеді.


## Phase 3 immutable public offer versioning — 2026-09-27

QaryzLinkBack PR #171 merged at `c693fcb`.

Public LoanOffer financial terms енді immutable revision history сақтайды:

- `LoanOffer.currentVersion` current materialized terms revision-ды көрсетеді;
- `LoanOfferVersion` әр version үшін identity-free immutable `termsSnapshot` сақтайды;
- migration `20260927233500_offer_versions` existing offers-ты version 1 ретінде backfill етеді;
- existing OfferApplication snapshot-тарына `offerVersion=1` backfill жасалады;
- жаңа offer atomically version 1 history row-мен бірге жасалады;
- verified owner ACTIVE немесе PAUSED, unexpired offer-ды idempotent REVISE жасай алады;
- revision status-ты өзгертпейді және expiry-ді ұзартпайды;
- no-op revision conflict;
- history `MAX_OFFER_VERSIONS` default 20, hard max 100 арқылы bounded;
- owner-only version history endpoint identity/contact fields шығармайды;
- public/owner offer read currentVersion береді.

Version semantics әдейі екіге бөлінді:

- application snapshot `version: 1` = snapshot JSON schema version;
- application snapshot `offerVersion: N` = LoanOffer business-term revision.

Existing PENDING application кейін offer terms v2/v3 болып өзгерсе де rewrite/supersede болмайды. Lender ACCEPT concrete Proposal-ды application жасалған кездегі immutable historical snapshot-тан құрады. New applications current offerVersion-ға байланысады. PostgreSQL regression incompatible later revision бұрынғы application terms-ін өзгертпейтінін тексереді.

QaryzLinkFront PR #47 merged at `ec0b6c3`:

- public/own offer card current `vN` көрсетеді;
- verified lender ACTIVE/PAUSED offer terms-ін жаңа version ретінде өзгерте алады;
- Front no-op revision-ды API-ға жібермей тоқтатады;
- owner immutable version history-ді on-demand қарайды;
- ашық history currentVersion өзгергенде refetch болады;
- application card source offerVersion көрсетеді;
- version history API жеке шағын module-ға бөлінді;
- KZ/RU marketplace catalog 87/87 parity.

Backend PR #171 workflow run `36342076280` және Front PR #47 run `36342488121` quality job құрғанымен GitHub Actions quota/billing gate салдарынан 0 step орындады. Local git clone арқылы verification жасау әрекеті execution environment сыртқы DNS-ке шыға алмағандықтан орындалмады. Сондықтан automated Prisma/typecheck/lint/unit/PostgreSQL/build/browser evidence pending; бұл runs code/test failure ретінде саналмайды.

Marketplace әлі `PUBLIC_MARKETPLACE_ENABLED=false` default gate артында. Release preflight legal approval-ға дейін deployed enablement-ті `fail` етеді.

Phase 3-те келесі implementation gaps: negotiation/counter-offer versions, moderation/spam controls, borrower-side discovery evolution және public rollout legal classification. Deterministic compatibility explanation бар, бірақ automated matching/ranking әлі жоқ.


## Phase 3 explainable compatibility — 2026-09-27

QaryzLinkBack PR #172 merged at `7271f9e`.

Exact borrower request пен public lender offer арасында deterministic compatibility explanation қосылды:

- endpoint: `GET /api/v1/discovery/offers/:offerId/compatibility?requestId=:requestId`;
- response mode `EXACT_REQUEST_V1`;
- current `offerVersion` response-қа кіреді;
- result тек `compatible`, amount/term fit booleans және stable reason codes береді;
- reason codes: `AMOUNT_BELOW_MIN`, `AMOUNT_ABOVE_MAX`, `TERM_BELOW_MIN`, `TERM_ABOVE_MAX`;
- score/rank/recommendation/ordering жоқ;
- owned ACTIVE unexpired exact request талап етіледі;
- offer ACTIVE + PUBLIC + non-own + unexpired болуы керек;
- lender ACTIVE + email verified болуы керек;
- екі бағыттағы PartyBlock visibility-ді жабады;
- cross-user request, own/blocked/ineligible offer privacy-safe unavailable shape қолданады;
- output userId/partyId/publicId/displayName/email/phone шығармайды.

Public browse consistency hardening та жасалды: lender account verification/status жоғалтса оның public offer-ы browse-тан бірден шығады. Бұрын бұл жағдай application create кезінде ғана кеш reject болуы мүмкін еді.

QaryzLinkFront PR #48 merged at `83ef3b8`:

- borrower selector енді барлық ACTIVE private request-ті көрсетеді;
- selected request үшін Backend explanation шақырылады;
- compatible request amount/term fit explanation көрсетеді;
- incompatible request deterministic reason text көрсетеді;
- Apply `compatible=true` болмайынша disabled;
- бұрынғы duplicate client-side range filter жойылды, Backend authoritative;
- UI compatibility-дің score/ranking емес екенін explicit көрсетеді;
- logic hook/panel/API шағын файлдарға бөлінді;
- KZ/RU marketplace catalog 99/99 parity.

Backend PR #172 workflow run `36343077646` және Front PR #48 run `36343406106` quality job құрғанымен GitHub Actions quota/billing gate салдарынан 0 step орындады. Бұл code/test failure evidence емес; automated verification quota қалпына келгенде қайта орындалуы тиіс.

Толық contract: [Explainable compatibility](../01-business/EXPLAINABLE_COMPATIBILITY.md).

Marketplace әлі `PUBLIC_MARKETPLACE_ENABLED=false` default gate артында; release preflight legal approval-ға дейін deployed enablement-ті `fail` етеді.


## Phase 3 marketplace moderation reporting baseline — 2026-09-28

QaryzLinkBack PR #173 merged at `094961c`.

User-driven public offer reporting baseline қосылды:

- `POST /api/v1/discovery/offers/:id/report`;
- enum-only reasons: `SPAM`, `MISLEADING_TERMS`, `SUSPICIOUS`, `OTHER`;
- free-text complaint body жоқ;
- verified active KZ personal account талап етіледі;
- тек current visible ACTIVE PUBLIC offer report болады;
- own/blocked/expired/paused/cancelled немесе ineligible lender offer privacy-safe unavailable shape қолданады;
- one account + one offer unique guard;
- daily quota `MAX_MARKETPLACE_REPORTS_PER_DAY`, default 5, hard max 50;
- idempotent Discovery command;
- report create offer lifecycle row lock-пен serialize болады;
- audit payload `{ status: "OPEN" }` ғана сақтайды.

Бұл baseline automatic ban/hide/ranking/reputation/fraud verdict жасамайды.

Backend aggregate moderation metrics:
`GET /api/v1/metrics/marketplace-reports`

тек OPEN/RESOLVED/DISMISSED counters, last-24h count, reason buckets, oldest-open age және capturedAt шығарады. User/party/offer identifiers немесе complaint content жоқ.

QaryzLinkFront PR #49 merged at `efbb69f`:

- public offer card-та compact report control;
- reason selector enum-only;
- free-text input жоқ;
- duplicate/daily-limit/feature-disabled errors privacy-safe көрсетіледі;
- success тек moderation signal жіберілгенін айтады, sanction болды деп көрсетпейді;
- KZ/RU marketplace catalog 112/112 parity.

QaryzLinkAdmin PR #30 merged at `2b3cd22`:

- protected aggregate marketplace-report metrics client;
- exact top-level және nested response shape validation;
- unexpected identifier/content field келсе fail-closed;
- operations console OPEN, last24h, RESOLVED, DISMISSED, reason buckets және oldest-open age көрсетеді;
- row-level report, reporter identity, lender identity, offerId және complaint content Admin-ға шығарылмайды;
- moderator mutations әлі жоқ.

CI evidence:
- Back PR #173 run `36380658519`;
- Front PR #49 run `36380836537`;
- Admin PR #30 run `36381075148`.

Үшеуінде де GitHub Actions quality job құрылды, бірақ quota/billing gate салдарынан **0 step** орындады. Бұл code/test failure evidence емес; automated Prisma/typecheck/lint/unit/PostgreSQL/build/browser verification quota қалпына келгенде қайта орындалуы тиіс.

Marketplace әлі `PUBLIC_MARKETPLACE_ENABLED=false` default gate артында. Release preflight legal approval-ға дейін deployed enablement-ті `fail` етеді.

Толық contract: [Marketplace moderation](../01-business/MARKETPLACE_MODERATION.md).


## Phase 3 immutable proposal negotiation — 2026-09-28

QaryzLinkBack PR #174 merged at `7877e64`.

Negotiation model existing Proposal final-accept invariant-ын бұзбайды:

- borrower PENDING lender Proposal-ға immutable counter suggestion жібереді;
- counter source Proposal terms-пен exact бірдей болса conflict;
- бір source Proposal үшін бір active PENDING counter;
- `MAX_PROPOSAL_COUNTERS_PER_DAY` default 10, hard max 50;
- create/respond active+verified participants және two-way block relationship-ті қайта тексереді;
- borrower `WITHDRAW`, lender `REJECT` safe terminal action ретінде re-verification-сыз орындала алады;
- lender counter-ды тікелей ACCEPT етпейді;
- lender RESPOND жаңа lender-authored Proposal жасайды;
- source Proposal `SUPERSEDED`, counter `RESPONDED`, `responseProposalId` сақталады;
- final Proposal ACCEPT тек borrower арқылы existing flow-да орындалады;
- source Proposal terminal болса pending counter `SUPERSEDED`;
- competing Proposal request-ті MATCHED етсе loser Proposal counters та `SUPERSEDED`;
- participant-only history userId/partyId/publicId/email/phone шығармайды;
- idempotent replay duplicate row/audit жасамайды;
- audit payload status-only boundary-ын сақтайды.

Backend PostgreSQL integration tests borrower → counter → lender response Proposal → borrower final ACCEPT lifecycle, unrelated-user isolation, block recheck, withdraw/reject, pending uniqueness, no-op, quota, idempotency және competing Proposal cleanup-ты қамтиды.

QaryzLinkFront PR #50 merged at `ac83ced`.

Request detail Proposal card ішіне KZ/RU negotiation panel қосылды:

- borrower counter form;
- exact no-op Front-та blocked;
- immutable counter history;
- lender REJECT немесе new Proposal terms-пен RESPOND;
- borrower WITHDRAW;
- response Proposal short reference;
- terminal/superseded history read-only;
- direct Counter ACCEPT UI әдейі жоқ;
- API/types жеке compact `proposal-negotiation.ts` модуліне бөлінді;
- responsive mobile styling;
- journey catalog KZ/RU 178/178 parity.

CI evidence:
- Back PR #174 run `36382300375`;
- Front PR #50 run `36415563949`.

Екі run-да да GitHub Actions `quality` job құрылды, бірақ quota/billing gate салдарынан **0 step** орындады. Бұл code/test failure evidence емес; Prisma/typecheck/lint/unit/PostgreSQL/build/browser execution quota қалпына келгенде қайта орындалуы тиіс.

Canonical contract: [Proposal negotiation](../01-business/PROPOSAL_NEGOTIATION.md).


## Phase 3 row-level marketplace moderation review — 2026-09-28

QaryzLinkBack PR #176 merged at `13f6282`.

Marketplace report moderation енді aggregate visibility-ден бөлек default-off row-level human review workflow алды:

- `GET /api/v1/internal/support/marketplace-reports?status=OPEN`;
- `PATCH /api/v1/internal/support/marketplace-reports/:reportId/status`;
- allowed terminal outcomes: `RESOLVED` және `DISMISSED`;
- queue oldest-first, bounded 50-row page;
- cursor reviewed row status өзгергеннен кейін де stable;
- queue report ID, reason/status/timestamps және non-identity offer terms ғана қайтарады;
- reporter/lender userId/partyId/publicId/displayName/email/phone және free-text complaint шығарылмайды;
- same terminal transition idempotent;
- terminal outcome rewrite conflict;
- transition audit payload тек `fromStatus/toStatus`;
- resolve/dismiss offer немесе lender account status-ын автоматты өзгертпейді.

Security gate:

- `SUPPORT_MARKETPLACE_REPORT_TRANSITIONS_ENABLED=false` default;
- server-only `SUPPORT_ACCESS_TOKEN` талап етіледі;
- release preflight support mutation enablement-ті `manual` acceptance ретінде көрсетеді;
- public marketplace gate бұдан тәуелсіз және әлі default-off.

QaryzLinkAdmin PR #31 merged at `768286d`.

Admin:

- OPEN row-level queue көрсетеді;
- exact response-shape validator unexpected identity/content field келсе fail-closed;
- support token browser props/JS-ке берілмейді;
- Resolve/Dismiss Next server action арқылы жүреді;
- report UUID және terminal status Admin server-де қайта validate болады;
- UI automatic hide/ban/ranking болмайтынын explicit көрсетеді;
- moderation mutations Admin safety metadata-да default-off.

CI evidence:

- Back PR #176 run `36424355848`: `quality` job **0 step**;
- Admin PR #31 run `36424928679`: `quality` job **0 step**.

Екі run да GitHub Actions quota/billing gate салдарынан runner step орындамаған. Бұл code/test failure evidence емес; successful CI/staging acceptance pending.

Қалған moderation gap: shared support token орнына per-staff least-privilege/JIT identity және attributable staff audit. Бұл Phase 4 staff JIT access-пен бірге орындалуы тиіс.

Толық contract: [Marketplace moderation](../01-business/MARKETPLACE_MODERATION.md).

## Phase 4 support staff attribution foundation — 2026-09-28

QaryzLinkBack PR #177 merged at `fe40ff2`: shared support mutation authorization replaced by scoped/expiring credential registry. Registry stores opaque staff id, SHA-256 token hash, expiry and scopes; dispute transitions require `disputes:write`, moderation queue `marketplace-reports:read`, moderation mutation `marketplace-reports:write`.

Successful dispute/moderation mutations audit payload-қа opaque `supportActorId` қосады. Staff name/email/raw token/token hash audit event-ке кірмейді. Backend existing `x-support-token` transport header-ді compatibility үшін сақтайды.

QaryzLinkAdmin PR #32 merged at `0ee77f3`: server-only moderation credential env атауы `SUPPORT_STAFF_TOKEN` болды. Token browser-ға шықпайды; backend actor/scope/expiry-ге resolve етеді.

Бұл backend attribution foundation ғана. Actual multi-user staff login/SSO/JIT issuance, revocation process, support owner және restricted internal ingress production enablement алдында әлі acceptance gate болып қалады.

Automated CI GitHub Actions quota/billing gate салдарынан pending.

QaryzLinkBack PR #178 merged at `7004952`: deprecated `SUPPORT_ACCESS_TOKEN` environment config толық алынып тасталды. Backend support authorization contract енді бірмәнді: `SUPPORT_STAFF_CREDENTIALS_JSON` registry + caller `x-support-token`; shared static backend token fallback жоқ.

## Phase 4 identity verification foundation — 2026-09-28

QaryzLinkBack PR #180 merged at `086893c`: provider-neutral authenticated identity-verification boundary қосылды. `IDENTITY_VERIFICATION_ENABLED=false` default, current adapter unavailable және release preflight enablement-ті `provider_adapter_unavailable` fail арқылы блоктайды.

Core start boundary provider-ге authenticated user-дың opaque subject reference-ын ғана береді; email/phone/IIN/BIN/document payload жібермейді. Provider redirect HTTPS, credential-free және future-expiry болуы тиіс, әйтпесе generic fail-closed 503.

Provider-neutral minimal L2 claim persistence/expiry/revocation core қосылды. Raw provider reference сақталмайды: normalized provider namespace-пен SHA-256 hash қана сақталады. Authenticated user privacy-safe `UNVERIFIED/VERIFIED/EXPIRED/REVOKED` status оқи алады; provider claim write/revoke mutation browser-ге ашылмайды. Кейінгі PR #199 generic signed remote session adapter + authenticated VERIFIED callback/session correlation foundation-ды қосты; нақты vetted provider mapping/revocation және KZ legal/privacy acceptance әлі Phase 4 backlog.

QaryzLinkBack PR #182 merged at `d1da649`: minimal claim persistence/expiry/revocation core. CI run `36452180331` job құрғанымен runner step орындамады, сондықтан automated Prisma/typecheck/lint/test/build verification pending.

QaryzLinkFront PR #53 merged at `4ecd179`: settings ішінде privacy-safe identity status/capability card бар. Provider disabled кезде start action көрсетілмейді; VERIFIED тек Backend authoritative claim state-тан көрсетіледі; provider identity/raw payload UI-ға шықпайды. CI run `36452734535` да runner step орындамады.

## Phase 4 contract document source — 2026-09-28

QaryzLinkBack PR #181 merged at `2941102`: verified participant-only `GET /api/v1/contracts/:contractId/document-source` endpoint қосылды. Immutable `document` section ContractVersion version/currency/principal/documentHash/termsSnapshot/calculationPolicy-ды береді; platform acknowledgement metadata бөлек section-да role/method/signedAt ретінде ғана шығады.

User/party/public/contact/display identifiers response-қа кірмейді. Lifecycle status және funding deadline immutable document source-қа әдейі кірмейді.

Immutable source үстіне deterministic technical renderer қосылады: KZ/RU locale, fixed template ID, persisted source document hash, canonical render-input hash және rendered UTF-8 content hash бөлек беріледі. Front contract detail technical preview көрсетіп, TXT download береді. Signatures/acknowledgements immutable rendered content-ке әдейі кірмейді.

QaryzLinkBack PR #183 merged at `5f96c0e`, QaryzLinkFront PR #54 merged at `d4ee270`. Екі CI run (`36453973371`, `36453978353`) job жасағанымен runner step орындамады; automated verification pending.

Бұл әлі legal PDF емес. KZ/RU legal template approval, deterministic PDF engine, final PDF artifact hash/source binding және staging visual/integrity acceptance ашық қалады.

Automated CI GitHub Actions quota/billing gate салдарынан pending.
