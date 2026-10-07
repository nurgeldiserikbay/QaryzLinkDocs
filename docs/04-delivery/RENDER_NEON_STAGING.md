# Render + Neon + Vercel staging deployment

This runbook is for a temporary QaryzLink web/PWA environment using **synthetic staging data only**. It is not the final production profile and is not evidence of Kazakhstan production data residency.

## Target topology

- Front: Vercel
- Back: Render Web Service
- Database: Neon PostgreSQL
- Cache/runtime dependency: Render Key Value
- Environment profile: `NODE_ENV=staging`

The backend repository contains `render.yaml`. The blueprint intentionally keeps regulated/high-risk feature gates disabled by default.

## 1. Neon

Create or reuse the Neon database and copy the application connection string.

Set this only in Render:

```text
DATABASE_URL=<Neon PostgreSQL connection string>
```

Do not commit the connection string.

## 2. Render Blueprint

In Render, create a new Blueprint from the `QaryzLinkBack` repository.

The blueprint creates:

- `qaryzlink-back` web service;
- `qaryzlink-cache` Render Key Value service;
- generated `JWT_ACCESS_SECRET`;
- generated `METRICS_ACCESS_TOKEN`;
- readiness health check at `/api/v1/health/ready`.

For this temporary single-instance staging setup, the Docker start command runs:

```text
prisma migrate deploy
node dist/src/main.js
```

before the service becomes healthy.

For a permanent paid production deployment, move migrations to Render's dedicated pre-deploy command/job instead of coupling migrations to web startup.

## 3. Required manual Render values

The Blueprint prompts for the values declared with `sync: false`.

### DATABASE_URL

Use the Neon application connection string.

### CORS_ALLOWED_ORIGINS

Provide exact comma-separated browser origins only.

For the current temporary frontend:

```text
https://qaryz-link-front.vercel.app
```

If Admin must call the API directly from the browser, append the exact Admin HTTPS origin:

```text
https://qaryz-link-front.vercel.app,https://<admin-origin>
```

Do not use wildcards, paths, credentials, query strings, or fragments.

## 4. Launch-safe staging defaults

The Blueprint keeps these disabled:

- public marketplace;
- contract signing;
- contract amendments;
- evidence storage/archive/sealing/timestamping;
- penalties;
- amount-based commission;
- identity verification;
- account data export;
- support mutation capabilities;
- public API docs.

Enable a capability later only after its own acceptance gate is complete.

## 5. Verify backend after deploy

Check:

```text
GET https://<render-service>/api/v1/health
GET https://<render-service>/api/v1/health/ready
```

Expected readiness response has:

```json
{
  "status": "ready",
  "dependencies": {
    "database": "up"
  }
}
```

If readiness is not healthy, inspect database connectivity and migration status before pointing Front/Admin at the service.

## 6. Vercel Front

Set:

```text
NEXT_PUBLIC_API_BASE_URL=https://<render-service>
NEXT_PUBLIC_SITE_URL=https://qaryz-link-front.vercel.app
NATIVE_APP_URL=https://qaryz-link-front.vercel.app
```

Redeploy Front after changing `NEXT_PUBLIC_API_BASE_URL`.

## 7. Admin

Set the backend origin to the same Render HTTPS service.

Keep `METRICS_ACCESS_TOKEN` and staff credentials server-only. Never expose them through `NEXT_PUBLIC_*`.

## 8. Acceptance

After all services point to the same environment:

1. verify backend readiness;
2. open Front landing/register/login;
3. run authenticated private-debt staging browser acceptance;
4. verify lender-only risk analytics lifecycle;
5. verify account settings and disclosure history;
6. verify Admin liveness/operator paths that are in current scope;
7. record Front/Back/Admin commit SHAs in release evidence.

## Personal-data restriction for this staging topology

Do not use real customer personal data in this temporary Render/Neon/Vercel environment.

The production profile now fails closed unless it declares:

```text
PERSONAL_DATA_STORAGE_COUNTRY=KZ
PERSONAL_DATA_PROCESSING_COUNTRY=KZ
PERSONAL_DATA_RESIDENCY_POLICY_ID=<reviewed-versioned-id>
PERSONAL_DATA_STORAGE_ENCRYPTION_POLICY_ID=<reviewed-versioned-id>
PII_CONTACT_STORAGE_MODE=encrypted
```

