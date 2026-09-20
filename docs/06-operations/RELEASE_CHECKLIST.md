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
- [ ] Invite revoke/block-list, notifications, pagination және business audit.
- [x] Contract draft және dual acknowledgement backend slice.
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
- [ ] Нақты SMTP/push provider, Kubernetes CronJob/queue scheduler және monitoring.
- [ ] Front/Admin UI және HTTP e2e tests.
- [ ] Privacy/consent enforcement, PII encryption және retention.
- [ ] Reproducible lockfile, container build және runtime smoke test.
- [ ] Production migration job және rollback rehearsal.
- [ ] Trusted proxy, CORS allowlist, health/readiness, monitoring.
- [ ] Нақты SMTP delivery және пайдаланушының email растау flow-ы.
- [ ] Dependency/security checks және operational review.

## Өнім мен құқықтық gate

- [ ] Жеке тұлғаларға арналған Қазақстан pilot scope-ы бекітілген.
- [ ] Terms, privacy notice және сақтау мерзімдері тексерілген.
- [ ] Public marketplace, penalty және amount-based commission false.
- [ ] Support, incident және dispute procedures.
- [ ] Жоба иесі staging acceptance нәтижесін көрген.

Platform acknowledgement qualified electronic signature болып табылмайды және жеке басты толық құқықтық растау емес. Email verification да қол қоюдың заңдық күшін растамайды.
