# L2 KYC provider acceptance record

Жаңартылған күні: 2026-09-30.

Бұл құжат QaryzLink үшін нақты L2 identity/KYC provider таңдау, generic signed adapter-ге provider-specific mapping жасау және staging/privacy/legal acceptance-ті versioned түрде тіркеуге арналған.

**Бұл template provider-ді автоматты түрде approve етпейді.** Provider атауы мен governance references тек review аяқталғаннан кейін толтырылады.

Қазіргі technical boundary: [Identity verification foundation](../01-business/IDENTITY_VERIFICATION.md).

## 1. Provider identity

| Field | Value |
|---|---|
| Provider legal name | **PENDING** |
| Provider product/API profile | **PENDING** |
| Provider contract/profile version | **PENDING** |
| Internal provider code | **PENDING** |
| Sandbox/staging environment | **PENDING** |
| Production region/residency | **PENDING** |
| Provider support/security contact | **PENDING** |
| Review date | **PENDING** |

Production config references:

- `IDENTITY_PROVIDER_CONTRACT_ID`;
- `IDENTITY_CALLBACK_AUTH_POLICY_ID`;
- `IDENTITY_PRIVACY_RESIDENCY_POLICY_ID`;
- `IDENTITY_LEGAL_CLASSIFICATION_ID`.

## 2. Mandatory technical compatibility

Provider integration must map to the existing QaryzLink boundary without widening product data collection.

### Start/session mapping

QaryzLink sends only an opaque random `subjectRef`.

Record:

| Provider field/event | QaryzLink mapping | Accepted |
|---|---|---|
| Session/client correlation | opaque `subjectRef` only | [ ] |
| Redirect URL | HTTPS, no embedded credentials | [ ] |
| Session expiry | bounded future expiry | [ ] |
| Provider code | exact configured internal code | [ ] |
| Session attestation | signed `QARYZLINK_IDENTITY_SESSION_V1` compatible adapter mapping | [ ] |

If provider requires QaryzLink to send email, phone, IIN/BIN, document content or profile payload during session start, that is a scope change and must not be silently mapped into the current adapter.

### VERIFIED event mapping

Provider successful-verification semantics must be mapped to:

- assurance `L2`;
- opaque provider reference;
- verified timestamp;
- expiry timestamp;
- provider event ID;
- signed callback/attestation;
- exact provider/session correlation.

| Provider success status/event | Meaning | Generic VERIFIED mapping | Accepted |
|---|---|---|---|
| **PENDING** | **PENDING** | **PENDING** | [ ] |

A provider state must not be mapped to VERIFIED if it represents pending/manual-review/partial/document-uploaded/liveness-only state unless legal/product review explicitly says that state satisfies the approved L2 meaning.

### REVOKED event mapping

| Provider revoke/expire/fraud event | Meaning | Generic REVOKED mapping | Accepted |
|---|---|---|---|
| **PENDING** | **PENDING** | **PENDING** | [ ] |

Provider-specific expiry and revocation semantics must be distinguished. QaryzLink runtime claim expiry already derives from `expiresAt`; REVOKED should represent an authoritative provider withdrawal/revocation event.

## 3. Callback and signature trust

Required evidence:

- [ ] callback transport is internal/restricted or otherwise explicitly protected;
- [ ] QaryzLink callback token/auth boundary is supported;
- [ ] provider callback payload can be authenticated/signed;
- [ ] provider public key or gateway key can be pinned;
- [ ] expected Ed25519/SPKI fingerprint is recorded;
- [ ] key rotation process is documented;
- [ ] old/compromised key revocation process is documented;
- [ ] event replay/idempotency semantics are compatible;
- [ ] provider event IDs are unique/stable enough for replay protection;
- [ ] generated/event timestamps support the configured clock-skew policy.

Record:

| Field | Value |
|---|---|
| Callback auth policy version | **PENDING** |
| Signing key owner | **PENDING** |
| Expected key fingerprint | **PENDING** |
| Rotation procedure reference | **PENDING** |
| Revocation procedure reference | **PENDING** |

