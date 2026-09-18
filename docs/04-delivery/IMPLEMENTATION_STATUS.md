# Implementation status

Жаңартылған күні: 2026-09-18

Бұл құжат specification мен нақты код арасындағы қысқа бақылау нүктесі. Толық талаптар өзгермейді; мұнда тек орындалу күйі көрсетіледі.

## Жалпы күй

| Бағыт | Күйі | Нәтиже |
|---|---|---|
| Product және business specification | Дайын | MVP шекарасы, state machine, privacy және calculation rules бекітілді |
| Backend foundation | Дайын | NestJS/Fastify modular monolith, Prisma/PostgreSQL, Docker, CI |
| IAM | Базалық нұсқа дайын | Register, login, refresh token rotation, current-session logout, email verification |
| Profile және privacy settings | Базалық нұсқа дайын | Өз профилін оқу және privacy баптауларын өзгерту |
| Database migration | Дайын | Бастапқы schema versioned SQL migration ретінде бекітілді |
| Discovery | Restricted slice дайын | Private request, exact invitation, proposal, atomic acceptance |
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

2026-09-17: 47 test өтті, оның 10-ы нақты PostgreSQL integration тесті. Coverage конфигурациясына кірген код: lines 99.38%, branches 96.55%, functions 100%. Бұл бүкіл backend немесе HTTP e2e coverage көрсеткіші емес.

## Келесі орындалу реті

~~~mermaid
flowchart LR
    A["IAM hardening"] --> D["Private discovery"]
    D --> C["Contract draft"]
    C --> F["Funding evidence"]
    F --> S["Schedule"]
    S --> UI["Front vertical slice"]
~~~

1. Email verification backend аяқталды; Front verification беті және нақты SMTP staging тексеруі қалды.
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
[CI run 35220576826](https://github.com/nurgeldiserikbay/QaryzLinkBack/actions/runs/35220576826): migration, typecheck, lint, 34 test және build сәтті өтті.

Қосымша архитектуралық талдау: [Graphify қолдану тәртібі](GRAPHIFY.md).

## Auth hardening аяқталды

Shared PostgreSQL rate limit, atomic refresh rotation және forged forwarded header қорғанысы қосылды. Толық шешім: [ADR-0005](../../adr/ADR-0005-auth-concurrency-and-rate-limits.md).

[CI run 35244669259](https://github.com/nurgeldiserikbay/QaryzLinkBack/actions/runs/35244669259): Prisma format/validate, migration, typecheck, lint, 47 test және build өтті. Бұл тарихи auth кезеңінің нәтижесі; email verification келесі кезеңде қосылды.

## Email verification аяқталды

[CI run 35305836411](https://github.com/nurgeldiserikbay/QaryzLinkBack/actions/runs/35305836411), commit 8483592cb17c7c736cd48593bb0425c82edd3b83:
Prisma format/generate/validate, үш migration, TypeScript, ESLint, 18 файлдағы 73 test және production build өтті.
Coverage конфигурациясына кірген код: lines/statements 99.47%, branches 97.19%, functions 100%; бұл толық HTTP e2e coverage емес.

Бір реттік 15 минуттық token, атомарлы confirm, resend лимиті және SMTP adapter қосылды.
Нақты SMTP жеткізу және Front verification беті әлі тексерілмеген; MAIL_ENABLED=false әдепкі күйде.
Шешім мен workflow: [ADR-0006](../../adr/ADR-0006-email-verification.md).
Орнату: [Deployment](../06-operations/DEPLOYMENT.md), [иесінен қажет мәліметтер](../06-operations/OWNER_CHECKLIST.md), [release checklist](../06-operations/RELEASE_CHECKLIST.md).


## Private discovery

Backend branch `gpt/private-discovery`-де request/invitation/proposal workflow, idempotency receipts, PostgreSQL locks, privacy checks және HTTP validation бар. 97 test өткен baseline-ға discovery тесттері қосылды. Public marketplace, negotiation, contract және funding әлі production-ready емес.

ADR: [ADR-0007](../../adr/ADR-0007-private-discovery.md). API guide: [PRIVATE_DISCOVERY](../01-business/PRIVATE_DISCOVERY.md).
