# PII contact encryption rollout

Жаңартылған күні: 2026-09-26.

Бұл runbook direct contact identifiers (email және phone E.164) үшін ADR-0026 rollout-ын басқарады. Production cutover бір қадаммен жасалмайды.

## Current implementation

- AES-256-GCM contact encryption primitive;
- HMAC-SHA-256 blind lookup hash;
- versioned encryption keyring;
- `plaintext`, `dual`, `encrypted` storage modes;
- additive encrypted/hash columns;
- bounded manual backfill command;
- auth register/login/email-verification dual/encrypted storage support;
- profile және notification contact readers protection boundary арқылы оқиды;
- encrypted startup backlog нөл болмаса fail-closed;
- protected aggregate PII migration metrics endpoint;
- Admin aggregate cutover status card.

## Required secrets

`dual` немесе `encrypted` mode үшін:

- `PII_ACTIVE_KEY_ID`;
- `PII_ENCRYPTION_KEYRING_JSON` — key id → 32-byte base64 AES key;
- `PII_LOOKUP_KEY_BASE64` — бөлек 32-byte HMAC lookup key.

Бұл мәндер GitHub, Docs, logs, screenshots немесе browser bundle ішінде сақталмайды.

## Phase 1 — plaintext baseline

`PII_CONTACT_STORAGE_MODE=plaintext` current compatibility mode. Encrypted columns nullable және runtime existing plaintext behavior-ды сақтайды.

## Phase 2 — dual write

Staging-та ғана:

1. key material Secret-ке енгізу;
2. `PII_CONTACT_STORAGE_MODE=dual`;
3. deploy;
4. register/login/email verification/profile/notification smoke;
5. protected `/api/v1/metrics/pii-migration` арқылы backlog бақылау.

Dual mode жаңа/өзгерген contact-тарды plaintext + encrypted + blind index ретінде қатар сақтайды.

## Phase 3 — manual backfill

Backfill автоматты CronJob емес. Controlled one-shot command:

~~~bash
pnpm pii:contacts:backfill
~~~

`PII_CONTACT_BACKFILL_BATCH_SIZE` 1–500 аралығында, default 50.

Әр run aggregate JSON қайтарады:

- `userRowsProcessed`;
- `verificationRowsProcessed`;
- `failed`;
- `remainingUsers`;
- `remainingVerifications`;
- `capturedAt`.

User id, email, phone немесе ciphertext output-қа шықпайды.

`failed > 0` болса command non-zero exit беруі тиіс; root cause түзетілмей cutover жасалмайды.

## Phase 4 — encrypted cutover

`remainingUsers=0` және `remainingVerifications=0` болғаннан кейін ғана staging-та:

`PII_CONTACT_STORAGE_MODE=encrypted`.

Application startup `PiiContactCutoverGuard` арқылы database backlog-ты қайта тексереді. Backlog болса HTTP server іске қосылмайды.

Encrypted mode-та жаңа email contact plaintext column-ға жазылмайды; lookup blind hash арқылы, read ciphertext decrypt арқылы орындалады.

## Phase 5 — acceptance

Cutover кейін:

- register жаңа user;
- case-insensitive email login;
- duplicate email conflict;
- email verification request/confirm;
- profile read;
- notification email recipient resolution;
- account deletion request/anonymization;
- restart;
- backup/restore;
- previous key decrypt compatibility

staging-та тексеріледі.

## Phase 6 — plaintext removal

Legacy plaintext columns бірден drop етілмейді. Encrypted mode бірнеше stable release және rollback window өткеннен кейін ғана бөлек destructive migration review жасалады.

## Key rotation

1. New key keyring-ке қосылады.
2. `PII_ACTIVE_KEY_ID` жаңа key-ге ауысады.
3. New writes жаңа key-мен жасалады.
4. Old key decrypt-only keyring-де қалады.
5. Controlled re-encryption backfill бөлек implementation/acceptance қажет.
6. Backup retention window өткеннен кейін ғана old key retire.

Lookup key rotation separate migration талап етеді, себебі барлық blind indexes қайта есептелуі керек.

## Rollback

- dual → plaintext rollback encrypted data-ны жоймайды;
- encrypted → dual rollback үшін legacy plaintext columns әлі сақталған болуы керек;
- plaintext columns drop жасалғаннан кейін rollback strategy қайта қаралады;
- key жоғалса encrypted contact recovery мүмкін болмауы мүмкін, сондықтан key custody backup strategy-мен бірге бекітіледі.

## Current gate

Code path encrypted cutover-ға дайын, бірақ GitHub Actions quota/billing gate салдарынан соңғы PII өзгерістер automated verification-дан өтпеді және нақты staging dual/backfill/encrypted acceptance орындалған жоқ. Сондықтан production mode әлі `plaintext`/operationally disabled деп қаралады.