# Contract PDF renderer boundary

QaryzLink contract PDF-ті Backend ішінде ad-hoc мәтіннен генерацияламайды.

Phase 4 foundation immutable contract version-ды алдын ала бекітілген KZ/RU template identity-мен байланыстырады және PDF artifact-ті бөлек remote renderer арқылы алуға мүмкіндік береді.

Бұл architecture legal template мәтінін ChatGPT/Backend ойдан шығармайтынын және template кейін өзгергенде бұрынғы contract жаңа template-ке үнсіз көшпейтінін қамтамасыз етеді.

## Legal boundary

Implementation мыналарды **жасайды**:

- contract draft кезінде KZ/RU template ID + SHA-256 hash snapshot сақтайды;
- participant contract source сол immutable pins-ті көрсетеді;
- PDF render input source document + locale + дәл сол template pin арқылы hash болады;
- remote renderer нәтижесі signed artifact attestation-пен қайтады;
- Backend PDF bytes/hash/size/template/source/render-input binding-ті қайта verify етеді;
- renderer Ed25519 public key fingerprint deployment config арқылы pin болады;
- verified artifact export audit жасайды.

Implementation мыналарды **өзі шешпейді**:

- KZ/RU final legal wording;
- заңгер approval;
- Қазақстандағы электрондық құжат/қолтаңба legal effect;
- qualified signature/time-stamp classification;
- font/pagination visual approval;
- external renderer SLA/operations acceptance.

Сондықтан config-ке template ID/hash енгізу тек controlled deployment approval process аяқталғаннан кейін жасалады.

## Immutable template snapshot

`ContractVersion` ішінде nullable fields:

- `pdfTemplateKkId`;
- `pdfTemplateKkHash`;
- `pdfTemplateRuId`;
- `pdfTemplateRuHash`.

Pair invariants DB CHECK арқылы қорғалады.

`CONTRACT_PDF_ENABLED=true` күйінде жаңа contract draft жасалғанда configured төрт мән version-ға snapshot ретінде жазылады.

Feature disabled кезінде жаңа version-да pins null болып қалады.

PDF feature enabled болса дәл осы KZ/RU template identity canonical signed `documentHash` input-ына да кіреді. Сондықтан party platform acknowledgement тек financial/source terms-ті емес, render template identity-ді де бекітеді. ClosureCertificate кейін сол `contractDocumentHash` арқылы осы binding-ті evidence chain-ға алып өтеді.

Ескі contract-тарға кейіннен template автоматты backfill жасалмайды.

Бұл маңызды: signed contract identity deployment config өзгергеннен кейін қайта интерпретацияланбауы тиіс.

## Participant endpoints

Capability:

`GET /api/v1/contracts/:contractId/document-pdf-capability`

Response:

- enabled;
- provider;
- templatePinned;
- contract-specific KZ/RU template ID/hash;
- max PDF bytes.

Explicit artifact generation:

`POST /api/v1/contracts/:contractId/document-pdf/:locale`

Locale:

- `kk`;
- `ru`.

Екі endpoint те authenticated participant boundary ішінде.

## Render input

Backend canonical render input құрады:

- schemaVersion;
- purpose;
- locale;
- selected immutable template ID/hash;
- immutable contract document:
  - version;
  - currency;
  - principalMinor;
  - documentHash;
  - termsSnapshot;
  - calculationPolicy.

Purpose:

`QARYZLINK_CONTRACT_PDF_RENDER_INPUT_V1`

Canonical JSON SHA-256 → `renderInputHash`.

Technical TXT preview hash semantics өзгермейді: `pdfTemplates` metadata technical preview render input-қа кірмейді.

## Remote renderer request

Backend remote renderer-ге identity/contact PII жібермейді.

Request тек:

- schemaVersion;
- locale;
- selected template pin;
- sourceDocumentHash;
- renderInputHash;
- immutable document source.

Transport:

