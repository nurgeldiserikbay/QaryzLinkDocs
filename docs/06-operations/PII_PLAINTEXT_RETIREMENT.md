# PII plaintext retirement

Жаңартылған күні: 2026-09-26.

Бұл runbook encrypted-mode rollout тұрақтанғаннан кейін legacy plaintext contact storage-ты қалай қауіпсіз retirement ету керегін анықтайды. Бұл кезең destructive болғандықтан automated CI және нақты staging acceptance орындалмайынша scrub/drop жасалмайды.

## 1. Current state

Қазіргі runtime үш режимді қолдайды:

- `plaintext` — legacy compatibility;
- `dual` — plaintext + ciphertext + blind lookup hash;
- `encrypted` — жаңа writes plaintext сақтамайды, readers encrypted storage-ды қолданады.

Backend retirement readiness endpoint:

`GET /api/v1/metrics/pii-plaintext-retirement`

Aggregate fields:

- `mode`;
- `plaintextUsers`;
- `plaintextVerifications`;
- `missingEncryptedUsers`;
- `missingEncryptedVerifications`;
- `readyToScrub`;
- `capturedAt`.

Contact values, key IDs, ciphertext немесе user IDs response-қа кірмейді.

## 2. Scrub prerequisites

`readyToScrub=true` тек:

- runtime mode `encrypted`;
- plaintext бар барлық user contact rows, соның ішінде deleted rows үшін ciphertext + blind lookup hash толық;
- кез келген verification plaintext row үшін ciphertext толық

болғанда ғана мүмкін.

Бұл автоматты scrub емес. `readyToScrub=true` тек destructive phase-қа техникалық дайындықты білдіреді.

## 3. Before any destructive cleanup

- GitHub Actions quality/build/runtime smoke қайта іске қосылып green болуы керек;
- encrypted login/profile/email verification/notification staging smoke өтуі керек;
- PII migration backlog `0/0` болуы керек;
- key-rotation backlog `0/0` немесе approved active key state болуы керек;
- isolated backup/restore rehearsal encrypted contact decrypt-пен бірге орындалуы керек;
- rollback point және restore key custody тексерілуі керек;
- owner/security review explicit approval беруі керек.

Осы шарттардың біреуі орындалмаса plaintext retirement BLOCKED.

## 4. Phase 1 — plaintext value scrub

Бірінші destructive phase schema columns-ды бірден DROP етпейді. Controlled migration user `email`, `phoneE164` және active verification `email` plaintext values-тарын NULL-ға ауыстыруы мүмкін, бірақ тек encrypted copies толық болған rows үшін.

Бұл phase бөлек bounded command/migration ретінде жасалуы тиіс және:

- encrypted mode-дан басқа режимде іске қосылмайды;
- missing encrypted copy бар row-ға тимейді;
- aggregate counters ғана шығарады;
- partial failure кезінде retryable;
- бір release window бойы schema columns орнында қалады.

Bounded manual command енді бар:

~~~bash
pnpm pii:contacts:scrub-plaintext
~~~

Ол тек `PII_CONTACT_STORAGE_MODE=encrypted` және `PII_PLAINTEXT_SCRUB_ENABLED=true` болғанда іске қосылады. Әдепкіде scrub gate `false`.

`PII_PLAINTEXT_SCRUB_BATCH_SIZE` 1–500 аралығында, engineering default 50.

User email немесе phone plaintext тек дәл сол field үшін ciphertext және blind lookup hash екеуі де бар кезде ғана NULL болады. Incomplete encrypted copy бар field өзгермейді және `remainingUsers` backlog ішінде қалады. Verification plaintext тек encrypted copy бар кезде ғана тазартылады.

Command schema column-дарын DROP етпейді және CronJob ретінде орнатылмайды. Actual execution тек green CI + encrypted-mode staging acceptance + explicit owner/security approval кейін.

## 5. Phase 2 — compatibility removal

Scrub бірнеше release бойы тұрақты болғаннан кейін:

- readers-дегі plaintext fallback code алынады;
- dual/plaintext runtime modes deprecation қарастырылады;
- legacy plaintext unique constraints/indexes migration арқылы алынады;
- Prisma schema-дан legacy plaintext fields бөлек migration-мен жойылады.

Бұл phase rollback capability-ді азайтады, сондықтан Phase 1-ден бөлек approval қажет.

## 6. Rollback

Schema columns бар кезде scrub rollback backup/restore немесе encrypted value-ден controlled repopulation арқылы теориялық мүмкін. Columns DROP болғаннан кейін rollback тек previous schema + migration rollback plan арқылы жүреді.

Сондықтан plaintext scrub және column drop бір migration-да жасалмайды.

## 7. Verification status

Backend PR #140 aggregate plaintext-retirement readiness endpoint-ті қосты. Admin PR #26 осы readiness-ті read-only түрде көрсетеді. Backend PR #141 bounded, explicit-gate plaintext scrub command-ты қосты және readiness-ті deleted/stale plaintext rows-ты да есептейтіндей қатаңдатты.

Backend #247 PII encrypted-mode staging acceptance tooling қосты және оны unified release-bound Staging Core Acceptance workflow-қа қосты. Gate migration backlog 0/0, key-rotation backlog 0/0, missing encrypted copies 0/0, `readyToScrub=true`, aggregate-only metrics contract және encrypted email lookup auth smoke-ты талап етеді. Automated PR verification green; actual encrypted-mode staging execution әлі pending. Scrub tooling implementation дайын, бірақ actual scrub execution және legacy column drop нақты staging acceptance + backup/restore + owner/security approval орындалмайынша жасалмайды.