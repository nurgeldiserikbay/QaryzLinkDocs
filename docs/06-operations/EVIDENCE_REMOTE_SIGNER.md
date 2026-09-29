# Remote Ed25519 evidence signer

QaryzLink evidence archive signature үшін private signing key application process ішінде сақталмайды.

Backend provider-neutral seal contract үстіне internal HTTPS remote signer adapter қолданады. Remote signer-дің артында нақты KMS/HSM немесе approved signing service орналасуы тиіс.

Бұл құжат adapter contract-ты сипаттайды. Нақты KMS/HSM account/key/IAM configuration deployment concern болып қалады.

## Feature gates

Default:

`EVIDENCE_SEALING_ENABLED=false`

`EVIDENCE_SEAL_PROVIDER=unavailable`

Remote provider:

`EVIDENCE_SEAL_PROVIDER=remote-ed25519`

Required when sealing enabled:

- `EVIDENCE_SEAL_REMOTE_URL`;
- `EVIDENCE_SEAL_REMOTE_TOKEN`;
- `EVIDENCE_SEAL_EXPECTED_KEY_ID`;
- `EVIDENCE_SEAL_EXPECTED_KEY_FINGERPRINT`.

Optional bounded timeout:

`EVIDENCE_SEAL_REMOTE_TIMEOUT_MS=3000`

Allowed range: 500–10000 ms.

Sealing тек staging/production environment-та enabled бола алады.

## Transport boundary

Signer URL:

- HTTPS болуы міндетті;
- URL ішінде username/password жоқ;
- query string жоқ;
- fragment жоқ;
- redirects қабылданбайды;
- bearer credential deployment secret store-да сақталады;
- request timeout bounded.

Backend signer-ге raw ZIP немесе funding/payment evidence bytes жібермейді.

Signer request тек canonical seal payload material жібереді:

~~~json
{
  "algorithm": "Ed25519",
  "payloadHash": "<64-lowercase-hex>",
  "payloadBase64": "<canonical-seal-payload>"
}
~~~

Canonical payload-та package/archive/evidence/bundle hashes, archive format, entry count және byte size бар.

## Signer response contract

~~~json
{
  "algorithm": "Ed25519",
  "keyId": "kms-key-2026-09",
  "publicKeySpkiBase64": "<Ed25519-SPKI-DER-base64>",
  "signatureBase64": "<64-byte-Ed25519-signature-base64>"
}
~~~

Response:

- 16 KiB hard application limit ішінде болуы тиіс;
- key ID opaque bounded identifier;
- public key Ed25519 SPKI болуы тиіс;
- signature canonical base64 және 64 byte болуы тиіс.

## Double verification

Remote signer result trusted-by-location деп саналмайды.

Backend:

1. response metadata/encoding-ті тексереді;
2. SPKI key type нақты Ed25519 екенін тексереді;
3. response key ID deployed `EVIDENCE_SEAL_EXPECTED_KEY_ID` мәнімен дәл сәйкес екенін тексереді;
4. SPKI DER SHA-256 fingerprint есептейді;
5. fingerprint deployed `EVIDENCE_SEAL_EXPECTED_KEY_FINGERPRINT` мәнімен дәл сәйкес болуы тиіс;
6. detached signature-ны canonical payload bytes үстінен локалды verify етеді;
7. mismatch болса seal бермейді.

Сондықтан compromised DNS/service немесе wrong key configuration pinned key-ден ауытқыса fail-closed болады.

## Versioned seal domains

Metadata archive:

- format: `ZIP_STORE_V1`;
- schemaVersion: 1;
- purpose: `QARYZLINK_EVIDENCE_ARCHIVE_SEAL_V1`.

Full binary archive:

- format: `ZIP_STORE_V2`;
- schemaVersion: 2;
- purpose: `QARYZLINK_EVIDENCE_ARCHIVE_SEAL_V2`.

v1 signature v2 payload үшін жарамсыз. Archive format canonical signed payload-тың ішінде бар.

Endpoints:

- `POST /api/v1/contracts/:contractId/evidence-package/seal` — v1;
- `POST /api/v1/contracts/:contractId/evidence-package/seal-v2` — v2.

Capability:

`GET /api/v1/contracts/:contractId/evidence-package/seal-capability`

Capability provider, algorithm, supported archive formats және trusted timestamp state-ін қайтарады.

## ZIP v2 interaction

v2 seal жаңа full ZIP-ті deterministic түрде `build()` жасайды, бірақ ordinary ZIP export audit event-ін жасамайды.

Содан кейін archive hash v2-specific canonical seal payload-қа кіреді.

Seal successful болса:

`EVIDENCE_BINARY_ARCHIVE_SEALED`

audit event жазылады.

Audit-ке:

- package ID;
- payload hash;
- archive hash;
- archive format;
- opaque key ID;
- public-key fingerprint;
- signature hash;
- algorithm;
- provider kind

ғана кіреді.

Raw signature/public key, remote token, signer URL, ZIP bytes және evidence content audit-ке жазылмайды.

## Key rotation

Current runtime бір approved active fingerprint pin жасайды.

Rotation controlled deployment ретінде орындалады:

1. жаңа KMS/HSM key provision;
2. public SPKI және fingerprint independently derive/verify;
3. staging signer жаңа key арқылы test payload қол қояды;
4. Backend local verification өтеді;
5. deployment secret/config expected fingerprint жаңа мәнге ауысады;
6. key ID/fingerprint acceptance evidence сақталады;
7. бұрынғы key disable/revoke timing legal retention талабымен бекітіледі.

Historical seal JSON өз public key және fingerprint-ын сақтайды, бірақ trusted historical key registry/revocation record бөлек operational requirement.

## Staging acceptance

Enable алдында кемінде:

1. signer URL TLS/ingress/private routing тексеріледі;
2. wrong bearer token rejected;
3. timeout fail-closed;
4. redirect fail-closed;
5. oversized signer response rejected;
6. malformed JSON rejected;
7. non-Ed25519 key rejected;
8. unexpected key ID rejected;
9. unexpected key fingerprint rejected;
10. valid but wrong-payload signature Backend verification-нан өтпейді;
11. v1 archive signature verify болады;
12. v2 archive signature verify болады;
13. v1 signature v2 payload-қа replay болмайды;
14. signer outage seal endpoint-ті 503/fail-closed күйге әкеледі;
15. audit secret/raw signature/archive bytes сақтамайды;
16. key rotation drill орындалады.

## Remaining production gates

Adapter implementation нақты KMS/HSM production acceptance-ті автоматты түрде жаппайды.

Әлі қажет:

- нақты KMS/HSM-backed signer deployment;
- least-privilege signer IAM;
- key creation/rotation/revocation owner;
- old-key trust registry;
- key compromise runbook;
- staging load/latency/error acceptance;
- trusted timestamp;
- jurisdiction/legal approval.
