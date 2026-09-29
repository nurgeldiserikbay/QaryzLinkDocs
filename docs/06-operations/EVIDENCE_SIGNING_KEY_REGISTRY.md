# Evidence signing key trust registry

QaryzLink remote Ed25519 signer үшін deployment config pinning жалғыз trust source емес.

Application-side trust registry signing key lifecycle-ді PostgreSQL-де сақтайды және seal жасау үшін **екі шартты** міндетті етеді:

1. runtime config күтілетін key ID + SPKI fingerprint-ті pin етеді;
2. дәл сол identity DB registry-де `ACTIVE` болуы тиіс.

Осы екі source сәйкес келмесе cryptographic seal capability `enabled=false` болады.

## Data model

`evidence_signing_keys`:

- opaque `keyId`;
- Ed25519 SPKI SHA-256 `keyFingerprint`;
- status: `ACTIVE | RETIRED | REVOKED`;
- `activatedAt`;
- optional `retiredAt`;
- optional `revokedAt`;
- created/updated timestamps.

Invariants:

- key ID unique;
- fingerprint unique;
- бір уақытта тек бір `ACTIVE` key;
- `RETIRED` key-де retirement timestamp бар;
- `REVOKED` key-де revocation timestamp бар;
- retired/revoked key автоматты түрде қайта активтенбейді.

## Runtime sealing boundary

Remote signer өзі pinned key ID/fingerprint-ке тексеріледі.

Одан кейін Backend дәл сол identity-ді DB registry-де `ACTIVE` деп қайта тексереді.

Sequence:

1. seal capability provider/config state-ті тексереді;
2. configured identity registry-де ACTIVE екені тексеріледі;
3. deterministic ZIP жасалады;
4. remote signer detached signature қайтарады;
5. signature cryptographically local verify болады;
6. returned key identity registry-де қайта ACTIVE екені тексеріледі;
7. содан кейін ғана audit + seal response беріледі.

5–6 аралығында key revoke/rotate болса операция fail-closed тоқтайды.

Seal response registry snapshot ретінде:

- `status=ACTIVE`;
- `activatedAt`

қайтарады.

## Historical lifecycle lookup

Authenticated contract participant seal ішіндегі key ID үшін lifecycle status оқи алады:

`GET /api/v1/contracts/:contractId/evidence-package/seal-keys/:keyId`

Response:

- key ID;
- fingerprint;
- current status;
- activatedAt;
- retiredAt;
- revokedAt.

Бұл endpoint raw private key, signer credential немесе secret metadata қайтармайды.

Participant scope алдымен contract access арқылы тексеріледі.

Historical `RETIRED` key — rotation болғанын білдіреді; ол өздігінен бұрынғы signature жарамсыз дегенді білдірмейді.

`REVOKED` key security incident/explicit distrust state ретінде қаралады. Оның нақты legal effect-і incident reason және jurisdiction policy-ге байланысты бөлек анықталуы тиіс.

## Controlled maintenance gate

Default:

`EVIDENCE_SIGNING_KEY_MAINTENANCE_ENABLED=false`

Maintenance тек staging/production environment-та true бола алады.

Бұл flag normal API deployment үшін тұрақты config емес. Ол controlled one-shot command үшін ғана уақытша беріледі.

Release preflight flag true болып қалса:

`signing_key_maintenance_must_be_disabled`

арқылы fail етеді.

Sealing enabled болса preflight configured key identity-ді DB registry-ден оқиды. Дәл сол key ACTIVE болмаса:

`active_signing_key_not_registered`

арқылы fail етеді. Registry ready болғанда check `active_signing_key_registered` болады.

## Accept / rotate configured key

Command:

`pnpm evidence:signing-key:accept`

Prerequisites:

- `EVIDENCE_SIGNING_KEY_MAINTENANCE_ENABLED=true`;
- `EVIDENCE_SEAL_PROVIDER=remote-ed25519`;
- configured expected key ID;
- configured expected fingerprint.

Transaction:

1. PostgreSQL advisory transaction lock алады;
2. database `clock_timestamp()` алады;
3. same ACTIVE key болса idempotent no-op;
4. same key ID басқа fingerprint-ке байланған болса reject;
5. retired/revoked key қайта activation сұралса reject;
6. same fingerprint басқа key ID-де болса reject;
7. existing ACTIVE key болса `RETIRED`;
8. жаңа key `ACTIVE` болып жазылады;
9. audit event жасалады.

Audit:

`EVIDENCE_SIGNING_KEY_ACTIVATED`

Payload public cryptographic identity ғана сақтайды:

- new key ID;
- new fingerprint;
- previous key ID;
- controlled-command source.

Bearer token/private key/signer URL audit-ке кірмейді.

## Revoke

Command:

`pnpm evidence:signing-key:revoke -- <key-id>`

Maintenance gate міндетті.

Active key revoke болса:

- status → `REVOKED`;
- current seal capability false болады;
- жаңа seal берілмейді;
- кейін жаңа configured key бөлек accepted болуы тиіс.

Already-revoked key үшін command idempotent.

Audit:

`EVIDENCE_SIGNING_KEY_REVOKED`

## Rotation runbook

1. KMS/HSM-де жаңа Ed25519 key жасаңыз.
2. Public SPKI мен fingerprint-ті independent құралмен тексеріңіз.
3. Staging signer жаңа key identity қайтаратынын verify етіңіз.
4. App config expected key ID/fingerprint-ті жаңа мәнге дайындаңыз.
5. Maintenance gate-ті тек controlled job үшін true етіңіз.
6. `evidence:signing-key:accept` орындаңыз.
7. Output-та new ACTIVE + previous RETIRED identity-ді тексеріңіз.
8. Seal capability жаңа ACTIVE key ID-ді көрсететінін тексеріңіз.
9. v1 және v2 test seal жасап local verification өткізіңіз.
10. Maintenance gate-ті false қайтарыңыз.
11. Release preflight maintenance check pass екенін тексеріңіз.
12. Old KMS/HSM key disable timing retention/legal policy бойынша орындаңыз.

## Compromise runbook

1. Compromised key ID-ді анықтаңыз.
2. Maintenance gate-ті controlled job үшін true етіңіз.
3. `evidence:signing-key:revoke -- <key-id>` орындаңыз.
4. Seal capability disabled болғанын тексеріңіз.
5. KMS/HSM жағында key signing permission-ды тоқтатыңыз.
6. Incident scope: affected seal IDs/time window анықтаңыз.
7. New key provision + acceptance бөлек rotation sequence арқылы жасалады.
8. Maintenance gate қайта false.
9. Legal/security owner historical signatures treatment туралы шешім қабылдайды.

## Remaining production gates

Registry implementation application-side key lifecycle-ді күшейтеді, бірақ мыналарды автоматты жаппайды:

- actual KMS/HSM gateway deployment;
- cloud/provider IAM least privilege;
- independent key ceremony;
- external key disable/delete policy;
- incident ownership;
- historical seal re-verification workflow/report;
- trusted timestamp;
- Kazakhstan legal acceptance.
