# ADR-0019: Resolve notification destinations at delivery time

- Status: Accepted
- Date: 2026-09-20
- Owners: QaryzLink maintainers

## Context

Notification outbox payload-ы privacy-safe metadata ғана сақтауы керек. Бірақ нақты email немесе push provider-ге recipient destination қажет. Contact address-ті outbox-қа көшіру дерек көбеюіне, retention және unauthorized access тәуекелін арттырады.

## Decision

Delivery алдында `NotificationRecipientResolver` party ID және channel арқылы ephemeral `NotificationDestination` қайтарады.

- `IN_APP`: party ID;
- `EMAIL`: тек `ACTIVE` owner user-дің verified email address-і;
- unknown party, inactive owner, missing email немесе unverified email: `null`;
- `NotificationDeliveryService` destination жоқ болса provider adapter-ді шақырмайды және outbox retry policy-ін қолданады;
- resolver HTTP profile access немесе public search boundary емес.

Organization party-лер үшін ownerUser міндетті болмағандықтан email routing кейінгі entity contact model-іне қалдырылады.

## Alternatives

- Email address-ті NotificationOutbox payload-қа сақтау: privacy және retention surface ұлғаяды.
- Provider adapter-ге Prisma query беру: channel-specific code persistence-ке байланады.
- Барлық party-ге email жіберу: verified consent және organization contact semantics жоқ.

## Consequences

Оң әсері:

- PII delivery уақытында ғана қысқа өмір сүреді.
- Provider adapter-лерге таза, тексерілетін destination contract беріледі.
- In-app және email арналарын бір claim lifecycle ішінде ажыратуға болады.

Шектеулері:

- Нақты SMTP/push adapter әлі жоқ.
- Email notification preference және organization contact model кейін қосылады.
- Resolver database lookup қосатындықтан provider dispatch алдында қосымша latency бар.

## Verification

Backend PR #13 және CI run 35512393331:

- destination resolver unit tests;
- missing destination retry test;
- strict typecheck, ESLint, coverage және production build.