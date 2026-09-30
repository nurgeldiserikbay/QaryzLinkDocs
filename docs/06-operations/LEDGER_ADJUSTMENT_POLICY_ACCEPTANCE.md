# Post-payment ledger adjustment policy acceptance record

Жаңартылған күні: 2026-09-30.

Бұл record preview-only post-payment ledger adjustment plan-нан нақты financial application policy-ге өту үшін product/accounting/legal decisions-ді бекітуге арналған. **Current system adjustment-ты қолданбайды және бұл template оны authorize етпейді.**

Technical foundation: [ADR-0028](../../adr/ADR-0028-post-payment-ledger-adjustment-plan.md).

## 1. Adjustment component treatment

Each component requires one approved treatment.

| Component | Approved treatment | Effective-date semantics | Basis |
|---|---|---|---|
| Interest reclassification candidate | **PENDING** | **PENDING** | **PENDING** |
| Unallocated credit | **PENDING** | **PENDING** | **PENDING** |
| Principal effect | **PENDING** | **PENDING** | **PENDING** |
| Accrued/future interest effect | **PENDING** | **PENDING** | **PENDING** |
| Charges effect | **PENDING** | **PENDING** | **PENDING** |
| Refund/external bank movement | **PENDING** | **PENDING** | **PENDING** |

No row may be silently rewritten to simulate an approved outcome.

## 2. Accounting invariants

- [ ] historical PaymentAllocation remains immutable;
- [ ] historical LedgerEntry remains append-only;
- [ ] corrections use explicit new entries/events;
- [ ] resulting balance reconciles to schedule and contract terms;
- [ ] rounding/minor-unit rules are explicit;
- [ ] effective date is deterministic;
- [ ] reversal/cancellation policy is explicit;
- [ ] idempotency and stale-plan handling are defined.

## 3. Product/legal semantics

- [ ] user-visible explanation for each treatment is approved;
- [ ] platform custody/refund claims are accurate;
- [ ] interest/fee treatment is lawful for the approved pilot;
- [ ] tax/accounting owner signs off;
- [ ] dispute path is defined;
- [ ] evidence/court export contains exact adjustment provenance.

## 4. Implementation gate

Before any application endpoint can be enabled:

- [ ] dedicated default-off feature flag exists;
- [ ] versioned policy ID is bound into the immutable application plan;
- [ ] exact source activationPlanHash/adjustmentPlanHash is revalidated;
- [ ] double application is impossible;
- [ ] concurrent payment/reversal/amendment race is fail-closed;
- [ ] ledger/schedule/evidence/audit integration tests are green;
- [ ] rollback means compensating entries, not history rewrite.

## 5. Staging scenarios

- [ ] interest-only reclassification case;
- [ ] unallocated-credit-only case;
- [ ] combined case;
- [ ] zero-adjustment case remains on existing safe path;
- [ ] stale accounting snapshot rejected;
- [ ] stale adjustment plan rejected;
- [ ] retry is idempotent;
- [ ] compensation/reversal path behaves as approved;
- [ ] evidence package independently reconciles resulting state.

## 6. Approval record

| Field | Value |
|---|---|
| Policy/version ID | **PENDING** |
| Accounting owner | **PENDING** |
| Legal reviewer | **PENDING** |
| Product owner | **PENDING** |
| Security/engineering reviewer | **PENDING** |
| Successful staging run/reference | **PENDING** |
| Effective/review date | **PENDING** |

## 7. Final gate

`CONTRACT_POST_PAYMENT_AMENDMENT_ACTIVATION_ENABLED` must not be used to apply non-zero ledger adjustments until this policy is approved and a separate exact application implementation is reviewed. Preview-only plans remain authoritative meanwhile.
