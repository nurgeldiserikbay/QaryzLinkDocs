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
- plaintext бар барлық user contact rows үшін ciphertext + blind lookup hash толық;
- active verification plaintext rows үшін ciphertext толық

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

Қазіргі кодта бұл destructive scrub command әдейі әлі қосылмаған.

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

Backend PR #140 aggregate plaintext-retirement readiness endpoint-ті қосты. Admin PR #26 осы readiness-ті read-only түрде көрсетеді.

GitHub Actions account free-quota/billing gate салдарынан automated verification pending. Destructive scrub/drop осы gate шешілмей орындалмайды.