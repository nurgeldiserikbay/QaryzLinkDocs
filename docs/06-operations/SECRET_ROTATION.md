# Runtime secret rotation runbook

Жаңартылған күні: 2026-10-08.

Бұл runbook QaryzLink runtime credentials-ін production/staging ортада қауіпсіз ауыстыру тәртібін сипаттайды. Ешбір raw secret repository, issue, chat, screenshot немесе retained release evidence ішіне жазылмайды.

## Scope

- `JWT_ACCESS_SECRET`
- `METRICS_ACCESS_TOKEN`
- `SCHEDULER_TRIGGER_TOKEN`
- `SUPPORT_STAFF_CREDENTIALS_JSON`
- provider bearer credentials:
  - identity callback/remote token;
  - evidence scan token;
  - PDF/sealing/timestamp remote token;
- SMTP және storage access credentials.

PII encryption key rotation бөлек `PII_KEY_ROTATION.md` runbook-ымен жүргізіледі.

## Негізгі қағидалар

1. Жаңа credential cryptographically random және deployment secret store ішінде жасалады.
2. Raw мән audit evidence-ке кірмейді; тек secret version/reference, owner, timestamp және outcome тіркеледі.
3. Rotation staging acceptance-тен кейін production-ға өтеді.
4. Caller және receiver credential-дары бір уақытта coordinated cutover арқылы жаңартылады.
5. Old credential removal алдында жаңа credential path бойынша нақты success дәлелі болуы керек.
6. Compromise rotation жоспарлы rotation-нан бөлек incident ретінде қаралады және old credential дереу revoke етіледі.

## JWT_ACCESS_SECRET

Backend қазір бір active JWT signing secret қолданады.

Rotation әсері:

- бұрын шығарылған access JWT-лер жаңа secret-пен verify болмайды;
- refresh token-дар DB-де hash түрінде сақталады және JWT signing secret емес;
- client access-token rejection алғаннан кейін refresh flow арқылы жаңа access token ала алады;
- rotation алдында refresh path staging-та міндетті тексеріледі.

Sequence:

1. Staging secret store-да жаңа `JWT_ACCESS_SECRET` жасаңыз.
2. Backend-ті жаңа secret-пен deploy етіңіз.
3. Existing session refresh smoke орындаңыз.
4. Жаңа access token protected endpoint-ке өтетінін тексеріңіз.
5. Old access token rejected екенін тексеріңіз.
6. Production deploy жасаңыз.
7. Auth error/refresh failure rate-ін бақылайсыз.
8. Rollback қажет болса previous deployment secret version-ін тек approved incident window ішінде қалпына келтіріңіз.

## Metrics және scheduler credentials

`METRICS_ACCESS_TOKEN` және `SCHEDULER_TRIGGER_TOKEN` single active token ретінде қолданылады.

Coordinated cutover:

1. New token secret store-да жасалады.
2. Receiver configuration және caller secret бір release/change ticket-пен жаңартылады.
3. Staging endpoint new token-мен success береді.
4. Old token reject болатыны тексеріледі.
5. Scheduler trigger немесе metrics smoke қалыпты өткеннен кейін old secret version retire болады.

Token stdout/log/command line history-ге шығарылмайды.

## Support staff credentials

`SUPPORT_STAFF_CREDENTIALS_JSON` raw token емес, SHA-256 token hash сақтайды.

Per-staff/JIT rotation:

1. New opaque token staff member үшін secret channel арқылы жасалады.
2. Оның SHA-256 hash-ы жаңа credential entry ретінде қосылады.
3. Scope және expiry минималды қажетті мәндермен беріледі.
4. New token authorization acceptance өтеді.
5. Old hash entry жойылады немесе expiry арқылы жарамсыз болады.
6. Audit evidence тек opaque staff actor ID/scope/outcome сақтайды.

Бұл модель бір credential-ды бүкіл support team үшін қайта қолдануға жол бермеуі тиіс.

## External provider credentials

Identity/evidence/PDF/sealing/timestamp/SMTP/storage credentials rotation provider-side lifecycle-мен coordinated болуы керек.

Қолдау болса:

- алдымен new credential provider жағында active;
- QaryzLink new credential-ға ауысады;
- acceptance success;
- содан кейін old credential provider жағында revoke.

Provider dual-validity window қолдамаса, қысқа approved maintenance/cutover window қажет.

## Rotation evidence

Retained evidence тек metadata:

| Field | Required |
|---|---|
| Environment | staging / production |
| Credential class | JWT / metrics / scheduler / support / provider |
| Secret version/reference | opaque ID only |
| Rotation reason | planned / compromise / provider expiry |
| Changed at | UTC |
| Operator/reviewer | named owner reference |
| Acceptance | pass/fail |
| Old credential revoked | yes/no |
| Rollback window closed | yes/no |

## Production acceptance

- [ ] secret store owner және access policy бекітілген;
- [ ] staging rotation drill орындалған;
- [ ] raw secret logs/evidence ішінде жоқ;
- [ ] JWT refresh-after-rotation сценарийі тексерілген;
- [ ] metrics/scheduler caller+receiver coordinated cutover тексерілген;
- [ ] support per-staff credential rotation тексерілген;
- [ ] provider credential revoke тәртібі documented;
- [ ] rollback және incident owner анықталған.

Бұл runbook secret manager/KMS/HSM өнімін таңдамайды. Нақты provider және secret-version reference production policy-де бекітіледі.
