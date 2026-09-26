# ADR-0026: Encrypt direct contact identifiers at rest with blind indexes

- Status: Accepted for phased implementation
- Date: 2026-09-26
- Owners: QaryzLink backend, security and release owners
- Related: ADR-0004, ADR-0005, ADR-0006

## Context

`User.email`, `User.phoneE164` және `EmailVerification.email` current PostgreSQL schema-да plaintext сақталады. Email login/uniqueness және verification flow үшін lookup қажет, сондықтан тек opaque encryption қосу жеткіліксіз: application exact match жасай алуы керек. Бір үлкен destructive migration public pilot алдында тәуекелді.

## Decision

### 1. Scope

Бірінші кезеңде direct contact identifiers қорғалады:

- user email;
- user phone E.164;
- email-verification email copy.

`displayName` және user таңдаған public/profile text бұл ADR scope-ына кірмейді; олардың visibility privacy policy арқылы басқарылады және кейін бөлек classification review жасалады.

### 2. Encryption

- AES-256-GCM authenticated encryption қолданылады.
- Әр encryption үшін random 96-bit nonce/IV.
- Ciphertext envelope key version-ды сақтайды.
- AAD record identity + logical field name-ды байланыстырады, сондықтан ciphertext басқа field/record-қа үнсіз көшірілмейді.
- Encryption key application secret store/Kubernetes Secret арқылы беріледі; source control, log, browser bundle немесе database ішінде сақталмайды.

Ұсынылатын envelope logical форматы: `v1:<keyId>:<iv>:<ciphertext>:<tag>`; binary components base64url encoding қолданады.

### 3. Exact lookup / uniqueness

Email/phone lookup ciphertext бойынша жасалмайды. Бөлек blind index:

- `HMAC-SHA-256(lookupKey, normalizedValue)`;
- encryption key-ден бөлек lookup key;
- email normalization: trim + lowercase;
- phone normalization: canonical E.164;
- full-length digest unique index үшін сақталады.

Blind index reversible емес, бірақ low-entropy values үшін offline guessing қаупі бар. Сондықтан lookup key database-тан бөлек secret болып қалады.

### 4. Runtime migration mode

`PII_CONTACT_STORAGE_MODE` үш күйден тұрады:

- `plaintext` — current compatibility mode;
- `dual` — plaintext + ciphertext + blind index бірге жазылады, read legacy fallback-ты қолдайды;
- `encrypted` — application lookup/read encrypted columns + blind index арқылы ғана жұмыс істейді; plaintext write жасалмайды.

Public pilot release gate: `encrypted` mode.

### 5. Key configuration

- `PII_ACTIVE_KEY_ID` — жаңа writes үшін active encryption key version;
- versioned encryption keyring secret — active және бұрынғы decrypt-only key-лер;
- `PII_LOOKUP_KEY_BASE64` — blind index HMAC key;
- invalid/missing key material staging/production-та encryption mode қолданылғанда startup fail-fast.

Lookup key rotation encryption key rotation-нан күрделірек, өйткені indexes backfill қажет етеді; ол бөлек controlled migration ретінде орындалады.

## Migration sequence

### Phase A — additive schema

Nullable columns қосылады, existing plaintext columns сақталады:

- `emailCiphertext`;
- `emailLookupHash`;
- `phoneCiphertext`;
- `phoneLookupHash`;
- verification challenge үшін encrypted email field.

Unique indexes жаңа lookup hash columns-қа тек backfill readiness ескеріліп енгізіледі.

### Phase B — dual write

`PII_CONTACT_STORAGE_MODE=dual` staging-та қосылады. Register/profile/email-verification writes encrypted + blind index мәндерін plaintext-пен қатар сақтайды. Reads encrypted мәнді prefer етіп, legacy row үшін plaintext fallback қолданады.

### Phase C — bounded backfill

One-shot/background backfill:

- primary key cursor бойынша bounded batch;
- idempotent;
- already encrypted row skip;
- plaintext log-қа шықпайды;
- aggregate processed/skipped/failed counters ғана;
- duplicate normalized email/phone conflict болса destructive overwrite жасамай fail-closed.

### Phase D — verification

- row counts;
- null encrypted/hash backlog;
- login exact lookup;
- email verification;
- profile read;
- unique conflict behavior;
- account deletion anonymization;
- backup/restore;
- rollback rehearsal.

### Phase E — encrypted mode

Staging acceptance кейін `PII_CONTACT_STORAGE_MODE=encrypted`. Plaintext fallback telemetry/backlog нөл болуы тиіс.

### Phase F — plaintext removal

Бөлек migration plaintext email/phone және legacy verification email columns-ды тек encrypted mode бірнеше release бойы stable болғаннан кейін алып тастайды. Бұл rollback point өткенін білдіреді және жеке approval қажет.

## Key rotation

Encryption key rotation:

1. жаңа key ID/key secret-ке қосылады;
2. active key ID ауысады;
3. жаңа writes жаңа key-мен;
4. old key decrypt-only күйде қалады;
5. bounded re-encryption backfill;
6. old-key usage backlog нөл;
7. backup retention window өткеннен кейін ғана old key retirement.

Key material log/debug output-қа ешқашан жазылмайды.

## Failure behavior

- decrypt/authentication tag failure → fail-closed, plaintext fallback тек `dual` режиміндегі legacy non-encrypted row үшін;
- malformed ciphertext → generic internal error + privacy-safe metric;
- missing active key → startup/config failure;
- blind-index collision/duplicate → registration/update conflict, data overwrite жоқ;
- backfill failure → row өзгермей қалады және retryable aggregate result.

## Consequences

- Database snapshot жалғыз өзі direct email/phone plaintext бермейді.
- Exact login/contact lookup сақталады.
- Application complexity және secret/key lifecycle артады.
- Dual phase уақытша plaintext сақтайды, сондықтан ол final security state емес.
- Key loss encrypted data-ны қалпына келтіруге кедергі болады; backup/key custody бірге жоспарлануы тиіс.

## Not chosen

- Deterministic encryption — ciphertext equality leakage жоғары.
- Single encryption key as lookup key — key separation бұзылады.
- Hash-only email — notification/profile display үшін original value қажет.
- Big-bang migration — rollback және existing user compatibility тәуекелі жоғары.

## Acceptance gates

- crypto implementation test vectors;
- normalization tests;
- dual-write integration tests;
- backfill idempotency + duplicate handling;
- encrypted-only login/verification/profile HTTP smoke;
- account deletion/anonymization compatibility;
- key rotation rehearsal;
- staging backup/restore with key availability;
- no plaintext contact values in logs/metrics/admin.