# Identity verification foundation

Жаңартылған күні: 2026-09-29.

QaryzLink Phase 4 Trust & Evidence кезеңінде external identity/KYC integration үшін provider-neutral boundary қосты. Бұл implementation user-ды өздігінен verified деп белгілемейді және нақты KYC провайдерін имитацияламайды.

## Қазіргі boundary

Authenticated user үшін үш endpoint бар:

- `GET /api/v1/identity/verification/capability`;
- `GET /api/v1/identity/verification/status`;
- `POST /api/v1/identity/verification/start`.

`IDENTITY_VERIFICATION_ENABLED=false` әдепкі күйде. Provider default `IDENTITY_VERIFICATION_PROVIDER=unavailable`; vendor-neutral signed adapter таңдалса `remote-signed-l2` қолданылады.

Verification start кезінде Backend 128-bit random opaque `subjectRef` жасайды. Provider-ге application user ID берілмейді. DB-де session correlation үшін provider code + raw `subjectRef` орнына SHA-256 hash қана сақталады. Email, phone, IIN/BIN, document content немесе profile payload бұл boundary арқылы provider-ге берілмейді.

Provider session response үшін:

- response `QARYZLINK_IDENTITY_SESSION_V1` signed attestation contract-ына сай болуы тиіс;
- provider code және returned `subjectRef` exact request binding-пен тексеріледі;
- provider Ed25519 SPKI fingerprint deployment config-пен pin болады;
- detached signature Backend-та local verify болады;
- redirect URL міндетті түрде HTTPS;
- URL ішінде username/password credential болмауы тиіс;
- session expiry future болуы тиіс;
- malformed/unsafe/signature-mismatched result generic unavailable response-қа fail-closed өтеді.

Successful start `identity_verification_sessions` кестесіне user relation, normalized provider code, `subjectRefHash`, expiry және completion state ғана жазады. Raw subjectRef/provider response/signature session row-да сақталмайды.

## Minimal verified-claim persistence

Provider-neutral claim core енді product DB-де тек минималды authoritative metadata сақтауға дайын:

- user relation;
- internal normalized provider code;
- raw provider subject/reference орнына SHA-256 hash;
- assurance level: қазір тек `L2`;
- `verifiedAt`;
- `expiresAt`;
- optional `revokedAt`;
- audit event.

Raw provider response, document image, face/liveness result, IIN/BIN, email, phone немесе provider subject string сақталмайды.

`GET /api/v1/identity/verification/status` тек privacy-safe effective state қайтарады:

- `UNVERIFIED`;
- `VERIFIED`;
- `EXPIRED`;
- `REVOKED`.

Response-та provider code/reference/hash, claim id немесе identity/contact fields жоқ. Expiry timestamp арқылы runtime-де есептеледі, сондықтан claim-ды EXPIRED ету үшін background cron қажет емес.

Provider callback үшін internal service boundary екі операцияны дайындайды:

1. valid L2 claim-ды жазу және overlap active claim-ды atomically revoke ету;
2. provider reference арқылы idempotent revocation жасау.

Бұл internal mutation API user/browser-ге ашылмаған.

## Frontend status boundary

QaryzLinkFront settings беті authenticated user үшін capability + privacy-safe status-ты ғана оқиды. UI:

- `VERIFIED` кезінде L2 assurance және verified/expiry уақытын көрсетеді;
- `UNVERIFIED/EXPIRED/REVOKED` state-терін бөлек көрсетеді;
- provider capability disabled болса start батырмасын көрсетпейді;
- start result redirect-ін browser navigation алдында HTTPS ретінде қайта тексереді;
- provider code/reference/hash, claim ID, document/biometric payload немесе contact data көрсетпейді;
- email verification-ды L2 KYC ретінде көрсетпейді.

Default provider `unavailable` болғандықтан production UI verification-ды өздігінен имитацияламайды; signed adapter тек explicit approved configuration кезінде қосылады.

## Current provider state

Default adapter — `UnavailableIdentityVerificationProvider`.

Backend-та vendor-neutral `RemoteSignedIdentityVerificationProvider` foundation да бар. Ол нақты KYC vendor-дың business semantics-ын hard-code етпейді: HTTPS session endpoint, bearer transport credential, provider code, pinned Ed25519 public-key fingerprint және signed session attestation contract ғана талап етеді.

