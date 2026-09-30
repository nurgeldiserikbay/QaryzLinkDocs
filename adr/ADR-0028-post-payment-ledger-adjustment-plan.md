# ADR-0028: Post-payment ledger adjustment plan remains preview-only

- Status: Accepted for implementation foundation
- Date: 2026-09-30
- Scope: QaryzLink post-payment financial amendments

## Context

The existing post-payment amendment flow can safely activate only when the latest immutable activation plan has:

- `requiresLedgerAdjustment=false`;
- `unappliedInterestReclassificationMinor=0`;
- `unappliedCreditMinor=0`.

When either an interest reclassification candidate or existing unallocated credit is present, Backend deliberately returns `CONTRACT_AMENDMENT_LEDGER_ADJUSTMENT_REQUIRED`. Historical `PaymentAllocation`, `ScheduleItem`, `LedgerEntry`, payment evidence and signed contract versions are immutable and must not be rewritten to make the amendment fit.

The next implementation step needs a deterministic representation of the required adjustment before any actual financial mutation is considered.

## Decision

Introduce a **preview-only, immutable post-payment ledger adjustment plan**.

This foundation does not activate the amendment and does not mutate accounting history.

### Eligibility

A ledger adjustment plan may be prepared only when all of the following are true:

1. amendment status is `SIGNED_PENDING_ACTIVATION`;
2. exact latest post-payment activation plan exists;
3. activation plan is still current after full accounting/cutover revalidation;
4. `requiresLedgerAdjustment=true`;
5. at least one of:
   - `unappliedInterestReclassificationMinor > 0`;
   - `unappliedCreditMinor > 0`.

Zero-adjustment plans must continue through the existing safe activation flow and must not create an adjustment plan.

### Immutable inputs

The plan binds at minimum:

- amendment ID;
- exact activation plan ID and `planHash`;
- source signed ContractVersion number and document hash;
- exact cutover preview ID/hash;
- exact accounting snapshot ID/stateHash;
- reference timestamp;
- currency;
- interest reclassification candidate amount;
- existing unallocated credit amount;
- replacement schedule amounts from the activation plan.

### Adjustment classifications

The plan must preserve separate classifications:

- `INTEREST_RECLASSIFICATION_CANDIDATE`;
- `UNALLOCATED_CREDIT`.

They must not be merged into one opaque balance.

The foundation does **not** decide whether either amount is later:

- refunded;
- credited against principal;
- credited against accrued/future interest;
- credited against charges;
- carried as a separate contract credit;
- applied using another legally approved treatment.

That decision belongs to a later versioned accounting/legal policy.

### Output

The plan is deterministic and versioned.

It exposes:

- source provenance;
- component amounts;
- total adjustment candidate;
- `policyStatus=PREVIEW_ONLY`;
- `applicationEligible=false`;
- `applicationReason=POST_PAYMENT_LEDGER_ADJUSTMENT_POLICY_PENDING`;
- canonical `adjustmentPlanHash`.

Same exact authoritative source state must be idempotent and return the same persisted plan.

A changed accounting state, cutover preview or activation plan requires a new plan version; old plans remain immutable.

## Mutation boundary

Creating or reading this plan must not modify:

- `Contract.currentVersion`;
- any `ContractVersion` status;
- amendment status;
- `ScheduleVersion` or `ScheduleItem`;
- `Payment`;
- `PaymentAllocation`;
- `LedgerEntry`;
- funding state.

Historical payment allocations and ledger entries remain append-only/immutable.

## Concurrency and stale-state handling

Preparation runs under the same contract/amendment locking boundary as post-payment activation planning.

Before persistence, Backend must rebuild the exact current activation plan inputs and compare them with the selected latest activation plan. Any mismatch fails closed as stale.

Payment submission/confirmation/dispute/reversal remains frozen while the amendment is `SIGNED_PENDING_ACTIVATION`, preserving the signed cutover state.

## Feature gating

The preview foundation uses the existing amendment feature boundary and may receive a dedicated default-off gate if operational separation is needed.

Any future **application** endpoint must have its own default-off production gate and explicit release-preflight/manual legal-accounting acceptance.

## Evidence

The next evidence schema version should bind ledger-adjustment-plan provenance without rewriting prior evidence packages.

At minimum it should include:

- adjustment plan version;
- policy version;
- adjustmentPlanHash;
- source activationPlanId/planHash;
- component classifications and amounts;
- explicit preview-only / not-applied state.

## Non-goals

This ADR does not authorize:

- retroactive ledger edits;
- deletion/rewrite of payment allocations;
- automatic refunds;
- automatic credit application;
- interest reclassification application;
- amendment activation when an adjustment is required.

## Consequences

This preserves the fail-closed accounting boundary while giving UI, evidence, audit and future policy work a deterministic object to review.

The next implementation slice is therefore:

1. schema/model for immutable ledger adjustment plans;
2. deterministic domain builder + hash;
3. participant-only prepare/list endpoints;
4. stale-state/idempotency tests;
5. evidence provenance extension;
6. no financial mutation.
