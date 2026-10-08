# Production environment matrix

This page summarizes the minimum production environment responsibilities across QaryzLinkFront, QaryzLinkBack and QaryzLinkAdmin.

It does not replace each repository's `.env.example`. It defines which values are launch-critical and which high-risk capabilities should remain disabled until their separate acceptance gates are satisfied.

## Frontend

Repository: `QaryzLinkFront`

Required production values:

| Variable | Requirement |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Exact HTTPS backend origin |
| `NEXT_PUBLIC_SITE_URL` | Final public frontend HTTPS origin |
| `NATIVE_APP_URL` | Final frontend HTTPS origin for Capacitor; may match `NEXT_PUBLIC_SITE_URL` |

Release rules:

- no credentials, path, query or fragment in origin variables;
- final public/store release should not use temporary `vercel.app` origins;
- `pnpm mobile:configure` must align Capacitor `server.url` with `NATIVE_APP_URL`;
- `pnpm mobile:check` and `pnpm release:preflight:strict` must pass before store/public release.

## Backend

Repository: `QaryzLinkBack`

### Core runtime

Required for a normal production deployment:

| Variable | Requirement |
| --- | --- |
| `NODE_ENV` | `production` |
| `HOST` | Deployment-specific bind address |
| `PORT` | Deployment port |
| `DATABASE_URL` | Production PostgreSQL connection string from secret store; TLS sslmode required |
| `PERSONAL_DATA_STORAGE_COUNTRY` | Must be `KZ` in production |
| `PERSONAL_DATA_PROCESSING_COUNTRY` | Must be `KZ` in production |
| `PERSONAL_DATA_RESIDENCY_POLICY_ID` | Versioned reviewed KZ residency policy reference |
| `PERSONAL_DATA_STORAGE_ENCRYPTION_POLICY_ID` | Versioned reviewed at-rest encryption policy reference |
| `REDIS_URL` | Production Redis connection string |
| `JWT_ACCESS_SECRET` | Strong random secret, minimum policy enforced by backend |
| `CORS_ALLOWED_ORIGINS` | Exact frontend/admin origins that require browser access |
| `METRICS_ACCESS_TOKEN` | Required when protected metrics are consumed in production |

`TRUST_PROXY_HOPS` must stay `0` unless the exact ingress/proxy topology is known and forwarding headers are sanitized by the trusted proxy.

### Launch-safe feature gates

The following capabilities should stay disabled unless their corresponding legal, provider or operations acceptance has been completed:

| Gate | Launch-safe default |
| --- | --- |
| `IDENTITY_VERIFICATION_ENABLED` | `false` |
| `PUBLIC_MARKETPLACE_ENABLED` | `false` unless launch scope explicitly includes it |
| `CONTRACT_SIGNING_ENABLED` | `false` until legal signing acceptance |
| `CONTRACT_AMENDMENTS_ENABLED` | `false` |
| `CONTRACT_POST_PAYMENT_AMENDMENT_SIGNING_ENABLED` | `false` |
| `CONTRACT_POST_PAYMENT_AMENDMENT_ACTIVATION_ENABLED` | `false` |
| `CONTRACT_PDF_ENABLED` | `false` until templates/renderer accepted |
| `EVIDENCE_STORAGE_ENABLED` | `false` until private storage/scanning/retention accepted |
| `EVIDENCE_BINARY_ARCHIVE_ENABLED` | `false` |
| `EVIDENCE_SEALING_ENABLED` | `false` until KMS/HSM signer accepted |
| `EVIDENCE_TIMESTAMP_ENABLED` | `false` until timestamp provider/legal profile accepted |
| `PENALTY_ENABLED` | `false` |
| `AMOUNT_BASED_COMMISSION_ENABLED` | `false` |
| `ACCOUNT_DATA_EXPORT_ENABLED` | `false` until privacy/export scope accepted |
| support mutation gates | `false` until named support/legal process exists |
| `EXPOSE_API_DOCS` | `false` in normal production |

### PII rollout

Production is now fail-closed:

- `PII_CONTACT_STORAGE_MODE=encrypted` is mandatory;
- `plaintext` and `dual` are rejected in production;
- encryption keyring/HMAC keys live only in the deployment secret store;
- plaintext backfill/dual-mode work is a migration/staging activity only;
- `PII_PLAINTEXT_SCRUB_ENABLED` remains a controlled maintenance gate.

Before switching a real production environment to encrypted mode, finish backfill, encrypted-mode acceptance, plaintext-retirement checks and rollback evidence in non-production first.

### Email

If email verification/password reset are enabled:

- `MAIL_ENABLED=true`;
- SMTP host/user/password/from must come from deployment secret storage;
- `EMAIL_VERIFICATION_URL` and `PASSWORD_RESET_URL` must use the final frontend HTTPS domain.

## Admin

Repository: `QaryzLinkAdmin`

Required production values:

| Variable | Requirement |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Public liveness/backend origin only, no secrets |
| `QARYZLINK_API_BASE_URL` | Exact HTTPS backend origin, server-only |
| `METRICS_ACCESS_TOKEN` | Server-only protected metrics credential |
| `SUPPORT_STAFF_TOKEN` | Server-only scoped staff credential |
| `ADMIN_BASIC_AUTH_USER` | Required production admin username |
| `ADMIN_BASIC_AUTH_PASSWORD` | Required production admin password; at least 32 bytes |
| `ADMIN_SITE_ORIGIN` | Exact production Admin HTTPS origin; required for server-action mutation origin checks |

Rules:

- never expose server credentials under `NEXT_PUBLIC_*`;
- operator credentials must be scoped and revocable;
- Admin proxy fails closed in production if Basic Auth credentials are missing or the password is shorter than 32 bytes;
- `ADMIN_SITE_ORIGIN` must be an exact HTTPS origin and must match the deployed Admin site;
- production server-action mutations reject cross-origin requests before using server-held support credentials;
- authenticated admin responses are `Cache-Control: no-store`;
- Basic Auth is an interim gate; a managed staff identity/SSO boundary is preferred for broader operational use;
- production admin origin must be included in backend CORS only if browser-origin access is actually required.

## Secret ownership

Store secrets in the deployment platform secret manager, not in Git:

- database/Redis credentials;
- JWT secrets;
- SMTP credentials;
- metrics token;
- support staff token;
- identity provider tokens;
- evidence storage credentials;
- signing/timestamp provider tokens;
- encryption keyring/HMAC material;
- Android/iOS signing material.

## Launch sequence

1. Select and accept Kazakhstan-hosted storage/processing providers and encryption-at-rest policy.
2. Configure production database and Redis.
3. Configure backend core runtime secrets.
4. Deploy backend and run migrations.
5. Verify backend health/metrics and confirm the production API returns HSTS.
6. Configure final frontend/admin origins and backend CORS.
7. Deploy Front and Admin.
8. Run strict Front release preflight.
9. Run strict Admin release preflight.
10. Run staging/production smoke/acceptance.
11. Enable only explicitly approved feature gates.
12. Record deployed commit SHAs, image digest and final environment profile in release evidence.

## Environment evidence rule

Release evidence should record variable **names and effective feature state**, never raw secret values.

Recommended release record:

```text
front_commit_sha=<sha>
admin_commit_sha=<sha>
backend_commit_sha=<sha>
backend_image_digest=sha256:<digest>
site_origin=https://...
api_origin=https://...
native_origin=https://...
identity_verification_enabled=false
contract_signing_enabled=false
evidence_storage_enabled=false
...
```

Do not store tokens, passwords, database URLs or key material in release evidence.
