# Evidence summary and immutable manifest

Бұл құжат Phase 2 Private Debt MVP ішіндегі evidence summary baseline-ды сипаттайды.

Мақсат — contract history-дің қандай дәлелдері барын participant-ке түсінікті көрсету және қарыз толық жабылғаннан кейін сол күйдің verifiable immutable JSON manifest snapshot-ын бекіту.

Бұл baseline court-ready evidence package емес. 2026-09-28 бастап Phase 4-тің алғашқы қадамы ретінде participant-only audited canonical JSON export қосылды; PDF/ZIP, manifest signature және trusted timestamp әлі Phase 4 scope-ында қалады.

## Екі бөлек ұғым

### Live evidence summary

`GET /api/v1/contracts/:contractId/evidence-summary` ағымдағы participant-visible coverage metadata қайтарады:

- contract version саны;
- signature саны;
- funding status/evidence/confirmation counts;
- schedule version/item counts;
- payment totals, confirmed/reversed counts және payment evidence count;
- ledger entry count;
- dispute бар/жоқ және status;
- closure certificate metadata;
- immutable package бұрын жасалған болса оның id/schema/hash/createdAt metadata-сы.

Summary immutable емес: contract lifecycle жалғасқан сайын оның count/status мәндері өзгеруі мүмкін.

### Immutable evidence manifest

`POST /api/v1/contracts/:contractId/evidence-package` тек мына кезде package жасайды:

1. caller contract borrower немесе lender participant;
2. Contract `COMPLETED`;
3. ClosureCertificate бар.

Бір contract үшін бір ғана `EvidencePackage` жасалады. Қайталанған POST existing package-ті қайтарады.

`GET /api/v1/contracts/:contractId/evidence-package` бұрын жасалған immutable manifest-ті participant-ке қайтарады.

## Manifest schema v1

Manifest мыналарды snapshot ретінде сақтайды:

- Contract ID/status/currency/principal және lifecycle timestamps;
- барлық ContractVersion metadata;
- signature method, role, signed payload hash және timestamp;
- Funding status/amount және funding evidence SHA-256/media type;
- funding confirmation role/decision/timestamp;
- барлық ScheduleVersion input hash/policy version және item financial state;
- payments, reversal linkage, evidence SHA-256, confirmation role/decision және allocations;
- ledger sequence/direction/account/amount/currency/effective time;
- dispute ID/status/opener role және timestamps;
- closure confirmations;
- ClosureCertificate hashes және aggregate totals;
- contract-scoped audit timeline-нан action + timestamp.

Party database ID manifest ішінде participant role-ға (`BORROWER`, `LENDER`) алмастырылады.

## Әдейі кірмейтін деректер

Manifest пен summary-ға:

- evidence storage `objectKey`;
- signed download URL;
- email/phone;
- ЖСН/БСН немесе identity document;
- raw receipt/document bytes;
- funding/payment confirmation reason;
- dispute description;
- ledger metadata JSON;
- audit actor user ID;
- password/token/session data

кірмейді.

Бұл boundary evidence package-ті PII dump-қа айналдырмау үшін бекітілген.

## Hash және deterministic serialization

Manifest hash SHA-256 арқылы canonical JSON-нан есептеледі.

Canonicalization:

- object key-лері lexical deterministic order-мен жазылады;
- array order business/source order арқылы алдын ала deterministic жасалады;
- BigInt financial values decimal string ретінде беріледі;
- Date values ISO-8601 UTC string ретінде беріледі;
- nullable values explicit `null`.

Database list query-лерінде unique business order немесе timestamp + ID secondary order қолданылады.

Сондықтан бір snapshot-тың field insertion order-ы өзгерсе де hash өзгермеуі тиіс; evidence truth өзгерсе hash өзгереді.

## Persistence

~~~mermaid
erDiagram
    CONTRACTS ||--o| CLOSURE_CERTIFICATES : closes_with
    CONTRACTS ||--o| EVIDENCE_PACKAGES : freezes
    CLOSURE_CERTIFICATES ||--o| EVIDENCE_PACKAGES : anchors

    EVIDENCE_PACKAGES {
      uuid id PK
      uuid contractId UK
      uuid closureCertificateId UK
      int schemaVersion
      jsonb manifest
      char64 manifestHash UK
      datetime createdAt
    }
~~~

Contract row lock package creation race-ін serialize етеді. Unique `contractId` және `closureCertificateId` constraints бір final package invariant-ын бекітеді.

Package жасалғаннан кейін manifest қайта есептеліп overwrite болмайды.

## Audit

Package алғаш жасалғанда:

- action: `EVIDENCE_PACKAGE_CREATED`;
- entity: Contract;
- payload: `schemaVersion` + `manifestHash`

ғана audit-ке жазылады.

Manifest content audit payload-қа көшірілмейді.

## Frontend boundary

Contract detail ішіндегі Evidence Summary panel:

- aggregate evidence coverage көрсетеді;
- package creation тек closure completed болғанда ұсынады;
- package жасалғаннан кейін schema version, manifest hash және created timestamp көрсетеді;
- API create response-та келген raw manifest-ті UI helper әдейі discard етеді.

