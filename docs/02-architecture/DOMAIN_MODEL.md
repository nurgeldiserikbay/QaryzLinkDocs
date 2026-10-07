# Domain Model

## 1. Bounded contexts

~~~mermaid
flowchart TD
    ID["Identity & Access"] --> PT["Profiles & Parties"]
    PT --> MK["Marketplace"]
    MK --> CT["Contracting"]
    CT --> FN["Funding"]
    FN --> LG["Ledger"]
    LG --> DP["Disputes"]
    PC["Privacy & Compliance"] --> PT
    PC --> MK
    PC --> CT
    EV["Evidence & Audit"] -. supports .-> CT
    EV -. supports .-> FN
    EV -. supports .-> LG
~~~

## 2. Domain units

### Identity & Access

Aggregates:

- User;
- Session;
- Device;
- AuthenticationFactor.

Инварианттар:

- blocked/deleted user жаңа әрекет бастамайды;
- sensitive action step-up authentication талап етуі мүмкін;
- session revocation immediately enforced.

### Profiles & Parties

Aggregates:

- Profile;
- Party;
- Relationship;
- Organization;
- Membership;
- RepresentationAuthority.

Party — шарттағы тарап. User — жүйеге кіретін аккаунт. Бір User жеке Party-ді және болашақта Organization Party-ді өкілдік ете алады.

### Privacy & Consent

Aggregates:

- ConsentGrant;
- DisclosureRequest;
- VisibilityPolicy;
- RetentionCase.

Инварианттар:

- default visibility PRIVATE;
- scope purpose және recipient-ке байланған;
- revoked consent future access-ті тоқтатады;
- legal retention consent-тен бөлек негізделеді.

### Verification

Aggregates:

- VerificationCase;
- VerifiedClaim;
- ProviderReference.

Тек қажетті claim сақталады. Raw document сақтау міндетті болмаса, provider-де қалады.

### Marketplace

Aggregates:

- LenderOffer;
- BorrowerRequest;
- Application;
- Proposal;
- MatchResult.

Инварианттар:

- published offer version immutable;
- borrower request contract term емес;
- match approval емес;
- private claim қарсы тарапқа leak болмауы керек;
- deadline өткен proposal қабылданбайды.

### Contracting

Aggregates:

- Negotiation;
- Contract;
- ContractVersion;
- SignatureGroup;
- Amendment;
- ContractMessage.

Инварианттар:

- final lender terms borrower-ге толық көрсетіледі;
- әр signer бір document hash-қа қол қояды;
- signed version өзгермейді;
- amendment жаңа version;
- signed state funded state емес;
- contract chat messages immutable and visible only to the two contract parties;
- chat text never mutates legal terms: any terms change must go through formal amendment/versioning.

### Funding

Aggregates:

- FundingCase;
- FundingAttempt;
- FundingConfirmation.

Инварианттар:

- біржақты evidence CONFIRMED емес;
- total confirmed funding contract лимитінен аспайды;
- funding deadline rule қолданылады;
- dispute кезінде accrual автоматты басталмайды.

### Ledger & Schedule

Aggregates:

- ObligationAccount;
- ScheduleVersion;
- Payment;
- LedgerEntry;
- BalanceProjection.

Ledger source of truth — append-only entries. Balance projection ledger-ден қайта құрылуы тиіс.

### Documents & Evidence

Aggregates:

- Document;
- EvidencePackage;
- ExportJob.

Инварианттар:

- immutable content hash;
- replacement жаңа document version;
- access signed/short-lived;
- malware scan;
- retention metadata міндетті.

### Disputes

Aggregates:

- Dispute;
- DisputeMessage;
- Resolution;
- ExternalProceedingReference.

### Compliance

Aggregates:

- CountryPack;
- LegalRule;
- TemplateVersion;
- PolicyDecision.

Әр block/warning official source, effective date және rule version қамтиды.

### Notifications

Aggregates:

- Notification;
- DeliveryAttempt;
- Preference;
- Template.

Notification delivery business event-тің орнына жүрмейді.

### Audit

Aggregates:

- AuditEvent;
- IntegrityCheckpoint;
- AccessLog.

## 3. Aggregate interaction rules

~~~mermaid
sequenceDiagram
    participant M as Marketplace
    participant C as Contracting
    participant F as Funding
    participant L as Ledger
    M->>C: AcceptedProposal
    C->>F: ContractFullySigned
    F->>L: FundingConfirmed
    L->>L: Create ScheduleVersion
    L-->>C: ObligationActivated
~~~

Context-тер бір-бірінің таблицасын тікелей өзгертпейді. Бір transaction ішіндегі modular monolith болса да, public application service немесе domain event қолданылады.

## 4. Command ownership

| Command | Owner module |
|---|---|
| PublishLenderOffer | Marketplace |
| PublishBorrowerRequest | Marketplace |
| SubmitApplication | Marketplace |
| SendProposal | Marketplace |
| AcceptProposal | Marketplace |
| CreateContract | Contracting |
| SignContract | Contracting |
| SubmitFundingEvidence | Funding |
| ConfirmFundingReceipt | Funding |
| GenerateSchedule | Ledger |
| ReportPayment | Ledger |
| ConfirmPayment | Ledger |
| CreateAmendment | Contracting |
| OpenDispute | Disputes |
| GrantConsent | Privacy |
| StartVerification | Verification |
| GenerateEvidencePackage | Evidence |

## 5. Domain events

- UserRegistered;
- RelationshipAccepted;
- ConsentGranted;
- ConsentRevoked;
- VerificationPassed;
- LenderOfferPublished;
- BorrowerRequestPublished;
- ApplicationSubmitted;
- ProposalSent;
- ProposalAccepted;
- ContractVersionCreated;
- ContractSigned;
- ContractFullySigned;
- FundingEvidenceSubmitted;
- FundingConfirmed;
- FundingDisputed;
- ObligationActivated;
- ScheduleGenerated;
- PaymentReported;
- PaymentConfirmed;
- PaymentReversed;
- ObligationOverdue;
- AmendmentActivated;
- DisputeOpened;
- DisputeResolved;
- ObligationCompleted;
- EvidencePackageGenerated.

## 6. Entity versus value object

| Type | Examples |
|---|---|
| Entity | User, Offer, Contract, Payment, Dispute |
| Value object | Money, InterestRate, DateRange, AddressClaim, Percentage |
| Immutable snapshot | ContractVersion, OfferVersion, ScheduleVersion |
| Projection | BalanceSummary, DashboardStats, PublicProfileStats |

## 7. Money value object

Money:

- currency;
- amountMinor;
- scale from currency metadata.

Операциялар әртүрлі currency арасында implicit жасалмайды. FX conversion жеке explicit operation.

## 8. Policy services

- MatchingPolicy;
- OfferEligibilityPolicy;
- DisclosurePolicy;
- FundingActivationPolicy;
- InterestCalculationPolicy;
- PaymentAllocationPolicy;
- OverduePolicy;
- RetentionPolicy;
- CountryRulePolicy.

Policy input және version audit-ке жазылады.

## 9. Болашақ organization extension

Personal Party және Organization Party бір Party abstraction пайдаланады. Organization context кейін:

- memberships;
- departments;
- approval workflow;
- signing authority;
- power of attorney;
- beneficial owners;
- organization-level limits

қосады. Personal MVP осы кестелерді UI-да міндетті етпейді. Detailed membership/acting-party design: [ORGANIZATION_ACCOUNTS.md](./ORGANIZATION_ACCOUNTS.md).
