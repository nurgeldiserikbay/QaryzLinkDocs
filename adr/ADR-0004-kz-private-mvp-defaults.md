# ADR-0004: Kazakhstan Private MVP Defaults

- **Status:** Accepted
- **Date:** 2026-09-17
- **Owners:** Product and Engineering

## Context

QaryzLink-тің алғашқы нұсқасы екі жеке тұлға арасындағы қарызды тіркеу, келісу, қаржыландыру фактісін растау және төлем кестесін жүргізу үшін жасалады. Ашық lending marketplace пен автоматты құқықтық enforcement Қазақстандағы құқықтық review аяқталмайынша жоғары тәуекелді.

## Decision

### Product scope

1. MVP — invite-only/private debt tracker.
2. Байланысу QaryzLink ID, invite link немесе тікелей шақыру арқылы орындалады.
3. Closed-network matching MVP құрамына кіреді.
4. Public lender/borrower marketplace кодта feature flag ретінде дайындалуы мүмкін, бірақ production-да өшірулі.
5. Платформа ақша ұстамайды, аудармайды және тараптардың орнына құқықтық шешім қабылдамайды.

### Proposal және matching

1. Бір BorrowerRequest тек бір қабылданған Proposal-мен аяқталады.
2. Proposal қабылдау атомарлы түрде орындалып, қалған белсенді proposal-дар жабылады.
3. Бастапқы лимит: бір lender-ге 3 белсенді public offer және тәулігіне 10 outgoing proposal. Лимиттер конфигурацияланады.
4. MVP ranking: currency, amount fit, term fit, rate fit, verification level және recency.
5. Sensitive attributes, жеке байланыстар және жасырын behavioural score ranking-те қолданылмайды.

### Funding

1. Signed contract қаржыландырылды дегенді білдірмейді.
2. Lender funding evidence енгізеді; borrower 72 сағат ішінде confirm немесе dispute жасайды.
3. Timeout автоматты dispute ашпайды: күй `CONFIRMATION_OVERDUE`, reminder жіберіледі.
4. Funding deadline өтсе және ақша расталмаса, contract `EXPIRED_UNFUNDED` болады.
5. Deadline тек екі тарап қабылдаған amendment арқылы ұзартылады.
6. Admin тараптардың орнына funding-ті растауға құқылы емес.

### Calculation

1. MVP-де `INTEREST_FREE` және `SIMPLE` әдістері ғана production-ready.
2. Simple interest үшін default day-count — `ACT_365_FIXED`.
3. Ақша minor unit integer түрінде, rounding — `HALF_UP`.
4. Бір contract үшін бір funding tranche; multi-tranche кейінгі этапқа қалдырылады.
5. Due date демалысқа түссе автоматты жылжымайды; contract-тағы жергілікті күн сақталады.
6. Penalty/late charge default — 0 және legal gate ашылғанша қосылмайды.
7. Төлем allocation: заңмен рұқсат етілген әрі шартта көрсетілген charge, accrued interest, principal, credit balance. Penalty disabled кезде іс жүзінде interest → principal.
8. Early repayment рұқсат етіледі, төлемді екі тарап растайды; default режим — `REDUCE_TERM`.
9. Қайта есеп әрқашан жаңа ScheduleVersion жасайды; бұрынғы нұсқа өзгермейді.

### Monetization

MVP-де қарыз сомасына немесе нәтижесіне байланысты комиссия болмайды. Алғашқы ықтимал модель — subscription және business account; қаржылық комиссиялар legal review-дан кейін ғана қаралады.

## Consequences

- Backend private workflow-ты заңдық marketplace шешімдерін күтпей жасай алады.
- Public discovery, penalty және amount-based commission feature flag/legal gate арқылы қорғалады.
- Барлық уақыт, лимит және calculation policy versioned configuration ретінде сақталады.
- Бұл шешім құқықтық қорытынды емес; legal gates бөлек ашық қалады.

## Alternatives

- Public marketplace-ті бірден іске қосу — құқықтық және abuse тәуекелі жоғары болғандықтан қабылданбады.
- Timeout кезінде автоматты funding confirmation — дәлелсіз қаржылық міндеттеме тудыруы мүмкін болғандықтан қабылданбады.
- Бір request үшін бірнеше lender — double-funding және күрделі ledger себебінен MVP-ден шығарылды.
