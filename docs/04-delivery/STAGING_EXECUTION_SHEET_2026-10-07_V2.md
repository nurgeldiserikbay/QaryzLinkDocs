# Staging execution sheet — candidate v2

Use this sheet only for the frozen staging candidate:

```text
front_commit_sha=de4d220e52f36a67ef047137a1596156e814955c
backend_commit_sha=07a742e759513e2eecd443c03c4c7c69f44180e1
admin_commit_sha=ea8f76674b72b6d0910ba69f967746d826da0cad
```

Canonical candidate record:

`STAGING_CANDIDATE_2026-10-07_V2.md`

Do not substitute a newer main commit during acceptance. Any application-code change invalidates this sheet and the candidate.

## 1. Render + Neon preparation

Create/update the Render Blueprint from the exact Backend candidate commit.

Required operator-supplied values:

```text
DATABASE_URL=<Neon staging connection string>
CORS_ALLOWED_ORIGINS=<exact Front/Admin origins as applicable>
```

Blueprint/runtime-generated or bound values to verify without copying their secret values into evidence:

```text
NODE_ENV=staging
HOST=0.0.0.0
TRUST_PROXY_HOPS=0
REDIS_URL=<bound from qaryzlink-cache>
JWT_ACCESS_SECRET=<generated>
METRICS_ACCESS_TOKEN=<generated>
SCHEDULER_TRIGGER_TOKEN=<generated>
```

High-risk feature flags remain default-off unless a dedicated acceptance slice explicitly requires one.

Verify:

```text
GET /api/v1/health       -> status=ok
GET /api/v1/health/ready -> status=ready
database                 -> up
```

Do not retain response bodies as release evidence.

## 2. Backend repository configuration

Repository variables:

```text
RENDER_STAGING_BASE_URL=https://<render-service-origin>
RENDER_STAGING_FRONT_ORIGIN=https://<front-staging-origin>
```

For broader Staging Core Acceptance, also configure the variables/secrets required by `staging-core-acceptance.yml`, including exact public/internal origins, metrics token and synthetic staging auth credentials.

Never store secret values in Docs, issues, chat or release evidence.

## 3. Run Backend Render acceptance

Repository: `QaryzLinkBack`

Workflow:

`Render Neon Staging Acceptance`

Run it from the exact Backend candidate commit.

Inputs:

```text
deployed_commit_sha=07a742e759513e2eecd443c03c4c7c69f44180e1
non_production_ack=true
```

Expected:

```text
health_readiness_result=success
cors_security_headers_result=success
private_auth_boundary_result=success
overall_result=success
```

The workflow also probes the unauthenticated contract-chat boundary and must receive 401.

## 4. Optional full Backend core acceptance

Repository: `QaryzLinkBack`

Workflow:

`Staging Core Acceptance`

Inputs:

```text
deployed_commit_sha=07a742e759513e2eecd443c03c4c7c69f44180e1
deployed_image_digest=sha256:<64-hex-digest>
non_production_ack=true
```

Expected metadata-only result:

```text
runtime_result=success
metrics_ingress_result=success
pii_encrypted_result=success
auth_session_result=success
proxy_spoof_result=success
overall_result=success
```

Do not fabricate an image digest. Use the immutable digest of the actually deployed Backend image.

## 5. Front deployment

Deploy exact Front candidate:

```text
de4d220e52f36a67ef047137a1596156e814955c
```

Environment:

```text
NEXT_PUBLIC_API_BASE_URL=https://<render-service-origin>
NEXT_PUBLIC_SITE_URL=https://<front-staging-origin>
NATIVE_APP_URL=https://<front-staging-origin>
```

Verify landing, register and login load without CORS errors.

## 6. Front authenticated browser acceptance

Repository: `QaryzLinkFront`

Workflow:

`Browser E2E (Render staging authenticated)`

Required repository configuration:

Variable:

```text
E2E_STAGING_BASE_URL=https://<front-staging-origin>
E2E_STAGING_LENDER_PUBLIC_ID=<synthetic-lender-public-id>
```

