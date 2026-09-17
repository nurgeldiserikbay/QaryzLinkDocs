# Privacy and Security

## 1. Privacy architecture

~~~mermaid
flowchart TD
    RAW["Identity Vault<br/>PII / documents"] --> CLAIM["Verified Claims"]
    CLAIM --> REL["Relationship View"]
    CLAIM --> CONTRACT["Contract Snapshot"]
    CLAIM --> PUBLIC["Public Profile"]
    CONSENT["Consent Policy"] --> REL
    CONSENT --> CONTRACT
    CONSENT --> PUBLIC
~~~

Public profile raw identity дерегін алмайды. Contract snapshot тек шартқа қажетті және lawful disclosure өткен деректерді алады.

## 2. Data classification

| Class | Мысал | Әдепкі access |
|---|---|---|
| PUBLIC | display name, opt-in stats | Барлық адам |
| RELATIONSHIP | contact claim, verification badge | Рұқсат етілген тарап |
| CONFIDENTIAL | contract, payment, evidence | Қатысушылар және authorized staff |
| RESTRICTED | ЖСН, ID document, biometrics | Identity Vault/service |
| SYSTEM_SECRET | keys, tokens | Runtime service ғана |

## 3. Access decision

~~~mermaid
flowchart TD
    A["Actor requests field"] --> B["Authentication"]
    B --> C["Role / tenant check"]
    C --> D["Relationship / ownership"]
    D --> E["Consent scope + purpose"]
    E --> F["Legal retention / hold"]
    F --> G{"Allow?"}
    G -->|Yes| H["Masked or full response"]
    G -->|No| I["Deny + audit"]
~~~

## 4. Consent

Consent:

- informed;
- granular;
- purpose-bound;
- recipient-bound;
- time-bound;
- versioned;
- revocable;
- auditable.

Revocation бұрын қол қойылған contract snapshot-ын немесе confirmed ledger-ді автоматты жоймайды. Future profile access тоқтайды.

## 5. Selective disclosure

Қарсы тарапқа raw document орнына claim беріледі:

- identity verified;
- age threshold met;
- citizenship verified;
- name matches contract;
- address verified;
- organization active;
- signing authority verified.

## 6. Authentication

- email/phone verification;
- passkey/TOTP MFA preferred;
- SMS fallback тәуекелі белгіленеді;
- device/session list;
- remote logout;
- sensitive action step-up;
- brute-force/rate limiting;
- compromised credential monitoring мүмкіндігі.

## 7. Authorization

RBAC + ABAC:

- role;
- party relationship;
- obligation membership;
- consent;
- purpose;
- data class;
- assurance level;
- legal hold;
- staff JIT approval.

Admin UI-да көрінуі admin-ге барлық PII оқу құқығын бермейді.

## 8. Encryption

- TLS in transit;
- storage/database encryption at rest;
- restricted PII envelope encryption;
- KMS-managed keys;
- key rotation/version;
- signed short-lived document URLs;
- backup encryption;
- secrets manager;
- production secrets repository-де жоқ.

## 9. Audit

Міндетті оқиғалар:

- login/MFA/device;
- PII view/export;
- consent grant/revoke;
- verification;
- offer/request publication;
- proposal/contract version;
- signatures;
- funding/payment confirmation;
- calculation version;
- dispute;
- admin access;
- data deletion/retention;
- provider callback.

Audit append-only және integrity chain арқылы тексеріледі.

## 10. Threat model summary

| Threat | Негізгі control |
|---|---|
| Жалған қарыз | Mutual confirmation, clear assurance level |
| Account takeover | MFA, device alerts, step-up |
| Жалған receipt | Counterparty confirmation, provider integration later |
| ID enumeration | Random public ID, throttling |
| PII scraping | Privacy default, rate limit, search controls |
| Insider access | JIT access, masking, audit |
| Cross-tenant leak | Central authorization + isolation tests |
| Document malware | Type validation + scan |
| Webhook replay | Signature, timestamp, idempotency |
| Ledger tampering | Append-only events, hashes, reconciliation |
| Public shaming | No unilateral debt publication |
| Deepfake/KYC fraud | Certified provider + liveness/manual review |

## 11. Data deletion

~~~mermaid
flowchart TD
    R["Deletion request"] --> A["Authenticate requester"]
    A --> M["Map user data"]
    M --> L{"Legal/contract hold?"}
    L -->|No| D["Delete/anonymize"]
    L -->|Yes| X["Restrict archive"]
    D --> P["Purge scheduled"]
    X --> N["Explain reason and retention"]
~~~

## 12. Security delivery gates

Before public beta:

- threat model reviewed;
- authorization matrix tests;
- tenant isolation tests;
- secret scan;
- dependency/container scan;
- backup restore test;
- critical/high findings closed;
- privacy policy and consent texts reviewed;
- incident runbook prepared.

Before payment/bank integration:

- provider security review;
- webhook penetration tests;
- KYC/AML scope;
- reconciliation;
- fraud monitoring;
- regulatory approval.
