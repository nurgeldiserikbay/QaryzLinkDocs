# Account own-data export foundation

Жаңартылған күні: 2026-09-30.

Бұл foundation authenticated user-ге QaryzLink ішінде өзіне қатысты шектеулі деректерді deterministic JSON ретінде көруге мүмкіндік береді. Ол administrator dump, evidence archive немесе толық statutory data-subject package емес.

## Feature gate

Default:

`ACCOUNT_DATA_EXPORT_ENABLED=false`

Feature production/staging-та privacy/legal scope acceptance аяқталмайынша өшірулі қалады.

Release preflight feature enabled болса:

- `account_data_export=manual`;
- `privacy_export_scope_acceptance_required`

көрсетеді.

## API

`POST /api/v1/profile/me/data-export`

Bearer-authenticated current user ғана шақыра алады.

Response:

```json
{
  "schemaVersion": 1,
  "format": "QARYZLINK_ACCOUNT_DATA_EXPORT_V1",
  "generatedAt": "2026-09-30T00:00:00.000Z",
  "dataHash": "<sha256>",
  "data": {}
}
```

`dataHash` canonical `data` object-ке ғана есептеледі. `generatedAt` hash-ке кірмейді, сондықтан бірдей selected state бірдей dataHash береді.

## Current export scope

### Account

- publicId;
- status;
- user's own email;
- user's own phoneE164;
- emailVerifiedAt;
- createdAt / updatedAt.

Email/phone storage ciphertext тікелей шығарылмайды. Backend PII protection layer арқылы user's own plaintext мәнін ғана қайта ашады. Key/decryption unavailable болса export generic fail-closed 503 береді.

### Profile/privacy

- displayName;
- countryCode;
- timezone;
- profile timestamps;
- searchableByPublicId;
- searchableByContact;
- publicProfileEnabled;
- analyticsConsent;
- emailNotificationsEnabled;
- privacy updatedAt.

### Account deletion request

Егер бар болса:

- status;
- requestedAt;
- eligibleAt;
- completedAt.

### Contract summaries

User borrower немесе lender болып қатысатын contract-тар:

- contract ID;
- own role: `BORROWER` / `LENDER`;
- status;
- currency;
- principalMinor;
- currentVersion;
- activation/completion/creation/update timestamps.

Counterparty party ID export payload-қа кірмейді.

### Payment summaries

User payer немесе payee болып қатысатын payment-тер:

- payment ID;
- contract ID;
- own role: `PAYER` / `PAYEE`;
- status;
- amountMinor;
- unallocatedMinor;
- currency;
- paidAt / confirmedAt;
- reversalOfId;
- createdAt / updatedAt.

Counterparty party ID export payload-қа кірмейді.

## Explicit exclusions

Current v1 export response intentionally does NOT contain:

- internal userId немесе partyId;
- passwordHash;
- refresh/access tokens немесе session rows;
- emailCiphertext / phoneCiphertext;
- lookup hashes немесе encryption key IDs/material;
- evidence objectKey немесе signed URLs;
- raw funding/payment evidence;
- audit actor IDs/internal audit payloads;
- counterparty profile/contact/identity fields;
- identity-provider raw references;
- support credentials/secrets.

Бұл exclusions export scope-тың privacy boundary бөлігі.

## Audit

Successful export:

`ACCOUNT_DATA_EXPORTED`

audit event жасайды.

Audit payload тек:

- schemaVersion;
- dataHash;
- contractCount;
- paymentCount

сақтайды.

Exported email/phone немесе full response audit payload-қа көшірілмейді.

## Account deletion interaction

Current deletion request flow request accepted болған сәтте active sessions-ды revoke етеді.

Сондықтан current UX contract бойынша user own-data export-ты deletion request жібермей тұрып алуы тиіс. Deletion-request-after-export ordering Front/settings UI acceptance кезінде анық көрсетілуі керек.

Бұл technical foundation statutory timing/right-to-access interpretation емес; legal/privacy owner production procedure-ны бөлек бекітеді.

## Still pending

V1 әдейі толық data-subject archive емес. Келесі legal/product review қажет:

- discovery requests/offers/applications/proposal history scope;
- notifications scope;
- identity-verification claim metadata scope;
- dispute/report/support records scope;
- evidence file export немесе exclusion rationale;
- audit-log subject-access scope;
- machine-readable downloadable file delivery UX;
- rate-limit/abuse limits;
- retention/deletion/export ordering;
- Kazakhstan privacy notice және response-time obligations;
- cross-user records-та third-party data redaction policy.

Production enablement осы scope review және staging privacy tests аяқталғаннан кейін ғана.
