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
3. [x] immutable KZ/RU PDF template identity snapshot at contract creation;
4. [x] provider-neutral signed remote PDF renderer boundary;
5. [x] participant verified PDF artifact download foundation;
6. [ ] actual approved KZ/RU legal template content;
7. [ ] rendered PDF artifact hash binding into evidence bundle/ZIP v2;
8. [ ] staging visual/font/pagination/legal acceptance.

## Қауіпсіздік

- non-participant privacy-safe unavailable result алады;
- source identity/contact fields шығармайды;
- lifecycle status/funding deadline immutable source ішіне әдейі кірмейді;
- acknowledgement metadata immutable document payload-тан бөлек.

## Verification status

QaryzLinkBack PR #181 merged at `2941102`: immutable participant document source.

QaryzLinkBack PR #183 merged at `5f96c0e`: deterministic KZ/RU technical renderer, source/input/render SHA-256 boundary және participant preview endpoint. CI run `36453973371` quality job құрды, бірақ runner step орындалмады; automated typecheck/lint/test/build verification pending.

QaryzLinkFront PR #54 merged at `d4ee270`: contract detail technical preview, integrity hashes және TXT download. CI run `36453978353` те quality job құрғанымен runner step орындалмады.

Бұл legal PDF approval-ды айналып өтпейді.

## Pinned-template PDF foundation — 2026-09-29

Contract PDF template identity енді deployment config-ке ғана тәуелді емес: feature enabled кезде жаңа ContractVersion KZ/RU template ID/hash-ті immutable snapshot ретінде сақтайды және сол identity signed `documentHash` canonical input-ына кіреді. Сондықтан party acknowledgements template identity-ді де бекітеді. Existing contract-тарға retroactive backfill жасалмайды.

Remote signed renderer foundation source document + locale + pinned template identity-ді render-input hash-қа байлайды. Backend renderer response-тан PDF bytes/hash/size, source/template/render-input metadata және detached Ed25519 attestation-ді қайта verify етеді.

Бұл actual legal template approval емес. Толық operational boundary: [Contract PDF renderer boundary](../06-operations/CONTRACT_PDF_RENDERER.md).


## PDF renderer implementation evidence — 2026-09-29

QaryzLinkBack PR #192 (`6218e73`) және QaryzLinkFront PR #62 (`e9dcd26`) pinned-template PDF foundation-ды main-ге енгізді. Legacy contract-тарда immutable template pins жоқ болса PDF capability disabled күйінде қалады. CI runs `36542155035` / `36536087948` runner 0-step болғандықтан automated verification pending.
