# Evidence summary and immutable manifest

Бұл құжат Phase 2 Private Debt MVP ішіндегі evidence summary baseline-ды сипаттайды.

Мақсат — contract history-дің қандай дәлелдері барын participant-ке түсінікті көрсету және қарыз толық жабылғаннан кейін сол күйдің verifiable immutable JSON manifest snapshot-ын бекіту.

Бұл baseline court-ready evidence package емес. Phase 4 ішінде canonical JSON export, deterministic ZIP v1/v2, Ed25519 archive seal, signing-key trust registry және external signed time attestation foundation іске асты. Approved KZ/RU legal PDF, нақты KMS/HSM/TSA production acceptance және RFC3161/qualified timestamp legal classification әлі ашық.

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

Бұл **metadata/text ZIP v1**. Ол backward-stable болып қалады.

Full binary export бөлек **ZIP_STORE_V2** capability ретінде қосылды. v2 immutable manifest-те frozen болған funding/payment evidence bytes-ті ғана қосады; consumed upload intent, CLEAN malware verdict, exact size/mediaType және downloaded SHA-256 қайта тексеріледі. Feature default-off және bounded. Толық boundary: [Full evidence binary archive v2](../06-operations/EVIDENCE_BINARY_ARCHIVE.md).

Manifest signature және trusted timestamp әлі жоқ.

## Phase 4 evolution

Trust & Evidence кезеңінде осы manifest baseline үстіне:

- [x] verified KZ/RU contract PDF bytes + renderer/template/source metadata bound into full ZIP v2;
- selected evidence binaries;
- manifest JSON;
- [x] deterministic bundle artifact index + bundle manifest hash;
- manifest signature;
- trusted timestamp;
- [x] bounded deterministic metadata/text ZIP container;
- [x] bounded selected evidence binary ZIP v2;
- [ ] large archive true streaming/ZIP64 if required;
- export audit;
- [x] application-level contract legal-hold foundation;
- [ ] jurisdiction retention periods + external storage lifecycle acceptance;
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

Evidence archives үшін detached Ed25519 seal versioned domain contract қолданады.

Signed canonical payload мыналарды байлайды:

- EvidencePackage ID;
- evidence manifest SHA-256;
- bundle manifest SHA-256;
- archive SHA-256;
- archive format;
- ZIP entry count;
- ZIP byte size.

Metadata ZIP v1:

- purpose: `QARYZLINK_EVIDENCE_ARCHIVE_SEAL_V1`;
- archive format: `ZIP_STORE_V1`;
- schemaVersion: 1.

Full binary ZIP v2:

- purpose: `QARYZLINK_EVIDENCE_ARCHIVE_SEAL_V2`;
- archive format: `ZIP_STORE_V2`;
- schemaVersion: 2.

Бұл domain separation v1 signature-ны v2 payload үшін replay етуге жол бермейді.

Production algorithm contract — `Ed25519`. Backend-та default-off HTTPS remote signer adapter бар:

1. canonical payload bytes және SHA-256 signer gateway-ге жіберіледі;
2. raw ZIP/evidence bytes signer-ге жіберілмейді;
3. redirects disabled және timeout bounded;
4. signer response 16 KiB-пен bounded;
5. response key нақты Ed25519 SPKI болуы тиіс;
6. SPKI SHA-256 fingerprint deployment-та pinned;
7. unexpected fingerprint fail-closed;
8. returned detached signature Backend ішінде canonical payload үстінен қайта verify болады.

Endpoints:

- `GET /api/v1/contracts/:contractId/evidence-package/seal-capability`;
- `POST /api/v1/contracts/:contractId/evidence-package/seal` — ZIP v1;
- `POST /api/v1/contracts/:contractId/evidence-package/seal-v2` — ZIP v2.

`EVIDENCE_SEALING_ENABLED=false` және `EVIDENCE_SEAL_PROVIDER=unavailable` default болып қалады.

Remote signer enabled болса release preflight automatic pass бермейді; нақты KMS/HSM gateway, key IAM, rotation/revocation және staging verification әлі manual acceptance gate.

Front Evidence panel:

- signer provider/algorithm capability көрсетеді;
- disabled provider кезінде signing action көрсетпейді;
- metadata ZIP v1 және full ZIP v2 seal action-дары бөлек;
- successful detached seal JSON ретінде жүктеледі;
- key ID, archive hash және key fingerprint көрсетіледі.

