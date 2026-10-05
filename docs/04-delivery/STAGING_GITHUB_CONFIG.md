# Staging GitHub configuration contract

This file defines the repository-level GitHub Variables and Secrets required by the temporary Render + Neon + Vercel acceptance workflows.

Do not commit real credentials into source files. Configure them in GitHub repository settings.

## QaryzLinkBack

### Repository Variables

```text
RENDER_STAGING_BASE_URL=https://<render-service>
RENDER_STAGING_FRONT_ORIGIN=https://qaryz-link-front.vercel.app
```

These must be exact HTTPS origins with no path, query, fragment or credentials.

The workflow `Render Neon Staging Acceptance` uses only these public origin values.

### Repository Secrets

No additional secret is required by the temporary Render acceptance workflow.

Backend runtime secrets such as `DATABASE_URL`, `JWT_ACCESS_SECRET` and `METRICS_ACCESS_TOKEN` remain in Render, not GitHub, for this temporary profile.

## QaryzLinkFront

### Repository Variables

```text
E2E_STAGING_BASE_URL=https://qaryz-link-front.vercel.app
E2E_STAGING_LENDER_PUBLIC_ID=<dedicated staging lender public id>
```

### Repository Secrets

```text
E2E_STAGING_BORROWER_EMAIL=<dedicated synthetic staging account>
E2E_STAGING_BORROWER_PASSWORD=<password>
E2E_STAGING_LENDER_EMAIL=<dedicated synthetic staging account>
E2E_STAGING_LENDER_PASSWORD=<password>
```

Use synthetic/dedicated staging accounts only. Do not use real customer accounts.

For temporary Render deployment use:

`Browser E2E (Render staging authenticated)`

Inputs:

```text
deployed_front_commit_sha=<exact Front SHA deployed to Vercel>
deployed_backend_commit_sha=<exact Backend SHA deployed to Render>
non_production_ack=true
```

The standard `Browser E2E (staging authenticated)` remains available for environments where an immutable backend image digest is recorded.

## QaryzLinkAdmin

### Repository Variables

```text
E2E_ADMIN_STAGING_BASE_URL=https://<admin-staging-origin>
```

The temporary Render operations workflow is read-only and does not need support mutation credentials.

For temporary Render deployment use:

`Browser E2E (Render staging operations)`

Inputs:

```text
deployed_admin_commit_sha=<exact Admin SHA deployed to staging>
deployed_backend_commit_sha=<exact Backend SHA deployed to Render>
non_production_ack=true
```

The standard `Browser E2E (staging operations)` remains for environments that record an immutable backend image digest.

## Required deployment bindings

Before running acceptance, verify:

```text
Front NEXT_PUBLIC_API_BASE_URL == Render backend origin
Admin NEXT_PUBLIC_API_BASE_URL == Render backend origin
Admin QARYZLINK_API_BASE_URL == Render backend origin
Backend CORS_ALLOWED_ORIGINS contains exact Front origin
```

If Admin performs browser-side backend calls in the active build, its exact origin must also be included in backend `CORS_ALLOWED_ORIGINS`.

## Acceptance order

1. Deploy Backend commit to Render.
2. Verify Render health check becomes healthy.
3. Run Backend `Render Neon Staging Acceptance`.
4. Deploy/redeploy Front with the Render API origin.
5. Configure synthetic Front acceptance accounts.
6. Run Front `Browser E2E (Render staging authenticated)`.
7. Deploy/redeploy Admin with the same Render API origin.
8. Run Admin `Browser E2E (Render staging operations)`.
9. Record only metadata results in the release evidence template.

## Privacy rules

- no real borrower/lender credentials;
- no tokens or passwords in workflow inputs;
- no target URLs or credentials in retained evidence;
- no raw API response bodies in evidence;
- no database records or PII in release notes.
