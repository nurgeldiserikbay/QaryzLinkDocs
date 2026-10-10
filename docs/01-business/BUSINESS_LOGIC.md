# Business Logic

## 1. Негізгі объектілердің байланысы

~~~mermaid
flowchart TD
    U["User / Party"] --> LO["LenderOffer"]
    U --> BR["BorrowerRequest"]
    BR --> AP["Application / Proposal"]
    LO --> AP
    AP --> NG["Negotiation"]
    NG --> CV["ContractVersion"]
    CV --> SG["SignatureGroup"]
    SG --> FD["Funding"]
    FD --> OB["Active Obligation"]
    OB --> SC["Schedule"]
    OB --> PM["Payments"]
    OB --> DS["Dispute"]
    OB --> CL["Closure"]
~~~

## 2. User ID арқылы табу

1. Пайдаланушы public немесе shareable ID енгізеді.
2. Жүйе privacy setting және block list тексереді.
3. Іздеу enumeration-ға жол бермейді.
4. Нәтижеде тек public profile және verification badges көрсетіледі.
5. Іздеуші Relationship request немесе нақты offer жібереді.
6. Қабылдаушы consent бермейінше құпия өрістер ашылмайды.

## 3. LenderOffer

Қарыз беруші ашық немесе жабық ұсыныс жасайды.

### Міндетті параметрлер

- currency;
- minimum және maximum principal;
- minimum және maximum term;
- interest policy;
- repayment methods;
- funding method;
- required verification;
- visibility;
- response deadline;
- offer expiry;
- country rule version.

### Lifecycle

~~~mermaid
flowchart LR
    D["Draft"] --> RV["Validation"]
    RV --> PB["Published"]
    PB --> PS["Paused"]
    PS --> PB
    PB --> EX["Expired"]
    PB --> CL["Closed"]
    RV --> RJ["Rejected by rules"]
~~~

Published ұсынысты өзгерту жаңа version жасайды. Бұрынғы application сол кезде көрген snapshot-пен байланыста қалады.

## 4. BorrowerRequest

BorrowerRequest — шарт емес.

### Current private pilot

Current private flow intentionally uses a minimal exact request:

- exact requested amount;
- exact term;
- KZT;
- invitation-only visibility;
- expiry.

This is the canonical user-facing pilot flow.

### Broader discovery model

Future/public matching may expand the request into a richer preference object:

- amount range;
- term range;
- preferred maximum rate;
- expected payment frequency;
- funds-needed date;
- purpose;
- available verification;
- collateral/guarantor availability;
- visibility and expiry.

The Prisma model already leaves room for part of this broader shape, but current UI/API must not be described as collecting fields it does not actually collect. Қарыз алушы preference өзгерткенде бұрын алынған нақты lender proposal өзгермейді.

## 5. Matching

Matching тек сәйкестікті түсіндіреді; approval жасамайды.

~~~mermaid
flowchart TD
    A["Borrower preferences"] --> M["Matching engine"]
    B["Lender offer rules"] --> M
    C["Privacy-visible claims"] --> M
    D["Country rules"] --> M
    M --> E["Eligible"]
    M --> F["Partial match"]
    M --> G["Not eligible"]
    E --> H["Explanation"]
    F --> H
    G --> H
~~~

Match result құрамында:

- matched fields;
- mismatched fields;
- missing verification;
- expired/ineligible reason;
- legal-rule warning;
- есептелген ranking factors.

Жасырын дерек matching engine-ге lawful scope арқылы беріледі, бірақ қарсы тарапқа ашылмайды.

## 6. Application және Proposal

Екі бастау жолы бар:

### LenderOffer → Borrower application

1. Borrower ұсынысты қарайды.
2. Өтінім береді.
3. Lender қабылдайды, бас тартады немесе нақты шарт ұсынады.
4. Нақты proposal response deadline алады.

### BorrowerRequest → Lender proposal

