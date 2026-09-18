# ADR-0006: Email verification

- Status: Accepted engineering default
- Date: 2026-09-18
- Owner: QaryzLink engineering

## Context

Аккаунт email-іне қолжетімділік расталуы керек. Бұл жеке басты анықтау, азаматтықты растау немесе заңдық қол қою емес.

## Decision

- Барлық email endpoint ағымдағы ACTIVE user және жарамды session талап етеді.
- Register автоматты хат жібермейді; пайдаланушы request endpoint арқылы сұратады.
- Криптографиялық token: 32 random bytes, base64url; 15 минут. DB-де email: domain prefix-пен hash қана сақталады.
- Бір user-де бір challenge: resend бұрынғы challenge-ді алмастырады.
- Confirm user row lock астында owner, ACTIVE status, сол email, expiry және consumedAt шарттарын тексереді. Бір token бір рет өтеді.
- Email өзгерсе ескі challenge жарамсыз. Email өзгерту API кейін қосылғанда emailVerifiedAt атомарлы тазартылуы міндетті.
- User бойынша ортақ PostgreSQL лимит: 1 / 60 секунд және 3 / 3600 секунд. Екі лимит те қолданылады; сәтсіз жеткізу де бюджетке кіреді.
- Email endpoint-тер auth IP лимитіне де кіреді: 30 / 60 секунд.
- MAIL_ENABLED әдепкіде false; true кезінде толық SMTP және HTTPS verification URL керек.
- SMTP TLS міндетті; protocol debug/log өшірулі. Token URL fragment-інде беріледі.
- SMTP қатесінде нақты challenge жойылады; параллель resend шығарған жаңа challenge өшірілмейді.
- SMTP қабылдауы жеткізудің соңғы кепілдігі емес. Автоматты resend, bounce webhook және queue әзірге жоқ.
- Already verified user үшін request 204 қайтарады, хат жіберілмейді; HTTP лимит бәрібір есептеледі.

## Workflow

~~~mermaid
flowchart TD
    A["Authenticated request"] --> B{"User verified?"}
    B -->|Yes| C["204"]
    B -->|No| D["Replace challenge; store hash"]
    D --> E{"SMTP accepts?"}
    E -->|No| F["Invalidate matching hash; 503"]
    E -->|Yes| G["Link with fragment token"]
    G --> H["Login and confirm"]
    H --> I{"Owner, email, expiry, unused?"}
    I -->|No| J["400 INVALID_EMAIL_TOKEN"]
    I -->|Yes| K["Atomic verify + consume; 204"]
~~~

Rate limit request-ке дейін орындалады; шектеуде 429 және Retry-After қайтады.

## Alternatives

Email OTP: қысқа код brute-force қорғанысын бөлек талап етеді.
Email сілтемесімен login: бұл кезеңде session authentication-ды алмастырмайды.
Queue/outbox: delivery reliability кезеңіне қалдырылды; қазір synchronous SMTP adapter.

## Consequences

Front fragment-ті оқып URL-ден өшіреді, token-ді analytics/log-қа жібермейді. Login қажет болса token-ді тек уақытша жадта ұстайды; бет қайта жүктелсе қайта хат сұратуға болады.
Request timeout болса хат келген-келмегені белгісіз болуы мүмкін; пайдаланушы лимит өткен соң қайта сұрата алады.
Email мен challenge email snapshot-ы қазіргі schema-да шифрланбаған; Identity Vault және retention жұмыстары public launch алдында аяқталуы керек.
Challenge бір user-ге бір жолмен шектелген; expiry автоматты purge емес. Өшірілген user үшін cascade бар.

## Acceptance

Valid confirmation, expiry, foreign token, replay, resend, email change, suspended account, parallel confirm және stale delivery failure сценарийлері тексеріледі.
SMTP tests нақты хат жібермейді. TLS, token fragment, sanitized error және disabled mail сценарийлері fake adapter арқылы тексеріледі.