`trustedTimestamp` current seal response-та explicit `null`. App-generated timestamp trusted timestamp ретінде көрсетілмейді.

Толық operational boundary: [Remote Ed25519 signer](../06-operations/EVIDENCE_REMOTE_SIGNER.md).

## Cryptographic seal implementation evidence — 2026-09-28

QaryzLinkBack PR #186 merged at `c2d2a1e`: domain-separated Ed25519 seal payload, provider-neutral signer boundary, Backend signature verification, participant-scoped capability/seal endpoints, release-preflight gate және default-off unavailable provider.

QaryzLinkFront PR #57 merged at `aad8056`: Ed25519 seal capability UI, default-off provider status және future detached seal JSON download boundary.

Back CI run `36461356114` және Front CI run `36461359027` quality job құрды, бірақ runner step орындалмады. Сондықтан automated typecheck/lint/test/build verification pending; бұл run-дар application code-ты орындамаған.

2026-09-29 remote signer extension: QaryzLinkBack PR #189 (`ba3d1ea`) pinned HTTPS remote Ed25519 adapter және ZIP v2 domain seal қосты; QaryzLinkFront PR #59 (`e68d354`) Full ZIP v2 seal UI қосты. Runs `36516530077` және `36516534678` runner 0-step күйінде қалды.

Signing-key trust registry slice аяқталды: QaryzLinkBack PR #190 (`6d9090d`) configured signer identity-дің DB-де ACTIVE болуын, controlled rotation/revocation command-тарын, historical lifecycle lookup-ты және maintenance/ACTIVE-registry release-preflight fail boundary-ын қосты. QaryzLinkFront PR #60 (`2f454c3`) registry readiness пен activation metadata-ны UI/API contract-қа қосты. Runs `36520601061` және `36520607376` runner 0-step күйінде қалды. Бұл external KMS/HSM key ceremony/IAM acceptance-ті алмастырмайды.

External timestamp attestation slice аяқталды: QaryzLinkBack PR #191 (`427d70d`) canonical timestamp subject, nonce + generatedAt + serial + subjectHash Ed25519 authority verification және fail-closed required mode қосты; QaryzLinkFront PR #61 (`48c4032`) verified authority metadata-ны көрсетеді. Runs `36523556368` және `36523562198` runner 0-step күйінде қалды. Бұл RFC3161/qualified legal timestamp емес; толық boundary: [External evidence timestamp attestation](../06-operations/EVIDENCE_EXTERNAL_TIMESTAMP.md).


## Phase 4 evidence legal-hold foundation

Contract-level legal hold destructive evidence cleanup-ты тоқтату үшін қосылды. Hold enum-only reason, scoped support actor және immutable placement/release history сақтайды. Бір contract-та бір active hold ғана DB partial unique index арқылы рұқсат етіледі.

Active hold кезінде expired/unconsumed evidence upload cleanup query contract-ты таңдаудан алып тастайды, сондықтан object delete-ке дейін fail-safe protection бар.

Бұл full legal retention емес: consumed evidence retention period, account deletion interaction және external object-store lifecycle acceptance әлі ашық. Толық boundary: [Evidence legal hold](../06-operations/EVIDENCE_LEGAL_HOLD.md).


## Verified contract PDF binding in full ZIP v2 — 2026-09-29

`ZIP_STORE_V2` full evidence archive енді immutable pinned-template contract PDF artifact-терін evidence chain-ге қосады. KZ/RU PDF bytes қайта verified renderer boundary арқылы алынады; source document hash ClosureCertificate hash-пен қайта тексеріледі.

Archive-ке екі PDF және deterministic `contract/pdf-artifacts.json` кіреді. Metadata template identity, render-input hash, PDF hash/size және renderer attestation/signature identity-ін сақтайды. Осы файлдар `buildEvidenceBundleManifest` artifact hashes арқылы `bundleManifestHash`-ке, кейін ZIP bytes `archiveHash`-ке байланысады.

Бұл approved legal wording/visual acceptance-ті білдірмейді. Renderer/template approval, staging font/pagination review және Kazakhstan legal acceptance бөлек release gate болып қалады.