1. Lender request көреді.
2. Өзінің нақты талаптарын жібереді.
3. Borrower қабылдайды, бас тартады немесе өзгеріс ұсынады.

Қарыз берушінің соңғы талаптары ғана ContractVersion-ға көшеді. Бірақ borrower оларды анық көріп, explicit acceptance беруі тиіс.

## 7. Negotiation

Әр counter-offer immutable version болады.

~~~mermaid
sequenceDiagram
    participant L as Lender
    participant Q as QaryzLink
    participant B as Borrower
    L->>Q: Proposal v1
    Q->>B: Талаптар + deadline
    B->>Q: Counter proposal
    Q->>L: Proposal v2
    L->>Q: Final lender terms v3
    Q->>B: Final summary
    B->>Q: Accept
    Q-->>L: Ready for signing
~~~

Deadline біткен нұсқа EXPIRED болады. Expired нұсқаны қайта ашу жаңа version талап етеді.

## 8. Contract және signing

ContractVersion мыналарды snapshot ретінде бекітеді:

- тараптар және олардың сол сәттегі legal identity claims;
- principal және currency;
- interest policy;
- schedule policy;
- funding deadline;
- repayment allocation;
- early repayment;
- late-payment terms;
- governing law және jurisdiction;
- document hash;
- country rule version;
- consent және disclosure version.

~~~mermaid
flowchart TD
    A["Final proposal accepted"] --> B["Contract draft"]
    B --> C["Lender signs"]
    B --> D["Borrower signs"]
    C --> E{"Барлық міндетті қол бар ма?"}
    D --> E
    E -->|Жоқ| F["Signing pending"]
    E -->|Иә| G["SIGNED_PENDING_FUNDING"]
~~~

Қол қою қарыз берілгенін білдірмейді.

## 9. Funding confirmation

1. Lender FundingAttempt жасайды.
2. Сома, әдіс, уақыт және evidence енгізеді.
3. Evidence hash және uploader сақталады.
4. Borrower алдым немесе алмадым деп жауап береді.
5. Расталса FundingConfirmed оқиғасы жазылады.
6. Obligation ACTIVE болады және schedule есептеледі.
7. Дауланса FUNDING_DISPUTED болады.

~~~mermaid
sequenceDiagram
    participant L as Lender
    participant Q as QaryzLink
    participant B as Borrower
    L->>Q: Funding evidence
    Q->>B: Ақшаны алдыңыз ба?
    alt Растады
        B->>Q: Confirm receipt
        Q-->>L: Funding confirmed
        Q-->>B: Schedule activated
    else Дауланды
        B->>Q: Dispute + reason
        Q-->>L: Funding disputed
    end
~~~

Interest accrual FundingConfirmed effective date-тан басталады. Біржақты файл upload есепті бастамайды.

## 10. Schedule

ScheduleItem құрамында:

- due date;
- opening principal;
- principal due;
- interest due;
- allowed fee/penalty due;
- total due;
- paid allocations;
- status;
- calculation policy version.

Schedule immutable calculation input-тан генерацияланады. Қайта құрылымдау кезінде жаңа schedule version жасалады.

## 11. Payment

PaymentRecord платформадан тыс жасалған төлемді көрсетеді.

1. Тарап payment claim енгізеді.
2. Evidence тіркеледі.
3. Қарсы тарап растайды немесе дауласады.
4. Confirmed payment allocation policy бойынша бөлінеді.
5. Balance және schedule status қайта есептеледі.
6. Қате болса reversal event жасалады; бастапқы жазба өшірілмейді.

Allocation priority country rule және contract арқылы versioned болады.

## 12. Early repayment

- borrower amount және date енгізеді;
- жүйе preview есептейді;
- lender растауы талап етілетін жағдай rule арқылы анықталады;
- approved payment-тен кейін қалған principal және schedule қайта есептеледі;
- ескі schedule archived version ретінде қалады.

