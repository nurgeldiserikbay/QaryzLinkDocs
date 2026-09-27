# Password reset operations

Жаңартылған күні: 2026-09-27.

QaryzLink password reset flow аккаунт бар-жоғын сыртқа ашпауға, reset token-ды бір рет қолдануға және successful reset-тен кейін барлық active session-ды revoke етуге арналған.

## Public flow

1. Front `/forgot-password` беті email қабылдайды.
2. `POST /api/v1/auth/password-reset/request` request-ті `202 { accepted: true }` деп қабылдайды.
3. Existing және missing account үшін public response бірдей.
4. Active account табылса 15 минуттық random token жасалады; database raw token емес, hash қана сақтайды.
5. SMTP хаттағы reset URL token-ды fragment ретінде береді: `/reset-password#token=...`.
6. Front fragment token-ды оқып, address bar-дан өшіреді.
7. `POST /api/v1/auth/password-reset/confirm` жаңа password пен token-ды қабылдайды.
8. Successful consume password hash-ты өзгертеді, challenge-ты consumed етеді және барлық active session-ды revoke етеді.

## Abuse and enumeration controls

- global auth IP budget сақталады;
- reset request үшін IP+normalized email pair budget — 3 request / 15 минут;
- missing/inactive account үшін хат жіберілмейді, бірақ response shape өзгермейді;
- SMTP provider failure public request арқылы account existence signal бермейді;
- expired/reused/invalid token generic invalid/expired ретінде fail-closed;
- raw token log/database/audit payload-қа кірмейді.

## Mail configuration

`MAIL_ENABLED=true` болса:

- SMTP_HOST;
- SMTP_USER;
- SMTP_PASSWORD;
- SMTP_FROM;
- EMAIL_VERIFICATION_URL;
- PASSWORD_RESET_URL

міндетті. Verification және reset URL екеуі де HTTPS болуы тиіс.

## Retention

Expired немесе consumed password-reset challenge daily auth-retention cleanup арқылы жойылады. Бұл cleanup password history сақтамайды және contract/payment/ledger data-ға тимейді.

## Verification status

Backend PR #154 password-reset core-ды қосты. Backend PR #156 HTTP/SMTP/rate-limit/retention wiring-ті аяқтады. Front PR #33 request/confirm UX және fragment-token handling қосты.

Бұл өзгерістер GitHub Actions account free-quota/billing gate салдарынан automated CI арқылы әлі қайта тексерілген жоқ. Quota ашылғанда backend quality/migration және Front browser/UI acceptance run-дары міндетті.