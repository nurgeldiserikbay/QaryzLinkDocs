# Notification preferences

## Мақсаты

Пайдаланушы optional email хабарламаларын profile privacy settings арқылы басқарады. Бұл баптау тек каналға қатысты; ол қарыз шартын, төлем міндеттемесін немесе in-app history-ді өзгертпейді.

## Default және API

`emailNotificationsEnabled` әдепкіде `true`.

Authenticated profile API:

| Operation | Field |
|---|---|
| `GET /api/v1/profile/me` | `privacy.emailNotificationsEnabled` |
| `PATCH /api/v1/profile/me` | `emailNotificationsEnabled: boolean` |

Пайдаланушы false қойған кезде келесі optional EMAIL notification intent-тері outbox-қа жазылмайды. Already queued intent-терге retroactive delete жасалмайды; outbox privacy-safe metadata ғана сақтайды.

## Арна саясаты

| Channel | Preference әсері |
|---|---|
| `EMAIL` | `false` болса enqueue кезінде skip; verified destination resolution бәрібір жеке guard болып қалады |
| `IN_APP` | Әзірше әрқашан қолжетімді; email opt-out in-app record-ты өшірмейді |

Бұл slice event category preference немесе legal/mandatory notification классификациясын енгізбейді. Мұндай саясат Қазақстан пилоты мен legal review-ден кейін бөлек бекітілуі тиіс.

## Backend mapping

- `PrivacySettings.emailNotificationsEnabled`
- `ProfileController` `GET/PATCH /profile/me`
- `NotificationOutboxWorkflow.enqueue(...)` EMAIL intent-ін preference арқылы сүзеді
- `PrismaNotificationRecipientResolver` verified active email guard-ын сақтайды

## Қауіпсіздік

- Email address outbox payload-қа көшірілмейді.
- Preference-ті тек party owner өзінің profile endpoint-і арқылы өзгерте алады.
- Default enabled болғандықтан migration бұрынғы пайдаланушылардың email delivery-ін күтпеген жерден өшірмейді.
