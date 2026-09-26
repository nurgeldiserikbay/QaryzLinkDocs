# Notification recipient destinations

## Мақсаты

Outbox claim тек `recipientPartyId` және metadata-only payload сақтайды. Delivery алдында party ID provider-ге жіберілетін нақты destination-ға қауіпсіз boundary арқылы аударылады.

~~~mermaid
flowchart TD
    C["Notification claim"] --> R["Recipient resolver"]
    R --> I["IN_APP: party ID"]
    R --> E["EMAIL: verified address"]
    R --> N["No destination"]
    I --> D["Delivery adapter"]
    E --> D
    N --> P["Retry / FAILED policy"]
~~~

## Қазіргі ережелер

| Channel | Resolver нәтижесі | Шарт |
|---|---|---|
| `IN_APP` | Party ID | Party бар болуы керек |
| `EMAIL` | Email address | Owner user `ACTIVE`, email бар және `emailVerifiedAt` толтырылған болуы керек; optional preference true болуы керек |

Organization party-де қазіргі schema бойынша `ownerUser` міндетті емес, сондықтан email destination автоматты түрде берілмейді. Заңды тұлғаға арналған contact routing кейін бөлек country/entity profile моделімен қосылады.

## Privacy boundary

- Email/phone outbox payload-қа жазылмайды.
- Resolver HTTP profile endpoint емес және пайдаланушыға contact дерегін ашпайды.
- Delivery adapter destination-ды тек бір dispatch шақырылымында алады.
- Unknown party, inactive user немесе unverified email `null` береді.
- Destination жоқ болса delivery provider шақырылмайды; claim retry/FAILED policy-іне өтеді.
- IN_APP destination durable inbox adapter-ға өтеді; unsupported channel ғана unavailable fail-closed adapter-ға түседі.

## Backend mapping

- `NotificationRecipientResolver` — application port.
- `PrismaNotificationRecipientResolver` — party/user persistence adapter.
- `NotificationDeliveryService` — resolver мен delivery port-ты ретімен оркестрациялайды.
- `NotificationClaim` ішінде contact address болмайды.

Бұл boundary нақты SMTP provider acceptance, push SDK және organization contact provider-ін қоспайды. IN_APP inbox backend және Front read-only UI арқылы қолжетімді.