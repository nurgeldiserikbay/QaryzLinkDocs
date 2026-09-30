# Timestamp authority acceptance record

Жаңартылған күні: 2026-09-30.

Бұл record QaryzLink evidence үшін нақты standards-based/RFC3161 немесе legally approved timestamp authority-ді таңдау және approve етуге арналған. **Current remote Ed25519 attestation өздігінен RFC3161/qualified timestamp емес.**

Technical boundary: [External evidence timestamp attestation](EVIDENCE_EXTERNAL_TIMESTAMP.md).

## 1. Authority identity

| Field | Value |
|---|---|
| Provider/legal name | **PENDING** |
| Protocol/profile | **PENDING** |
| RFC3161/QTSA/other classification | **PENDING** |
| Endpoint/environment | **PENDING** |
| Region/residency | **PENDING** |
| Trust anchor/certificate profile | **PENDING** |
| Review date | **PENDING** |

Production references:

- `EVIDENCE_TIMESTAMP_STANDARD_PROFILE_ID`;
- `EVIDENCE_TIMESTAMP_TRUST_POLICY_ID`;
- `EVIDENCE_TIMESTAMP_REVOCATION_POLICY_ID`;
- `EVIDENCE_TIMESTAMP_LEGAL_CLASSIFICATION_ID`.

## 2. Protocol and trust mapping

- [ ] request/response format maps to approved standard/profile;
- [ ] subject hash semantics preserve QaryzLink archive/seal binding;
- [ ] nonce/replay protection exists;
- [ ] authority identity is pinned;
- [ ] certificate/path validation is specified;
- [ ] revocation/OCSP/CRL behavior is specified;
- [ ] clock source and accuracy/SLA are reviewed;
- [ ] long-term validation requirements are documented.

## 3. Legal classification

| Decision | Reference/status |
|---|---|
| Kazakhstan legal effect | **PENDING** |
| Qualified/trusted timestamp classification | **PENDING** |
| Evidence/court package suitability | **PENDING** |
| Certificate/revocation retention requirement | **PENDING** |
| User disclosure wording | **PENDING** |

No UI/docs may claim “qualified timestamp” unless this section explicitly approves that classification.

## 4. Staging acceptance

- [ ] valid authority response verifies;
- [ ] wrong authority identity fails closed;
- [ ] wrong trust chain/key fails closed;
- [ ] revoked/expired certificate path fails as approved policy requires;
- [ ] replay/nonce mismatch fails closed;
- [ ] stale/future time outside policy fails closed;
- [ ] outage/timeout/malformed/oversized response fails closed;
- [ ] v1 and v2 evidence seal timestamps verify independently;
- [ ] long-term verification artifact is exportable;
- [ ] logs/artifacts contain no provider secret or evidence bytes.

## 5. Approval record

| Field | Value |
|---|---|
| `EVIDENCE_TIMESTAMP_STANDARD_PROFILE_ID` | **PENDING** |
| `EVIDENCE_TIMESTAMP_TRUST_POLICY_ID` | **PENDING** |
| `EVIDENCE_TIMESTAMP_REVOCATION_POLICY_ID` | **PENDING** |
| `EVIDENCE_TIMESTAMP_LEGAL_CLASSIFICATION_ID` | **PENDING** |
| Provider/authority ID | **PENDING** |
| Security reviewer | **PENDING** |
| Legal reviewer | **PENDING** |
| Operations reviewer | **PENDING** |
| Successful staging run/reference | **PENDING** |
| Effective/review date | **PENDING** |

## 6. Final gate

Production timestamping stays disabled until this record is approved and the selected provider/adapter satisfies the approved protocol and trust policy. Versioned config references alone do not imply legal acceptance.