- HTTPS only;
- URL ішінде credentials/query/fragment жоқ;
- redirects rejected;
- bearer token server-side secret;
- timeout bounded.

## Remote renderer response

Renderer қайтарады:

- schemaVersion = 1;
- purpose = `QARYZLINK_CONTRACT_PDF_ARTIFACT_V1`;
- algorithm = Ed25519;
- rendererId;
- locale;
- templateId/templateHash;
- sourceDocumentHash;
- renderInputHash;
- pdfHash;
- sizeBytes;
- PDF base64;
- renderer public SPKI;
- detached signature.

Renderer signature canonical artifact metadata-ны қорғайды:

- renderer ID;
- locale;
- template ID/hash;
- source document hash;
- render input hash;
- PDF hash;
- PDF size.

## Backend verification

Backend independently:

1. renderer ID exact pin-ге тең екенін;
2. locale requested locale екенін;
3. template ID/hash contract snapshot-пен дәл сәйкес екенін;
4. sourceDocumentHash immutable contract documentHash-пен дәл сәйкес екенін;
5. renderInputHash Backend есептеген hash-пен дәл сәйкес екенін;
6. PDF base64 canonical екенін;
7. PDF size bounded екенін;
8. bytes `%PDF-` header-мен басталатынын;
9. соңғы 1 KiB ішінде `%%EOF` барын;
10. PDF SHA-256 renderer жариялаған hash-пен тең екенін;
11. renderer public key Ed25519 екенін;
12. SPKI SHA-256 configured fingerprint-ке тең екенін;
13. detached signature canonical artifact metadata үстінен valid екенін

тексереді.

Provider adapter бұл checks-ті орындайды, service layer template/source/render-input binding-ті қайта тексереді.

## Feature configuration

Default:

`CONTRACT_PDF_ENABLED=false`

`CONTRACT_PDF_PROVIDER=unavailable`

Remote provider:

`CONTRACT_PDF_PROVIDER=remote-signed`

Enabled кезде міндетті:

- `CONTRACT_PDF_REMOTE_URL`;
- `CONTRACT_PDF_REMOTE_TOKEN`;
- `CONTRACT_PDF_EXPECTED_RENDERER_ID`;
- `CONTRACT_PDF_EXPECTED_RENDERER_KEY_FINGERPRINT`;
- `CONTRACT_PDF_KK_TEMPLATE_ID`;
- `CONTRACT_PDF_KK_TEMPLATE_HASH`;
- `CONTRACT_PDF_RU_TEMPLATE_ID`;
- `CONTRACT_PDF_RU_TEMPLATE_HASH`.

Bounds:

- `CONTRACT_PDF_REMOTE_TIMEOUT_MS=3000`, 500–10000 ms;
- `CONTRACT_PDF_MAX_BYTES=2097152`, 64 KiB–10 MiB.

Rendering only staging/production environment-та enabled бола алады.

## Production PDF governance references

Production-та `CONTRACT_PDF_ENABLED=true` болу үшін renderer/template pins жеткіліксіз. Deployment төрт versioned non-secret reference береді:

- `CONTRACT_PDF_TEMPLATE_APPROVAL_ID` — KZ/RU approved template artifact set/version;
- `CONTRACT_PDF_LEGAL_SIGNOFF_ID` — Kazakhstan legal wording/sign-off record version;
- `CONTRACT_PDF_VISUAL_ACCEPTANCE_ID` — KZ/RU pagination/line-break/layout visual acceptance version;
- `CONTRACT_PDF_FONT_EMBEDDING_POLICY_ID` — approved deterministic font/embedding policy version.

Бұл ID-лер legal text, font file немесе approval content емес. Олар reviewed external artifacts-қа opaque provenance reference қана.

Behavior:
- staging-та refs жоқ PDF config parse бола алады, бірақ `release:preflight` `contract_pdf_governance=fail` береді;
- production-та PDF enabled және төрт reference-тің бірі жоқ болса config fail-fast;
- refs толық болса preflight `manual` күйінде қалады;
- configured template ID/hash өзі legal/visual approval деп саналмайды.

