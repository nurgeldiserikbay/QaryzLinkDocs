# Trust and risk analytics

## Principle

QaryzLink trust/risk analytics is not a public reputation system.

Risk information is private, contextual and temporary. It is disclosed only to a lender who has an active lending relationship with the borrower.

The borrower must never receive a public badge such as a universal credit score that can be viewed by unrelated users.

## Access lifecycle

A lender may access the borrower risk view only during the active lending lifecycle:

```text
Borrower creates/submits request
        |
        v
Lender becomes an eligible counterparty
        |
        v
Risk view becomes available to that lender
        |
        v
Negotiation / agreement / active obligation
        |
        v
Repayment lifecycle
        |
        v
Obligation fully closed
        |
        v
Risk view access is revoked
```

The lender-only access window starts when the borrower creates an application/request that the lender is legitimately handling.

The access window ends when:

- the request/application is rejected, cancelled or expires;
- negotiation ends without an agreement;
- the resulting obligation is fully closed;
- the lender no longer has a valid relationship/resource authorization.

Historical records may remain in QaryzLink for audit, legal retention and internal analytics, but the previous lender does not retain permanent access to the borrower's current risk profile.

## Authorization rule

Risk analytics uses relationship/resource-based authorization.

Access requires all of the following:

1. requester is authenticated;
2. requester is the lender party for the relevant request/proposal/contract;
3. the request/proposal/contract is within an allowed lifecycle state;
4. the analytics snapshot belongs to the borrower party in that same relationship;
5. the requested fields are permitted by the risk disclosure policy version.

A user ID, public ID, marketplace presence or previous unrelated relationship is not sufficient to access risk analytics.

## Suggested lifecycle states

### Request stage

Allowed when the lender is an eligible recipient of the borrower's active request.

Visible:

- repayment history summary;
- completed obligations count;
- on-time payment rate;
- overdue history summary;
- dispute/restructure summary;
- active obligation count;
- current payment burden where available;
- identity/verification assurance level;
- confidence/history depth.

Not visible:

- counterparties' identities;
- contract documents from other relationships;
- exact private transaction references;
- raw income documents;
- evidence files;
- unrelated personal profile data.

### Negotiation / pre-contract

The same risk view remains available and may include an immutable snapshot reference used when the lending decision was made.

### Active contract

Risk access remains available while the lender is an active party to the obligation.

The lender may additionally see analytics directly related to their own contract, including:

- current outstanding balance;
- repayment schedule status;
- overdue days;
- payment confirmations/disputes;
- contract-specific risk alerts.

### Closure

When the obligation is fully closed, general borrower risk-profile access is revoked.

The lender keeps access only to the historical facts of their own closed contract according to normal contract/evidence retention policy.

The lender must not continue to see the borrower's updated global repayment metrics after closure.

## Snapshot model

To preserve fairness and auditability, lending decisions should reference a risk snapshot rather than a mutable live score.

Example:

```text
risk_snapshot_id
borrower_party_id
viewer_lender_party_id
source_request_id
policy_version
calculated_at
valid_until
history_window
metrics_json
confidence_level
```

A snapshot is immutable.

If material information changes before contract acceptance, the platform may generate a new snapshot and clearly show that the information changed.

## Recommended borrower metrics

The first version should use explainable facts rather than opaque machine-learning scoring.

- confirmed obligations count;
- completed obligations count;
- active obligations count;
- total confirmed scheduled payments;
- on-time payment count/rate;
- 1-7 day late count;
- 8-30 day late count;
- 31+ day late count;
- average delay days;
- maximum delay days;
- current overdue obligations;
- restructured obligations;
- disputed obligations;
- unresolved disputes;
- current scheduled payment burden;
- current outstanding exposure;
- verified-income affordability ratio, only if the borrower separately provided/authorized this data;
- history depth;
- verification assurance.

## Risk presentation

Avoid a universal public score such as "Credit score 680".

Prefer explainable categories:

```text
Repayment history: Strong
On-time payments: 94%
Completed obligations: 8
Current active obligations: 2
Current overdue: 0
Average late payment: 1.4 days
Disputes: 1 resolved
History depth: 24 months
Data confidence: High
```

If history is insufficient:

```text
Repayment assessment: Insufficient history
Confirmed completed obligations: 1
QaryzLink does not have enough verified history for a reliable assessment.
```

Absence of history must not be treated as negative history.

## Affordability

Affordability is a separate indicator from repayment history.

