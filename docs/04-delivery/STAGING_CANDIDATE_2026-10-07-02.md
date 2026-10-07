# Staging candidate — 2026-10-07 #2

Status: frozen candidate for temporary Render + Neon + Vercel acceptance.

This record supersedes the earlier 2026-10-07 candidate because Front and Backend application code changed after that freeze. It is not production approval.

## Candidate revisions

```text
front_commit_sha=de4d220e52f36a67ef047137a1596156e814955c
backend_commit_sha=07a742e759513e2eecd443c03c4c7c69f44180e1
admin_commit_sha=ea8f76674b72b6d0910ba69f967746d826da0cad
```

Repository checks at freeze time:

```text
front_ci=pass
front_supply_chain=pass
backend_ci=pass
backend_supply_chain=pass
admin_ci=pass
admin_supply_chain=pass
open_pull_requests=0
open_issues=0
```

Documentation baseline immediately before this candidate record:

```text
docs_build_sha=82514e8929bdf85e2c868c15ab8ee82c2fa592b0
docs_build=pass
```

The Docs SHA is not an application deployment binding.

## Included repository-side scope

This candidate includes the personal-account private-debt flow plus the hardened contract-chat and privacy-export slices:

- private borrower/lender contract chat;
- immutable message persistence and role-only sender projection;
- bounded send rate and privacy-safe in-app message notifications;
- per-contract unread counts with grouped read sync;
- pending/sent notification race handling;
- bounded 50-message cursor pagination and preserved history scroll;
- visible-tab polling efficiency and chat/dashboard notification deep-links;
- Render staging chat-boundary acceptance tests;
- account own-data export v2;
- account export v2 includes only chat messages authored by the current user's own party;
- counterparty-authored chat text remains excluded from self-service export;
- account export remains default-off until privacy/legal acceptance and policy reference are approved.

Organization/company accounts remain architecture-only and are not enabled in this candidate.

## Deployment order

1. Deploy the exact Backend SHA to Render using the existing Blueprint.
2. Verify migrations complete and `/api/v1/health/ready` reports ready.
3. Run Backend `Render Neon Staging Acceptance` from the exact Backend candidate commit with:
   - `deployed_commit_sha=07a742e759513e2eecd443c03c4c7c69f44180e1`;
   - `non_production_ack=true`.
4. Deploy the exact Front SHA to Vercel with the accepted Render API origin.
5. Run Front `Browser E2E (Render staging authenticated)` using the exact Front and Backend candidate SHAs.
6. Deploy the exact Admin SHA with the same Render API origin.
7. Run Admin `Browser E2E (Render staging operations)` using the exact Admin and Backend candidate SHAs.
8. Record metadata-only results in `RELEASE_EVIDENCE_TEMPLATE.md`.

## Required chat acceptance

The staging evidence record must include:

```text
contract_chat_private_boundary=pass
contract_chat_two_party_flow=pass
contract_chat_unread_read_sync=pass
contract_chat_history_pagination=pass
contract_chat_notification_deep_link=pass
```

Use synthetic staging users only. Do not retain message text, account credentials, tokens, credential-bearing URLs, raw API payloads or customer PII as acceptance evidence.

## Own-data export acceptance boundary

If `ACCOUNT_DATA_EXPORT_ENABLED` is temporarily enabled in staging for a dedicated privacy acceptance run:

- use synthetic staging users only;
- verify response `schemaVersion=2` and `format=QARYZLINK_ACCOUNT_DATA_EXPORT_V2`;
- verify authored chat message count/content belongs only to the current user's party;
- verify counterparty-authored chat body does not appear;
- verify audit evidence contains only hash/count metadata;
- disable the feature again unless the approved policy explicitly authorizes continued enablement.

This technical test does not approve statutory/legal scope.

## Invalidation rule

This candidate is invalidated if any of the following changes before acceptance completes:

- Front application commit;
- Backend application commit;
- Admin application commit;
- Backend migration set;
- deployment origin binding in a way that changes the accepted environment;
- a CI/security gate becomes non-green;
- staging acceptance discovers a reproducible defect requiring code changes.

Documentation-only corrections do not change the pinned application candidate unless they alter the acceptance contract.

If invalidated, select new exact SHAs, rerun repository checks and create a new candidate record instead of editing retained acceptance evidence to fit a different build.