Secrets:

```text
E2E_STAGING_BORROWER_EMAIL
E2E_STAGING_BORROWER_PASSWORD
E2E_STAGING_LENDER_EMAIL
E2E_STAGING_LENDER_PASSWORD
```

Inputs:

```text
deployed_front_commit_sha=de4d220e52f36a67ef047137a1596156e814955c
deployed_backend_commit_sha=07a742e759513e2eecd443c03c4c7c69f44180e1
non_production_ack=true
```

Expected result: success.

Use synthetic staging accounts only.

## 7. Admin deployment

Deploy exact Admin candidate:

```text
ea8f76674b72b6d0910ba69f967746d826da0cad
```

Environment:

```text
NEXT_PUBLIC_API_BASE_URL=https://<render-service-origin>
QARYZLINK_API_BASE_URL=https://<render-service-origin>
METRICS_ACCESS_TOKEN=<same Render metrics token>
```

Do not place metrics/support credentials under `NEXT_PUBLIC_*`.

## 8. Admin browser acceptance

Repository: `QaryzLinkAdmin`

Workflow:

`Browser E2E (Render staging operations)`

Repository variable:

```text
E2E_ADMIN_STAGING_BASE_URL=https://<admin-staging-origin>
```

Inputs:

```text
deployed_admin_commit_sha=ea8f76674b72b6d0910ba69f967746d826da0cad
deployed_backend_commit_sha=07a742e759513e2eecd443c03c4c7c69f44180e1
non_production_ack=true
```

Expected result: success.

The acceptance is read-only and must not enable support mutation actions merely for testing.

## 9. Chat acceptance evidence

Record only result metadata:

```text
contract_chat_private_boundary=pass
contract_chat_two_party_flow=pass
contract_chat_unread_read_sync=pass
contract_chat_history_pagination=pass
contract_chat_notification_payload_privacy=pass
```

Do not retain:

- chat message text;
- account emails;
- access/refresh tokens;
- raw notification payloads;
- response bodies;
- credential-bearing URLs.

## 10. Account-data export v2 acceptance

Only if `ACCOUNT_DATA_EXPORT_ENABLED=true` for a controlled staging slice.

Record:

```text
account_data_export_schema=v2
account_data_export_self_authored_chat_only=pass
account_data_export_counterparty_chat_excluded=pass
account_data_export_policy_review=accepted|pending
```

Technical correctness is not legal/privacy approval.

## 11. Notification scheduler

Repository: `QaryzLinkBack`

Workflow:

`Render Staging Notification Scheduler`

Enable only after the staging Backend target and scheduler token are configured.

Repository configuration:

```text
RENDER_STAGING_SCHEDULER_ENABLED=true
RENDER_STAGING_BASE_URL=https://<render-service-origin>
RENDER_STAGING_SCHEDULER_TRIGGER_TOKEN=<secret>
```

The scheduled run is hourly at minute 17 UTC.

Expected: maintenance response validates as non-negative counters and `failed=0`.

## 12. Evidence record

Fill `RELEASE_EVIDENCE_TEMPLATE.md` with metadata only.

At minimum bind:

```text
front_commit_sha=de4d220e52f36a67ef047137a1596156e814955c
backend_commit_sha=07a742e759513e2eecd443c03c4c7c69f44180e1
admin_commit_sha=ea8f76674b72b6d0910ba69f967746d826da0cad
backend_image_digest=sha256:<actual-digest-or-n/a-for-render-only-slice>
```

## 13. Stop / invalidate conditions

Stop acceptance and mark this candidate invalid if:

- any deployed application SHA differs from the pinned candidate;
- Backend migrations fail;
- readiness/database dependency is not green;
- CORS/private-auth/chat boundary checks fail;
- browser E2E fails reproducibly;
- acceptance discovers a defect requiring application-code change;
- a security gate becomes non-green.

Do not repair evidence to fit a changed build. Freeze a new candidate instead.
