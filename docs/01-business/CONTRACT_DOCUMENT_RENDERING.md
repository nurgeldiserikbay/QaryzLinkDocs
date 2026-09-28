# Contract document rendering foundation

Жаңартылған күні: 2026-09-28.

QaryzLink Phase 4 Trust & Evidence кезеңінде contract PDF жасауға дейін immutable document-source boundary қосты. Бұл әлі PDF файл емес және legal template final approval дегенді білдірмейді.

## Endpoints

- `GET /api/v1/contracts/:contractId/document-source`;
- `GET /api/v1/contracts/:contractId/document-preview/:locale`, мұнда locale тек `kk` немесе `ru`.

Екі endpoint те authenticated verified contract participant үшін ғана қолжетімді.

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

## Deterministic technical preview

Phase 4 renderer infrastructure legal template-ті ойдан шығармай тексерілуі үшін `technical-contract-preview-v1` қосылды.

Preview response:

- `legalStatus=TECHNICAL_PREVIEW`;
- `sourceDocumentHash` — persisted immutable ContractVersion hash;
- `renderInputHash` — template ID + locale + толық immutable document source canonical input hash;
- `renderHash` — нақты UTF-8/LF rendered content SHA-256;
- `mediaType=text/plain; charset=utf-8`;
- deterministic KZ/RU technical content.

Renderer тек support етілетін immutable terms shape-ты қабылдайды. Principal mismatch, invalid document hash, unknown locale немесе unsupported terms болса fail-closed `CONTRACT_DOCUMENT_MISMATCH` береді.

Acknowledgements/signatures rendered immutable content-ке кірмейді. Себебі олар contract version content жасалғаннан кейін пайда болады; оларды render hash-ке қосу signed content identity-ін signature қосылған сайын өзгертер еді.

Front contract detail осы preview-ды locale бойынша көрсетеді, үш integrity hash-ті көрсетеді және explicit user action арқылы TXT download береді.

## Неге PDF бірден қосылмады

PDF renderer legal text/template, font embedding, pagination, reproducibility және final Kazakhstan disclosure wording-ке тәуелді. Renderer-ді immutable source дайын болмай тұрып енгізу signed document semantics-ті шатастыруы мүмкін.

Сондықтан implementation реті:

1. [x] immutable document source;
2. [x] deterministic technical renderer + source/input/content hash boundary;
3. approved KZ/RU legal contract template;
4. deterministic PDF renderer;
5. rendered PDF hash/source binding;
6. participant PDF download;
7. staging visual/integrity acceptance.

## Қауіпсіздік

- non-participant privacy-safe unavailable result алады;
- source identity/contact fields шығармайды;
- lifecycle status/funding deadline immutable source ішіне әдейі кірмейді;
- acknowledgement metadata immutable document payload-тан бөлек.

## Verification status

QaryzLinkBack PR #181 merged at `2941102`: immutable participant document source. Technical renderer slice кейінгі PR арқылы source/input/render hash boundary және KZ/RU deterministic TXT preview қосады. Бұл legal PDF approval-ды айналып өтпейді.