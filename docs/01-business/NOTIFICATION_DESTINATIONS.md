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
| `EMAIL` | Email address | Owner user `ACTIVE`, email бар және `emailVerifiedAt` толтырылған болуы керек |

Organization party-де қазіргі schema бойынша `ownerUser` міндетті емес, сондықтан email destination автоматты түрде берілмейді. Заңды тұлғаға арналған contact routing кейін бөлек country/entity profile моделімен қосылады.

## Privacy boundary

- Email/phone outbox payload-қа жазылмайды.
- Resolver HTTP profile endpoint емес және пайдаланушыға contact дерегін ашпайды.
- Delivery adapter destination-ды тек бір dispatch шақырылымында алады.
- Unknown party, inactive user немесе unverified email `null` береді.
- Destination жоқ болса delivery provider шақырылмайды; claim retry/FAILED policy-іне өтеді.
- Қазіргі default adapter бәрібір fail-closed күйде.

## Backend mapping

- `NotificationRecipientResolver` — application port.
- `PrismaNotificationRecipientResolver` — party/user persistence adapter.
- `NotificationDeliveryService` — resolver мен delivery port-ты ретімен оркестрациялайды.
- `NotificationClaim` ішінде contact address болмайды.

Бұл boundary нақты SMTP/push SDK, consent UI және organization contact provider-ін қоспайды. Олар destination contract-іне кейін қосылады.