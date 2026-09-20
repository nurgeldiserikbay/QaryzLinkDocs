# ADR-0020: Fail-closed SMTP notification adapter

- Status: Accepted
- Date: 2026-09-20
- Owners: QaryzLink maintainers

## Context

Recipient destination resolution дайын. Енді verified email destination-ды сыртқы SMTP provider-ге жеткізетін adapter қажет. Бірақ staging немесе production provider қате бапталса, жүйе жалған SENT күйін жасамауы және PII-ды логқа шығармауы керек.

## Decision

`SmtpNotificationAdapter` қосылады және `NotificationDeliveryRouter` арқылы тек `EMAIL` destination үшін таңдалады.

- `MAIL_ENABLED=false` кезінде transport құрылмайды;
- `MAIL_ENABLED=true` кезінде environment validation-нан өткен SMTP settings қолданылады;
- event type generic, PII-сыз subject/text арқылы render етіледі;
- transport қауіпсіз TLS/logging/file/url access параметрлерімен құрылады;
- provider error sanitized `NotificationError` ретінде retry policy-іне беріледі;
- `IN_APP` adapter әзірге unavailable болып қалады.

## Alternatives

- SMTP кодын delivery service-ке тікелей енгізу: application boundary provider-ге байланады.
- Әр event үшін бөлек mailer: template және retry lifecycle қайталанады.
- Provider сәтсіз болса SENT жасау: audit пен пайдаланушы сенімін бұзады.

## Consequences

Оң әсері:

- SMTP adapter нақты provider credentials-ін repository-ге қоспайды.
- Generic email content payment/contract metadata-сын ашпайды.
- MAIL_ENABLED арқылы staging fail-closed қалады.

Шектеулері:

- Нақты inbox delivery, bounce, unsubscribe/preferences әлі жоқ.
- Organization contact routing және push adapter кейінгі кезең.
- Email claims producer workflow-тары кейін қосылады; қазіргі payment notifications IN_APP болып қалады.

## Verification

Backend PR #14 және CI run 35514028534:

- renderer, SMTP adapter және router unit tests;
- strict typecheck, ESLint, coverage және production build.