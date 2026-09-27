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
| [Public lender offers](docs/01-business/PUBLIC_LENDER_OFFERS.md) | Phase 3 default-off public offer publication/browse foundation |
| [Contract signing](docs/01-business/CONTRACT_SIGNING.md) | Immutable contract және dual acknowledgement |
| [Funding evidence](docs/01-business/FUNDING_EVIDENCE.md) | Төлем дәлелі және borrower confirmation |
| [Repayment schedule](docs/01-business/REPAYMENT_SCHEDULE.md) | Детерминистік өтеу кестесі және есептеу саясаты |
| [Payment ledger](docs/01-business/PAYMENT_LEDGER.md) | Төлем дәлелі, растау, allocation және ledger |
| [Overdue worker](docs/01-business/OVERDUE_WORKER.md) | Due/overdue күйін materialize ететін worker |
| [Repayment reminders](docs/01-business/REPAYMENT_REMINDERS.md) | Due/overdue borrower reminders, cadence және privacy contract |
| [Payment reversal](docs/01-business/PAYMENT_REVERSAL.md) | Confirmed төлемді immutable түрде кері жазу |
| [Contract closure](docs/01-business/CONTRACT_CLOSURE.md) | Нөлдік баланс, dual final-statement confirmation және closure certificate |
| [Evidence summary](docs/01-business/EVIDENCE_SUMMARY.md) | Participant evidence coverage және immutable manifest baseline |
| [Notification outbox](docs/01-business/NOTIFICATION_OUTBOX.md) | Транзакциялық notification intent және idempotency |
| [Notification worker](docs/01-business/NOTIFICATION_WORKER.md) | Claim, lease және retry lifecycle |
| [Notification delivery](docs/01-business/NOTIFICATION_DELIVERY.md) | Provider-neutral dispatch boundary |
| [Notification destinations](docs/01-business/NOTIFICATION_DESTINATIONS.md) | Privacy-safe party-to-channel resolution |
| [Notification scheduler](docs/01-business/NOTIFICATION_SCHEDULER.md) | One-shot outbox orchestration |
| [Notification runtime config](docs/06-operations/NOTIFICATION_RUNTIME_CONFIG.md) | Deployment batch settings |
| [Notification SMTP](docs/06-operations/NOTIFICATION_SMTP.md) | Fail-closed email delivery adapter |
| [Notification metrics](docs/06-operations/NOTIFICATION_METRICS.md) | Privacy-safe delivery counters және operational snapshot |
| [Notification CronJob](docs/06-operations/NOTIFICATION_CRONJOB.md) | Kubernetes one-shot scheduler deployment |
| [Staging smoke test](docs/06-operations/STAGING_SMOKE_TEST.md) | Staging auth, privacy және legal-gate тексерістері |
| [Release preflight](docs/06-operations/RELEASE_PREFLIGHT.md) | Secret-free deploy config/database readiness gate |
| [Backup and restore](docs/06-operations/BACKUP_RESTORE.md) | Backup, restore drill және rollback тәртібі |
| [Monitoring](docs/06-operations/MONITORING.md) | Privacy-safe сигналдар, log hygiene және incident flow |
| [Notification preferences](docs/01-business/NOTIFICATION_PREFERENCES.md) | User-controlled optional email channel |
| [State machines](docs/01-business/STATE_MACHINES.md) | Негізгі объектілердің күйлері |
| [Calculation model](docs/01-business/CALCULATION_MODEL.md) | Пайыз, кесте, төлем және баланс есебі |
| [System architecture](docs/02-architecture/SYSTEM_ARCHITECTURE.md) | Репозиторийлер мен модульдердің байланысы |
| [Domain model](docs/02-architecture/DOMAIN_MODEL.md) | Bounded context және агрегаттар |
| [Database model](docs/02-architecture/DATA_MODEL.md) | Негізгі кестелер және ERD |
| [Privacy & security](docs/03-security/PRIVACY_SECURITY.md) | Privacy, consent, access және audit |
| [Roadmap](docs/04-delivery/ROADMAP.md) | Этаптар, deliverable және exit criteria |
| [Phase 2 critical E2E](docs/04-delivery/PHASE2_CRITICAL_E2E.md) | Private Debt MVP lifecycle және cross-user isolation acceptance |
| [Phase 2 KZ/RU journey](docs/04-delivery/PHASE2_KZ_RU_JOURNEY.md) | Қазақша/орысша critical user journey және browser acceptance |
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
