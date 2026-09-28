# Full evidence binary archive v2

QaryzLink full evidence archive v2 — immutable evidence package-ке нақты funding/payment evidence bytes-ті bounded түрде қосатын participant-only export.

Бұл metadata ZIP v1-ді өзгертпейді. Existing v1 archive hash contract stable қалады.

## Feature gate

Default:

`EVIDENCE_BINARY_ARCHIVE_ENABLED=false`

Limits:

- `EVIDENCE_BINARY_ARCHIVE_MAX_BYTES=20971520` — ZIP payload үшін 20 MiB default;
- `EVIDENCE_BINARY_ARCHIVE_MAX_OBJECTS=8` — max binary evidence object count.

Hard schema cap:

- max bytes: 50 MiB;
- max objects: 32.

Binary archive enabled болу үшін `EVIDENCE_STORAGE_ENABLED=true` міндетті.

## Endpoint

Capability:

`GET /api/v1/contracts/:contractId/evidence-package/binary-archive-capability`

Export:

`POST /api/v1/contracts/:contractId/evidence-package/archive-with-binaries`

Export JSON/Base64 емес, direct `application/zip` body қайтарады.

Front capability enabled кезде ғана action көрсетеді. Browser ZIP bytes үшін SHA-256 есептеп, local verification hash көрсетеді.

## Frozen-manifest selection

v2 archive current DB-дегі барлық evidence-ті автоматты түрде қоспайды.

Binary inclusion тек immutable EvidencePackage manifest ішінде frozen болған evidence references бойынша жасалады:

- evidence ID;
- purpose: FUNDING/PAYMENT;
- SHA-256;
- media type.

Current persisted row дәл сол ID/purpose/hash/mediaType-ке сәйкес болуы тиіс.

Manifest жасалғаннан кейін DB-де пайда болған evidence object archive-ке кірмейді.

Mismatch немесе missing row болса export fail-closed `EVIDENCE_PACKAGE_INTEGRITY_FAILED`.

## Consumed upload-intent binding

Frozen evidence row-дан кейін Backend matching consumed upload intent-ті қайта тексереді:

- contract ID;
- object key;
- purpose;
- SHA-256;
- media type;
- expected size;
- `consumedAt != null`.

Intent mismatch болса bytes storage-дан оқылмайды.

## Malware gate

Әр binary object үшін latest trusted malware verdict қайта оқылады.

Тек:

`CLEAN`

status archive inclusion-ға рұқсат береді.

`PENDING`, `INFECTED`, `FAILED` немесе verdict жоқ болса export fail-closed.

Scanner/verdict infrastructure unavailable болса storage/service unavailable ретінде тоқтайды.

## Storage read integrity

S3-compatible reader:

1. participant contract/purpose scope-қа object key сәйкес екенін тексереді;
2. short-lived signed GET жасайды;
3. redirect-ті қабылдамайды;
4. response bytes-ті chunk-by-chunk оқиды;
5. expected size-тан асса stream-ді тоқтатады;
6. final size exact match болуын тексереді;
7. media type exact normalized match болуын тексереді;
8. downloaded bytes SHA-256 persisted hash-пен дәл сәйкес болуын тексереді.

Осы тексерулердің кез келгені өтпесе binary ZIP жасалмайды.

## Archive layout

ZIP v2 deterministic STORE format қолданады.

ZIP v2 басында deterministic self-description artifact бар:

- `archive-profile.json` → `{"format":"ZIP_STORE_V2","schemaVersion":2}`.

Metadata/text artifacts v1-дегідей қалады:

- canonical evidence manifest;
- KZ technical contract preview;
- RU technical contract preview.

Қосымша binary paths:

- `evidence/funding/{evidenceId}.pdf|jpg|png`;
- `evidence/payment/{evidenceId}.pdf|jpg|png`.

Final `bundle-manifest.json` барлық metadata және binary artifact үшін:

- stable path;
- media type;
- exact byte size;
- SHA-256

бекітеді.

ZIP lexical order, fixed DOS timestamp және CRC32 compatibility сақтайды.

## Memory/streaming boundary

Object storage-дан оқу chunk-by-chunk және expected-size bounded.

Current v2 ZIP writer deterministic central directory/hash есептеу үшін total configured payload cap ішінде archive bytes-ті memory-де assemble етеді.

Сондықтан бұл unrestricted large-file streaming емес. Production load acceptance max configured 20 MiB/8 object profile-да memory/latency concurrency-ді өлшеуі тиіс.

Үлкен archive/ZIP64 немесе true end-to-end streaming бөлек future slice болады.

## Audit

Successful export:

`EVIDENCE_BINARY_ARCHIVE_EXPORTED`

Audit payload тек:

- package ID;
- evidence manifest hash;
- bundle manifest hash;
- archive hash;
- binary count;
- entry count;
- size;
- `ZIP_STORE_V2`

сақтайды.

Raw object key, signed URL, file bytes, user contacts немесе document content audit-ке кірмейді.

## Signing boundary

Current Ed25519 seal foundation `ZIP_STORE_V1` metadata archive-ке арналған.

ZIP v2 автоматты түрде signed деп саналмайды.

KMS/HSM signing implementation кейін seal payload version/format contract-ты explicit v2 support-пен кеңейтіп, archive v2 hash-ін бөлек sign етуі тиіс.

Trusted timestamp әлі жоқ.

## Staging acceptance

Enable алдында кемінде:

1. frozen CLEAN funding PDF archive-ке кіреді;
2. frozen CLEAN payment JPEG/PNG archive-ке кіреді;
3. manifest-те жоқ кейінгі evidence кірмейді;
4. DB hash/mediaType mismatch fail-closed;
5. consumed intent жоқ/size mismatch fail-closed;
6. PENDING/INFECTED/FAILED verdict fail-closed;
7. storage byte tampering SHA-256 mismatch арқылы fail-closed;
8. object size overflow stream кезінде тоқтайды;
9. total payload/object count limits enforce болады;
10. outsider contract export 404/authorization boundary-дан өтпейді;
11. direct response `application/zip`;
12. browser SHA-256 бірдей ZIP bytes үшін stable;
13. concurrent exports configured memory/latency budget ішінде;
14. audit raw evidence bytes/object keys сақтамайды.

## Remaining gates

Бұл court-ready package дегенді білдірмейді.

Әлі ашық:

- approved KZ/RU legal PDF;
- KMS/HSM signer for ZIP v2;
- trusted timestamp;
- Kazakhstan retention periods;
- bucket lifecycle/legal-hold staging acceptance;
- load/SLO acceptance;
- large archive true streaming/ZIP64 қажет болса бөлек design.
