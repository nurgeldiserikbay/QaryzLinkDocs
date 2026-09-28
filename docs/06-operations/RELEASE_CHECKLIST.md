# Release checklist

2026-09-18: толық өнім public launch-қа дайын емес.

## Backend staging

- [ ] Нақты deploy commit-тің CI-ы жасыл.
- [x] Privacy-safe `pnpm release:preflight` command implementation + CI smoke contract бар.
- [ ] Нақты staging image/config ішінде release preflight орындалып, `fail` емес result acceptance evidence-ке жазылды.
- [ ] Жеке staging database және credentials.
- [ ] Migration сәтті; production дерегіне test орындалмайды.
- [ ] HTTPS және restricted ingress.
- [ ] Register/login/refresh/logout smoke test.
- [ ] MAIL_ENABLED=false немесе толық бапталған SMTP + Front verification page.
- [ ] Backup және restore rehearsal.
- [ ] Private object storage, signed URLs, malware scan және retention policy.
- [ ] Логтарда password, token, email, SMTP response және құжат деректері жоқ.

## Public pilot алдында инженерлік жұмыстар

- [x] Private request/invite/proposal backend және atomic acceptance тесттері.
- [x] Invite revoke/block-list, notifications, cursor pagination және business audit.
- [x] Contract draft және dual acknowledgement backend slice.
- [x] Contract signing mutation default-off gate; legal review required before enablement.
- [x] Funding evidence және borrower confirmation backend slice.
- [x] Schedule generation backend slice.
- [x] Payment evidence, confirmation және ledger backend slice.
- [x] Overdue status worker backend slice.
- [x] Payment reversal backend slice.
- [x] Transactional notification outbox persistence backend slice.
- [x] Notification outbox claim/retry worker backend slice.
- [x] Provider-neutral notification delivery boundary backend slice.
- [x] Privacy-safe notification recipient resolution backend slice.
- [x] One-shot notification scheduler/orchestrator backend slice.
- [x] Notification runtime batch configuration backend slice.
- [x] Fail-closed SMTP notification adapter backend slice.
- [x] One-shot notification scheduler executable backend slice.
- [x] Optional email notification preference backend slice.
- [x] Privacy-safe notification delivery metrics backend slice.
- [x] Metrics endpoint token protection backend slice.
- [x] Notification scheduler Kubernetes CronJob deployment contract.
- [x] Durable IN_APP delivery + authenticated latest-50 inbox backend + ownership-safe read/unread state.
- [x] Front private notifications inbox + unread count/mark-read UX.
- [ ] Нақты SMTP/push provider және queue trigger.
- [x] Provider-neutral monitoring/alert signal contract (`MONITORING_ALERTING.md`).
- [ ] External collector/provider, tuned thresholds, paging және escalation acceptance.
- [x] Backend compiled HTTP auth/security lifecycle smoke: register/login/refresh rotation/logout, authorization, rate-limit, metrics және CORS contracts.
- [x] Phase 2 critical PostgreSQL lifecycle + cross-user isolation harness implementation merged (`QaryzLinkBack#165`).
- [ ] Phase 2 critical PostgreSQL harness current main commit-те successful CI runner арқылы green болғаны дәлелденді.
- [x] Runtime/provider error persistence және maintenance CLI stderr PII-safe generic boundary.
- [x] Front/Admin production server HTTP security-header/CSP runtime smoke.
- [x] Front/Admin manual-only Chromium E2E harness дайын.
- [x] Front KZ/RU presentation coverage critical Phase 2 routes және account lifecycle бойынша implementation-да бар (Front #41/#42/#43).
- [ ] KZ authenticated borrower/lender full browser journey successful staging run.
- [ ] RU authenticated borrower/lender full browser journey successful staging run.
- [ ] Front/Admin actual browser E2E run және толық UI acceptance — Actions quota ашылғаннан кейін.
- [x] Privacy/consent defaults және ephemeral auth/evidence retention baseline.
- [ ] PII encrypted-mode staging acceptance.
- [x] PII plaintext-retirement aggregate readiness gate (`PII_PLAINTEXT_RETIREMENT.md`).
- [x] Gated bounded plaintext scrub tooling implementation.
- [ ] Actual plaintext scrub execution және кейінгі legacy column removal — тек green CI + staging acceptance кейін.
- [x] PII encryption additive/dual-write/backfill/readers/cutover guard және bounded key-rotation tooling.
- [x] PII key rotation operational runbook (`PII_KEY_ROTATION.md`).
- [ ] Contract/payment/ledger/evidence/audit/session legal retention periods owner/legal review арқылы бекітілген.
- [x] Backend reproducible lockfile, container build және runtime smoke test.
- [ ] Front/Admin committed pnpm lockfile және `--frozen-lockfile` install.
- [ ] Production migration job және rollback rehearsal.
- [x] Trusted proxy default-off bounded configuration және exact CORS allowlist code/CI contracts.
- [ ] Staging ingress proxy-hop/header sanitization acceptance — `STAGING_ACCEPTANCE.md` бойынша.
- [x] Backend privacy-safe liveness/readiness contracts және PostgreSQL readiness check.
- [ ] Staging ingress/orchestrator readiness probe нақты `/api/v1/health/ready` endpoint-іне қосылғаны тексерілді.
- [ ] Kubernetes CronJob staging rollout, immutable image verification және job alerting.
- [ ] Metrics endpoint internal ingress review және staging acceptance.
- [ ] Нақты SMTP delivery және пайдаланушының email растау flow-ы.
- [x] Password reset backend/Front flow: enumeration-safe request, one-time token, session revoke, HTTPS reset URL және retention cleanup.
- [x] Self-service logout-all sessions backend + Front security control + audit.
- [x] Authenticated current-password-confirmed password change backend + Front flow; success revokes all sessions.
- [x] Privacy-safe active session inventory + selective owned-session revoke backend/Front controls.
- [ ] Password reset нақты SMTP inbox delivery және browser acceptance.
- [x] Production dependency high/critical audit gate Back/Front/Admin CI ішінде.
- [x] Full-history secret scanning және CycloneDX SBOM generation Back/Front/Admin CI ішінде.
- [ ] SBOM artifact retention/access policy documented in `SBOM_POLICY.md`; Back/Front/Admin retention workflow-тары main-ге merged, бірақ billing/quota gate шешілгеннен кейін бір successful run-мен acceptance жабылады.
- [x] Container image HIGH/CRITICAL vulnerability scanning CI gate.
- [ ] Operational security review және нақты staging/container acceptance — `SECURITY_REVIEW.md` + `STAGING_ACCEPTANCE.md` бойынша орындалады.

## Өнім мен құқықтық gate

- [ ] Жеке тұлғаларға арналған Қазақстан pilot scope-ы бекітілген.
- [ ] Terms, privacy notice және сақтау мерзімдері тексерілген.
- [ ] Public marketplace, penalty және amount-based commission false.
- [x] Provider-neutral fail-closed identity verification boundary (`IDENTITY_VERIFICATION.md`).
- [x] Minimal L2 verified-claim persistence, expiry derivation, hashed provider reference және idempotent revocation core.
- [x] Front KZ/RU privacy-safe identity status/capability UI; provider disabled болса start action hidden.
- [ ] External L2 KYC provider adapter, authenticated callback/session correlation және KZ privacy/legal staging acceptance.
- [x] Participant-only immutable contract document source (`CONTRACT_DOCUMENT_RENDERING.md`).
- [x] Deterministic KZ/RU technical preview with source/input/content SHA-256 integrity boundary + Front TXT download.
- [ ] Approved KZ/RU legal template + deterministic PDF renderer + final PDF artifact hash/source binding + staging visual acceptance.
- [x] Participant-only immutable evidence manifest + audited canonical JSON export with hash re-verification.
- [ ] Court/export package hardening: PDF/ZIP, manifest signature, trusted timestamp және legal-hold policy.
- [x] Participant-only neutral dispute intake/read backend + Front contract panel.
- [x] Privacy-safe aggregate dispute backlog metrics + Admin read-only operations card.
- [x] Marketplace enum-only abuse reports + aggregate moderation backlog.
- [x] Default-off privacy-safe row-level marketplace moderation Resolve/Dismiss backend + Admin server-action UI.
- [x] Backend scoped/expiring per-staff support credential registry + attributable audit foundation (`SUPPORT_STAFF_ACCESS.md`).
- [ ] Marketplace moderation production enablement: support owner/process, restricted ingress, actual multi-user staff identity/JIT issuance және revocation acceptance.
- [x] Dispute open counterparty durable IN_APP notification + Front inbox label.
- [x] Support, incident және dispute procedures құжатталған; нақты owner/channel pilot алдында бекітіледі.
- [x] Default-off audited support dispute status transition backend boundary.
- [ ] Support/admin transition production enablement — actual support owner/process, staff identity/JIT issuance және staging acceptance кейін.
- [ ] Жоба иесі staging acceptance нәтижесін көрген.

Platform acknowledgement qualified electronic signature болып табылмайды және жеке басты толық құқықтық растау емес. Email verification да қол қоюдың заңдық күшін растамайды.
