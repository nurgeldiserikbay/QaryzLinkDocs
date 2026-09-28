# Identity verification foundation

Жаңартылған күні: 2026-09-28.

QaryzLink Phase 4 Trust & Evidence кезеңінде external identity/KYC integration үшін provider-neutral boundary қосты. Бұл implementation user-ды өздігінен verified деп белгілемейді және нақты KYC провайдерін имитацияламайды.

## Қазіргі boundary

Authenticated user үшін екі endpoint бар:

- `GET /api/v1/identity/verification/capability`;
- `POST /api/v1/identity/verification/start`.

`IDENTITY_VERIFICATION_ENABLED=false` әдепкі күйде.

Core provider port тек opaque authenticated user subject reference алады. Email, phone, IIN/BIN, document content немесе profile payload бұл boundary арқылы provider-ге берілмейді.

Provider session response үшін:

- redirect URL міндетті түрде HTTPS;
- URL ішінде username/password credential болмауы тиіс;
- session expiry future болуы тиіс;
- malformed/unsafe result generic unavailable response-қа fail-closed өтеді.

## Current provider state

Current adapter — `UnavailableIdentityVerificationProvider`. Ол verification session жасамайды және 503 қайтарады.

Release preflight `IDENTITY_VERIFICATION_ENABLED=true` болса `provider_adapter_unavailable` fail береді. Сондықтан real vetted provider adapter орнатылмайынша staging/production release identity verification-ды кездейсоқ қосып жібере алмайды.

## Бұл не емес

Бұл foundation:

- identity verified claim емес;
- email verification-ды KYC деп есептемейді;
- contract signature legal validity бермейді;
- provider callback/result persistence жасамайды;
- document upload/KYC evidence storage жасамайды;
- face/liveness/document matching verdict шығармайды.

## Келесі implementation кезеңі

Нақты L2 KYC provider таңдалғаннан кейін ғана:

1. provider adapter;
2. signed/authenticated callback boundary;
3. provider session correlation;
4. minimal verified-claim model;
5. claim expiry/revocation;
6. provider-specific sensitive-data minimization;
7. audit/observability;
8. KZ legal meaning және privacy notice;
9. staging acceptance

қосылады.

Verified claim user-controlled profile text-тен бөлек authoritative state болуы тиіс. Provider raw payload-ы product DB-ға әдепкіде көшірілмеуі керек; минималды claim metadata ғана сақталуы тиіс.

## Verification status

QaryzLinkBack PR #180 merged at `086893c`. GitHub Actions account quota/billing gate салдарынан automated verification pending.