Frontend storage key, raw evidence, identity/contact немесе manifest contents көрсетпейді.

## Нені дәлелдейді және нені дәлелдемейді

Manifest:

- QaryzLink database state-інің белгілі бір completed contract үшін қандай evidence metadata snapshot-ын бекіткенін;
- included document/evidence hashes-ты;
- contract/signature/payment/ledger/closure records арасындағы байланыс metadata-сын

тексеруге негіз береді.

Manifest өздігінен:

- құжаттың заңдық күшіне;
- signer identity assurance деңгейіне;
- файлдың сотта admissibility-іне;
- сыртқы timestamp authority-ге;
- нотариалдық куәландыруға

кепілдік бермейді.

## Phase 4 JSON export baseline

`POST /api/v1/contracts/:contractId/evidence-package/export` existing immutable package үшін ғана жұмыс істейді.

Export алдында backend persisted manifest-ті canonical JSON ретінде қайта serialize етіп, SHA-256 hash-ін persisted `manifestHash` мәнімен салыстырады. Hash сәйкес келмесе `EVIDENCE_PACKAGE_INTEGRITY_FAILED` арқылы fail-closed болады және файл берілмейді.

Successful export:

- authenticated borrower/lender participant-пен ғана шектелген;
- canonical JSON content, deterministic filename, schema version және manifest hash қайтарады;
- `EVIDENCE_PACKAGE_EXPORTED` audit event жасайды;
- audit payload-қа manifest content, raw evidence, contact немесе storage key қоспайды.

Front raw manifest-ті тұрақты UI state-ке сақтамайды: user explicit download action жасағанда content уақытша Blob ретінде жасалып, JSON файл болып жүктеледі.

Бұл export әлі court-ready ZIP емес және trusted timestamp/signature қоспайды.

## Phase 4 deterministic bundle manifest

`POST /api/v1/contracts/:contractId/evidence-package/bundle-manifest` existing immutable package үстінен болашақ archive contract-ын жасайды.

Bundle manifest ZIP binary жасамайды. Ол болашақ archive-ке кіретін artifact metadata-ны deterministic түрде бекітеді:

- canonical `evidence/manifest-v{schema}.json`;
- `contract/technical-preview.kk.txt`;
- `contract/technical-preview.ru.txt`.

Әр artifact үшін:

- normalized relative path;
- media type;
- UTF-8 byte size;
- SHA-256

сақталады. Artifact path-тар lexical order-мен canonical manifest-ке кіреді; unsafe/duplicate path reject болады.

Bundle manifest жеке:

- persisted evidence `manifestHash`;
- ClosureCertificate `contractDocumentHash`;
- artifact hashes;
- `bundleManifestHash`

арасында integrity chain жасайды.

KZ/RU technical preview екеуінің `sourceDocumentHash` мәні ClosureCertificate contract document hash-імен дәл сәйкес келуі міндетті. Сәйкес болмаса export fail-closed.

`cryptographicSeals.manifestSignature` және `trustedTimestamp` қазір explicit `null`. Сондықтан бұл implementation қолтаңба немесе external timestamp бар деп мәлімдемейді.

Successful bundle manifest export `EVIDENCE_BUNDLE_MANIFEST_EXPORTED` audit event жасайды. Audit payload raw manifest/content емес, тек package/hash/artifact count metadata сақтайды.

Front user explicit action кезінде bundle manifest JSON-ды жүктейді және bundle hash пен artifact count көрсетеді.

## Phase 4 deterministic ZIP archive

`POST /api/v1/contracts/:contractId/evidence-package/archive` bundle builder-дің дәл сол artifact set-ын deterministic ZIP ретінде жинайды.

Archive v1:

- compression қолданбайды (`STORE`);
- filenames UTF-8;
- file order lexical;
- DOS timestamp fixed `1980-01-01 00:00:00`;
- duplicate/unsafe paths reject;
- payload 5 MiB және 16 entry-мен bounded;
- әр file CRC32 ZIP compatibility үшін;
- бүкіл ZIP bytes үшін SHA-256 `archiveHash`.

ZIP ішінде:

- `bundle-manifest.json`;
- canonical evidence manifest JSON;
- KZ technical contract preview;
- RU technical contract preview.

`bundle-manifest.json` өзінің recursive hash мәселесін тудырмау үшін bundle artifact list-ке кірмейді; бүкіл container integrity-ін бөлек `archiveHash` жабады.

Successful export `EVIDENCE_ARCHIVE_EXPORTED` audit event жасайды. Audit тек package/evidence/bundle/archive hashes, entry count, size және format metadata сақтайды.

Front Base64 transport-ты bytes-ке айналдырып explicit user action арқылы ZIP жүктейді және archive hash/count/size көрсетеді.

Бұл **metadata/text ZIP v1**. Raw funding/payment evidence binaries әдейі кірмейді; олар storage streaming, malware-clean verification, legal-hold және size policy дайын болғаннан кейін ғана қосылады.

Manifest signature және trusted timestamp әлі жоқ.

