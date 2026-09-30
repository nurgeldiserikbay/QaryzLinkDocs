# Retention and storage lifecycle acceptance record

Жаңартылған күні: 2026-09-30.

Бұл record Kazakhstan pilot үшін data/evidence retention periods және external object-storage lifecycle behavior-ды versioned түрде approve етуге арналған. **Template retention duration-ды өзі анықтамайды.**

Baseline: [Data retention](DATA_RETENTION.md).

## 1. Policy scope

Each category requires an explicit period or event-based rule plus legal/business basis.

| Category | Retention rule | Basis/reference |
|---|---|---|
| Contract + signed versions | **PENDING** | **PENDING** |
| Funding/payment records | **PENDING** | **PENDING** |
| Ledger/reversals | **PENDING** | **PENDING** |
| Evidence objects/manifests | **PENDING** | **PENDING** |
| Disputes | **PENDING** | **PENDING** |
| Audit events | **PENDING** | **PENDING** |
| Revoked/expired sessions | **PENDING** | **PENDING** |
| Notification history | **PENDING** | **PENDING** |
| Support tickets | **PENDING** | **PENDING** |

## 2. Account deletion interaction

- [ ] deletion/anonymization ordering is defined;
- [ ] active obligation creates the correct retention hold;
- [ ] retained legal/accounting rows survive user anonymization where required;
- [ ] deletion completion cannot remove active legal-hold evidence;
- [ ] privacy notice explains retained categories and reasons.

## 3. Evidence storage lifecycle

Production references:

- `EVIDENCE_RETENTION_POLICY_ID`;
- `EVIDENCE_STORAGE_LIFECYCLE_POLICY_ID`.

Acceptance:

- [ ] bucket lifecycle matches the approved retention record;
- [ ] lifecycle cannot delete active legal-hold objects;
- [ ] unconsumed/expired orphan uploads are handled separately;
- [ ] consumed CLEAN evidence is not deleted by orphan cleanup;
- [ ] provider lifecycle version is immutable/auditable;
- [ ] lifecycle changes require reviewed version bump;
- [ ] restore/backup retention does not silently extend or shorten legal retention.

## 4. Provider and jurisdiction review

| Field | Value |
|---|---|
| Storage provider | **PENDING** |
| Region/residency | **PENDING** |
| Backup/PITR retention | **PENDING** |
| Object versioning/deletion behavior | **PENDING** |
| Legal hold mechanism | **PENDING** |
| Privacy/legal basis | **PENDING** |

## 5. Staging acceptance

- [ ] lifecycle rule is deployed with expected version;
- [ ] non-held eligible object expires as expected in test policy window;
- [ ] legal-held object is preserved;
- [ ] consumed evidence is preserved;
- [ ] orphan upload cleanup still works;
- [ ] account deletion does not bypass retention hold;
- [ ] restore/PITR behavior is documented against deletion expectations.

## 6. Approval record

| Field | Value |
|---|---|
| `EVIDENCE_RETENTION_POLICY_ID` | **PENDING** |
| `EVIDENCE_STORAGE_LIFECYCLE_POLICY_ID` | **PENDING** |
| Product/data owner | **PENDING** |
| Legal reviewer | **PENDING** |
| Privacy reviewer | **PENDING** |
| Operations reviewer | **PENDING** |
| Successful staging/provider evidence | **PENDING** |
| Effective/review date | **PENDING** |

## 7. Final gate

Production evidence storage may be enabled only with approved references and provider-side lifecycle evidence. Application preflight remains manual even when IDs are configured.
