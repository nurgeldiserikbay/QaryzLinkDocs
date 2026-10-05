# Render + Neon + Vercel staging deployment

This runbook is for a temporary QaryzLink web/PWA environment. It is not the final production profile.

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

## Production differences

Before a permanent production launch:

- use a final custom domain instead of temporary `vercel.app` / `onrender.com` origins;
- use `NODE_ENV=production`;
- provide `PILOT_SCOPE_APPROVAL_ID`;
- move migrations to a dedicated pre-deploy step;
- complete legal/privacy approval;
- confirm backups/recovery, monitoring and alerting;
- record the exact deployment SHAs and image digest.