## 13. Overdue

ScheduleItem due date өткенде және толық жабылмағанда overdue болады.

- grace period rule қолданылады;
- MVP-де borrower-ға due күні бір рет және overdue болғанда бір рет idempotent reminder жіберіледі;
- late charge тек valid country rule және contract болғанда есептеледі;
- dispute болса disputed amount бөлек көрсетіледі;
- public shame немесе автоматты жариялау болмайды.

## 14. Amendment / restructuring

~~~mermaid
flowchart TD
    A["Active obligation"] --> B["Amendment draft"]
    B --> C["Difference preview"]
    C --> D["Required parties sign"]
    D --> E["New ContractVersion"]
    E --> F["New ScheduleVersion"]
    F --> G["Active obligation continues"]
~~~

Principal history және confirmed payments өзгермейді. Amendment effective date-тан кейінгі есепке әсер етеді.

## 15. Closure

Obligation жабылады, егер:

- principal толық өтелген;
- applicable interest/fees resolved;
- disputed balance жоқ немесе settlement жасалған;
- required parties final statement растаған.

ClosureCertificate final balances, payment summary және hashes қамтиды.

## 16. Dispute

Dispute түрлері:

- funding not received;
- payment not recognized;
- wrong amount;
- identity/signature challenge;
- calculation disagreement;
- contract terms dispute;
- unauthorized account access;
- document authenticity.

Платформа дәлелдерді жинайды, коммуникацияны тіркейді және resolution snapshot сақтайды. Платформа соттың орнына шешім шығармайды.

## 17. Инварианттар

- Confirmed object үнсіз өзгермейді.
- Balance confirmed events-тен есептеледі.
- Signed != Funded.
- Uploaded != Confirmed.
- BorrowerRequest != ContractTerms.
- Public profile != Legal identity.
- Revoked consent бұрын заңды түрде жасалған contract snapshot-ын жоймайды.
- Admin audit history-ді өшірмейді.
- Әр қаржылық есеп policy version және rounding rule сақтайды.


## Private discovery implementation

[Request → invitation → proposal → acceptance](PRIVATE_DISCOVERY.md) іске асқан restricted slice-ты сипаттайды. Бір accepted proposal request-ті MATCHED етеді; contract, signature және funding бөлек кезеңдерде орындалады.

## Public lender offer implementation boundary

[Public lender offers](PUBLIC_LENDER_OFFERS.md) Phase 3-тің алғашқы default-off backend slice-ын сипаттайды. Offer publication және privacy-safe browse коды бар, бірақ `PUBLIC_MARKETPLACE_ENABLED=false` әдепкі күйде және deployed release preflight marketplace enablement-ті legal gate өтпейінше fail етеді.

[Public offer applications](PUBLIC_OFFER_APPLICATIONS.md) borrower exact request-ті public offer-ге application ретінде байланыстырады. Lender ACCEPT concrete Proposal ғана жасайды; borrower кейін сол Proposal-ды бөлек explicit ACCEPT етеді. Application offer terms-ті immutable snapshot ретінде сақтайды.


## Public marketplace moderation boundary

[Marketplace moderation reporting baseline](MARKETPLACE_MODERATION.md) user-driven public offer reports-ты enum-only reason code, duplicate/daily quota және privacy-safe visibility guards арқылы шектейді. Report automatic sanction, ranking немесе fraud verdict емес. Current Admin тек aggregate backlog көреді; row-level review және moderator mutation кейінгі бөлек workflow.


## Proposal negotiation boundary

[Proposal negotiation](PROPOSAL_NEGOTIATION.md) borrower counter suggestion-ды lender-approved concrete Proposal-дан әдейі бөледі. Borrower counter-ды тікелей ACCEPT ету мүмкін емес: lender жаңа Proposal шығарады, final ACCEPT қайта borrower-де қалады. Бұл lender-authority және borrower explicit consent invariant-ын сақтайды.
