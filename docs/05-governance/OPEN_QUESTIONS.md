# Open Questions and Gates

## 1. Қабылданған MVP бизнес шешімдері

2026-09-17 күні B-001—B-007 және C-001—C-007 бойынша MVP defaults қабылданды. Толық негіздеме: [ADR-0004](../../adr/ADR-0004-kz-private-mvp-defaults.md).

| ID | Шешім | Күйі |
|---|---|---|
| B-001 | Borrower funding evidence-ті 72 сағат ішінде confirm/dispute етеді | Accepted |
| B-002 | Timeout автоматты dispute емес; `CONFIRMATION_OVERDUE` + reminder | Accepted |
| B-003 | Funding deadline өтсе `EXPIRED_UNFUNDED`; ұзарту amendment арқылы | Accepted |
| B-004 | 3 active public offer, 10 outgoing proposal/day; config арқылы өзгереді | Accepted |
| B-005 | Бір BorrowerRequest — бір accepted Proposal; қалғандары атомарлы жабылады | Accepted |
| B-006 | Currency, amount, term, rate, verification, recency; sensitive score жоқ | Accepted |
| B-007 | Closed-network/invite-only matching MVP-ге кіреді | Accepted |
| C-001 | `ACT_365_FIXED` | Accepted for MVP |
| C-002 | Minor units + `HALF_UP` | Accepted for MVP |
| C-003 | Allowed charge → interest → principal → credit; penalty disabled | Accepted for MVP |
| C-004 | Due date автоматты жылжымайды | Accepted for MVP |
| C-005 | Бір funding tranche | Accepted for MVP |
| C-006 | Penalty/late charge = 0 | Accepted until legal gate |
| C-007 | Dual-confirmed early repayment, default `REDUCE_TERM` | Accepted for MVP |

## 2. Қазақстан бойынша legal gates

Бұл сұрақтар өнімдік болжаммен жабылмайды және маманданған заңгердің жазбаша қорытындысын қажет етеді:

- Жеке тұлғаның жүйелі пайыздық қарызы қай кезде кәсіпкерлік/лицензиялық қызметке айналады?
- Ашық LenderOffer/BorrowerRequest matching платформаның мәртебесіне қалай әсер етеді?
- Платформа success fee немесе amount-based commission ала ала ма?
- Қандай пайыз/айыппұл ережелері жеке тұлғалар арасында қолданылады?
- Қарапайым электрондық растаудың дәлелдік күші қандай?
- Қай жағдайда ЭЦҚ немесе нотариалдық нысан қажет?
- Нотариустың атқарушылық жазбасына қандай дәлелдер жеткілікті?
- Пайыздық кірістің салық disclosure-ы қандай?
- ЖСН және identity documents Қазақстанда қайда сақталуы тиіс?
- Шетел азаматы қатысқан шарттың governing law тәртібі қандай?

Legal gate жабылғанша public marketplace, penalty, automated enforcement және amount-based commission production-да өшірулі болады.

## 3. Кейін таңдалатын providers

Provider интерфейстері қазір жасалады, нақты vendor интеграция алдында таңдалады:

- authentication және OTP;
- SMS/email/push;
- KYC/liveness және Kazakhstan Digital ID feasibility;
- signature/ЭЦҚ;
- object storage region және malware scanner;
- PDF renderer және trusted timestamp;
- future bank/escrow partner.

## 4. Product gate

~~~mermaid
flowchart TD
    F["Feature proposed"] --> L{"Legal impact?"}
    L -->|No| S["Security/privacy review"]
    L -->|Yes| R["Legal rule/source"]
    R --> S
    S --> T["Technical design + tests"]
    T --> FF["Feature flag"]
    FF --> P["Production enable"]
~~~

## 5. Decision lifecycle

Жаңа ашық сұрақ шешілгенде:

1. шешім ADR-ға жазылады;
2. business logic/state machine жаңартылады;
3. data/API impact көрсетіледі;
4. acceptance criteria қосылады;
5. roadmap gate жабылады;
6. implementation issue ашылады.
