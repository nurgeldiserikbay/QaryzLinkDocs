# Staging operator checklist

Use this checklist when creating the temporary Render + Neon + Vercel staging environment.

## Backend / Render

- [ ] Create the Blueprint from `QaryzLinkBack`.
- [ ] Confirm deployed Backend commit SHA.
- [ ] Confirm `qaryzlink-back` uses the free plan.
- [ ] Confirm `qaryzlink-cache` uses the free plan.
- [ ] Confirm Blueprint sets `NODE_ENV=staging`, `HOST=0.0.0.0` and reviewed `TRUST_PROXY_HOPS=0`.
- [ ] Confirm `REDIS_URL` is bound from `qaryzlink-cache` by Blueprint, not copied into docs or chat.
- [ ] Confirm `PII_CONTACT_STORAGE_MODE=encrypted` for any staging environment that stores user contact data.
- [ ] Configure `PII_ACTIVE_KEY_ID`, `PII_ENCRYPTION_KEYRING_JSON` and `PII_LOOKUP_KEY_BASE64` through the secret manager/Render environment; never place key material in Docs, issues, chat or release evidence.
- [ ] Do not use plaintext/dual contact PII mode for a production candidate.
- [ ] Enter Neon `DATABASE_URL`.
- [ ] Enter exact `CORS_ALLOWED_ORIGINS`.
- [ ] Confirm Render generated `JWT_ACCESS_SECRET`.
- [ ] Confirm Render generated `METRICS_ACCESS_TOKEN`.
- [ ] Confirm Render generated `SCHEDULER_TRIGGER_TOKEN`.
- [ ] Confirm high-risk feature flags remain default-off (`IDENTITY_VERIFICATION_ENABLED`, `CONTRACT_SIGNING_ENABLED`, `CONTRACT_AMENDMENTS_ENABLED`, `CONTRACT_PDF_ENABLED`, `EVIDENCE_STORAGE_ENABLED`, `WEB_PUSH_ENABLED`, support mutation flags) unless a dedicated acceptance run explicitly enables one.
- [ ] Wait for `/api/v1/health/ready` to become healthy.
- [ ] Confirm migrations completed without checksum errors.

## GitHub / Backend acceptance

Set Backend repository variables:

```text
RENDER_STAGING_BASE_URL=https://<render-service>
RENDER_STAGING_FRONT_ORIGIN=https://qaryz-link-front.vercel.app
```

Then run:

`Render Neon Staging Acceptance`

Inputs:

```text
deployed_commit_sha=<exact Backend SHA deployed to Render>
non_production_ack=true
```

Expected result: success.

## Front / Vercel

Set:

```text
NEXT_PUBLIC_API_BASE_URL=https://<render-service>
NEXT_PUBLIC_SITE_URL=https://qaryz-link-front.vercel.app
NATIVE_APP_URL=https://qaryz-link-front.vercel.app
```

- [ ] Redeploy Front from the exact accepted Front commit.
- [ ] Confirm landing/register/login load.
- [ ] Confirm no browser CORS error.

## Front acceptance accounts

Configure dedicated synthetic accounts only.

Variables:

```text
E2E_STAGING_BASE_URL=https://qaryz-link-front.vercel.app
E2E_STAGING_LENDER_PUBLIC_ID=<staging lender public id>
```

Secrets:

```text
E2E_STAGING_BORROWER_EMAIL
E2E_STAGING_BORROWER_PASSWORD
E2E_STAGING_LENDER_EMAIL
E2E_STAGING_LENDER_PASSWORD
```

Run:

`Browser E2E (Render staging authenticated)`

Inputs:

```text
deployed_front_commit_sha=<exact Front SHA>
deployed_backend_commit_sha=<exact Backend SHA>
non_production_ack=true
```

Expected result: success.

## Admin

Set:

```text
NEXT_PUBLIC_API_BASE_URL=https://<render-service>
QARYZLINK_API_BASE_URL=https://<render-service>
METRICS_ACCESS_TOKEN=<same Render metrics token>
```

Do not expose metrics/support tokens with `NEXT_PUBLIC_*`.

Set repository variable:

```text
E2E_ADMIN_STAGING_BASE_URL=https://<admin-staging-origin>
```

Run:

`Browser E2E (Render staging operations)`

Inputs:

```text
deployed_admin_commit_sha=<exact Admin SHA>
deployed_backend_commit_sha=<exact Backend SHA>
non_production_ack=true
```

Expected result: success.

## Release evidence

Record only metadata:

- Backend SHA;
- Front SHA;
- Admin SHA;
- exact public origins;
- health/readiness status;
- CI/security status;
- Front browser acceptance result;
- Admin browser acceptance result;
- risk request/contract/closure acceptance result;
- contract chat private/two-party/unread/history/privacy acceptance results;
- account-data export v2 self-authored/counterparty-exclusion results when that feature is enabled for the acceptance slice.

Never store:

- database URLs;
- passwords;
- access tokens;
- email addresses;
- response bodies;
- customer or staging account PII.

## Completion rule

The temporary staging environment is accepted only when all of the following are true:

```text
backend_ci=pass
backend_supply_chain=pass
render_backend_acceptance=pass
front_ci=pass
front_browser_acceptance=pass
admin_ci=pass
admin_supply_chain=pass
admin_browser_acceptance=pass
contract_chat_private_boundary=pass
contract_chat_two_party_flow=pass
contract_chat_unread_read_sync=pass
contract_chat_history_pagination=pass
contract_chat_notification_payload_privacy=pass
account_data_export_schema=v2|n/a
account_data_export_self_authored_chat_only=pass|n/a
account_data_export_counterparty_chat_excluded=pass|n/a
account_data_export_policy_review=accepted|pending|n/a
docs_build=pass
```

If any deployed acceptance fails, treat the staging release as not accepted and fix the failing layer before enabling additional product capabilities.
