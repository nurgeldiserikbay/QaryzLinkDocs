# Start here

Бұл бет QaryzLink-ті алғаш рет түсінуге арналған қысқа карта.

## QaryzLink деген не?

QaryzLink — екі тарап арасындағы қарыз/міндеттеме lifecycle-ін жүйелі түрде жүргізуге арналған privacy-first платформа.

Негізгі қағида: **бір тарап енгізген жазба екінші тарап растағанша ортақ расталған қарыз болып саналмайды.**

## Негізгі рөлдер

### Borrower

Borrower:
- қажетті соманы және мерзімді request ретінде көрсетеді;
- lender ұсынған нақты шарттарды қарайды;
- final proposal-ды explicit түрде қабылдайды немесе қабылдамайды;
- funding receipt, repayments және closure кезеңдеріне қатысады.

### Lender

Lender:
- нақты қаржылық шарттарды ұсынады;
- deadline және repayment шарттарын бекітеді;
- funding evidence береді;
- borrower payment evidence-ін растайды немесе дауласады;
- closure-ға қатысады.

## Негізгі lifecycle

1. **Request** — borrower қажеттілік/мақсат параметрлерін көрсетеді.
2. **Proposal** — lender нақты шарттарын ұсынады.
3. **Acceptance** — borrower final terms-ті қабылдайды.
4. **Contract** — immutable contract version жасалады.
5. **Signing** — міндетті тараптар contract-ты растайды.
6. **Funding** — ақша платформадан тыс беріледі, evidence қосылады.
7. **Funding confirmation** — borrower ақша алғанын растайды.
8. **Schedule** — confirmed funding-тан кейін repayment schedule іске қосылады.
9. **Repayment** — төлемдер evidence + counterparty confirmation арқылы ledger-ге кіреді.
10. **Closure** — баланс нөлге жетіп, final statement екі тараппен бекітіледі.

## Ең маңызды инварианттар

- Signed != Funded.
- Uploaded evidence != Confirmed event.
- BorrowerRequest != ContractTerms.
- Public profile != Legal identity.
- Confirmed financial history үнсіз өзгермейді.
- Correction reversal/amendment арқылы versioned түрде жасалады.
- Платформа MVP-де пайдаланушы қаражатын ұстамайды.

## Қай құжатты қашан оқу керек?

| Сұрақ | Құжат |
|---|---|
| Өнімнің мақсаты қандай? | [Product overview](PRODUCT_OVERVIEW.md) |
| Толық бизнес логика қалай жүреді? | [Business logic](../01-business/BUSINESS_LOGIC.md) |
| State-тер қалай өзгереді? | [State machines](../01-business/STATE_MACHINES.md) |
| Front/Back/Admin қалай байланысады? | [System architecture](../02-architecture/SYSTEM_ARCHITECTURE.md) |
| DB модель қандай? | [Data model](../02-architecture/DATA_MODEL.md) |
| Privacy/security қалай құрылған? | [Privacy & security](../03-security/PRIVACY_SECURITY.md) |
| Серверге қалай саламын? | [Deployment portal](../06-operations/DEPLOYMENT_PORTAL.md) |
| Қазіргі дайындық қандай? | [Implementation status](../04-delivery/IMPLEMENTATION_STATUS.md) |
| Production алдында не істеу керек? | [Final release handoff](../06-operations/FINAL_RELEASE_HANDOFF.md) |

## Репозиторийлер

- **QaryzLinkFront** — public landing және user application.
- **QaryzLinkBack** — API, domain logic, database, workers, integrations.
- **QaryzLinkAdmin** — internal support/moderation/compliance surface.
- **QaryzLinkDocs** — canonical product/engineering documentation.

## Келесі оқу

Алдымен [Business logic](../01-business/BUSINESS_LOGIC.md), содан кейін [System architecture](../02-architecture/SYSTEM_ARCHITECTURE.md) оқыған дұрыс.
