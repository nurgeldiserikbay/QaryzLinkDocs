# Identity verification foundation

Жаңартылған күні: 2026-09-28.

QaryzLink Phase 4 Trust & Evidence кезеңінде external identity/KYC integration үшін provider-neutral boundary қосты. Бұл implementation user-ды өздігінен verified деп белгілемейді және нақты KYC провайдерін имитацияламайды.

## Қазіргі boundary

Authenticated user үшін үш endpoint бар:

- `GET /api/v1/identity/verification/capability`;
- `GET /api/v1/identity/verification/status`;
- `POST /api/v1/identity/verification/start`.

`IDENTITY_VERIFICATION_ENABLED=false` әдепкі күйде.

Core provider port тек opaque authenticated user subject reference алады. Email, phone, IIN/BIN, document content немесе profile payload бұл boundary арқылы provider-ге берілмейді.

Provider session response үшін:

- redirect URL міндетті түрде HTTPS;
- URL ішінде username/password credential болмауы тиіс;
- session expiry future болуы тиіс;
- malformed/unsafe result generic unavailable response-қа fail-closed өтеді.

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

Current provider unavailable болғандықтан production UI verification-ды имитацияламайды.

## Current provider state

Current adapter — `UnavailableIdentityVerificationProvider`. Ол verification session жасамайды және 503 қайтарады.

Release preflight `IDENTITY_VERIFICATION_ENABLED=true` болса `provider_adapter_unavailable` fail береді. Сондықтан real vetted provider adapter орнатылмайынша staging/production release identity verification-ды кездейсоқ қосып жібере алмайды.

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
- current adapter әлі unavailable болғандықтан жалпы identity verification check бәрібір `provider_adapter_unavailable` fail береді;
- actual vetted adapter, authenticated callback/session correlation және privacy/legal staging acceptance аяқталмайынша feature production-ready болып саналмайды.

## Бұл не емес

Бұл foundation:

- нақты provider callback келгенше user-ды өздігінен VERIFIED етпейді;
- email verification-ды KYC деп есептемейді;
- contract signature legal validity бермейді;
- raw provider callback payload-ын product DB-ға сақтамайды;
- document upload/KYC evidence storage жасамайды;
- face/liveness/document matching verdict шығармайды.

## Келесі implementation кезеңі

Governance/config provenance boundary дайын. Нақты L2 KYC provider таңдалғаннан кейін:

1. provider adapter;
2. signed/authenticated callback boundary;
3. provider session correlation;
4. callback verdict mapping → дайын minimal claim service;
5. provider-specific sensitive-data minimization review;
6. revocation webhook mapping;
7. KZ legal meaning және privacy notice;
8. staging acceptance

қосылады.

Minimal claim persistence, expiry derivation және revocation core provider таңдауынан тәуелсіз орындалды.

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
- provider revocation қайталанса duplicate audit жасамайды;
- verification/revocation audit payload identity data сақтамайды.
