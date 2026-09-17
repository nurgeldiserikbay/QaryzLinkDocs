# Open Questions and Gates

## 1. Blocking business decisions

| ID | Сұрақ | Әсері | Күйі |
|---|---|---|---|
| B-001 | Funding receipt-ті borrower қанша уақытта растауы керек? | Funding state | Open |
| B-002 | Timeout кезінде автоматты dispute ашыла ма? | Workflow | Open |
| B-003 | Funding deadline өткен signed contract қалай жабылады? | Contract state | Open |
| B-004 | Бір lender-дің active offer/application лимиті | Abuse/capacity | Open |
| B-005 | Borrower бірнеше proposal-ды қатар қабылдай ала ма? | Double funding risk | Open |
| B-006 | Match ranking қандай факторларды қолданады? | Fairness/privacy | Open |
| B-007 | Closed-network matching MVP-ге кіре ме? | Scope | Open |

## 2. Calculation decisions

| ID | Сұрақ | Күйі |
|---|---|---|
| C-001 | Day-count basis | Legal/product review |
| C-002 | Rounding mode | Engineering review |
| C-003 | Payment allocation order | Legal review |
| C-004 | Weekend/holiday due-date shift | Product/legal review |
| C-005 | Multi-tranche accrual | Product decision |
| C-006 | Overdue/penalty formula | Legal gate |
| C-007 | Early repayment confirmation | Legal/product review |

## 3. Kazakhstan legal gates

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

## 4. Provider decisions

- authentication provider;
- SMS/email/push;
- KYC/liveness;
- Kazakhstan Digital ID feasibility;
- signature/ЭЦҚ;
- object storage region;
- malware scanner;
- PDF renderer;
- trusted timestamp;
- future bank/escrow partner.

## 5. Product gates

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

## 6. Decision lifecycle

Open сұрақ шешілгенде:

1. шешім ADR-ға жазылады;
2. business logic/state machine жаңартылады;
3. data/API impact көрсетіледі;
4. acceptance criteria қосылады;
5. roadmap gate жабылады;
6. implementation issue ашылады.
