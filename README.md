# QaryzLink Docs

QaryzLink — Қазақстандағы жеке тұлғалар арасында қарыз ұсыныстарын табу, келісу, растау және төлем кестесін басқаруға арналған privacy-first платформа.

Бұл репозиторий барлық QaryzLink компоненттері үшін ортақ source of truth болып табылады:

- [QaryzLinkFront](https://github.com/nurgeldiserikbay/QaryzLinkFront) — пайдаланушы интерфейсі;
- [QaryzLinkBack](https://github.com/nurgeldiserikbay/QaryzLinkBack) — API және бизнес-логика;
- [QaryzLinkAdmin](https://github.com/nurgeldiserikbay/QaryzLinkAdmin) — moderation, support және compliance;
- **QaryzLinkDocs** — өнім, архитектура және delivery құжаттары.

## Құжаттар картасы

| Бөлім | Мақсаты |
|---|---|
| [Master specification](docs/MASTER_SPEC.md) | Толық техникалық тапсырма |
| [Product overview](docs/00-product/PRODUCT_OVERVIEW.md) | Өнім мақсаты, шекарасы және рөлдер |
| [Glossary](docs/00-product/GLOSSARY.md) | Domain терминдерінің canonical анықтамасы |
| [Business logic](docs/01-business/BUSINESS_LOGIC.md) | Ұсыныс, matching, шарт, қаржыландыру және өтеу |
| [Private discovery](docs/01-business/PRIVATE_DISCOVERY.md) | Іске асқан шақыру және proposal сценарийі |
| [Contract signing](docs/01-business/CONTRACT_SIGNING.md) | Immutable contract және dual acknowledgement |
| [Funding evidence](docs/01-business/FUNDING_EVIDENCE.md) | Төлем дәлелі және borrower confirmation |
| [Repayment schedule](docs/01-business/REPAYMENT_SCHEDULE.md) | Детерминистік өтеу кестесі және есептеу саясаты |
| [State machines](docs/01-business/STATE_MACHINES.md) | Негізгі объектілердің күйлері |
| [Calculation model](docs/01-business/CALCULATION_MODEL.md) | Пайыз, кесте, төлем және баланс есебі |
| [System architecture](docs/02-architecture/SYSTEM_ARCHITECTURE.md) | Репозиторийлер мен модульдердің байланысы |
| [Domain model](docs/02-architecture/DOMAIN_MODEL.md) | Bounded context және агрегаттар |
| [Database model](docs/02-architecture/DATA_MODEL.md) | Негізгі кестелер және ERD |
| [Privacy & security](docs/03-security/PRIVACY_SECURITY.md) | Privacy, consent, access және audit |
| [Roadmap](docs/04-delivery/ROADMAP.md) | Этаптар, deliverable және exit criteria |
| [Implementation status](docs/04-delivery/IMPLEMENTATION_STATUS.md) | Кодтың specification-ға қатысты ағымдағы күйі |
| [Open questions](docs/05-governance/OPEN_QUESTIONS.md) | Шешілмеген сұрақтар мен legal gates |
| [Deployment](docs/06-operations/DEPLOYMENT.md) | Backend staging орнату нұсқаулығы |
| [Owner checklist](docs/06-operations/OWNER_CHECKLIST.md) | Жоба иесінен қажет баптаулар |
| [Release checklist](docs/06-operations/RELEASE_CHECKLIST.md) | Staging және public launch шарттары |
| [ADRs](adr/README.md) | Архитектуралық шешімдер журналы |

## Оқу реті

~~~mermaid
flowchart LR
    P["Product"] --> B["Business Logic"]
    B --> S["State Machines"]
    S --> D["Domain Model"]
    D --> DB["Database Model"]
    DB --> R["Roadmap"]
~~~

## Негізгі қағидалар

1. Бір тараптың жазбасы екінші тараптың расталған қарызы болып саналмайды.
2. Қол қою шартты бекітеді, бірақ қарыздың есебі ақша берілгені расталғаннан кейін басталады.
3. Қарыз алушының сұранысы matching үшін; соңғы қаржылық талаптарды қарыз беруші ұсынады және екі тарап қабылдайды.
4. Платформа бастапқыда ақшаны қабылдамайды және сақтамайды.
5. Құпия дерек әдепкіде жабық және тек нақты consent арқылы ашылады.
6. Құқықтық шектеу ресми құқықтық дереккөзбен және rule version-мен байланысады.
7. Ашық matching Қазақстандағы құқықтық мәртебесі бекітілгеннен кейін ғана production-да қосылады.

## Құжаттарды өзгерту тәртібі

- Маңызды шешім ADR арқылы бекітіледі.
- Business rule өзгерсе, BUSINESS_LOGIC, тиісті state machine және acceptance criteria бірге жаңартылады.
- Database entity атаулары domain glossary-мен сәйкес болуы керек.
- Код пен құжат арасында қайшылық болса, бекітілген ADR және осы репозиторийдегі versioned business rule негізге алынады.
- Құжаттарға production secret, нақты ЖСН, құжат көшірмесі немесе пайдаланушы дерегі салынбайды.

## Күйі

Foundation documentation v1 дайын. Ашық сұрақтар мен legal gates шешілген сайын құжаттар versioned түрде жаңартылады.
