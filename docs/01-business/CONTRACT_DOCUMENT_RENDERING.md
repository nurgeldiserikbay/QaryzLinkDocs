# Contract document rendering foundation

Жаңартылған күні: 2026-09-28.

QaryzLink Phase 4 Trust & Evidence кезеңінде contract PDF жасауға дейін immutable document-source boundary қосты. Бұл әлі PDF файл емес және legal template final approval дегенді білдірмейді.

## Endpoint

`GET /api/v1/contracts/:contractId/document-source`

Endpoint тек authenticated verified contract participant үшін қолжетімді.

Response екі бөлікке бөлінеді:

### Immutable document

- contract version;
- currency;
- principal amount in minor units;
- persisted `documentHash`;
- immutable `termsSnapshot`;
- `calculationPolicy`.

Бұл section ContractVersion-ға bound және болашақ PDF renderer-дің authoritative input-ы болуы тиіс.

### Acknowledgements

Platform acknowledgement metadata бөлек беріледі:

- BORROWER/LENDER role;
- method;
- signedAt.

User ID, party ID, public ID, email, phone немесе display name response-қа кірмейді.

## Неге PDF бірден қосылмады

PDF renderer legal text/template, font embedding, pagination, reproducibility және final Kazakhstan disclosure wording-ке тәуелді. Renderer-ді immutable source дайын болмай тұрып енгізу signed document semantics-ті шатастыруы мүмкін.

Сондықтан implementation реті:

1. immutable document source;
2. approved KZ/RU contract template;
3. deterministic renderer;
4. rendered PDF hash/source binding;
5. participant download;
6. staging visual/integrity acceptance.

## Қауіпсіздік

- non-participant privacy-safe unavailable result алады;
- source identity/contact fields шығармайды;
- lifecycle status/funding deadline immutable source ішіне әдейі кірмейді;
- acknowledgement metadata immutable document payload-тан бөлек.

## Verification status

QaryzLinkBack PR #181 merged at `2941102`. Automated CI GitHub Actions quota/billing gate салдарынан pending.