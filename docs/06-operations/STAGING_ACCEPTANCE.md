# Staging acceptance checklist

Жаңартылған күні: 2026-09-26.

Бұл checklist QaryzLink-ті public pilot-қа дейін нақты staging environment-те тексеруге арналған. Code/CI green болуы staging acceptance орнына жүрмейді.

## 1. Release identity

- [ ] Deploy commit SHA жазылған.
- [ ] API/worker/CronJob image бір immutable digest қолданады.
- [ ] CI және supply-chain checks green.
- [ ] Migration Job сол digest-пен аяқталды.
- [ ] Сол image/config ішінде `pnpm release:preflight` іске қосылды; overall status `fail` емес және JSON evidence secret-free сақталды.

## 2. Network және TLS

- [ ] HTTPS certificate valid.
- [ ] API ingress restricted.
- [ ] Database/Redis/object storage management ports public емес.
- [ ] TRUST_PROXY_HOPS нақты ingress topology-ге сәйкес.
- [ ] Ingress caller-supplied Forwarded/X-Forwarded-* headers-ді overwrite/sanitize етеді.
- [ ] CORS тек нақты Front/Admin origin-дерге рұқсат етеді.
- [ ] Metrics endpoint public internet-тен қолжетімсіз.

## 3. Health және rollout

- [ ] /api/v1/health 200.
- [ ] /api/v1/health/ready 200 және database=up.
- [ ] Kubernetes readiness probe дәл ready endpoint-ті қолданады.
- [ ] Rolling update кезінде available replica нөлге түспейді.
- [ ] Last-known-good digest rollback rehearsal орындалды.

## 4. Auth және privacy smoke

- [ ] register/login/refresh rotation/logout.
- [ ] replayed refresh token 401.
- [ ] forged forwarded IP rate-limit budget-ті айналып өтпейді.
- [ ] жаңа profile privacy-closed.
- [ ] account deletion request active sessions-ды revoke етеді.
- [ ] production Swagger/docs жабық.

## 5. Email

- [ ] MAIL_ENABLED=false немесе verified sender толық дайын.
- [ ] SPF/DKIM/DMARC provider жағында тексерілген.
- [ ] verification email test mailbox-қа жетті.
- [ ] expired/reused verification token fail-closed.
- [ ] log-та email body/token/SMTP secret жоқ.

## 6. Evidence storage

- [ ] private bucket және least-privilege credential.
- [ ] signed PUT expected metadata/size шекарасымен жұмыс істейді.
- [ ] CLEAN verdict evidence persistence-ке жол береді.
- [ ] INFECTED/FAILED/unknown verdict блоктайды.
- [ ] infected object purge.
- [ ] participant-only signed download.
- [ ] expired unconsumed cleanup CronJob.
- [ ] storage/scanner outage кезінде fail-closed.

### 6.1 Evidence KMS/HSM signer operations

- [ ] `EVIDENCE_SIGNER_DEPLOYMENT_ID` reviewed deployment/IaC version-ға сәйкес.
- [ ] `EVIDENCE_SIGNER_IAM_POLICY_ID` signer gateway үшін least-privilege policy version-ға сәйкес.
- [ ] IAM signing permission нақты expected key scope-пен шектелген.
- [ ] Runtime credential key create/delete/admin permission алмайды.
- [ ] `EVIDENCE_SIGNER_KEY_CEREMONY_ID` independent key creation/activation record-қа сәйкес.
- [ ] Ceremony кезінде public SPKI/fingerprint independent channel/tool арқылы тексерілген.
- [ ] `EVIDENCE_SIGNER_KEY_LIFECYCLE_POLICY_ID` rotation/revocation/old-key disable-delete procedure version-ға сәйкес.
- [ ] Active key compromise drill: provider signing permission тоқтайды, registry revoke болады, жаңа seal fail-closed.
- [ ] Rotation drill: жаңа key accepted, previous ACTIVE → RETIRED, expected pin cutover және v1/v2 seal verify.
- [ ] Old key disable/delete timing retention/legal policy-ге қайшы емес.
- [ ] Signer audit/log acceptance secret/private key/raw evidence шығармайтынын тексереді.
- [ ] Release preflight `evidence_signer_operations=manual` көрсетеді; бұл checklist owner+engineer review арқылы жабылады.

