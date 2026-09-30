# External evidence timestamp attestation

QaryzLink evidence seal үшін application-generated timestamp trusted timestamp ретінде саналмайды.

Осы foundation бөлек external timestamp authority арқылы seal subject hash-ін signed time attestation-ға байлайды.

Бұл protocol **RFC3161 емес** және өздігінен eIDAS/QES/QTSA немесе Қазақстан құқығындағы qualified/legal timestamp мәртебесін білдірмейді. Ол provider-neutral application boundary және staging integration foundation.

## Purpose

Evidence seal cryptographically archive state-ті бекітеді, бірақ signer өзі уақыттың тәуелсіз көзі емес.

External timestamp authority мына фактіні signed түрде растайды:

> белгілі evidence seal subject hash authority көрсеткен уақытта timestamp request ретінде қабылданды.

## Timestamp subject

Backend timestamp authority-ге raw ZIP, document немесе evidence bytes жібермейді.

Алдымен canonical subject құрады:

- EvidencePackage ID;
- seal payload SHA-256;
- archive SHA-256;
- archive format;
- evidence signer key fingerprint;
- evidence seal signature SHA-256.

Purpose:

`QARYZLINK_EVIDENCE_TIMESTAMP_SUBJECT_V1`

Осы canonical JSON-ның SHA-256 мәні `subjectHash`.

## Authority request

Request:

~~~json
{
  "standard": "QARYZLINK_EXTERNAL_ATTESTATION_V1",
  "subjectHash": "<64-lowercase-hex>",
  "nonce": "<32-lowercase-hex>"
}
~~~

Nonce әр request үшін cryptographically random 16 bytes.

Бұл replay/substitution қорғанысын береді.

## Authority response

~~~json
{
  "standard": "QARYZLINK_EXTERNAL_ATTESTATION_V1",
  "algorithm": "Ed25519",
  "authorityId": "tsa-1",
  "generatedAt": "2026-09-29T04:30:00.000Z",
  "serialNumber": "serial-1",
  "nonce": "<same-request-nonce>",
  "publicKeySpkiBase64": "<Ed25519-SPKI-DER-base64>",
  "signatureBase64": "<64-byte-signature-base64>"
}
~~~

Authority signature canonical payload-ты қорғайды:

- schemaVersion;
- standard;
- authorityId;
- generatedAt;
- serialNumber;
- nonce;
- subjectHash.

## Backend verification

Backend response-ты trusted-by-location деп қабылдамайды.

Verification sequence:

1. response size 24 KiB limit ішінде;
2. standard exact match;
3. authority ID exact configured pin-ге тең;
4. nonce request nonce-ке дәл тең;
5. generatedAt canonical ISO-8601 UTC;
6. generatedAt configured bounded clock-skew терезесінде;
7. key нақты Ed25519 SPKI;
8. SPKI SHA-256 fingerprint configured pin-ге дәл тең;
9. detached signature canonical attestation payload үстінен local verify;
10. mismatch болса timestamp қабылданбайды.

HTTP:

- HTTPS-only;
- credentials/query/fragment URL-да болмайды;
- redirects disabled;
- bearer token deployment secret;
- timeout bounded.

## Feature gates

Default:

`EVIDENCE_TIMESTAMP_ENABLED=false`

`EVIDENCE_TIMESTAMP_PROVIDER=unavailable`

Remote adapter:

`EVIDENCE_TIMESTAMP_PROVIDER=remote-ed25519-attestation`

Required when enabled:

- `EVIDENCE_SEALING_ENABLED=true`;
- `EVIDENCE_TIMESTAMP_REMOTE_URL`;
- `EVIDENCE_TIMESTAMP_REMOTE_TOKEN`;
- `EVIDENCE_TIMESTAMP_EXPECTED_AUTHORITY_ID`;
- `EVIDENCE_TIMESTAMP_EXPECTED_KEY_FINGERPRINT`.

Bounds:

- `EVIDENCE_TIMESTAMP_REMOTE_TIMEOUT_MS=3000`;
- range 500–10000 ms;
- `EVIDENCE_TIMESTAMP_MAX_CLOCK_SKEW_SECONDS=300`;
- range 30–3600 seconds.

Timestamping тек staging/production environment-та enabled болады.

## Production timestamp governance references

Production timestamping үшін current authority URL/key pin жеткіліксіз. Deployment төрт versioned non-secret reference береді:

- `EVIDENCE_TIMESTAMP_STANDARD_PROFILE_ID` — approved timestamp protocol/standards profile reference;
- `EVIDENCE_TIMESTAMP_TRUST_POLICY_ID` — authority trust/certificate-path policy reference;
- `EVIDENCE_TIMESTAMP_REVOCATION_POLICY_ID` — revocation/OCSP/CRL/long-term validation policy reference;
- `EVIDENCE_TIMESTAMP_LEGAL_CLASSIFICATION_ID` — Kazakhstan legal review/classification record reference.