Where verified or voluntarily supplied income information is available and legally permitted, QaryzLink may calculate:

```text
scheduled monthly obligation payments / verified monthly income
```

The raw income value should not automatically be disclosed to the lender.

Prefer disclosure such as:

```text
Current payment burden: Moderate
Assessment confidence: Verified income available
```

rather than:

```text
Borrower salary: 742,000 KZT
```

unless the borrower explicitly agreed to disclose that exact value.

## Internal vs lender-visible analytics

### Internal platform analytics

QaryzLink may calculate broader aggregate metrics for fraud/risk operations, subject to privacy/legal policy.

Examples:

- portfolio overdue rate;
- dispute rate;
- suspicious multi-account patterns;
- repayment cohorts;
- fraud signals;
- model calibration.

These are not automatically visible to lenders.

### Lender-visible analytics

Only the minimum decision-relevant borrower metrics approved by disclosure policy are shown.

## Privacy requirements

- no public risk profile;
- no risk access through public ID lookup alone;
- no permanent lender access after relationship closure;
- no unrelated counterparties or exact contract identities in aggregate history;
- no protected/sensitive characteristics in scoring;
- no social graph/contact-list scoring;
- no raw provider payloads;
- all access is audited;
- borrower can see that risk information was disclosed and under which relationship/policy;
- disputed data must be flagged or excluded according to policy;
- correction/appeal mechanism is required.

## Audit events

Recommended audit events:

```text
RISK_VIEW_GRANTED
RISK_VIEW_OPENED
RISK_SNAPSHOT_CREATED
RISK_SNAPSHOT_REFRESHED
RISK_VIEW_REVOKED
RISK_DATA_CORRECTION_REQUESTED
RISK_DATA_CORRECTED
```

Each event should record only necessary identifiers and policy/version metadata.

## Data model additions

Suggested entities:

### risk_snapshots

- id;
- borrower_party_id;
- lender_party_id;
- source_type;
- source_id;
- policy_version;
- metrics;
- confidence;
- calculated_at;
- expires_at;
- revoked_at;
- created_at.

### risk_access_grants

- id;
- borrower_party_id;
- lender_party_id;
- source_type;
- source_id;
- status;
- granted_at;
- expires_at;
- revoked_at;
- policy_version.

### repayment_metrics

Materialized/internal aggregate view, not directly public:

- party_id;
- confirmed_obligations;
- completed_obligations;
- active_obligations;
- on_time_rate;
- late_1_7;
- late_8_30;
- late_31_plus;
- average_delay_days;
- max_delay_days;
- overdue_exposure_minor;
- outstanding_exposure_minor;
- dispute_rate;
- restructure_rate;
- history_days;
- updated_at.

## Security invariant

The API must never accept an arbitrary borrower ID and return risk analytics.

Every lender-facing risk request must be authorized through the specific active request/proposal/contract resource.

Conceptually:

```text
GET /requests/:requestId/risk-view
GET /contracts/:contractId/risk-view
```

is acceptable.

A generic endpoint such as:

```text
GET /users/:userId/risk-score
```

must not exist for lender-facing use.

## End condition

When the lending relationship ends, QaryzLink must revoke the risk-access grant.

The former lender retains their own contract/payment/evidence history, but not ongoing access to the borrower's cross-platform risk analytics.


## Implementation status

Current implementation includes:

- Prisma models and migration for `risk_access_grants`, `risk_snapshots` and `repayment_metrics`;
- relationship-scoped lender endpoints for request and contract risk views;
- borrower-only disclosure history endpoint;
- automatic request/application/proposal grant lifecycle;
- request-to-contract access transition;
- automatic revoke when the contract closes;
- immutable snapshot creation when a lender opens the risk view;
- audit event for risk-view access;
- repayment metrics recomputed from confirmed funding, schedule and confirmed payment history;
- lender-only risk cards in request and active contract screens;
- borrower disclosure history in Settings;
- KZ/RU presentation and mobile layout;
- API regression tests preventing generic user-risk lookup.

The current implementation remains intentionally explainable. It does not expose a public universal score and does not use an opaque ML repayment probability.


### Acceptance coverage

Browser acceptance now verifies the privacy lifecycle in the private-debt journey:

- lender sees the risk analytics card after borrower invitation/request access is granted;
- lender still sees the risk analytics card after the relationship becomes a contract;
- after both parties complete closure, the lender risk analytics card is no longer available.

This complements backend unit coverage for request grant creation, request-to-contract transition and contract-access revocation.