### 6.2 External timestamp authority

- [ ] Timestamp feature disabled немесе approved staging authority configured.
- [ ] Authority endpoint HTTPS және expected routing/TLS policy-ге сәйкес.
- [ ] Wrong bearer credential rejected.
- [ ] Redirect/timeout/oversized/malformed response fail-closed.
- [ ] Wrong authority ID және wrong Ed25519 key fingerprint rejected.
- [ ] Nonce mismatch/replay rejected.
- [ ] Authority time configured clock-skew шекарасынан шықса rejected.
- [ ] Changed attestation payload signature verification-нан өтпейді.
- [ ] v1 metadata ZIP және v2 full ZIP seal verified external attestation алады.
- [ ] Authority outage timestamp-required seal-ды audit/response-қа дейін fail-closed тоқтатады.
- [ ] Acceptance record бұл foundation RFC3161/qualified legal timestamp емес екенін көрсетеді.
- [ ] Егер legal gate RFC3161/qualified TSA талап етсе, standards-based provider acceptance бөлек орындалды.

### 6.3 Contract PDF renderer

- [ ] Approved KZ template artifact + independent SHA-256 recorded.
- [ ] Approved RU template artifact + independent SHA-256 recorded.
- [ ] Legal owner template IDs/hashes-ты sign-off етті.
- [ ] Жаңа contract draft дәл сол pins-ті ContractVersion-ға snapshot етеді.
- [ ] Signed documentHash template identity-ді қамтиды.
- [ ] Legacy contract templatePinned=false және retroactive render жасалмайды.
- [ ] Renderer endpoint HTTPS және expected routing/TLS policy-ге сәйкес.
- [ ] Wrong bearer token rejected.
- [ ] Redirect/timeout/oversized response fail-closed.
- [ ] Wrong renderer ID/key fingerprint rejected.
- [ ] Wrong locale/template/source/renderInput binding rejected.
- [ ] Malformed PDF/header/EOF/hash/size mismatch rejected.
- [ ] Renderer detached signature independently verify болады.
- [ ] KK және RU PDF fonts/pagination/line breaks visual approval өтті.
- [ ] Same source + locale + pinned template deterministic PDF hash береді.
- [ ] Audit PDF bytes/token/PII сақтамайды.
- [ ] Final PDF evidence-bundle binding бөлек acceptance item ретінде ашық деп белгіленген.

## 7. Background jobs

- [ ] notification CronJob immutable digest-пен іске қосылды.
- [ ] account deletion CronJob immutable digest-пен іске қосылды.
- [ ] evidence cleanup CronJob immutable digest-пен іске қосылды.
- [ ] concurrencyPolicy және deadline жұмыс істейді.
- [ ] failed Job alert source-қа түседі.

## 8. Backup/restore

- [ ] staging backup алынды.
- [ ] бөлек isolated database-ке restore орындалды.
- [ ] application restored DB-ға readiness check өткізді.
- [ ] restore evidence-те secret/PII жоқ.

## 9. Monitoring

Signal/alert contract: `MONITORING_ALERTING.md`.

- [ ] readiness failure alert.
- [ ] notification failed/pending growth alert.
- [ ] evidence orphan/verdict failure alert.
- [ ] account deletion READY/backlog age alert.
- [ ] CronJob failure alert.
- [ ] alert owner және escalation channel бекітілген.

## 10. Acceptance evidence

Әр scenario үшін тек environment, UTC timestamp, commit/image digest, scenario name және pass/fail сақталады. Password, token, full email/phone, IIN/BIN, signed URL, raw document немесе database dump acceptance evidence-ке кірмейді.

Acceptance-ті owner және кемінде бір инженер review етеді.

Release preflight тек machine-checkable бөлікті алдын ала бөледі; `manual` checks осы checklist арқылы нақты environment-те жабылады. Толық contract: [Release preflight](RELEASE_PREFLIGHT.md).