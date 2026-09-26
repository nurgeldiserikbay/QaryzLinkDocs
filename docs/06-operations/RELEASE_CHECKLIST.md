# Release checklist

2026-09-18: толық өнім public launch-қа дайын емес.

## Backend staging

- [ ] Нақты deploy commit-тің CI-ы жасыл.
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
- [ ] Нақты SMTP/push provider, queue trigger, persistent monitoring және alerting.
- [x] Backend compiled HTTP auth/security lifecycle smoke: register/login/refresh rotation/logout, authorization, rate-limit, metrics және CORS contracts.
- [x] Front/Admin production server HTTP security-header/CSP runtime smoke.
- [ ] Front/Admin browser E2E tests және толық UI acceptance.
- [ ] Privacy/consent enforcement, PII encryption және retention.
- [x] Backend reproducible lockfile, container build және runtime smoke test.
- [ ] Front/Admin committed pnpm lockfile және `--frozen-lockfile` install.
- [ ] Production migration job және rollback rehearsal.
- [x] Trusted proxy default-off bounded configuration және exact CORS allowlist code/CI contracts.
- [ ] Staging ingress proxy-hop/header sanitization acceptance, persistent monitoring және alerting — `STAGING_ACCEPTANCE.md` бойынша.
- [x] Backend privacy-safe liveness/readiness contracts және PostgreSQL readiness check.
- [ ] Staging ingress/orchestrator readiness probe нақты `/api/v1/health/ready` endpoint-іне қосылғаны тексерілді.
- [ ] Kubernetes CronJob staging rollout, immutable image verification және job alerting.
- [ ] Metrics endpoint internal ingress review және staging acceptance.
- [ ] Нақты SMTP delivery және пайдаланушының email растау flow-ы.
- [x] Production dependency high/critical audit gate Back/Front/Admin CI ішінде.
- [x] Full-history secret scanning және CycloneDX SBOM generation Back/Front/Admin CI ішінде.
- [ ] SBOM artifact retention/access policy documented in `SBOM_POLICY.md`; Back/Front/Admin retention workflow-тары main-ге merged, бірақ billing/quota gate шешілгеннен кейін бір successful run-мен acceptance жабылады.
- [x] Container image HIGH/CRITICAL vulnerability scanning CI gate.
- [ ] Operational security review және нақты staging/container acceptance — `SECURITY_REVIEW.md` + `STAGING_ACCEPTANCE.md` бойынша орындалады.

## Өнім мен құқықтық gate

- [ ] Жеке тұлғаларға арналған Қазақстан pilot scope-ы бекітілген.
- [ ] Terms, privacy notice және сақтау мерзімдері тексерілген.
- [ ] Public marketplace, penalty және amount-based commission false.
- [x] Support, incident және dispute procedures құжатталған; нақты owner/channel pilot алдында бекітіледі.
- [ ] Жоба иесі staging acceptance нәтижесін көрген.

Platform acknowledgement qualified electronic signature болып табылмайды және жеке басты толық құқықтық растау емес. Email verification да қол қоюдың заңдық күшін растамайды.
