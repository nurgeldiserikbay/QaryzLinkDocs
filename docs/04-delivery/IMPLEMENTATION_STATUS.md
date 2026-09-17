# Implementation status

Жаңартылған күні: 2026-09-17

Бұл құжат specification мен нақты код арасындағы қысқа бақылау нүктесі. Толық талаптар өзгермейді; мұнда тек орындалу күйі көрсетіледі.

## Жалпы күй

| Бағыт | Күйі | Нәтиже |
|---|---|---|
| Product және business specification | Дайын | MVP шекарасы, state machine, privacy және calculation rules бекітілді |
| Backend foundation | Дайын | NestJS/Fastify modular monolith, Prisma/PostgreSQL, Docker, CI |
| IAM | Базалық нұсқа дайын | Register, login, refresh token rotation, current-session logout |
| Profile және privacy settings | Базалық нұсқа дайын | Өз профилін оқу және privacy баптауларын өзгерту |
| Database migration | Дайын | Бастапқы schema versioned SQL migration ретінде бекітілді |
| Discovery | Келесі этап | Loan request, offer, invite және proposal |
| Contract/Funding/Schedule | Жоспарда | Қол қою, ақша берілгенін растау және кесте |
| Front/Admin UI | Жоспарда | Backend contract тұрақтанған сайын вертикаль slice бойынша жасалады |

## Қазіргі backend slice

~~~mermaid
flowchart TD
    R["Register"] --> U["User + Person party"]
    U --> P["Private profile defaults"]
    L["Login"] --> A["Short-lived access token"]
    L --> T["Rotating refresh session"]
    A --> M["GET/PATCH own profile"]
    T --> A
~~~

Қауіпсіздік шешімдері:

- password built-in Node.js `scrypt` арқылы hash болады;
- refresh token дерекқорда ашық түрде сақталмайды;
- JWT secret configuration іске қосылғанда тексеріледі;
- жаңа профильдің public көрінуі әдепкіде өшірулі;
- domain қателері тұрақты API error code-тарымен қайтарылады.

## Quality gate

Әр push пен pull request-та GitHub Actions мыналарды орындайды:

1. PostgreSQL service-ін іске қосады;
2. Prisma schema-ны generate және validate етеді;
3. барлық versioned migration-ды бос базаға қолданады;
4. TypeScript strict typecheck орындайды;
5. ESLint complexity, nesting және файл ұзындығы шектерін тексереді;
6. unit test пен coverage threshold-тарды тексереді;
7. production build жасайды.

2026-09-17 baseline: 25 test өтті; таңдалған domain/application code coverage — lines 99.34%, branches 96.34%, functions 100%.

## Келесі орындалу реті

~~~mermaid
flowchart LR
    A["IAM hardening"] --> D["Private discovery"]
    D --> C["Contract draft"]
    C --> F["Funding evidence"]
    F --> S["Schedule"]
    S --> UI["Front vertical slice"]
~~~

1. Email verification, auth rate limiting және refresh rotation concurrency тексеруі.
2. Invite-only loan request/offer/proposal use cases.
3. Бір ұсынысты қабылдағанда қалған proposal-дарды атомарлы жабу.
4. Contract version және екі тараптың қол қою workflow-ы.
5. Funding evidence және 72 сағаттық borrower confirmation.
6. Deterministic repayment schedule және payment confirmation.
7. Осы API-ларға сәйкес Front, кейін Admin интерфейстері.

## Production-ға жіберілмейтін мүмкіндіктер

Қазақстан бойынша құқықтық қорытынды жасалғанша public marketplace, penalty/late fee, automated enforcement, platform custody және amount-based commission өшірулі қалады.

## Session logout

`POST /api/v1/auth/logout` Bearer token арқылы ағымдағы сессияны тоқтатады (204).
Әр қорғалған сұраныста session owner, revokedAt, expiresAt және User.status тексеріледі.
Тоқтатылған session-мен қайталанған HTTP сұраныс 401 қайтарады. Revoke дерекқор операциясы идемпотентті.
Жаңа тесттер CI-де тексеріледі; базалық 25 тест көрсеткіші алдыңғы аяқталған кезеңге қатысты.

Қосымша архитектуралық талдау: [Graphify қолдану тәртібі](GRAPHIFY.md).
