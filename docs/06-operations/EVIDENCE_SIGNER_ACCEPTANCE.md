# Evidence KMS/HSM signer acceptance record

Жаңартылған күні: 2026-09-30.

Бұл record нақты KMS/HSM-backed evidence signer deployment-ін approve етуге арналған. **Template-тің болуы approval емес.** Барлық reviewer/provider fields review аяқталғанша `PENDING`.

Technical boundary: [Remote Ed25519 evidence signer](EVIDENCE_REMOTE_SIGNER.md).

## 1. Deployment identity

| Field | Value |
|---|---|
| KMS/HSM/provider | **PENDING** |
| Signer gateway deployment/version | **PENDING** |
| Region/residency | **PENDING** |
| Key algorithm/profile | Ed25519 / **PENDING** |
| Active key ID | **PENDING** |
| Independently verified SPKI SHA-256 | **PENDING** |
| Review date | **PENDING** |

Production references:

- `EVIDENCE_SIGNER_DEPLOYMENT_ID`;
- `EVIDENCE_SIGNER_IAM_POLICY_ID`;
- `EVIDENCE_SIGNER_KEY_CEREMONY_ID`;
- `EVIDENCE_SIGNER_KEY_LIFECYCLE_POLICY_ID`.

## 2. IAM and custody acceptance

- [ ] application runtime can request signatures only;
- [ ] application runtime cannot create/delete/export/administer keys;
- [ ] signer credential is scoped to the expected key;
- [ ] private key material is non-exportable;
- [ ] provider/operator access is least privilege and attributable;
- [ ] emergency revoke/disable path is documented;
- [ ] key usage/audit logs exclude payload bytes and secrets;
- [ ] backup/replication/residency behavior is reviewed.

## 3. Key ceremony

Record exact independent evidence:

| Field | Value |
|---|---|
| Ceremony record/version | **PENDING** |
| Key creation participants | **PENDING** |
| Independent fingerprint verifier | **PENDING** |
| Activation time | **PENDING** |
| Previous key status | **PENDING** |

Acceptance:

- [ ] SPKI/fingerprint independently derived;
- [ ] configured key ID/fingerprint match the ceremony record;
- [ ] application trust registry shows exactly one ACTIVE expected key;
- [ ] old key becomes RETIRED/REVOKED as designed;
- [ ] maintenance gate is disabled after ceremony.

## 4. Runtime staging checks

- [ ] valid v1 seal verifies locally;
- [ ] valid v2 seal verifies locally;
- [ ] wrong key ID fails closed;
- [ ] wrong fingerprint fails closed;
- [ ] changed payload signature fails closed;
- [ ] redirect/timeout/malformed/oversized response fails closed;
- [ ] signer outage does not emit a seal/audit success;
- [ ] rotation drill succeeds without rewriting historical seals;
- [ ] compromise drill blocks new signing;
- [ ] load/latency stays inside approved budget.

## 5. Lifecycle policy

Policy must explicitly state:

- rotation cadence/trigger;
- compromise response;
- RETIRED versus REVOKED semantics;
- provider-side disable/delete timing;
- historical verification requirements;
- retention/legal constraints before deletion;
- incident owner and escalation route.

## 6. Approval record

| Field | Value |
|---|---|
| `EVIDENCE_SIGNER_DEPLOYMENT_ID` | **PENDING** |
| `EVIDENCE_SIGNER_IAM_POLICY_ID` | **PENDING** |
| `EVIDENCE_SIGNER_KEY_CEREMONY_ID` | **PENDING** |
| `EVIDENCE_SIGNER_KEY_LIFECYCLE_POLICY_ID` | **PENDING** |
| Approved key ID/fingerprint | **PENDING** |
| Security reviewer | **PENDING** |
| Operations reviewer | **PENDING** |
| Legal/retention reviewer | **PENDING** |
| Successful staging run/reference | **PENDING** |
| Effective/review date | **PENDING** |

## 7. Final gate

Only after this record is approved may production enable `EVIDENCE_SEALING_ENABLED=true` with the approved remote signer. Release preflight must still return non-fail and staging evidence must be retained separately.
