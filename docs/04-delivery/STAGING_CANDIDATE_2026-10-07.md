# Staging candidate — 2026-10-07

Status: **superseded**. This candidate was invalidated by subsequent Front/Backend application changes. Superseded by `STAGING_CANDIDATE_2026-10-07_V2.md`.

This record is not production approval. It pins the exact application revisions that must be deployed together for the next staging acceptance cycle.

## Candidate revisions

```text
front_commit_sha=bebe6089766dd693d6467830ac45d0b55a080cd6
backend_commit_sha=a356c1377c132b9b317122ec09cde8e038a651dc
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
docs_build_sha=3d235074e7145d65d81e79a1887adc97f84862bf
docs_build=pass
```

The Docs repository SHA is not an application deployment binding. This candidate file itself creates a newer documentation-only commit.

## Included repository-side scope

The candidate includes the completed personal-account private-debt flow plus the bounded contract-chat extension:

- private borrower/lender contract chat;
- immutable message persistence;
- role-only sender projection;
- rate-limited chat writes;
- in-app privacy-safe message notification;
- per-contract unread counts and grouped read sync;
- pending-notification race handling;
- bounded older-history cursor pagination;
- visible-tab polling optimization;
- dashboard and notification deep-links to contract chat;
- Render acceptance smoke for the private chat endpoint.

Organization/company accounts remain architecture-only and are not enabled in this staging candidate.

## Deployment order

1. Deploy the exact Backend SHA to Render through the existing Blueprint.
2. Verify migrations complete and `/api/v1/health/ready` reports ready.
3. Run Backend `Render Neon Staging Acceptance` from the exact Backend candidate commit with:
   - `deployed_commit_sha=a356c1377c132b9b317122ec09cde8e038a651dc`;
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
```

Use synthetic staging users only. Do not retain message text, account credentials, tokens, URLs containing credentials, raw API payloads or customer PII as acceptance evidence.

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
