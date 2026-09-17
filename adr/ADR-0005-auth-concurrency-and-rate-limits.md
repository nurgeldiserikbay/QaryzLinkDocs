# ADR-0005: Auth concurrency және rate limits

- Status: Accepted engineering default
- Date: 2026-09-17
- Owner: QaryzLink engineering

## Context

Бір refresh token-ге параллель сұраныстар бірнеше жаңа token бере алды.
In-memory лимит сервер қайта іске қосылғанда жоғалады және replica арасында бөлінеді.

## Decision

- Session жаңартуы PostgreSQL updateMany арқылы compare-and-set болады.
- id, бұрынғы refreshTokenHash, revokedAt, expiresAt және ACTIVE user бір операцияда тексеріледі.
- Бір бұрынғы hash-пен тек бір жаңарту өтеді. Қалғандары INVALID_REFRESH_TOKEN (401).
- AuthRateBucket: key (HMAC, primary key), hits (integer), expiresAt (timestamp, indexed).
- Register/login/refresh үшін ортақ IP лимиті: 30 request / 60 секунд.
- Login үшін қосымша IP + normalized email лимиті: 5 attempt / 900 секунд.
- Барлық әрекет, оның ішінде сәтті login де есептеледі; автоматты success reset жоқ.
- Уақыт PostgreSQL clock_timestamp арқылы алынады, replica clock айырмасы әсер етпейді.
- Шектен асқан жауап: HTTP 429, AUTH_RATE_LIMITED, Retry-After.
- Кілттерде email/IP ашық сақталмайды; HMAC domain prefix және барлық replica-ға ортақ JWT secret пайдаланылады.
- Expired bucket-тер рұқсат етілген auth traffic кезінде 100-ден тазартылады; traffic тоқтаса келесі traffic-ке дейін қалады.
- trustProxy әдепкіде false. Production ingress үшін нақты trusted proxy тізімі бөлек тексеріледі.

## Alternatives

- In-memory: multi-replica және restart кезінде ортақ лимитті сақтамайды.
- Redis: жүктеме өскенде жарамды балама, әзірге қосымша міндетті сервис енгізілмейді.

## Consequences

Лимит барлық replica-да ортақ. PostgreSQL қолжетімсіз болса auth сұранысы fail closed болады.
Proxy бапталмаған deployment-те ортақ NAT/proxy IP клиенттерді бір бюджетке біріктіреді.
Бұл лимит application деңгейінде; distributed abuse пен көлемді traffic үшін ingress қорғанысы да қажет.

Front refresh сұраныстарын бір мезетте бір рет орындайды.
Жауабы жоғалған refresh-ті ескі token-мен қайталау қолдау таппайды; қайта кіру қажет болуы мүмкін.
Сақталған refresh жауаптарын idempotent replay ретінде қайтару әзірге жасалмаған.

## Acceptance

- Екі қатар refresh операциясының тек біреуі өтеді.
- Logout, suspension немесе expiry кейін refresh өтпейді.
- Екі rate store instance ортақ 5 әрекет шегін атомарлы сақтайды.
- Мерзімі өткен bucket қайта басталады.
- HTTP guard 429 және Retry-After қайтарады.
- Жалған forwarded header transport IP-ді алмастырмайды.
