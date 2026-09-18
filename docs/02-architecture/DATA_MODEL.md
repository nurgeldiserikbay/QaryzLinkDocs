# Database Model

## 1. Қағидалар

- PostgreSQL — transactional source of truth.
- Primary key: UUID/UUIDv7.
- Ақша: integer minor units + currency code.
- Уақыт: timestamptz UTC.
- Confirmed contract/ledger/audit жазбалары hard delete болмайды.
- PII бөлек Identity Vault схемасында application-level encryption арқылы сақталады.
- Business row-ларда tenant/party ownership анық болады.
- Әр versioned entity version, status, effective dates және created_by сақтайды.
- Optimistic locking үшін row_version қолданылады.
- Soft delete тек mutable profile/discovery объектілерінде.

## 2. Identity және party ERD

~~~mermaid
erDiagram
    USERS ||--|| PROFILES : owns
    USERS ||--o{ USER_IDENTITIES : has
    USERS ||--o{ SESSIONS : opens
    USERS ||--o{ VERIFICATION_CASES : requests
    USERS ||--o{ PARTY_REPRESENTATIONS : represents
    PARTIES ||--o{ PARTY_REPRESENTATIONS : represented_by
    ORGANIZATIONS ||--|| PARTIES : is_party
    ORGANIZATIONS ||--o{ MEMBERSHIPS : contains
    USERS ||--o{ MEMBERSHIPS : joins
    VERIFICATION_CASES ||--o{ VERIFIED_CLAIMS : produces
~~~

### Негізгі кестелер

#### users

- id;
- status;
- locale;
- timezone;
- risk_state;
- created_at;
- deleted_at;
- row_version.

#### user_identities

- id;
- user_id;
- identity_type;
- encrypted_value;
- blind_index — exact duplicate detection үшін;
- key_version;
- verified_claim_id;
- created_at;
- retention_until.

#### profiles

- user_id;
- public_id;
- display_name;
- avatar_document_id;
- bio;
- search_visibility;
- stats_visibility;
- updated_at.

Public ID sequential болмауы керек.

#### parties

- id;
- party_type: INDIVIDUAL/ORGANIZATION;
- status;
- country;
- created_at.

#### party_representations

- party_id;
- user_id;
- role;
- authority_type;
- valid_from;
- valid_until;
- verification_status.

## 3. Privacy ERD

~~~mermaid
erDiagram
    USERS ||--o{ CONSENT_GRANTS : grants
    PARTIES ||--o{ DISCLOSURE_REQUESTS : requests
    CONSENT_GRANTS ||--o{ CONSENT_SCOPES : includes
    CONSENT_GRANTS ||--o{ CONSENT_EVENTS : records
    DATA_POLICIES ||--o{ CONSENT_GRANTS : governs
    USERS ||--o{ RETENTION_CASES : subjects
    USERS ||--o{ DATA_ACCESS_LOGS : accesses
~~~

#### consent_grants

- id;
- subject_party_id;
- recipient_party_id;
- purpose_code;
- context_type/context_id;
- policy_version_id;
- granted_at;
- expires_at;
- revoked_at;
- status.

#### consent_scopes

- consent_id;
- field_code немесе claim_code;
- permission: VIEW/DOWNLOAD/RESHARE;
- masking_policy.

## 4. Marketplace ERD

~~~mermaid
erDiagram
    PARTIES ||--o{ LENDER_OFFERS : publishes
    LENDER_OFFERS ||--o{ LENDER_OFFER_VERSIONS : versions
    PARTIES ||--o{ BORROWER_REQUESTS : publishes
    BORROWER_REQUESTS ||--o{ BORROWER_REQUEST_VERSIONS : versions
    LENDER_OFFERS ||--o{ APPLICATIONS : receives
    BORROWER_REQUESTS ||--o{ PROPOSALS : receives
    APPLICATIONS ||--o{ PROPOSALS : creates
    PROPOSALS ||--o{ PROPOSAL_VERSIONS : versions
    PROPOSALS ||--o| CONTRACTS : converts_to
    MATCH_RESULTS }o--|| LENDER_OFFER_VERSIONS : evaluates
    MATCH_RESULTS }o--|| BORROWER_REQUEST_VERSIONS : evaluates
~~~

#### lender_offers

Identity және lifecycle:

- id;
- lender_party_id;
- current_version_id;
- visibility;
- status;
- published_at;
- expires_at.

#### lender_offer_versions

Immutable terms:

- id;
- offer_id;
- version;
- currency;
- min/max principal minor;
- min/max term days;
- interest_policy_json;
- repayment_policy_json;
- required_claims_json;
- response_window_seconds;
- country_rule_version_id;
- created_at.

#### borrower_requests

- id;
- borrower_party_id;
- current_version_id;
- visibility;
- status;
- published_at;
- expires_at.

#### proposals

- id;
- lender_party_id;
- borrower_party_id;
- source_type/source_id;
- current_version_id;
- response_deadline;
- status.

## 5. Contract ERD

~~~mermaid
erDiagram
    CONTRACTS ||--o{ CONTRACT_VERSIONS : versions
    CONTRACT_VERSIONS ||--o{ CONTRACT_PARTIES : snapshots
    CONTRACT_VERSIONS ||--o{ SIGNATURE_REQUESTS : requires
    SIGNATURE_REQUESTS ||--o| SIGNATURES : completed_by
    CONTRACTS ||--o{ AMENDMENTS : changed_by
    AMENDMENTS ||--|| CONTRACT_VERSIONS : activates
    CONTRACTS ||--|| OBLIGATIONS : governs
    CONTRACT_VERSIONS ||--o{ DOCUMENT_LINKS : renders
~~~

#### contracts

- id;
- source_proposal_id;
- current_version_id;
- status;
- assurance_level;
- governing_country;
- jurisdiction;
- created_at.

#### contract_versions

- id;
- contract_id;
- version;
- terms_json;
- principal_minor;
- currency;
- interest_policy_version;
- schedule_policy_version;
- funding_deadline;
- rule_pack_version_id;
- rendered_document_id;
- document_hash;
- effective_at;
- created_by.

#### contract_parties

Snapshot:

- contract_version_id;
- party_id;
- role;
- legal_name_snapshot_encrypted;
- verified_claims_snapshot_json;
- representation_snapshot_json.

## 6. Funding және ledger ERD

~~~mermaid
erDiagram
    OBLIGATIONS ||--o{ FUNDING_CASES : funded_by
    FUNDING_CASES ||--o{ FUNDING_ATTEMPTS : attempts
    FUNDING_ATTEMPTS ||--o{ FUNDING_CONFIRMATIONS : confirmed_by
    OBLIGATIONS ||--o{ SCHEDULE_VERSIONS : schedules
    SCHEDULE_VERSIONS ||--o{ SCHEDULE_ITEMS : contains
    OBLIGATIONS ||--o{ PAYMENTS : receives
    PAYMENTS ||--o{ PAYMENT_CONFIRMATIONS : confirmed_by
    PAYMENTS ||--o{ PAYMENT_ALLOCATIONS : allocates
    OBLIGATIONS ||--o{ LEDGER_ENTRIES : records
    SCHEDULE_ITEMS ||--o{ PAYMENT_ALLOCATIONS : settled_by
~~~

#### obligations

- id;
- contract_id;
- status;
- lender_party_id;
- borrower_party_id;
- currency;
- original_principal_minor;
- confirmed_funded_minor;
- current_schedule_version_id;
- activated_at;
- completed_at;
- row_version.

#### funding_attempts

- id;
- funding_case_id;
- amount_minor;
- currency;
- method;
- claimed_effective_at;
- evidence_document_id;
- status;
- provider_reference;
- idempotency_key.

#### schedule_versions

- id;
- obligation_id;
- version;
- calculation_policy_version;
- input_hash;
- effective_from;
- superseded_at;
- created_reason.

#### schedule_items

- id;
- schedule_version_id;
- sequence;
- due_at;
- opening_principal_minor;
- principal_due_minor;
- interest_due_minor;
- fee_due_minor;
- total_due_minor;
- status.

#### payments

- id;
- obligation_id;
- payer_party_id;
- payee_party_id;
- amount_minor;
- currency;
- claimed_paid_at;
- confirmed_paid_at;
- method;
- status;
- evidence_document_id;
- provider_reference;
- reversal_of_payment_id;
- idempotency_key.

#### ledger_entries

- id;
- obligation_id;
- event_type;
- account_code;
- debit_minor;
- credit_minor;
- currency;
- effective_at;
- source_type/source_id;
- sequence;
- integrity_hash.

## 7. Evidence, dispute және audit ERD

~~~mermaid
erDiagram
    DOCUMENTS ||--o{ DOCUMENT_VERSIONS : versions
    DOCUMENT_VERSIONS ||--o{ DOCUMENT_ACCESS_GRANTS : protected_by
    OBLIGATIONS ||--o{ DISPUTES : has
    DISPUTES ||--o{ DISPUTE_MESSAGES : contains
    DISPUTES ||--o{ DISPUTE_EVIDENCE : attaches
    DISPUTES ||--o| DISPUTE_RESOLUTIONS : resolves
    AUDIT_EVENTS ||--o{ AUDIT_INTEGRITY_CHECKPOINTS : anchored_by
    OUTBOX_EVENTS ||--o{ DELIVERY_ATTEMPTS : publishes
~~~

#### documents

- id;
- owner_party_id;
- classification;
- status;
- current_version_id;
- retention_policy_id.

#### document_versions

- id;
- document_id;
- storage_key_encrypted;
- content_hash;
- mime_type;
- size_bytes;
- malware_scan_status;
- created_at;
- created_by.

#### disputes

- id;
- obligation_id;
- type;
- opened_by;
- status;
- disputed_amount_minor;
- opened_at;
- resolved_at.

#### audit_events

- id;
- occurred_at;
- actor_type/actor_id;
- action;
- resource_type/resource_id;
- purpose;
- request_id;
- ip_hash/device_id;
- before_hash;
- after_hash;
- previous_event_hash;
- event_hash.

## 8. Country rules

Негізгі кестелер:

- country_packs;
- legal_rules;
- legal_sources;
- policy_versions;
- contract_templates;
- template_versions;
- rule_evaluation_logs.

legal_rules:

- jurisdiction;
- rule_code;
- result type;
- condition expression;
- official source;
- article/paragraph;
- published/effective/expiry dates;
- review status;
- approved_by;
- version.

## 9. Notification және integration

- notifications;
- notification_templates;
- user_notification_preferences;
- delivery_attempts;
- webhook_inbox;
- provider_callbacks;
- integration_credentials_reference — secret мәннің өзі емес;
- idempotency_keys;
- outbox_events;
- background_jobs.

## 10. Міндетті индекстер

- profiles(public_id) unique;
- user_identities(blind_index, identity_type) unique where active;
- lender_offers(status, visibility, expires_at);
- borrower_requests(status, visibility, expires_at);
- proposals(recipient party, status, response_deadline);
- obligations(lender_party_id, status);
- obligations(borrower_party_id, status);
- schedule_items(due_at, status);
- payments(obligation_id, confirmed_paid_at);
- ledger_entries(obligation_id, sequence) unique;
- consent_grants(subject_party_id, recipient_party_id, purpose_code, status);
- audit_events(resource_type, resource_id, occurred_at);
- outbox_events(status, available_at).

## 11. Delete және retention

| Entity | Strategy |
|---|---|
| Draft offer/request | Soft delete, кейін purge |
| Public profile | Delete/anonymize |
| Identity PII | Legal basis бойынша delete/restrict |
| Signed contract | Restricted retention, no silent delete |
| Confirmed ledger | Append-only |
| Document binary | Retention policy + legal hold |
| Audit | Append-only, limited retention by category |
| Analytics | Aggregate/anonymize |

## 12. Кейінгі техникалық артефакттар

Backend басталғанда осы conceptual model негізінде:

- Prisma schema;
- SQL migrations;
- row-level authorization tests;
- seed fixtures;
- data dictionary;
- OpenAPI schemas

жасалады. Conceptual doc пен implementation schema арасындағы айырмашылық ADR арқылы түсіндіріледі.


## 13. Қазіргі email verification schema

Бұл бөлім 2026-09-18 implementation-ына сәйкес; жоғарыдағы conceptual model толық іске асырылды дегенді білдірмейді.
[ADR-0006](../../adr/ADR-0006-email-verification.md) challenge lifecycle-ін бекітеді.

~~~mermaid
erDiagram
    USERS ||--o| EMAIL_VERIFICATIONS : requests
    USERS {
        uuid id PK
        string email
        datetime emailVerifiedAt
    }
    EMAIL_VERIFICATIONS {
        uuid userId PK,FK
        string email
        string tokenHash UK
        datetime expiresAt
        datetime consumedAt
    }
~~~

Prisma model EmailVerification → SQL email_verifications. userId primary key бір user-ге бір challenge сақтайды.
Email snapshot ағымдағы users.email-мен салыстырылады. Token plaintext сақталмайды; tokenHash unique.
Expiry жеткенде confirm өтпейді, бірақ жол автоматты жойылмайды. Resend жолды алмастырады; user deletion cascade қолданады.
Current email storage application-level encryption-сыз; Identity Vault пен retention public launch gate-інде тұр.


## Private discovery implementation tables

~~~mermaid
erDiagram
    USERS ||--o{ DISCOVERY_COMMANDS : retries
    LOAN_REQUESTS ||--o{ REQUEST_INVITATIONS : shares
    PARTIES ||--o{ REQUEST_INVITATIONS : receives
    LOAN_REQUESTS ||--o{ PROPOSALS : receives
~~~

`request_invitations(requestId,lenderPartyId)` unique; `discovery_commands(userId,key)` composite primary key; `proposals(requestId)` partial unique accepted index. Receipt және mutation бір transaction-да орындалады.
