# Staging candidate v2 — 2026-10-07

Status: frozen candidate for temporary Render + Neon + Vercel acceptance.

This record supersedes the earlier 2026-10-07 staging candidate because Front and Backend application code changed after that freeze.

This is not production approval. It pins the exact application revisions that must be deployed together for the next staging acceptance cycle.

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

Documentation baseline at freeze time:

```text
docs_commit_sha=82514e8929bdf85e2c868c15ab8ee82c2fa592b0
docs_html=pass
```

## Included repository-side scope

This candidate includes the complete current personal-account private-debt flow plus:

- private borrower/lender contract chat;
- immutable chat persistence;
- privacy-safe role-only sender projection;
- rate-limited message writes;
- in-app message notifications without message body in the notification payload;
- per-contract unread message counts;
- grouped chat-read synchronization;
- pending-notification race handling;
- bounded 50-message history cursor pagination;
- visible-tab polling optimization;
- dashboard and notification deep-links to contract chat;
- account-data export **v2**;
- account-data export v2 includes only the current user's authored contract-chat messages;
- counterparty-authored chat text remains excluded from self-service export;
- chat retention after anonymization remains subject to legal/privacy retention acceptance;
- Render chat-boundary acceptance tooling;
- staging operator checklist aligned with Blueprint runtime bindings and scheduler secrets.

Organization/company accounts remain architecture-only and are not enabled in this staging candidate.

## Deployment order

1. Deploy the exact Backend SHA to Render through the existing Blueprint.
2. Verify migrations complete and `/api/v1/health/ready` reports ready.
3. Run Backend `Render Neon Staging Acceptance` using:
   - `deployed_commit_sha=07a742e759513e2eecd443c03c4c7c69f44180e1`;
   - `non_production_ack=true`.
4. Deploy the exact Front SHA to Vercel with the accepted Render API origin.
5. Run Front `Browser E2E (Render staging authenticated)` against the frozen Front + Backend SHAs.
6. Deploy the exact Admin SHA with the same Render API origin.
7. Run Admin `Browser E2E (Render staging operations)` against the frozen Admin + Backend SHAs.
8. Record metadata-only evidence in `RELEASE_EVIDENCE_TEMPLATE.md`.

## Required chat acceptance

The staging evidence record must include:

```text
contract_chat_private_boundary=pass
contract_chat_two_party_flow=pass
contract_chat_unread_read_sync=pass
contract_chat_history_pagination=pass
contract_chat_notification_payload_privacy=pass
```

Use synthetic staging users only. Do not retain message text, credentials, tokens, credential-bearing URLs, raw API payloads or customer PII as acceptance evidence.

## Account export acceptance

If `ACCOUNT_DATA_EXPORT_ENABLED=true` for the staging acceptance slice, record:

```text
account_data_export_schema=v2
account_data_export_self_authored_chat_only=pass
account_data_export_counterparty_chat_excluded=pass
account_data_export_policy_review=pending_or_pass
```

Do not treat technical export correctness as legal/privacy approval.

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

If invalidated, select new exact SHAs, rerun repository checks and create a new candidate record instead of editing retained acceptance evidence to fit the new build.