## 4. Data minimization and residency

Document exactly what provider receives and what QaryzLink stores.

QaryzLink product DB currently expects to retain only:

- internal user relation;
- normalized provider code;
- hashed provider reference;
- L2 assurance;
- verified/expiry/revoked timestamps;
- minimal audit metadata.

The acceptance record must answer:

- [ ] does provider require raw IIN/BIN from QaryzLink, or collect it directly from the user?
- [ ] does provider require email/phone from QaryzLink?
- [ ] does provider return document image/biometric/liveness payloads?
- [ ] can QaryzLink avoid storing raw provider payloads?
- [ ] where is provider data processed/stored?
- [ ] which subprocessors/regions are involved?
- [ ] what provider-side retention applies?
- [ ] what deletion/DSAR mechanism exists?
- [ ] what breach/security notification commitments exist?

Any requirement to persist new identity fields in QaryzLink must be treated as a separate privacy/schema change, not an adapter mapping detail.

## 5. Legal/privacy review

Reviewers must record, without relying on technical implementation alone:

| Decision | Reference/status |
|---|---|
| Kazakhstan legal basis/classification for pilot use | **PENDING** |
| Privacy notice wording | **PENDING** |
| Processor/controller role | **PENDING** |
| Cross-border/residency analysis | **PENDING** |
| Retention/deletion obligations | **PENDING** |
| User consent/notice requirements | **PENDING** |
| Dispute/manual-review handling | **PENDING** |
| Minor/vulnerable-user restrictions if applicable | **PENDING** |

Technical L2 naming in code is not itself a legal determination.

## 6. Operational acceptance

Before enablement:

- [ ] sandbox session creation succeeds;
- [ ] successful VERIFIED callback passes signature/correlation validation;
- [ ] duplicate VERIFIED callback is idempotent;
- [ ] altered replay fails closed;
- [ ] REVOKED callback passes;
- [ ] revoke-before-verify ordering is handled;
- [ ] later fresh re-verification works as intended;
- [ ] invalid signature/key fingerprint fails closed;
- [ ] provider timeout/unavailable path is privacy-safe;
- [ ] no provider secret/raw payload appears in application logs;
- [ ] metrics/alerts cover provider unavailable/failure at aggregate level;
- [ ] incident escalation owner is named.

## 7. Rejection conditions

Do not enable the provider if any unresolved condition applies:

- unsigned/unauthenticated callback with no compensating approved trust mechanism;
- no stable event/session correlation;
- provider status cannot be safely mapped to L2 VERIFIED/REVOKED semantics;
- required QaryzLink-side sensitive-data collection exceeds approved pilot scope;
- residency/subprocessor/retention cannot be reviewed;
- key rotation/revocation cannot be operationally controlled;
- callback replay cannot be bounded;
- legal/privacy review is unresolved;
- production support/incident ownership is missing.

## 8. Approval record

| Field | Value |
|---|---|
| Provider decision | **PENDING** |
| `IDENTITY_PROVIDER_CONTRACT_ID` | **PENDING** |
| `IDENTITY_CALLBACK_AUTH_POLICY_ID` | **PENDING** |
| `IDENTITY_PRIVACY_RESIDENCY_POLICY_ID` | **PENDING** |
| `IDENTITY_LEGAL_CLASSIFICATION_ID` | **PENDING** |
| Provider code | **PENDING** |
| Approved key fingerprint | **PENDING** |
| Product owner | **PENDING** |
| Legal/privacy reviewer | **PENDING** |
| Security/operations reviewer | **PENDING** |
| Successful staging run/reference | **PENDING** |
| Effective/review date | **PENDING** |

## 9. Final gate

Only after this record is approved may deployment switch:

`IDENTITY_VERIFICATION_ENABLED=true`

and configure:

`IDENTITY_VERIFICATION_PROVIDER=remote-signed-l2`.

Release preflight remains authoritative and must still return non-fail status; successful staging execution is required separately.