## Phase 4 evolution

Trust & Evidence кезеңінде осы manifest baseline үстіне:

- contract rendered PDF;
- selected evidence binaries;
- manifest JSON;
- [x] deterministic bundle artifact index + bundle manifest hash;
- manifest signature;
- trusted timestamp;
- [x] bounded deterministic metadata/text ZIP container;
- [ ] streaming evidence-binary ZIP expansion;
- export audit;
- retention/legal-hold policy;
- identity/KYC assurance references;
- jurisdiction-specific legal wording

қосылуы мүмкін.

Phase 4 export жаңа versioned package format болуы тиіс; Phase 2 `schemaVersion: 1` manifest үнсіз өзгертілмейді.


## Bundle manifest implementation evidence — 2026-09-28

QaryzLinkBack PR #184 merged at `76f9a59`: deterministic bundle manifest, ClosureCertificate document-hash binding, audited participant-only export және POST auth smoke gate.

QaryzLinkFront PR #55 merged at `0e0cdad`: bundle manifest download, bundle hash және artifact count UI.

Back CI run `36455112812` және Front CI run `36455120153` quality job жасады, бірақ runner step орындалмады. Сондықтан automated typecheck/lint/test/build verification pending; бұл run-дарда application code орындалмаған.


## Deterministic ZIP implementation evidence — 2026-09-28

QaryzLinkBack PR #185 merged at `d167663`: dependency-free deterministic STORE ZIP writer, shared bundle builder, participant archive endpoint, whole-archive SHA-256 және audit boundary.

QaryzLinkFront PR #56 merged at `b61aeb0`: ZIP download, archive hash, entry count және size UI.

Back CI run `36456180490` және Front CI run `36456185321` quality job құрды, бірақ runner step орындалмады. Automated typecheck/lint/test/build verification pending; бұл run-дар application code-ты орындамаған.


## Phase 4 cryptographic seal foundation

Deterministic ZIP үстіне provider-neutral detached signature boundary қосылды.

Seal payload canonical JSON ретінде мыналарды байлайды:

- fixed purpose: `QARYZLINK_EVIDENCE_ARCHIVE_SEAL_V1`;
- EvidencePackage ID;
- evidence manifest SHA-256;
- bundle manifest SHA-256;
- archive SHA-256;
- archive format `ZIP_STORE_V1`;
- ZIP entry count;
- ZIP byte size.

Payload өзі бөлек SHA-256 `payloadHash` алады.

Production signature algorithm contract — `Ed25519`. External signer adapter:

1. canonical payload bytes алады;
2. detached signature, opaque bounded key ID және SPKI public key қайтарады;
3. Backend signature-ны Ed25519 public key арқылы қайта verify етеді;
4. verification өтпесе seal result берілмейді;
5. audit-ке raw payload/public key/signature емес, payload/archive hashes, key ID, key fingerprint және signature hash қана жазылады.

Public key fingerprint — SPKI DER bytes SHA-256.

Backend-side signature verification cryptographic consistency-ді тексереді, бірақ returned public key өздігінен trust anchor емес. Production KMS/HSM adapter approved key alias/version-ды pin етуі, IAM арқылы signing permission-ды шектеуі және unexpected key identity-ді fail-closed reject етуі тиіс.

Endpoints:

- `GET /api/v1/contracts/:contractId/evidence-package/seal-capability`;
- `POST /api/v1/contracts/:contractId/evidence-package/seal`.

Capability contract participant access boundary арқылы өтеді.

Current production provider — intentionally unavailable. `EVIDENCE_SEALING_ENABLED=false` default. Flag true болса current release preflight `seal_provider_adapter_unavailable` арқылы fail етеді. Осылайша private key application env/config-ке салынбайды және жалған "signed" state жасалмайды.

Front Evidence panel:

- `Ed25519` capability status көрсетеді;
- provider unavailable кезде seal action көрсетпейді;
- provider enabled болғанда ғана explicit seal action ашады;
- successful detached seal JSON ретінде жүктеледі;
- payload hash, key identity/fingerprint verification metadata сақталады.

`trustedTimestamp` current seal response-та explicit `null`. App-generated timestamp trusted timestamp ретінде көрсетілмейді.

Келесі external dependency: KMS/HSM немесе equivalent managed signing provider adapter, approved key lifecycle/IAM, rotation/revocation және independent staging verification. Trusted timestamp authority одан кейін бөлек layer.


## Cryptographic seal implementation evidence — 2026-09-28

QaryzLinkBack PR #186 merged at `c2d2a1e`: domain-separated Ed25519 seal payload, provider-neutral signer boundary, Backend signature verification, participant-scoped capability/seal endpoints, release-preflight gate және default-off unavailable provider.

QaryzLinkFront PR #57 merged at `aad8056`: Ed25519 seal capability UI, default-off provider status және future detached seal JSON download boundary.

Back CI run `36461356114` және Front CI run `36461359027` quality job құрды, бірақ runner step орындалмады. Сондықтан automated typecheck/lint/test/build verification pending; бұл run-дар application code-ты орындамаған.
