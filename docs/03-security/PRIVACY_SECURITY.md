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

Current implemented foundation:

- email verification;
- password + scrypt storage;
- active session inventory;
- selective session revoke / logout-all;
- refresh-token rotation;
- brute-force/rate limiting boundaries;
- password reset/change session revocation;
- prepared native biometric secure-session boundary.

Target hardening, **not yet production-complete**:

- passkey/TOTP MFA;
- sensitive-action step-up;
- compromised credential monitoring;
- real Android/iOS biometric host acceptance.

SMS authentication is not enabled.

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

Implemented repository controls:

- Backend/API HTTPS expectations and production PostgreSQL TLS validation;
- restricted contact PII envelope encryption;
- key version/rotation tooling;
- signed short-lived evidence URLs;
- production secrets are not committed to repositories;
- production startup now requires KZ storage/processing residency declarations and versioned storage-encryption governance.

External/provider controls that still require acceptance:

- actual database/storage encryption at rest;
- backup encryption;
- KZ provider/replica residency;
- KMS/HSM/vault custody for PII keys;
- evidence bucket encryption/IAM/lifecycle.

See [User data storage security audit — 2026-10-07](./USER_DATA_STORAGE_SECURITY_AUDIT_2026-10-07.md).

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


## 13. Web response security headers

Front және Admin web response baseline-і кодта бекітіледі және staging-та нақты HTTP response арқылы дәлелденеді:

- Content-Security-Policy: `default-src 'self'`, `base-uri 'self'`, `object-src 'none'`, `frame-ancestors 'none'`, `form-action 'self'`, self/data/blob image sources, self/data font sources, self/inline styles, self/inline scripts, self HTTPS және localhost-only development connections, self manifest, self/blob workers;
- `X-Content-Type-Options: nosniff`;
- `X-Frame-Options: DENY`;
- `Referrer-Policy: strict-origin-when-cross-origin`;
- `Permissions-Policy`: camera, microphone, geolocation және payment disabled;
- `Cross-Origin-Opener-Policy: same-origin`;
- `X-DNS-Prefetch-Control: off`;
- `poweredByHeader` disabled, сондықтан framework identity response header-і жарияланбайды.

CSP-тегі `unsafe-eval` тек development режиміне рұқсат етіледі; production response-та болмауы тиіс. HSTS бұл application code-қа емес, HTTPS staging/production ingress немесе reverse proxy-ге тиесілі. Нақты HTTPS ingress тексерілмей тұрып HSTS белсенді деп саналмайды.

Metrics access token browser bundle-ге, public environment variable-ға, Front/Admin request-ке немесе screenshot/log-қа түспейді. Protected metrics тек internal runner/restricted ingress арқылы тексеріледі.

Staging smoke кезінде әр қолданбаның нақты HTTPS response header-лері `curl -I` немесе эквивалент құралмен тексеріледі. Evidence record-та тек commit SHA, hostname, UTC уақыты, header атаулары және pass/fail сақталады; token, cookie, PII және secret мәндері сақталмайды.