## Response and audit

Participant response:

- filename;
- mediaType = application/pdf;
- artifactStatus = PINNED_TEMPLATE_SNAPSHOT;
- renderer/template/source/render hashes;
- renderer key fingerprint;
- attestation hash;
- public verification material;
- bounded PDF `contentBase64`.

Raw private keys/token/renderer URL response-қа кірмейді.

Successful export:

`CONTRACT_PDF_EXPORTED`

Audit payload:

- locale;
- template ID/hash;
- source document hash;
- render input hash;
- PDF hash;
- size;
- renderer ID;
- renderer key fingerprint;
- attestation hash.

PDF bytes және bearer token audit-ке кірмейді.

## Release preflight

Feature off:

`contract_pdf_off`.

Feature enabled + remote-signed provider:

`approved_template_renderer_acceptance_required` → manual.

Feature enabled + provider unavailable:

`contract_pdf_provider_unavailable` → fail.

Environment startup validation толық template/renderer pins жоқ болса fail етеді.

## Versioned template acceptance record

Actual KZ/RU artifacts and governance sign-off are recorded in [KZ/RU contract template acceptance record](CONTRACT_TEMPLATE_ACCEPTANCE.md). It binds exact template IDs/hashes, legal wording review, font/embedding policy, visual/pagination evidence, renderer identity/key and evidence-chain verification.

The record must remain `PENDING` until independent review is complete; configuring template hashes alone is not approval.

## Staging acceptance

Enable алдында кемінде:

1. legal owner approved KZ template ID/hash-ті жазбаша бекітеді;
2. legal owner approved RU template ID/hash-ті жазбаша бекітеді;
3. template files independently SHA-256 есептеледі;
4. configured hashes сол artifacts-пен дәл сәйкес;
5. renderer TLS/private routing verified;
6. wrong token rejected;
7. redirect rejected;
8. timeout fail-closed;
9. oversized response rejected;
10. wrong renderer ID rejected;
11. wrong renderer key rejected;
12. wrong locale/template/source/renderInput rejected;
13. malformed/non-PDF bytes rejected;
14. PDF hash mismatch rejected;
15. detached renderer signature independently verify болады;
16. KZ/RU PDF visual/pagination/font acceptance орындалады;
17. same input + same pinned template deterministic PDF hash береді;
18. legacy contract templatePinned=false күйінде fail-closed қалады;
19. log/audit-та PDF bytes/token/PII жоқ.

## Remaining PDF work

Foundation-нан кейін ашық:

- [x] production config/preflight requires versioned template-approval/legal-signoff/visual/font-policy references;
- нақты approved KZ/RU legal template content;
- renderer deployment/SLA;
- KZ/RU visual regression fixtures/acceptance;
- approved fonts and deterministic embedding policy acceptance;
- [x] final verified KZ/RU PDF bytes + metadata ZIP v2 bundle hash chain-ге immutable binding;
- [x] archive build кезінде ClosureCertificate source hash + verified PDF hash/source/template binding;
- signed-document semantics бойынша Kazakhstan legal review.


## Implementation evidence — 2026-09-29

QaryzLinkBack PR #192 merged at `6218e73`: immutable KZ/RU template pins in ContractVersion, template identity in new contract documentHash, participant PDF capability/render endpoints, deterministic render-input hash, remote signed renderer verification және privacy-safe export audit.

QaryzLinkFront PR #62 merged at `e9dcd26`: pinned-template PDF capability UI, explicit legacy-contract state, verified PDF download және PDF/render-input/attestation hash display.

Back CI run `36542155035` және Front CI run `36536087948` quality job құрды, бірақ runner step орындалмады. Сондықтан automated Prisma/typecheck/lint/test/build verification pending; application code бұл run-дарда орындалмаған.
