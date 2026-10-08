# User data storage security audit — 2026-10-08

Status: technical repository audit completed; production approval **not granted**.

This review covers QaryzLink user-data storage and handling end to end:

- PostgreSQL persistent data;
- restricted contact PII;
- passwords, sessions and reset/verification tokens;
- browser/PWA session storage;
- contract chat and notification storage;
- evidence/object storage;
- audit/support access;
- account export and anonymization;
- logging;
- backups and retention;
- Kazakhstan residency/processing governance;
- release and incident-response controls.

This is a technical security review, not a Kazakhstan legal opinion.

## Executive result

The repository has strong privacy/security foundations, but production must remain blocked until environment/provider/legal acceptance is complete.

Important repository fixes confirmed or added during this review:

1. production requires encrypted contact-PII mode;
2. production PostgreSQL requires TLS;
3. production requires KZ storage and KZ processing declarations;
4. production requires versioned residency and storage-encryption governance references;
5. Render staging no longer defaults contact PII to plaintext mode;
6. notification payloads are centrally rejected when sensitive keys/values are present;
7. log privacy scanning detects phone PII with context-aware matching;
8. account anonymization removes ephemeral reset/idempotency/push data;
9. expired sessions are cleaned by retention maintenance;
10. login timing is equalized for missing/inactive accounts and stored scrypt parameters are strictly validated;
11. account export v2 keeps only self-authored contract-chat text;
12. API responses are globally no-store and production API responses use HSTS;
13. Front production CSP uses per-request nonces and strict-dynamic instead of script unsafe-inline;
14. audit_events is append-only at the PostgreSQL boundary;
15. Admin is protected by a fail-closed authentication gate; production admin passwords must be at least 32 bytes and authenticated responses are no-store.

## Release status

The previously frozen staging candidate is invalid because Backend/Front security hardening changed application code afterwards.

A replacement candidate must not be frozen until repository checks can run again.

At the time of this audit, QaryzLinkBack and QaryzLinkFront are private repositories and GitHub Actions runs are terminating at setup level within a few seconds without executing job steps. QaryzLinkDocs is public and its Docs HTML workflow remains green. This behavior is consistent with the existing private-repository Actions quota/billing gate note in project operations documentation.

Therefore:

```text
backend_ci=blocked_until_runner_quota_restored
backend_supply_chain=blocked_until_runner_quota_restored
front_ci=blocked_until_runner_quota_restored
front_supply_chain=blocked_until_runner_quota_restored
docs_html=pass
```

Do not interpret the setup-level workflow failures as proof that application tests failed. Also do not treat code as verified until those workflows rerun successfully.

## Severity summary

| Severity | Finding | State |
|---|---|---|
| CRITICAL / release blocker | Production personal-data storage must use an accepted Kazakhstan-resident environment | External provider/legal acceptance pending |
| CRITICAL / release blocker | Processing/backup/evidence paths must stay within the accepted KZ boundary or have an approved lawful design | External acceptance pending |
| HIGH | Production previously allowed plaintext/dual contact-PII mode | Fixed fail-closed |
| HIGH | Render staging previously defaulted PII storage to plaintext | Fixed; encrypted mode now requires explicit key material |
| HIGH | Production DB transport could previously be configured without explicit TLS | Fixed fail-closed |
| HIGH | Domain content such as chat/dispute/display name/financial details remains logical plaintext in PostgreSQL | Requires accepted provider encryption/IAM or separate field-encryption design |
| MEDIUM/HIGH | Browser refresh token is JavaScript-readable in sessionStorage; successful XSS could steal it | Residual architecture risk; strict nonce CSP now reduces exposure |
| MEDIUM | Raw PII encryption keys are supplied to application runtime | KMS/HSM/vault custody pending |
| MEDIUM | AuditEvent.payload is generic JSON without the same centralized privacy guard as notifications | Central audit privacy helper pending |
| MEDIUM | Stored password hashes that do not match the approved scrypt profile are rejected | Operational reset/migration plan required if legacy hashes exist |
| MEDIUM | Exact legal retention periods remain unresolved | Legal/privacy review pending |
| EXTERNAL | Backup/PITR and object-storage encryption/residency evidence | Provider acceptance pending |
| EXTERNAL | Independent penetration test | Pending before broad public launch |

## 1. Contact PII encryption

Protected contact fields include:

- email;
- phone;
- verification email;
- push endpoint;
- push P-256 DH key;
- push auth secret.

Protection design:

- AES-256-GCM;
- random 12-byte IV;
- 16-byte authentication tag;
- AAD bound to record ID + field + envelope version;
- versioned key ID;
- HMAC-SHA256 blind index using a separate 32-byte lookup key.

Production now requires:

```text
PII_CONTACT_STORAGE_MODE=encrypted
```

Production rejects `plaintext` and `dual`.

### Key custody risk

