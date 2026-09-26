# PII contact encryption key rotation

Жаңартылған күні: 2026-09-26.

Бұл runbook ADR-0026 бойынша user email/phone және active email-verification ciphertext үшін encryption key rotation процесін сипаттайды. Lookup HMAC key rotation бұл runbook scope-ына кірмейді, өйткені ол blind-index backfill талап етеді.

## 1. Негізгі қағида

Old encryption key ешқашан active key ауысқан сәтте жойылмайды. Keyring ішінде old key decrypt-only ретінде қалады, барлық old-key ciphertext жаңа active key-ге bounded re-encryption арқылы ауыстырылғаннан кейін ғана retirement қарастырылады.

## 2. Preconditions

- PII storage mode `dual` немесе `encrypted`;
- current database backup бар;
- жаңа 32-byte encryption key secret store ішінде жасалған;
- old және new key екеуі де `PII_ENCRYPTION_KEYRING_JSON` ішінде;
- `PII_ACTIVE_KEY_ID` жаңа key ID-ға ауыстырылған;
- `PII_LOOKUP_KEY_BASE64` өзгермейді;
- metrics endpoint ішкі ingress арқылы қолжетімді;
- deploy/config change owner review-дан өткен.

Key material repository, ticket, screenshot, chat немесе runbook ішіне жазылмайды.

## 3. Rotation sequence

1. Keyring-ке new key қосыңыз, old key-ді қалдырыңыз.
2. `PII_ACTIVE_KEY_ID`-ды new key ID-ға ауыстырыңыз.
3. API/worker-лерді жаңа config-пен restart/deploy етіңіз.
4. `/api/v1/metrics/pii-key-rotation` aggregate backlog-ты тексеріңіз.
5. Bounded command-ты қайталап іске қосыңыз:

~~~bash
pnpm pii:contacts:reencrypt
~~~

`PII_CONTACT_REENCRYPT_BATCH_SIZE` 1–500, engineering default 50.

6. Command `failed > 0` болса old key-ді retire етпеңіз.
7. Command-ты backlog нөлге түскенше қайталаңыз.
8. Admin operations card `remainingUsers=0` және `remainingVerifications=0` көрсеткенде ғана rotation data phase аяқталды деп есептеледі.

## 4. Command behavior

Command:

- user email ciphertext;
- user phone ciphertext;
- active, unconsumed және unexpired email-verification ciphertext

ішінен active key prefix-ке жатпайтын rows-ты ғана қайта шифрлайды.

Lookup hashes өзгермейді. Plaintext/contact values stdout немесе log-қа шықпайды. Output тек aggregate counters:

- `userRowsProcessed`;
- `verificationRowsProcessed`;
- `failed`;
- `remainingUsers`;
- `remainingVerifications`;
- `capturedAt`.

Partial failure кезінде affected row retryable болып қалады және command non-zero exit code қайтарады.

## 5. Old key retirement

Old key-ді keyring-нен алып тастау үшін барлығы орындалуы керек:

- re-encryption backlog `0/0`;
- latest app version old key-ге жаңа writes жасамайды;
- staging smoke login/profile/email notification/email verification paths өтеді;
- backup/restore rehearsal old key retention requirement-пен салыстырылған;
- old-key decrypt usage жоқ екені расталған;
- rollback window өткен.

Backup retention ішінде old-key ciphertext болуы мүмкін болса, old key-ді backup expiry өткенге дейін сақтау қажет. Әйтпесе restore жасалған backup decrypt болмай қалуы мүмкін.

## 6. Rollback

Rotation барысында issue болса:

- old key keyring ішінде болғандықтан previous ciphertext decryptable күйде қалады;
- `PII_ACTIVE_KEY_ID` уақытша previous key-ге қайтарылуы мүмкін;
- re-encrypted rows dual-key keyring арқылы оқыла береді;
- lookup key өзгермегендіктен login exact lookup behavior өзгермейді.

Old key keyring-нен алынғаннан кейін rollback әлдеқайда күрделі; сондықтан retirement — соңғы қадам.

## 7. Metrics and privacy

`GET /api/v1/metrics/pii-key-rotation` тек aggregate backlog береді. Key ID, email, phone, ciphertext, user ID немесе record ID response-қа кірмейді.

Plaintext compatibility mode-де metrics `enabled=false` қайтарады; бұл `0/0` backlog-ты retirement-ready деп қате түсінбеуге мүмкіндік береді.

## 8. Verification status

Backend PR #137 manual bounded re-encryption command-ты, PR #138 aggregate rotation metrics-ті, PR #139 explicit enabled/disabled state-ті қосты. Admin PR #25 read-only backlog card қосты.

GitHub Actions account free-quota/billing gate салдарынан осы өзгерістер automated CI арқылы әлі қайта тексерілген жоқ. Quota ашылғанда quality + compiled metrics smoke міндетті түрде орындалады.