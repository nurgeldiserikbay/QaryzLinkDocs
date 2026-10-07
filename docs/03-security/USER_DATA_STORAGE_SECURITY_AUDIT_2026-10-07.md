# User data storage security audit — 2026-10-07

Status: repository audit complete; production approval **not granted**.

Scope:

- QaryzLinkBack persistent data and secrets;
- QaryzLinkFront browser/PWA storage;
- session and password lifecycle;
- PII encryption and lookup;
- notification/outbox persistence;
- evidence/object storage;
- account export and deletion/anonymization;
- audit/support access;
- logging and backup boundaries;
- Kazakhstan personal-data residency/storage requirements;
- release/preflight configuration.

This is a technical security audit. Legal conclusions still require qualified Kazakhstan legal/privacy review.

## Executive result

Repository controls are substantially stronger than the original MVP baseline, but the audit found several production-significant gaps.

Security fixes applied during this audit:

1. production now rejects plaintext/dual contact PII storage;
2. production PostgreSQL URL must explicitly require TLS;
3. production must declare Kazakhstan as both personal-data storage and processing country;
4. production requires versioned personal-data residency governance;
5. production requires versioned storage-encryption-at-rest governance;
6. release preflight fails when the production PII/residency/encryption conditions are absent;
7. notification outbox rejects sensitive keys/values before persistence;
8. privacy log scanner now detects phone-number PII;
9. account anonymization immediately purges password reset challenges, discovery idempotency rows and push subscriptions;
10. new password hashes use stronger scrypt parameters.

Because these Backend changes happened after staging candidate v2 was frozen, candidate v2 is invalidated. A replacement candidate must not be frozen until updated CI/security checks run successfully.

## Severity summary

| Severity | Finding | Current state |
|---|---|---|
| CRITICAL / release blocker | Production personal-data storage/processing residency must be Kazakhstan | Code governance gate added; real provider/location acceptance still pending |
| HIGH | Production could previously start with plaintext contact PII mode | Fixed fail-closed |
| HIGH | Production database connection could previously omit TLS mode | Fixed fail-closed |
| HIGH | Plaintext domain content relies on provider encryption-at-rest | Versioned governance gate added; real provider encryption acceptance pending |
| HIGH | Production use of Render/Neon outside Kazakhstan would violate the intended KZ-first residency boundary | Do not use temporary Render/Neon staging for real production personal data |
| MEDIUM | Notification payload had no central PII guard | Fixed |
| MEDIUM | Account anonymization retained reset/push/idempotency data | Fixed |
| MEDIUM | Log scanner did not explicitly detect phone PII | Fixed |
| MEDIUM | Password scrypt work factor below current OWASP minimum profile | New hashes strengthened; legacy hash rehash strategy pending |
| MEDIUM | PII encryption keys are still supplied to application runtime rather than isolated KMS/HSM operations | Pending architecture/provider hardening |
| MEDIUM | Chat/dispute/display-name/financial domain values are logical plaintext in DB | Provider encryption + access controls mandatory; field-level encryption requires separate design |
| MEDIUM | Front production CSP still permits inline scripts | Pending nonce/strict-CSP design review |
| LOW/MEDIUM | Push endpoint blind lookup is SHA-256 over high-entropy endpoint, not keyed HMAC | Hardening candidate; no practical low-entropy reversal found |
| EXTERNAL | Backup/PITR, object-storage encryption, KZ provider location and access controls | Real provider evidence pending |
| LEGAL | Retention periods for contracts/chat/disputes/evidence/audit after anonymization | Legal/privacy decision pending |

## 1. Contact PII storage

Current protected fields include:

- user email;
- user phone;
- verification email;
- push endpoint;
- push P-256 DH key;
- push auth secret.

Application-level contact protection uses:

- AES-256-GCM;
- random 12-byte IV;
- authentication tag;
- AAD binding to record ID + field + envelope version;
- versioned key ID;
- separate HMAC-SHA256 lookup/blind-index key.

Production rule after this audit:

```text
PII_CONTACT_STORAGE_MODE=encrypted
```

Production startup fails for `plaintext` or `dual`.

The cutover guard also verifies active data has ciphertext/lookup representation before encrypted mode is accepted.

### Remaining key-management risk

The application still receives raw PII key material from runtime secret configuration.

That protects against a database-only compromise, but not a full application-runtime compromise.

For higher-assurance production, migrate PII cryptographic operations/key custody toward:

- Kazakhstan-compatible secrets manager / KMS / HSM;
- explicit key access IAM;
- rotation and revocation evidence;
- no raw key material in developer-accessible configuration exports.

## 2. Database transport and at-rest protection

Production `DATABASE_URL` now must:

- use `postgres://` or `postgresql://`;
- specify `sslmode=require`, `verify-ca` or `verify-full`.

This is a transport control only.

Several domain fields remain logical plaintext inside PostgreSQL, including examples such as:

- party display name;
- contract-chat body;
- dispute description;
- financial amounts and schedules;
- some confirmation/reason fields;
- audit/outbox metadata JSON.

Therefore DB/provider encryption at rest is not optional.

Production now requires a versioned:

```text
PERSONAL_DATA_STORAGE_ENCRYPTION_POLICY_ID=<reviewed-policy-id>
```

This configuration is a governance guard, not proof. Real provider-side encryption, key custody, backup encryption and IAM must still be independently accepted.

## 3. Kazakhstan storage and processing residency

For the current KZ-first pilot, production now requires:

```text
PERSONAL_DATA_STORAGE_COUNTRY=KZ
PERSONAL_DATA_PROCESSING_COUNTRY=KZ
PERSONAL_DATA_RESIDENCY_POLICY_ID=<reviewed-policy-id>
```

The repository intentionally fails production configuration when these are absent or not KZ.

This follows the current Kazakhstan personal-data framework requiring personal-data storage in a database/digital object located in Kazakhstan and protection of restricted personal-data processing facilities.

### Important environment consequence

The temporary Render + Neon + Vercel staging setup is for synthetic/non-production acceptance only.

Do **not** load real customer personal data into that temporary environment unless an independently reviewed legal/provider arrangement explicitly makes the target compliant.

Before production/pilot:

- select KZ-hosted primary database;
- select KZ-compatible Backend processing infrastructure;
- select KZ-compatible private evidence/object storage if evidence storage is enabled;
- document all subprocessors;
- classify any cross-border transfer;
- obtain required consent/legal basis where applicable;
- verify backup replicas and disaster-recovery copies do not silently move regulated data outside the accepted boundary.

## 4. Passwords

Passwords are never stored plaintext or reversibly encrypted.

Current format:

- scrypt;
- random salt;
- encoded work-factor parameters in the stored hash;
- timing-safe comparison;
- malformed/tombstone hashes fail closed.

New hashes after this audit:

```text
N=32768
r=8
p=3
```

This meets a current OWASP scrypt minimum-equivalent profile.

### Legacy password hashes

Older accounts may still contain:

```text
N=16384
r=8
p=1
```

They continue to verify for compatibility.

Production hardening still needs one of:

- transparent rehash after successful login;
- bounded migration where the plaintext password is naturally available;
- forced password reset for old profiles after a policy deadline.

Never attempt to "upgrade" hashes without the user's plaintext password by weakening the security model.

## 5. Refresh, reset and invitation tokens

Verified:

- refresh tokens are random high-entropy values;
- DB stores only refresh-token hashes;
- refresh rotates atomically;
- access-token guard checks live DB session state;
- revoked/expired session makes access token unusable;
- password reset challenge stores token hash only;
- reset tokens are short-lived and single-use;
- reset revokes existing sessions;
- private request invite links store SHA-256 token hashes and are short-lived/single-use;
- invite token plaintext is not persisted.

## 6. Browser/PWA session storage

Verified Front behavior:

- session is stored only in `sessionStorage`;
- no application `localStorage` usage found;
- no application `IndexedDB` usage found;
- malformed session payloads are removed;
- normal logout/session revoke/password change/account deletion use the unified cleanup boundary;
- native protected persistence is capability-gated and not emulated with ordinary WebView storage.

