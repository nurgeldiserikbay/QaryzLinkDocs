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