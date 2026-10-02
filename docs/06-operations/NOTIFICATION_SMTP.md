# Notification SMTP adapter

## Мақсаты

QaryzLink-та нақты email delivery тек verified destination арқылы және `MAIL_ENABLED=true` болғанда іске қосылады. Default `MAIL_ENABLED=false`, сондықтан staging provider-ге email жібермейді.

~~~mermaid
flowchart TD
    C["EMAIL claim"] --> R["Recipient resolver"]
    R --> V["ACTIVE + verified email"]
    V --> S["SMTP adapter"]
    S --> T["SMTP transport"]
    T --> O["SENT or retry"]
    R --> N["No destination"]
    N --> O
~~~

## Хат мазмұны

Adapter тек бекітілген event type-терге generic мәтін құрады:

| Event | Subject |
|---|---|
| `PAYMENT_CONFIRMED` | QaryzLink — төлем расталды |
| `PAYMENT_REVERSED` | QaryzLink — төлем кері жазылды |

Хатқа payment ID, contract ID, email address, құжат немесе банк дерегі қосылмайды. Пайдаланушы толық мәліметті authenticated интерфейстен көреді.

## Қауіпсіздік

- `MAIL_ENABLED=false` кезінде Nodemailer transport құрылмайды.
- SMTP response, credential және recipient details error message-ке шығарылмайды.
- `requireTLS`, `disableFileAccess`, `disableUrlAccess`, `logger=false`, `debug=false` қолданылады.
- Transport әр send attempt-тен кейін жабылады.
- `IN_APP` channel әлі fail-closed; inbox adapter кейін қосылады.

## Deployment

Қолданыстағы SMTP environment settings пайдаланылады:

- `MAIL_ENABLED=true`;
- `SMTP_HOST`;
- `SMTP_PORT`;
- `SMTP_SECURE`;
- `SMTP_USER` және `SMTP_PASSWORD` secret store-да;
- `SMTP_FROM` verified sender.

Нақты staging delivery үшін SPF/DKIM/DMARC, sender verification және бақыланатын test mailbox қажет. CI SMTP provider-ге хат жібермейді.

## Backend mapping

- `SmtpNotificationAdapter` — provider adapter;
- `NotificationDeliveryRouter` — EMAIL-ді SMTP-ге, IN_APP-ты fail-closed adapter-ге бағыттайды;
- `NotificationEmailRenderer` — event type бойынша generic template;
- `NotificationRecipientResolver` — verified destination boundary.

## Staging email-verification mailbox acceptance

Back #245 `ops/staging-email-verification-smoke.sh` арқылы provider-neutral екі фазалы acceptance flow береді.

**Request phase** dedicated unverified staging account-пен login жасайды, verification status `false` екенін тексереді, verification email request үшін HTTP 204 талап етеді және session-ды revoke етеді. Бұл SMTP adapter/provider request-ті қабылдағанын көрсетеді; нақты mailbox delivery-ді operator controlled mailbox-та бөлек тексереді.

**Confirm phase** controlled mailbox-тағы link fragment-тен алынған 43-character token-ды қабылдайды, status `true` болғанын тексереді және consumed token replay HTTP 400 болуын талап етеді. Token/email/password/base URL/response body retained output-қа жазылмайды; temporary files mode 600/700 және run соңында жойылады.

Бұл implementation SPF/DKIM/DMARC, production sender/domain ownership, SMTP provider SLA немесе production recipient policy-ін approve етпейді.


## Staging password-reset mailbox acceptance

Back #246 `ops/staging-password-reset-smoke.sh` арқылы password-reset үшін provider-neutral екі фазалы acceptance береді.

**Request phase** dedicated account-тың current password-ын login арқылы тексереді, public reset request үшін HTTP 202 + `accepted=true` талап етеді және request-phase session-ды revoke етеді. Password-reset request endpoint account enumeration-ды болдырмау үшін SMTP provider failure-ды сыртқа шығармайтындықтан, бұл phase нақты delivery-ді дәлелдемейді; controlled mailbox-ты operator бөлек тексереді.

**Confirm phase** controlled mailbox link fragment-тен алынған 43-character token-ды explicit acknowledgement-пен қолданады. Harness pre-reset access session 401, old password 401, temporary new password 200, consumed-token replay 400 болуын талап етеді. Содан кейін dedicated staging account original password-ын authenticated password-change flow арқылы қайта қалпына келтіреді, temporary password-тың қайта 401 болуын тексереді және final session-ды revoke етеді.

Email/password/token/base URL/response body retained output-қа жазылмайды; temporary files mode 600/700 және run соңында жойылады. SPF/DKIM/DMARC, provider SLA, production sender/domain ownership және actual browser mailbox execution бөлек approval болып қалады.