`IDENTITY_VERIFICATION_PROVIDER=remote-signed-l2` кезінде release preflight provider adapter-ді енді unavailable деп санамайды, бірақ `manual` staging acceptance ретінде қалдырады. Governance references толық болмаса бөлек `identity_provider_governance=fail` болады. Сондықтан generic adapter implementation vetted provider selection немесе legal/privacy acceptance-ті автоматты түрде жаппайды.

## Production provider governance references

Actual provider adapter орнатылмайынша identity verification бәрібір unavailable болып қалады. Бірақ production enablement үшін governance provenance алдын ала versioned reference арқылы бекітіледі:

- `IDENTITY_PROVIDER_CONTRACT_ID` — vetted L2 provider contract/profile version;
- `IDENTITY_CALLBACK_AUTH_POLICY_ID` — signed/authenticated callback verification policy version;
- `IDENTITY_PRIVACY_RESIDENCY_POLICY_ID` — sensitive-data minimization, retention/residency және processor boundary policy version;
- `IDENTITY_LEGAL_CLASSIFICATION_ID` — Kazakhstan L2 KYC legal/privacy classification record version.

Бұл ID-лер provider secret, callback key, raw contract немесе user identity дерегі емес.

Behavior:
- staging-та refs жоқ болса `release:preflight` `identity_provider_governance=fail` береді;
- production-та `IDENTITY_VERIFICATION_ENABLED=true` және refs толық емес болса config fail-fast;
- refs толық болса governance check `manual` күйінде қалады;
- provider `unavailable` болса жалпы identity verification check `provider_adapter_unavailable` fail береді; `remote-signed-l2` configured болса check `manual` staging acceptance болып қалады;
- generic signed adapter/session correlation және signed revocation foundation бар, бірақ actual vetted vendor API/event mapping және privacy/legal staging acceptance аяқталмайынша feature production-ready болып саналмайды.

## Authenticated correlated callback foundation

Internal callback endpoint:

`POST /api/v1/internal/identity-verification/callback`

Callback екі тәуелсіз trust boundary қолданады:

1. deployment secret `x-identity-callback-token` constant-time compare арқылы тексеріледі;
2. payload `QARYZLINK_IDENTITY_CALLBACK_V1` canonical signed content ретінде pinned Ed25519 provider key-мен local verify болады.

Verified callback тек provider code, opaque session `subjectRef`, provider event ID, `L2` assurance, opaque provider reference, verified/expiry/generated timestamps және detached signature material қабылдайды.

Backend configured provider code/fingerprint exact match талап етеді, callback generated time-ды bounded clock-skew ішінде тексереді, raw subjectRef-ті hash арқылы persisted session-мен байланыстырады және session row-ды transaction ішінде `FOR UPDATE` lock етеді. Verified claim write және session completion бір transaction ішінде орындалады.

Successful callback canonical attestation hash-ін `completionHash` ретінде сақтайды. Дәл сол signed callback retry болса idempotent no-op; completed session-ге өзгертілген replay келсе fail-closed reject болады.

Claim persistence бұрынғы privacy boundary-ды сақтайды: raw provider reference claim row-ға түспейді, тек SHA-256 hash сақталады. Callback body/signature/raw subjectRef audit payload-қа көшірілмейді.

Бұл foundation VERIFIED/L2 callback path-ты жабады.

## Signed revocation callback foundation

Provider verification-ды кейін revoke еткен сценарий үшін internal endpoint:

`POST /api/v1/internal/identity-verification/callback/revoked`

Payload `QARYZLINK_IDENTITY_REVOCATION_V1` canonical contract-пен provider code, event ID, opaque provider reference, `revokedAt`, `generatedAt` және detached Ed25519 signature береді. Callback VERIFIED path сияқты deployment token, configured provider code және pinned provider key fingerprint арқылы fail-closed тексеріледі.

Product DB raw provider reference-ті сақтамайды. Backend normalized provider namespace + provider reference үшін SHA-256 hash шығарып, `identity_verification_revocations` кестесінде тек hash, latest revocation timestamp және attestation hash сақтайды.

