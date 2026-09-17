# System Architecture

## 1. System context

~~~mermaid
flowchart TD
    PERSON["Жеке тұлға<br/>Lender / Borrower"] --> FRONT["QaryzLink Front"]
    STAFF["Moderator / Support / Compliance"] --> ADMIN["QaryzLink Admin"]
    FRONT --> API["QaryzLink Backend API"]
    ADMIN --> API
    API --> DATA["PostgreSQL + Redis + Object Storage"]
    API --> EXT["KYC / Signature / Email / SMS"]
~~~

QaryzLink бастапқыда modular monolith ретінде жасалады. Әр domain шекарасы нақты сақталады, бірақ ерте кезеңде network-distributed microservice күрделілігі қосылмайды.

## 2. Repository architecture

| Repository | Deployable | Жауапкершілік |
|---|---:|---|
| QaryzLinkFront | Иә | Public және authenticated user experience |
| QaryzLinkBack | Иә | Domain, API, workers және integrations |
| QaryzLinkAdmin | Иә | Internal moderation/compliance/support |
| QaryzLinkDocs | Жоқ | Ортақ specification және decisions |

Front және Admin backend жасаған OpenAPI contract-тан TypeScript client генерациялайды. DTO-ларды қолмен үш репозиторийде қайталауға болмайды.

## 3. Logical containers

~~~mermaid
flowchart TD
    WEB["Next.js User PWA"] --> BFF["REST API / BFF"]
    ADM["Next.js Admin"] --> BFF
    BFF --> CORE["NestJS Modular Monolith"]
    CORE --> PG["PostgreSQL"]
    CORE --> REDIS["Redis / BullMQ"]
    CORE --> S3["Encrypted Object Storage"]
    REDIS --> WORKER["Background Workers"]
    WORKER --> PROVIDERS["External Providers"]
~~~

## 4. Backend module map

~~~mermaid
flowchart TD
    IAM["IAM"] --> PROFILE["Profiles & Parties"]
    PROFILE --> DISCOVERY["Discovery & Matching"]
    DISCOVERY --> CONTRACT["Contracting"]
    CONTRACT --> FUNDING["Funding"]
    FUNDING --> LEDGER["Ledger & Schedule"]
    LEDGER --> DISPUTE["Disputes"]
    IAM --> PRIVACY["Privacy & Consent"]
    PRIVACY --> PROFILE
    COMPLIANCE["Country Rules & Compliance"] --> DISCOVERY
    COMPLIANCE --> CONTRACT
    COMPLIANCE --> LEDGER
    DOCS["Documents & Evidence"] --> CONTRACT
    DOCS --> FUNDING
    AUDIT["Audit"] -. observes .-> IAM
    AUDIT -. observes .-> CONTRACT
    AUDIT -. observes .-> LEDGER
~~~

## 5. Module responsibilities

| Module | Жауапкершілік | Өзгелерге бермейді |
|---|---|---|
| IAM | login, MFA, sessions, devices | Profile visibility |
| Profiles | display profile, parties, relationships | Authentication |
| Organizations | tenant, membership, roles, authority | Personal KYC |
| Privacy | consent grants, visibility, disclosure | Contract terms |
| Verification | provider orchestration, verified claims | User-facing rating |
| Discovery | offers, requests, applications, matching | Loan approval |
| Contracting | negotiation, versions, signatures | Money confirmation |
| Funding | disbursement evidence және confirmation | Repayment ledger |
| Ledger | schedule, balances, payment allocation | Contract editing |
| Documents | encrypted files, hashes, retention | Business decision |
| Disputes | claims, evidence, resolution | Court judgment |
| Country Rules | legal/config validation | Domain records |
| Notifications | templates, preferences, delivery | Business truth |
| Audit | append-only trace | Mutable application state |
| Reporting | projections және analytics | Source-of-truth ledger |
| Admin | review commands through APIs | Direct DB mutation |

## 6. Synchronous request flow

~~~mermaid
sequenceDiagram
    participant UI as Front/Admin
    participant API as API
    participant APP as Application Service
    participant DOM as Domain
    participant DB as PostgreSQL
    UI->>API: Authenticated command
    API->>APP: Validated DTO + actor
    APP->>DOM: Execute use case
    DOM->>DOM: Invariants and policy checks
    APP->>DB: Atomic transaction
    DB-->>APP: Stored state + outbox
    APP-->>API: Result
    API-->>UI: Sanitized response
~~~

Authorization және privacy filtering controller-де ғана емес, application/policy layer-де орындалады.

## 7. Asynchronous event flow

~~~mermaid
sequenceDiagram
    participant TX as DB Transaction
    participant OUT as Outbox
    participant W as Worker
    participant EXT as Provider
    TX->>OUT: Domain event
    OUT->>W: Publish job
    W->>EXT: Send/verify/process
    EXT-->>W: Result/webhook
    W->>TX: Idempotent state update
~~~

Outbox pattern critical notification, audit projection және provider integration үшін қолданылады.

## 8. External adapters

Барлық провайдерлер port/adapter интерфейсі арқылы қосылады:

- IdentityProvider;
- SignatureProvider;
- NotificationProvider;
- ObjectStorageProvider;
- MalwareScanner;
- PaymentEvidenceProvider;
- BankTransactionProvider — кейін;
- TrustedTimestampProvider — кейін;
- LegalTemplateProvider.

Domain code нақты vendor SDK-ға тәуелді болмауы керек.

## 9. Deployment environments

~~~mermaid
flowchart LR
    PR["Pull Request"] --> PREVIEW["Preview"]
    MAIN["main"] --> STAGE["Staging"]
    TAG["Release tag"] --> PROD["Production KZ"]
    PROD --> OBS["Logs / Metrics / Traces"]
    PROD --> BACKUP["Encrypted backup"]
~~~

Орталар:

- local;
- test/CI;
- preview;
- staging;
- production-kz;
- кейін production-eu және басқа data region.

## 10. Infrastructure baseline

- Docker images;
- managed PostgreSQL бастапқыда;
- Redis/BullMQ;
- S3-compatible object storage;
- KMS/secret manager;
- CDN/WAF;
- OpenTelemetry;
- error tracking;
- automated backups;
- GitHub Actions;
- Infrastructure as Code production readiness кезінде.

## 11. Architecture constraints

- Multi-tenant ready, бірақ personal MVP-де tenant complexity UI-да жасырын.
- Financial amount minor units integer.
- UTC timestamps + user timezone.
- Confirmed financial records append/reversal арқылы өзгереді.
- PII Identity Vault ішінде бөлек шифрланады.
- API versioned.
- External webhook idempotent.
- Provider outage core private record-ты тоқтатпайды.
- Admin production DB-ға тікелей жазбайды.
