# ADR-0027: Post-payment amendment cutover remains a preview until accounting policy is approved

- Status: Accepted
- Date: 2026-09-30
- Owners: Product / Backend / Legal / Accounting

## Context

QaryzLink MVP repayment is an immutable one-item AT_MATURITY schedule. Confirmed payment allocation is deterministic: charge, then scheduled interest, then principal.

A financial contract amendment after repayment history exists cannot safely reuse the pre-payment transition. Historical allocations and ledger entries are evidence and must not be silently rewritten.

The historical allocation policy can also allocate scheduled interest before the same amount would be technically accrued under an ACT/365 elapsed-day calculation. Treating that difference as an automatic refund, credit or principal payment would be a new accounting/legal policy decision.

## Decision

Post-payment TERMS_CHANGE/SCHEDULE_CHANGE gets an immutable cutover **projection**, not activation.

The participant first creates/reviews an immutable accounting snapshot. Cutover projection requires the exact latest snapshot ID and re-verifies that current contract version, schedule, payment counts/totals, paidMinor/component split and canonical accounting stateHash still match it.

Projection reference time is the accounting snapshot `capturedAt`. The API does not accept an arbitrary effective date.

Policy v1:

- base simple interest uses the existing ACT/365 fixed half-up formula;
- elapsed days are funding effective date → snapshot reference UTC day, capped by base term;
- technical accrued interest is capped by scheduled interest;
- historical paid-interest remains immutable evidence;
- `earnedInterestSettledMinor = min(paidInterest, accruedInterest)`;
- `outstandingAccruedInterestMinor = max(accruedInterest - paidInterest, 0)`;
- `interestReclassificationCandidateMinor = max(paidInterest - accruedInterest, 0)`;
- `unearnedScheduledInterestMinor = scheduledInterest - accruedInterest`;
- opening principal is the accounting snapshot outstanding principal;
- proposed maturity continues to use funding effective date + proposed total termDays;
- proposed future interest is calculated only on opening principal for remaining days at proposed annualRateBps;
- projected remaining due includes outstanding charge + outstanding accrued interest + opening principal + projected future interest.

`interestReclassificationCandidateMinor` and existing unallocated credit are shown separately as **credits not applied**. They are not subtracted from projected remaining due and do not create PaymentAllocation, LedgerEntry, refund, waiver or principal credit.

Projection is immutable/versioned and binds:

- amendment ID/document hash/proposed terms;
- exact accounting snapshot ID/stateHash;
- policy version;
- reference time;
- all deterministic projection outputs;
- a canonical SHA-256 previewHash.

One accounting snapshot has at most one cutover projection under this policy. Same-state retries are idempotent. If payment/reversal/unresolved state changes, the previous snapshot becomes stale and a new accounting snapshot is required first.

## API boundary

Participant-only:

- `POST /api/v1/contracts/:contractId/amendments/:amendmentId/cutover-preview`
- `GET /api/v1/contracts/:contractId/amendments/:amendmentId/cutover-previews`

POST body contains only the exact `accountingSnapshotId`.

Response explicitly remains:

- `policyStatus=PREVIEW_ONLY`;
- `activationEligible=false`;
- `activationReason=POST_PAYMENT_CUTOVER_POLICY_PENDING`.

## Evidence

New evidence package schema v5 binds cutover projection history, accountingSnapshotId, previewHash, policyVersion and projection amounts/dates.

Persisted evidence v1-v4 packages are never retroactively rewritten.

## Consequences

Positive:

- historical payment allocations and ledger remain immutable;
- users/legal reviewers can inspect deterministic impact before an accounting policy is approved;
- stale payment state cannot be projected as current;
- legal effective-date semantics are not invented by application code.

Trade-offs:

- post-payment financial amendment still cannot activate;
- reclassification candidate requires an explicit future accounting/legal decision;
- current projection supports the one-item AT_MATURITY policy only.

## Rejected alternatives

### Rewrite historical interest allocation

Rejected because it mutates evidence and changes the meaning of already-confirmed payments.

### Automatically convert excess paid-interest to principal or credit

Rejected because that is an accounting/legal policy decision not established by the current MVP contract.

### Let the caller choose any cutover/effective date

Rejected because it would let the API create legal/accounting semantics not yet approved.

### Activate N+1 directly from the projection

Rejected until reclassification, opening-balance ledger treatment, effective-date semantics and Kazakhstan legal acceptance are defined.
