# KZ/RU contract template acceptance record

Жаңартылған күні: 2026-09-30.

Бұл құжат QaryzLink contract PDF үшін нақты KZ/RU legal template artifacts, independent hashes, legal wording sign-off, font policy және visual/pagination acceptance-ті versioned түрде бекітуге арналған.

**Бұл template approval емес.** Барлық approval fields review аяқталғанша `PENDING` болып қалады.

Technical boundary:

- [Contract document rendering foundation](../01-business/CONTRACT_DOCUMENT_RENDERING.md)
- [Contract PDF renderer boundary](CONTRACT_PDF_RENDERER.md)

## 1. Artifact set

| Field | KZ | RU |
|---|---|---|
| Template ID | **PENDING** | **PENDING** |
| Template artifact filename/version | **PENDING** | **PENDING** |
| Independently computed SHA-256 | **PENDING** | **PENDING** |
| Language/legal owner | **PENDING** | **PENDING** |
| Effective/review date | **PENDING** | **PENDING** |

Configured values after approval:

- `CONTRACT_PDF_KK_TEMPLATE_ID`;
- `CONTRACT_PDF_KK_TEMPLATE_HASH`;
- `CONTRACT_PDF_RU_TEMPLATE_ID`;
- `CONTRACT_PDF_RU_TEMPLATE_HASH`.

Template hash must be computed from the exact reviewed artifact; copying a hash from renderer output without independent verification is not sufficient.

## 2. Legal content review

For each locale reviewers must confirm or explicitly mark not-applicable:

- [ ] parties and roles are described correctly;
- [ ] principal/currency/term/rate fields map to immutable contract data;
- [ ] repayment schedule representation is accurate;
- [ ] funding/payment evidence language does not imply platform custody;
- [ ] platform acknowledgement wording is legally appropriate for the approved model;
- [ ] no qualified/electronic-signature claim is made unless separately approved;
- [ ] dispute/correction language matches product behavior;
- [ ] post-payment amendment wording does not imply unavailable ledger treatment;
- [ ] privacy/contact fields not present in immutable PDF source unless separately approved;
- [ ] applicable notices/disclosures are present;
- [ ] locale terminology is consistent and reviewed.

Legal review should reference exact template IDs/hashes, not generic “current template” wording.

## 3. Deterministic font policy

Record approved font/embedding policy:

| Field | Value |
|---|---|
| Font family/families | **PENDING** |
| Font source/license reference | **PENDING** |
| Embedding/subsetting policy | **PENDING** |
| Fallback policy | **PENDING** |
| Renderer font package/version | **PENDING** |
| Font policy approval ID | **PENDING** |

Acceptance:

- [ ] all required glyphs for KZ and RU are rendered;
- [ ] no runtime network font fetch is required;
- [ ] fallback does not silently change approved layout;
- [ ] font embedding/subsetting is deterministic;
- [ ] font license/use is reviewed;
- [ ] renderer image/package pins the approved font set.

Do not store raw font bytes in this approval record.

## 4. Visual and pagination acceptance

Test the approved templates against representative bounded fixtures.

At minimum:

- [ ] minimum supported principal/term/rate values;
- [ ] maximum supported bounded values;
- [ ] zero-interest contract;
- [ ] long KZ wording/data values;
- [ ] long RU wording/data values;
- [ ] page break near signature/acknowledgement area;
- [ ] multi-page schedule/terms layout if supported;
- [ ] no clipped text;
- [ ] no overlapping content;
- [ ] no missing glyphs;
- [ ] headers/footers/page numbers, if used, are deterministic;
- [ ] same immutable input + same template + same renderer/font set yields the same PDF hash.

Record visual evidence/reference without embedding participant PII.

## 5. Renderer binding

Approved renderer deployment must demonstrate:

- [ ] exact renderer ID;
- [ ] pinned Ed25519/SPKI fingerprint;
- [ ] wrong renderer ID fails closed;
- [ ] wrong key fingerprint fails closed;
- [ ] wrong locale/template/source/render-input fails closed;
- [ ] malformed/non-PDF bytes fail closed;
- [ ] PDF hash mismatch fails closed;
- [ ] detached renderer signature verifies independently;
- [ ] redirect/timeout/oversized response fail closed;
- [ ] renderer logs contain no bearer token, PDF bytes or participant PII.

## 6. Evidence-chain acceptance

For a staging contract created with approved pins:

- [ ] ContractVersion stores the exact KZ/RU template IDs/hashes;
- [ ] template identity participates in signed documentHash semantics;
- [ ] ClosureCertificate contractDocumentHash matches immutable source;
- [ ] KZ/RU verified PDF artifact metadata matches pinned templates;
- [ ] ZIP v2 contains KZ/RU PDFs and deterministic `pdf-artifacts.json`;
- [ ] bundle/archive hashes verify after independent download;
- [ ] legacy contract without template pins remains fail-closed.

## 7. Governance references

Production config requires versioned non-secret references:

| Variable | Approval record |
|---|---|
| `CONTRACT_PDF_TEMPLATE_APPROVAL_ID` | **PENDING** |
| `CONTRACT_PDF_LEGAL_SIGNOFF_ID` | **PENDING** |
| `CONTRACT_PDF_VISUAL_ACCEPTANCE_ID` | **PENDING** |
| `CONTRACT_PDF_FONT_EMBEDDING_POLICY_ID` | **PENDING** |

These IDs point to reviewed artifacts/records; they are not the legal text or PDF bytes themselves.

## 8. Change control

A new approval version is required if any of these change:

- legal wording;
- template structure;
- KZ/RU template artifact hash;
- font family/version/embedding policy;
- renderer identity/key;
- material pagination/layout behavior;
- immutable document fields rendered into PDF;
- legal signing/acknowledgement semantics.

Existing signed ContractVersion template pins must never be silently migrated to a newer template.

## 9. Approval record

| Field | Value |
|---|---|
| Artifact set/version | **PENDING** |
| KZ template ID/hash | **PENDING** |
| RU template ID/hash | **PENDING** |
| Template approval ID | **PENDING** |
| Legal sign-off ID | **PENDING** |
| Visual acceptance ID | **PENDING** |
| Font embedding policy ID | **PENDING** |
| Renderer ID/key fingerprint | **PENDING** |
| Legal reviewer | **PENDING** |
| Product owner | **PENDING** |
| Security/operations reviewer | **PENDING** |
| Successful staging run/reference | **PENDING** |
| Effective/review date | **PENDING** |

## 10. Final gate

Only after the exact artifacts and governance references above are approved may production enable:

`CONTRACT_PDF_ENABLED=true`

with `CONTRACT_PDF_PROVIDER=remote-signed`.

Release preflight must still return non-fail and staging visual/font/pagination/integrity acceptance must be retained separately.
