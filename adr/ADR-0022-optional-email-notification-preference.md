# ADR-0022: Optional email notification preference

- Status: Accepted
- Date: 2026-09-20
- Owners: QaryzLink maintainers

## Context

SMTP adapter және verified destination resolution дайын. Пайдаланушы optional email арнасын privacy settings арқылы өшіре алуы керек, бірақ in-app арнасы мен қарыз міндеттемелері email choice-қа тәуелді болмауы тиіс.

## Decision

`PrivacySettings.emailNotificationsEnabled` енгізіледі.

- default: `true`;
- authenticated profile `GET/PATCH /profile/me` арқылы оқылады және өзгереді;
- `NotificationOutboxWorkflow` тек `EMAIL` intent-тері үшін preference-ті enqueue алдында тексереді;
- preference `false` болса, optional email intent outbox-қа жазылмайды;
- `IN_APP` intent-тері preference-ке қарамай enqueue болады;
- outbox payload-қа email немесе басқа PII қосылмайды.

Preference enqueue time-да тексерілетіндіктен, бұрын жазылған intent-терді жаппай өшіру/қайта жазу қарастырылмайды. Mandatory/legal notification category кейін бөлек policy ретінде бекітіледі.

## Alternatives

- Delivery кезінде skip ету: outbox retry/FAILED lifecycle-ін бұзады және disabled event-ті қайта-қайта claim етуі мүмкін.
- Барлық channel-ды бір toggle-мен өшіру: in-app obligations history-ін жасырын етеді.
- Әр event үшін preference қазір қосу: legal classification бекітілмей тұрып ерте күрделілік енгізеді.

## Consequences

- Пайдаланушы optional email delivery-ді ашық басқарады.
- In-app notification path өзгермейді.
- Email opt-out кейінгі enqueue-лерге әсер етеді; already queued event semantics сақталады.
- Profile privacy migration және API contract өзгерісі қажет.

## Verification

Backend PR #16:

- migration, Prisma validation, typecheck, ESLint, coverage, build және smoke test өтті;
- CI run [35514976266](https://github.com/nurgeldiserikbay/QaryzLinkBack/actions/runs/35514976266).
