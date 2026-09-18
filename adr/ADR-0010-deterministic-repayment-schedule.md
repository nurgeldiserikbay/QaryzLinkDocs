# ADR-0010: Deterministic repayment schedule generation

- Status: Accepted
- Date: 2026-09-18
- Owners: QaryzLink product and backend
- Related: ADR-0003, ADR-0008, ADR-0009

## Context

After funding is confirmed, both parties need the same deterministic view of what is due and when. The Kazakhstan-first MVP does not yet record repayments or move money, so the first schedule slice must be calculation-only and repeatable.

## Decision

1. A schedule can be generated only for an ACTIVE contract with Funding CONFIRMED.
2. The MVP policy is ACT_365_FIXED_HALF_UP_V1: simple interest uses an ACT/365 fixed denominator and HALF_UP rounding to the smallest currency unit.
3. Terms are read from the immutable proposal snapshot: principalMinor, annualRateBps, termDays, and funding effectiveAt.
4. The first version creates one AT_MATURITY item. Installments and custom calendars are later policy versions.
5. Each ScheduleVersion stores the policy version and a canonical inputHash. Repeating the same request is idempotent.
6. Schedule reads are restricted to the two contract parties; no PII or storage object key is returned.
7. Payment submission, payment confirmation, overdue automation and bank reconciliation remain separate slices.

~~~mermaid
flowchart TD
    F["Funding CONFIRMED"] --> I["Canonical input"]
    I --> P["ACT/365 + HALF_UP"]
    P --> V["ScheduleVersion"]
    V --> M["AT_MATURITY item"]
    M --> R["Party-only read"]
~~~

## Consequences

- Both parties see the same amount and due date for the same confirmed funding.
- Monetary arithmetic is integer-based and avoids floating-point drift.
- A terms change requires a new contract/version; the existing schedule is not mutated.
- A future payment ledger can consume schedule items without changing this calculation policy.