The crypto construction is sound for database-only compromise resistance, but application runtime receives raw encryption key material.

For higher-assurance production, use a Kazakhstan-compatible secrets/KMS/HSM design with:

- explicit IAM;
- rotation/revocation evidence;
- restricted operator access;
- no key material in developer-readable config exports.

## 2. Database transport and at-rest storage

Production DATABASE_URL must:

- be PostgreSQL;
- use TLS with `sslmode=require`, `verify-ca` or `verify-full`.

Provider encryption at rest is still mandatory because many domain values are logical plaintext, including examples such as:

- display name;
- contract-chat body;
- dispute description;
- contract terms;
- payment amounts/schedules;
- some reason/confirmation fields;
- audit/outbox metadata.

Production also requires a versioned storage-encryption policy reference.

This is a governance gate, not provider proof.

## 3. Kazakhstan residency and processing

Current production configuration requires:

```text
PERSONAL_DATA_STORAGE_COUNTRY=KZ
PERSONAL_DATA_PROCESSING_COUNTRY=KZ
PERSONAL_DATA_RESIDENCY_POLICY_ID=<approved-reference>
PERSONAL_DATA_STORAGE_ENCRYPTION_POLICY_ID=<approved-reference>
```

Temporary Render/Neon/Vercel use must remain synthetic staging unless the actual provider topology has been independently accepted for Kazakhstan personal-data requirements.

Production acceptance must cover:

- primary DB location;
- Backend processing location;
- evidence/object storage location;
- backups and replicas;
- disaster recovery;
- malware scanner path;
- identity/KYC provider path;
- e-mail/subprocessor flows;
- cross-border processing/transfer basis.

## 4. Passwords

Current password storage:

- scrypt;
- random salt;
- N=32768;
- r=8;
- p=3;
- 64-byte derived key;
- timing-safe verification.

Passwords are never stored plaintext or reversibly encrypted.

Verifier now accepts only the approved scrypt parameter profile and valid salt/hash lengths. If any legacy hashes exist from an older profile, migrate them or force a bounded password reset before production rollout rather than weakening verification.

## 5. Session/token storage

Verified server-side:

- refresh tokens are high-entropy;
- only refresh-token hashes are persisted;
- refresh rotation is atomic;
- revoked/expired sessions invalidate access;
- reset and verification tokens are stored as hashes;
- invite-link tokens are hash-only, short-lived and single-use;
- expired sessions/ephemeral auth metadata have cleanup tooling.

Browser/PWA:

- session material is stored in sessionStorage only;
- no localStorage application usage;
- no IndexedDB application usage;
- logout/password/session revoke/account deletion use the unified cleanup boundary.

Residual risk: sessionStorage is JavaScript-readable. XSS can expose access/refresh tokens.

Long-term preferred hardening: evaluate server-managed HttpOnly/Secure/SameSite refresh-session design or equivalent architecture, paired with CSRF controls.

## 6. Front CSP / XSS

Current response protections include:

- default-src self;
- object-src none;
- frame-ancestors none;
- exact connect-src;
- nosniff;
- DENY framing;
- restrictive permissions policy;
- Cross-Origin-Opener-Policy;
- poweredByHeader disabled;
- a per-request CSP nonce;
- `script-src 'self' 'nonce-…' 'strict-dynamic'` in production;
- `unsafe-eval` only in development.

Production no longer relies on `script-src 'unsafe-inline'`.

Residual risk remains because access/refresh tokens are JavaScript-readable in sessionStorage. Keep browser E2E/CSP regression coverage and evaluate a future server-managed refresh-session design if the threat model requires stronger XSS resistance.

## 7. Browser/PWA cache behavior

Verified:

- Backend globally emits `Cache-Control: no-store`;
- dashboard metadata uses noindex/nofollow/nocache;
- service worker caches static assets only;
- navigation is network-first;
- API responses are not intentionally cached;
- offline fallback does not contain private financial payload.

## 8. Notification persistence

A central privacy guard runs before notification-outbox persistence.

Forbidden categories include:

- email/phone;
- password;
- access/refresh token;
- authorization/cookie;
- object/signed/upload/download URLs;
- chat/body/description content;
- ciphertext/private key.

Contract-chat notifications contain IDs/status/role metadata only, not chat body.

Phone detection was made context-aware so UUID/amount/timestamp operational metadata is not misclassified as phone PII.

## 9. Evidence/object storage

Verified repository controls:

- feature default-off;
- private signed upload/download;
- upload scope bound to user + contract + purpose;
- download scope bound to contract + purpose;
- short signed URL TTL;
- default TTL 300 seconds;
- hard maximum 900 seconds;
- hash/size/media metadata binding;
- malware scan before usable download;
- retention/legal hold tooling;
- HTTPS-only storage endpoint config;
- production retention/lifecycle references required.

External production proof still required for:

- bucket public-access block;
- encryption at rest;
- KZ location;
- service-account least privilege;
- replication/backup region;
- lifecycle implementation;
- scanner residency;
- CLEAN/EICAR acceptance.

## 10. Account export

Self-service export v2:

- authenticated;
- rate-limited;
- canonical data hash;
- decrypted own contact data;
- role-scoped contract/payment summaries;
- only chat messages authored by the current user's party;
- excludes counterparty-authored chat text;
- excludes password/token/ciphertext/storage-key/provider raw identifiers.

Front security hardening keeps only export summary metadata in React state after the download action.

## 11. Account deletion/anonymization

Current anonymization removes or disables:

- direct email/phone plaintext and ciphertext;
- lookup hashes;
- password credential;
- public identifier;
- active sessions;
- email verification;
- password-reset challenge;
- discovery/idempotency commands;
- push subscriptions;
- risk access;
- repayment metrics;
- public/search/analytics notification settings.

Retained structures such as contracts/payments/audit/chat/disputes/evidence require legal retention decisions.

## 12. Audit/support access

Support mutation surfaces are default-off.

Support credential registry uses:

- token hashes, not raw tokens;
- timing-safe compare;
- expiry;
- explicit scopes.

Reviewed support audit payloads retain metadata (status/reason/actor IDs) rather than raw contact/chat/document content.

Database integrity hardening now makes `audit_events` append-only by rejecting UPDATE and DELETE through a PostgreSQL trigger.

Residual design gap:

`AuditEvent.payload` is generic JSON and does not currently share the notification payload's centralized sensitive-key/value guard.

Recommendation: put new audit writers behind a privacy-safe audit service/helper. For stronger tamper evidence against privileged database operators, add an external append-only archive or cryptographic chaining.

## 13. Logging

No generic application request-body logging was identified.

Privacy scanner detects:

- authorization/token patterns;
- password indicators;
- e-mail;
- phone values;
- signed URL;
- evidence object key;
- SMTP response;
- document content;
- private key indicators.

Raw matched values must never be retained in evidence.

## 14. Backups

Repository backup rehearsal:

- uses synthetic data;
- verifies encrypted contact ciphertext/blind index/decryption after restore;
- deletes dump bytes before retaining CI evidence;
- retains metadata only.

Production still needs proof for:

- encrypted automated backups;
- KZ residency of replicas/backups;
- separate backup access controls;
- retention/deletion;
- PITR;
- isolated restore;
- RTO/RPO.

## 15. Incident response

Personal-data breach suspicion is treated as SEV-1.

Current Kazakhstan regulatory baseline includes a short breach-notification clock. Incident handling must record detection time immediately and escalate to the privacy/legal owner without copying raw personal data into tickets/chat.

Repository incident-response runbook includes a one-working-day notification-clock gate.

## 16. Data minimization / discovery

Verified privacy principles:

- profile/search defaults private;
- public-ID search is opt-in;
- blocks enforced both ways;
- inaccessible resources use privacy-safe not-found behavior;
- private requests remain invite scoped;
- public marketplace surfaces avoid lender identity disclosure;
- analytics consent is opt-in;
- metrics are aggregate-only.

## 17. Remaining production blockers

Do not approve production/public pilot until at minimum:

```text
backend_ci=pass
backend_supply_chain=pass
front_ci=pass
front_supply_chain=pass
personal_data_storage_country=KZ
personal_data_processing_country=KZ
kz_primary_database_provider_acceptance=pass
kz_backend_processing_provider_acceptance=pass
database_tls=pass
provider_encryption_at_rest=pass
backup_residency_encryption=pass
pii_contact_storage_mode=encrypted
pii_key_custody_review=accepted
evidence_storage_residency_encryption=pass|n/a
retention_legal_review=accepted
privacy_notice_consent_review=accepted
incident_owner_and_escalation=accepted
independent_security_review=pass
```

Additional strongly recommended hardening before broader public launch:

- MFA/passkeys/TOTP;
- strict CSP migration;
- audit-payload privacy guard;
- legacy password rehash;
- penetration test;
- KMS/HSM key custody.

## 18. CI verification note

The current Back/Front private-repository Actions runs are terminating at setup level in a few seconds without job steps. The project already documents a private GitHub Actions quota/billing gate. Public QaryzLinkDocs workflows continue to run successfully.

Security changes must therefore be treated as **repository-reviewed but not CI-verified** until private-runner quota/billing is restored and all checks rerun.

## Conclusion

QaryzLink now has a strong privacy-first storage foundation, but production safety depends on more than code.

The biggest remaining risks are:

1. real Kazakhstan residency/processing/provider proof;
2. provider encryption and backup controls;
3. key custody;
4. browser XSS/session-token architecture;
5. legal retention;
6. external/independent verification.

A new staging candidate should be frozen only after private CI/supply-chain execution is restored and all security-hardened revisions pass.