Бұл ID-лер current `remote-ed25519-attestation` adapter-ді RFC3161 немесе qualified timestamp-қа айналдырмайды. `STANDARD_PROFILE_ID` тек approved artifact-ке сілтеме; actual protocol/provider implementation бөлек gate.

Behavior:
- staging-та references-терсіз timestamp config parse бола алады, бірақ `release:preflight` `evidence_timestamp_governance=fail` береді;
- production-та timestamp enabled және төрт reference-тің бірі жоқ болса config fail-fast;
- references толық болса да preflight `manual` күйін сақтайды;
- RFC3161/QTSA мәртебесі тек standards-based adapter + provider/certificate/legal acceptance аяқталғаннан кейін ғана бекітіледі.

## Fail-closed semantics

Timestamp feature disabled:

- seal бұрынғыдай жасалады;
- `trustedTimestamp=null`.

Timestamp feature enabled:

- timestamp provider capability міндетті;
- authority response verify болуы міндетті;
- authority failure/timeout/mismatch кезінде seal response берілмейді;
- seal audit event жазылмайды;
- API 503 fail-closed күйіне өтеді.

Бұл timestamp талап етілген deployment-та unsigned-by-time seal кездейсоқ шығарылмауы үшін.

## Seal response

Verified timestamp response ішінде:

- standard;
- provider;
- subject hash;
- canonical attestation payload;
- attestation hash;
- authority ID;
- generatedAt;
- serial number;
- nonce;
- authority key fingerprint;
- authority public key;
- detached signature;
- signature hash

сақталады.

Бұл self-contained verification material береді.

## Audit boundary

Seal audit event timestamp enabled кезде:

- timestamp subject hash;
- provider kind;
- authority ID;
- authority generatedAt;
- attestation hash

сақтайды.

Audit event-ке:

- bearer token;
- authority URL;
- raw evidence bytes;
- archive bytes;
- private key

кірмейді.

## Release preflight

Timestamp disabled:

`evidence_timestamp_off`

Timestamp enabled, sealing disabled:

`timestamp_requires_evidence_sealing` → fail.

Timestamp enabled, provider unavailable:

`timestamp_provider_adapter_unavailable` → fail.

Remote authority configured:

`external_timestamp_authority_acceptance_required` → manual.

Сондықтан adapter бар болуы production trust автоматты түрде accepted дегенді білдірмейді.

## Staging acceptance

Кемінде:

1. TLS/private routing;
2. wrong bearer token rejected;
3. redirects rejected;
4. timeout fail-closed;
5. oversized response rejected;
6. malformed response rejected;
7. wrong authority ID rejected;
8. wrong key fingerprint rejected;
9. non-Ed25519 key rejected;
10. nonce mismatch rejected;
11. stale/future time outside skew rejected;
12. signature over changed timestamp payload rejected;
13. authority outage seal-ды fail-closed тоқтатады;
14. v1 metadata ZIP seal timestamp алады;
15. v2 full ZIP seal timestamp алады;
16. timestamp-disabled deployment бұрынғы seal behavior-ды сақтайды.

Before any RFC3161/qualified/legal timestamp claim, complete [Timestamp authority acceptance record](TIMESTAMP_AUTHORITY_ACCEPTANCE.md).

## Remaining legal/production gates

Бұл foundation төмендегілерді жаппайды:

- [x] production config/preflight requires versioned standards/trust/revocation/legal-classification references;
- RFC3161 protocol integration;
- nationally/eIDAS recognized TSA/QTSA selection;
- authority certificate/path/revocation policy provider-side acceptance;
- qualified timestamp legal effect;
- timestamp token long-term validation;
- Kazakhstan legal opinion;
- authority SLA/load/incident acceptance;
- independent NTP/time-source operations review.

Егер legal review нақты RFC3161 немесе qualified timestamp талап етсе, осы provider contract жаңа standards-based adapter-мен ауыстырылады/кеңейтіледі.


## Implementation evidence — 2026-09-29

QaryzLinkBack PR #191 merged at `427d70d`: deterministic timestamp subject, HTTPS remote Ed25519 authority adapter, nonce/clock-skew checks, pinned authority ID/SPKI fingerprint, local signature verification, fail-closed required mode және seal/audit integration.

QaryzLinkFront PR #61 merged at `48c4032`: timestamp capability contract, verified authority metadata, authority time/attestation hash UI және explicit RFC3161/qualified-timestamp disclaimer.

Back CI run `36523556368` және Front CI run `36523562198` quality job құрды, бірақ runner step орындалмады. Сондықтан automated typecheck/lint/test/build verification pending; application code бұл run-дарда орындалмаған.