Residual risk:

- any XSS in the same browsing context can read `sessionStorage`.

Therefore CSP/XSS defense remains security-critical.

## 7. Front CSP and web response controls

Current controls include:

- `default-src 'self'`;
- `object-src 'none'`;
- `frame-ancestors 'none'`;
- exact API `connect-src`;
- production excludes `unsafe-eval`;
- `X-Content-Type-Options: nosniff`;
- frame denial;
- restrictive permissions policy;
- framework identity header disabled.

Residual:

```text
script-src 'self' 'unsafe-inline'
```

remains in production.

This should be treated as a medium hardening item. A nonce/hash-based Next.js CSP should be designed and tested rather than removing `unsafe-inline` blindly.

## 8. Service worker and caching

Verified:

- service worker caches static assets only;
- API responses are not deliberately cached;
- authenticated navigation is network-first;
- offline fallback contains no private financial payload;
- Backend globally sets `Cache-Control: no-store`.

No private financial/API cache was identified in the current PWA implementation.

## 9. Notification storage

Before this audit, current producers already used IDs/status values rather than email/phone/chat text.

A central fail-closed payload guard is now enforced before outbox persistence.

It rejects sensitive field names such as:

- email / phone;
- password;
- access/refresh token;
- authorization/cookie;
- signed/upload/download URL;
- object key;
- message/body/description;
- ciphertext/private key.

It also rejects string values matching email or E.164-like phone patterns.

Contract chat notifications continue to persist only metadata:

- contract ID;
- message ID;
- sender role.

Chat body is not copied into notification storage.

## 10. Push notifications

Verified:

- endpoint/key/auth material has encrypted storage representation;
- lookup uses a non-plaintext hash;
- optional push is default-off;
- user opt-in is required;
- only narrow repayment reminder events support PUSH;
- lock-screen message is generic;
- debt amount/due date/contract ID are not exposed in push body.

Residual hardening:

- endpoint lookup currently uses SHA-256 over a high-entropy endpoint rather than keyed HMAC;
- practical reversal risk is low because endpoint URLs have high entropy, but HMAC would improve unlinkability.

## 11. Logging

No application `console.log`, `console.error` or generic request-body logging was found in Back/Front code search.

The log privacy scanner already detected:

- authorization/token patterns;
- e-mail addresses;
- evidence object keys;
- signed URLs;
- document content indicators.

This audit added phone-number detection.

Staging evidence must remain metadata-only.

## 12. Account deletion / anonymization

Existing behavior already:

- revokes sessions;
- removes direct email/phone plaintext and ciphertext;
- removes lookup hashes;
- randomizes public ID;
- replaces password hash with random tombstone material;
- changes display name to a neutral deleted-user value;
- disables public/search/analytics/email privacy surfaces;
- revokes active risk access;
- removes repayment metrics;
- preserves legally relevant contract/audit structures when retention requires them.

This audit additionally purges immediately:

- password reset challenge;
- discovery/idempotency command rows;
- push subscriptions.

Still intentionally retained pending legal policy:

- contract records;
- payments/ledger;
- audit history;
- chat content;
- dispute data;
- evidence metadata/files under retention/legal-hold rules;
- identity verification history/tombstones where legally required.

The legal retention matrix must decide exact periods and access restriction after anonymization.

## 13. Own-data export

Current self-service export v2:

- authenticated only;
- rate-limited;
- canonical data hash;
- own decrypted contact data;
- role-scoped contract/payment summary;
- only messages authored by the current user's party;
- excludes counterparty-authored chat text;
- excludes passwords, tokens, ciphertext, storage keys and provider raw identifiers.

Legal/privacy acceptance for the full Kazakhstan data-subject scope remains pending.

## 14. Evidence/object storage

Verified application controls:

- storage feature is default-off;
- private signed uploads;
- short bounded signed URL lifetime;
- media type/size/hash metadata binding;
- participant-only reads;
- malware scan required before download;
- CLEAN/INFECTED handling;
- object identifiers are not exposed in ordinary public surfaces;
- evidence retention/legal-hold tooling exists.

External production requirements still pending:

- KZ provider/data-location acceptance;
- encryption-at-rest/bucket policy;
- bucket public-access block;
- service account least privilege;
- backup/replication region review;
- lifecycle/deletion policy;
- scanner data path residency;
- real CLEAN + EICAR acceptance.

## 15. Backups

Repository rehearsal is privacy-safe and removes dump bytes before retaining CI evidence.

Production still needs real provider proof for:

- encryption at rest;
- backup encryption;
- KZ residency of backup replicas;
- retention;
- deletion;
- access logging;
- isolated restore;
- RTO/RPO.

A backup stored outside the accepted KZ boundary is not made compliant merely because the primary DB is in KZ.

## 16. Audit and support access

Verified:

- support mutation features default-off;
- support credentials are represented by hashes, not plaintext token values in the registry;
- comparison is timing-safe;
- credentials expire;
- explicit scopes are required;
- audit payloads reviewed in security-sensitive support/password/privacy flows contain metadata such as status, IDs, changed-field names and counters rather than user content.

Residual:

- `AuditEvent.payload` is a generic JSON field and does not currently have the same centralized forbidden-sensitive-key guard as notification payloads.

Recommendation: introduce a shared privacy-safe audit payload helper for new audit producers or migrate audit writers behind a central service.

## 17. Identity provider data

Current foundation stores hashes of provider references/subjects rather than raw provider identifiers where designed.

Remote callbacks use:

- signature verification;
- pinned key fingerprint;
- provider code validation;
- clock-skew bound;
- correlation with an existing verification session;
- idempotent completion/revocation behavior.

Production KYC remains unavailable until provider contract, privacy/residency, callback-auth and legal classification are accepted.

## 18. Data minimization / discovery privacy

Verified:

- private requests are invite-only;
- public-ID invitation requires `searchableByPublicId=true`;
- blocks are enforced both ways;
- inaccessible resources use privacy-safe not-found semantics;
- public offers omit lender identity;
- relationship/risk access is scoped to the relevant request/contract;
- self-profile decryption is exposed only through authenticated `profile/me`.

## 19. Controls still not complete

The following must not be presented as already production-ready:

1. real KZ-hosted DB/Backend/evidence provider acceptance;
2. provider encryption-at-rest and key custody evidence;
3. PII key isolation in KMS/HSM/vault;
4. legal retention matrix;
5. cross-border/subprocessor inventory and consent/legal basis;
6. legacy password rehash strategy;
7. strict CSP without inline scripts;
8. MFA/passkey/TOTP for account takeover resistance;
9. central audit-payload privacy enforcement;
10. real backup/PITR encryption/residency acceptance;
11. real incident response/security owner sign-off;
12. independent penetration test before broader public launch.

## 20. Production release blockers after this audit

Do not approve production/pilot until at minimum:

```text
backend_ci=pass
backend_supply_chain=pass
pii_contact_storage_mode=encrypted
database_tls=pass
personal_data_storage_country=KZ
personal_data_processing_country=KZ
personal_data_residency_policy=accepted
personal_data_storage_encryption_policy=accepted
kz_database_provider_acceptance=pass
kz_backend_processing_provider_acceptance=pass
evidence_storage_residency_encryption=pass|n/a
backup_residency_encryption=pass
retention_legal_review=accepted
privacy_notice_consent_review=accepted
```

The temporary Render/Neon environment may continue only as synthetic staging.

## 21. Audit conclusion

The repository is no longer in the same security state as the previously frozen candidate v2.

The most important repository-side gaps found in this review were patched.

The most important remaining risks are **environment/provider/legal**:

- actual Kazakhstan residency;
- provider/storage encryption;
- key management;
- retention;
- cross-border processing;
- independent verification.

A new staging candidate must be frozen only after the security-hardened Backend commit passes CI and supply-chain checks.