Revocation tombstone-ның мақсаты — event ordering-ті қауіпсіз ету:
- REVOKED callback VERIFIED callback-тан бұрын келсе де tombstone сақталады;
- кейін сол provider reference үшін `verifiedAt <= revokedAt` callback stale ретінде reject болады;
- provider revocation-нан кейін жаңа verification жасаса және жаңа `verifiedAt > revokedAt` болса re-verification рұқсат етіледі;
- same/older revocation retry idempotent no-op;
- later revocation tombstone timestamp-ты алға жылжытады және matching active claim-ды revoke етеді;
- VERIFIED және REVOKED concurrent transaction бір raw-reference-free advisory lock key арқылы serialise болады.

Revocation audit payload provider code-тан артық identity/provider reference дерегін сақтамайды. Нақты vendor-дың event/status атауларын осы generic contract-қа mapping жасау және staging acceptance әлі provider-specific жұмыс болып қалады. Revocation tombstone retention мерзімі кодта hard-code етілмейді; ол `IDENTITY_PRIVACY_RESIDENCY_POLICY_ID` және provider/legal retention acceptance арқылы бекітілуі тиіс.
## Бұл не емес

Бұл foundation:

- нақты provider callback келгенше user-ды өздігінен VERIFIED етпейді;
- email verification-ды KYC деп есептемейді;
- contract signature legal validity бермейді;
- raw provider callback payload-ын product DB-ға сақтамайды;
- document upload/KYC evidence storage жасамайды;
- face/liveness/document matching verdict шығармайды.

## Келесі implementation кезеңі

Generic signed session adapter, authenticated VERIFIED callback және opaque session correlation foundation дайын. Нақты L2 KYC provider таңдалғаннан кейін:

1. provider-specific API/profile mapping осы generic contract-қа сәйкестендіріледі;
2. callback/event contract real provider staging environment-та тексеріледі;
3. provider-specific revocation event/status mapping generic signed revocation contract-қа сәйкестендіріледі;
4. provider-specific sensitive-data minimization/residency review;
5. KZ legal meaning және privacy notice;
6. provider SLA/error/incident ownership;
7. full staging acceptance

орындалады.

Minimal claim persistence, expiry derivation, verified callback transaction және revocation core provider таңдауынан тәуелсіз орындалды.

Verified claim user-controlled profile text-тен бөлек authoritative state болуы тиіс. Provider raw payload-ы product DB-ға әдепкіде көшірілмеуі керек; минималды claim metadata ғана сақталуы тиіс.

## Verification status

QaryzLinkBack PR #180 merged at `086893c` provider boundary-ды қосты. QaryzLinkBack PR #182 merged at `d1da649`: minimal claim persistence/expiry/revocation core. PR #182 CI run `36452180331` quality job құрды, бірақ runner step орындалмады; automated Prisma/typecheck/lint/test/build verification pending.

QaryzLinkFront PR #53 merged at `4ecd179`: KZ/RU settings identity status/capability UI және safe start redirect boundary. CI run `36452734535` quality job құрды, бірақ runner step орындалмады; automated typecheck/lint/test/build verification pending.

## Claim lifecycle invariants — 2026-09-28

- claim expiry міндетті түрде verification уақытынан кейін;
- already-expired callback claim қабылданбайды;
- clock-skew үшін verifiedAt future tolerance 5 минутпен шектелген;
- provider code bounded және normalized;
- raw provider reference тек request scope-та өмір сүреді және SHA-256 hash-ке айналады;
- жаңа valid claim сол user-дың overlap active claim-ын serialised user-row transaction ішінде жабады;
- provider revocation raw reference сақтамай hashed tombstone жасайды;
- out-of-order revocation stale verification-ды блоктайды, кейінгі fresh re-verification-ды рұқсат етеді;
- VERIFIED/REVOKED concurrent mutation hashed provider-subject advisory lock арқылы serialise болады;
- provider revocation қайталанса duplicate audit жасамайды;
- verification/revocation audit payload identity data сақтамайды.


## Signed remote adapter implementation evidence — 2026-09-29

Backend implementation random opaque subject correlation, signed session attestation verification, authenticated + signed VERIFIED callback, one-time completion hash/replay protection және atomic minimal L2 claim mapping-ті қамтиды. Бұл evidence actual vendor vetting емес; merged PR/CI evidence implementation status құжатында бөлек тіркеледі.
