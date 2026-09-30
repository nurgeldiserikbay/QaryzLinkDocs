# Kazakhstan personal private-debt pilot scope approval record

Жаңартылған күні: 2026-09-30.

Бұл құжат production/pilot scope шешімін versioned және traceable түрде бекітуге арналған approval record template.

**Бұл файлдың болуы approval дегенді білдірмейді.** Release gate тек owner/legal/operations review аяқталып, versioned approval reference берілгеннен кейін жабылады.

Backend technical profile:

`PILOT_SCOPE_PROFILE=kz-personal-private-debt-v1`

Production config сол profile-дан кең scope қабылдамайды және versioned `PILOT_SCOPE_APPROVAL_ID` талап етеді.

## 1. Proposed pilot boundary

Ұсынылған MVP boundary:

- jurisdiction: Kazakhstan;
- participant type: natural persons / personal accounts;
- core product: private debt / loan agreement workflow between known or directly connected participants;
- currency baseline: KZT;
- platform role: workflow, evidence, schedule and contract-state coordination;
- platform does not automatically custody or transfer bank funds;
- evidence/funding/payment actions record participant assertions and supporting evidence;
- platform acknowledgement is not to be described as a qualified electronic signature unless a separately approved legal/signing model says so.

## 2. Explicitly excluded until separately approved

Pilot approval автоматты түрде мыналарды қоспайды:

- public marketplace enablement;
- penalty enablement;
- amount-based platform commission;
- legal-entity borrowing/lending;
- international/cross-border scope;
- platform custody/escrow/payment initiation;
- automatic bank refund;
- production KYC provider enablement without provider/privacy/legal acceptance;
- production KMS/HSM sealing without key/IAM/lifecycle acceptance;
- RFC3161/qualified timestamp claims without approved provider/legal classification;
- post-payment ledger adjustment application that changes accounting treatment without approved policy;
- legal PDF claims before approved KZ/RU templates and visual/legal acceptance.

Technical release preflight already fails closed if public marketplace, penalty or amount-based commission flags are enabled.

## 3. Required decision inputs

Before approval, reviewers must resolve or explicitly defer:

| Area | Required decision/evidence | Status |
|---|---|---|
| Product | pilot cohort, acquisition channel, support boundary | Pending |
| Legal | Kazakhstan product/legal classification and required notices | Pending |
| Privacy | data categories, disclosures, retention and own-data export scope | Pending |
| Contract | KZ/RU wording and platform acknowledgement legal effect | Pending |
| Identity | whether KYC is required for pilot; vetted provider if enabled | Pending |
| Payments | platform does not custody/transfer funds unless separately approved | Pending |
| Evidence | storage/scanner/retention boundary | Pending |
| Operations | support owner, incident path, staging evidence | Pending |
| Security | production security review and staging acceptance | Pending |

A reviewer may mark a dependency as "not enabled for pilot" instead of approving the underlying provider/function. The disabled state must match deployed configuration.

## 4. Deployment assertions to verify

The approved deployment must evidence:

- `PILOT_SCOPE_PROFILE=kz-personal-private-debt-v1`;
- `PILOT_SCOPE_APPROVAL_ID=<this approved record/version>`;
- `PUBLIC_MARKETPLACE_ENABLED=false`;
- `PENALTY_ENABLED=false`;
- `AMOUNT_BASED_COMMISSION_ENABLED=false`;
- release preflight status is not `fail`;
- tested Backend/Front/Admin commit SHAs are recorded;
- staging acceptance evidence is linked;
- any default-off external provider enabled for pilot has its own required approval references.

## 5. Change control

A new approval record/version is required if any of these change materially:

- jurisdiction;
- participant class;
- public marketplace availability;
- fee/commission/penalty model;
- custody/payment-transfer role;
- legal signing model;
- KYC/identity role;
- evidence retention/legal-hold scope;
- cross-border processing;
- legal-entity support.

Changing code/config alone does not widen the approved scope.

## 6. Approval record

Fill only after review.

| Field | Value |
|---|---|
| Approval ID | **PENDING** |
| Profile | `kz-personal-private-debt-v1` |
| Effective date | **PENDING** |
| Pilot start/end or review date | **PENDING** |
| Product owner | **PENDING** |
| Legal reviewer / reference | **PENDING** |
| Privacy reviewer / reference | **PENDING** |
| Security/operations reviewer | **PENDING** |
| Approved Front commit | **PENDING** |
| Approved Back commit | **PENDING** |
| Approved Admin commit | **PENDING** |
| Staging acceptance record | **PENDING** |
| Exceptions / disabled dependencies | **PENDING** |

## 7. Final acceptance checklist

- [ ] Product owner confirms the pilot cohort and product boundary.
- [ ] Legal review confirms the scope or records explicit limitations.
- [ ] Privacy/retention/export obligations are recorded.
- [ ] KZ/RU contract/legal copy required for the enabled flow is approved.
- [ ] KYC requirement for pilot is decided; provider remains disabled unless separately accepted.
- [ ] Public marketplace remains disabled unless a new scope approval explicitly replaces this profile.
- [ ] Penalty remains disabled.
- [ ] Amount-based commission remains disabled.
- [ ] Platform custody/payment-transfer role remains disabled unless separately approved.
- [ ] Staging release preflight and acceptance evidence match the approved scope.
- [ ] Approval ID is copied to `PILOT_SCOPE_APPROVAL_ID`.
- [ ] Any later material scope change creates a new approval version.