Those declarations still require independent provider/location/encryption evidence. They are not satisfied merely by setting environment variables.

## Production differences

Before a permanent production launch:

- use a final custom domain instead of temporary `vercel.app` / `onrender.com` origins;
- use `NODE_ENV=production`;
- use accepted Kazakhstan-hosted storage and processing infrastructure;
- require encrypted contact PII mode and accepted storage encryption-at-rest;
- provide `PILOT_SCOPE_APPROVAL_ID`;
- move migrations to a dedicated pre-deploy step;
- complete legal/privacy approval;
- confirm backups/recovery, monitoring and alerting;
- record the exact deployment SHAs and image digest.


## 9. Backend Render acceptance workflow

For this temporary plaintext staging profile, use the backend workflow:

`Render Neon Staging Acceptance`

Do not use `Staging Core Acceptance` for the first Render demo unless the backend has already been moved to encrypted PII mode. The full core workflow intentionally requires encrypted-mode acceptance.

Configure these Backend repository variables:

```text
RENDER_STAGING_BASE_URL=https://<render-service>
RENDER_STAGING_FRONT_ORIGIN=https://qaryz-link-front.vercel.app
```

Run the workflow from the exact Backend commit deployed to Render and provide:

```text
deployed_commit_sha=<same 40-character backend SHA>
non_production_ack=true
```

The workflow verifies:

- liveness;
- Neon-backed readiness;
- allowed Front CORS;
- rejected untrusted CORS;
- security headers;
- unauthenticated private API rejection;
- unauthenticated risk-disclosure rejection.

It stores metadata-only evidence for 14 days and does not retain target URLs, origins, tokens, response bodies or PII.

## 10. End-to-end staging acceptance order

After the Render service is healthy:

1. run Backend `Render Neon Staging Acceptance`;
2. point Front Vercel to the Render origin and redeploy;
3. create/confirm the dedicated staging borrower and lender test accounts;
4. run Front `Browser E2E (staging authenticated)`;
5. point Admin to the same backend and run Admin `Browser E2E (staging operations)`;
6. copy only metadata/status results into the release evidence record.

For a later production-like encrypted staging environment, run Backend `Staging Core Acceptance` in addition to the temporary Render acceptance.


## 11. Migration immutability

Treat every migration that may have been applied to Neon/staging/production as immutable.

Rules:

- never edit an existing applied migration to add backfill or patch SQL;
- add a new timestamped migration for every follow-up data backfill or schema correction;
- before deployment, run `prisma migrate deploy` against a clean CI database;
- if Prisma reports a checksum mismatch, stop deployment and reconcile migration history before changing application code or data.

The risk analytics foundation migration is kept at its original checksum. The relationship-grant backfill is delivered as a separate later migration.


## 12. Optional Web Push

Web Push is implemented but remains disabled by default in the Render Blueprint.

Do not enable it until the backend and frontend are deployed from commits that include the push channel migration and Settings controls.

### Generate one VAPID key pair

From the Backend repository after dependencies are installed:

```text
pnpm exec web-push generate-vapid-keys
```

Store the generated values in the deployment secret stores. Do not commit either key.

### Render backend

Add:

```text
WEB_PUSH_ENABLED=true
WEB_PUSH_VAPID_SUBJECT=mailto:<operations-contact>
WEB_PUSH_VAPID_PUBLIC_KEY=<generated-public-key>
WEB_PUSH_VAPID_PRIVATE_KEY=<generated-private-key>
```

The private key is backend-only.

If push should remain unavailable, keep:

```text
WEB_PUSH_ENABLED=false
```

and omit the VAPID keys.

### Vercel Front

Set only the matching public key:

```text
NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY=<same-generated-public-key>
```

Never expose the private VAPID key through a `NEXT_PUBLIC_*` variable.

Redeploy Front after adding or changing the public key.

### Acceptance

After both services are redeployed:

1. open Settings in a supported browser;
2. press the explicit push enable button;
3. grant browser notification permission;
4. confirm the current device reports push enabled;
5. verify a repayment due/overdue reminder can create a push delivery;
6. disable push for the current device and confirm that device subscription is revoked;
7. confirm notification lock-screen text does not expose debt amount or due date.

The current release intentionally limits push to repayment due and overdue reminders.
