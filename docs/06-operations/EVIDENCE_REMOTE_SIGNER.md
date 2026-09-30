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

## Production signer operations references

Production sealing enabled кезде deployment тек remote URL/key pin-мен шектелмейді. Application config төрт opaque versioned reference-ті міндетті етеді:

- `EVIDENCE_SIGNER_DEPLOYMENT_ID` — нақты KMS/HSM-backed signer deployment/configuration version;
- `EVIDENCE_SIGNER_IAM_POLICY_ID` — approved least-privilege IAM policy version;
- `EVIDENCE_SIGNER_KEY_CEREMONY_ID` — key creation/activation ceremony record version;
- `EVIDENCE_SIGNER_KEY_LIFECYCLE_POLICY_ID` — rotation/revocation/old-key disable-delete policy version.

Бұл мәндер secret, ARN, raw policy немесе private key емес. Олар approved external artifacts-қа opaque reference қана.

Behavior:
- staging-та sealing config references-терсіз parse бола алады, бірақ `release:preflight` `evidence_signer_operations=fail` береді;
- production-та sealing enabled және төрт reference-тің бірі жоқ болса environment validation fail-fast;
- төрт reference толық болса preflight `manual` күйін сақтайды, себебі Backend олардың IAM least privilege, ceremony independence немесе KMS/HSM deployment reality-сін өзі дәлелдей алмайды.

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

Current runtime expected key ID + fingerprint pin жасайды және дәл сол identity application trust registry-де ACTIVE болуын талап етеді.

Rotation controlled deployment ретінде орындалады:

1. жаңа KMS/HSM key provision;
2. public SPKI және fingerprint independently derive/verify;
3. staging signer жаңа key арқылы test payload қол қояды;
4. Backend local verification өтеді;
5. deployment secret/config expected key ID + fingerprint жаңа мәнге ауысады;
6. controlled `evidence:signing-key:accept` command жаңа identity-ді ACTIVE registry-ге қабылдайды және previous ACTIVE key-ді RETIRED етеді;
7. v1/v2 seal verification жаңа ACTIVE key арқылы өтеді;
8. maintenance gate қайта false болады;
9. бұрынғы provider-side key disable timing legal retention талабымен бекітіледі.

Historical seal JSON өз public key/fingerprint-ын сақтайды, ал application trust registry ACTIVE/RETIRED/REVOKED lifecycle history береді. Participant contract-scoped key-status endpoint арқылы current lifecycle state-ті тексере алады. Толық boundary: [Evidence signing key trust registry](EVIDENCE_SIGNING_KEY_REGISTRY.md).

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

Before closing these gates, complete [Evidence KMS/HSM signer acceptance record](EVIDENCE_SIGNER_ACCEPTANCE.md).

## Remaining production gates

Adapter implementation нақты KMS/HSM production acceptance-ті автоматты түрде жаппайды.

Әлі қажет:

- [x] production config/preflight requires versioned signer deployment/IAM/key-ceremony/key-lifecycle references;
- нақты KMS/HSM-backed signer deployment provider-side acceptance;
- least-privilege signer IAM policy review;
- independent key creation/rotation/revocation ceremony acceptance;
- provider-side old-key disable/delete acceptance;
- incident ownership and external KMS compromise drill;
- staging load/latency/error acceptance;
- RFC3161/qualified timestamp provider and legal acceptance; provider-neutral external signed time attestation foundation is documented separately in [External evidence timestamp attestation](EVIDENCE_EXTERNAL_TIMESTAMP.md);
- jurisdiction/legal approval.


## Implementation evidence — 2026-09-29

QaryzLinkBack PR #189 merged at `ba3d1ea`: ZIP v1/v2 domain-separated seal payloads, default-off HTTPS remote Ed25519 signer adapter, pinned key ID/SPKI fingerprint, bounded transport, local signature verification және participant-only `seal-v2` endpoint.

QaryzLinkFront PR #59 merged at `e68d354`: provider/archive-format capability, separate Full ZIP v2 seal action, key/archive hash/fingerprint UI және detached v2 seal JSON download.

Back CI run `36516530077` және Front CI run `36516534678` quality job құрды, бірақ runner step орындалмады. Сондықтан automated typecheck/lint/test/build verification pending; application code бұл run-дарда орындалмаған.
