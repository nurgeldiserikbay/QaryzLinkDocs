# Contract closure and final statement

Contract closure — расталған төлемдердің нәтижесінде міндеттеме нөлге түскеннен кейін екі тараптың бірдей final statement-ті explicit растауы арқылы Contract-ті `COMPLETED` күйіне ауыстыратын MVP workflow.

Бұл workflow ақша аудармайды, төлемді өзі жасамайды және бір тараптың мәлімдемесін екінші тарапқа автоматты түрде міндеттемейді.

## Негізгі қағида

`PAID schedule != closed debt`.

Contract тек барлық closure guard орындалып, borrower мен lender **бірдей statement hash**-ті растағанда ғана жабылады.

## Closure readiness

Backend closure view жасау кезінде мына шарттарды тексереді:

1. Contract `ACTIVE`.
2. Funding `CONFIRMED`.
3. Repayment schedule бар.
4. Schedule бойынша outstanding balance = 0.
5. `SUBMITTED`, `AWAITING_CONFIRMATION` немесе `DISPUTED` payment жоқ.
6. Confirmed payment ішінде unresolved `unallocatedMinor > 0` credit жоқ.
7. Dispute жоқ немесе оның status-ы `RESOLVED` / `CLOSED`.

Кез келген guard орындалмаса closure confirmation қабылданбайды.

## Final statement hash

Final statement hash canonical aggregate snapshot-тен SHA-256 арқылы есептеледі:

- contract id;
- currency;
- original principal;
- current contract version;
- contract document hash;
- latest schedule version;
- schedule input hash;
- total schedule due;
- total schedule paid;
- confirmed payment total.

Evidence object key, contact, email, phone, dispute description немесе басқа sensitive payload hash input-қа кірмейді.

Statement өзгерсе hash те өзгереді. Осылайша бірінші тарап растағаннан кейін payment/reversal/schedule truth өзгерсе, екінші тарап ескі hash-пен жаба алмайды.

## Confirmation flow

~~~mermaid
sequenceDiagram
    participant B as Borrower
    participant Q as QaryzLink
    participant L as Lender

    B->>Q: GET closure
    Q-->>B: final statement + hash
    B->>Q: confirm(statementHash)
    Q-->>B: 1/2 confirmed

    L->>Q: GET closure
    Q-->>L: same final statement + hash
    L->>Q: confirm(same statementHash)

    Q->>Q: re-check readiness under contract lock
    Q->>Q: Contract -> COMPLETED
    Q->>Q: persist ClosureCertificate
    Q-->>L: completed
~~~

Confirmation contract + party + statementHash бойынша idempotent.

## API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/contracts/:contractId/closure` | Participant final statement/readiness |
| POST | `/api/v1/contracts/:contractId/closure/confirm` | Exact statement hash-ті растау |

Confirm body:

~~~json
{
  "statementHash": "64 lowercase/uppercase hexadecimal characters"
}
~~~

Backend hash-ті current canonical statement-пен салыстырады. Stale hash `CLOSURE_STATEMENT_MISMATCH` қайтарады.

## Closure certificate

Екінші distinct party бірдей statement hash-ті растағанда бір transaction ішінде:

1. Contract `COMPLETED` болады.
2. `completedAt` бекітіледі.
3. Immutable `ClosureCertificate` жасалады.
4. Audit trail-ге closure completion жазылады.

Certificate aggregate snapshot ретінде мыналарды сақтайды:

- statement hash;
- contract version және document hash;
- schedule version және input hash;
- principal;
- total due;
- total paid;
- confirmed payment total;
- completed timestamp.

Certificate legal enforcement немесе нотариалдық құжаттың орнына жүрмейді; ол платформаның сол сәттегі versioned financial state snapshot-ы.

## Concurrency және stale-state қорғанысы

Confirmation transaction contract row-ды `FOR UPDATE` lock арқылы serialize етеді.

Сондықтан payment confirmation, reversal немесе басқа contract-mutating flow closure-мен қатар race жасағанда final state transaction boundary-де қайта есептеледі.

Бірінші confirmation-нан кейін truth өзгерсе бұрынғы confirmation жойылмайды, бірақ жаңа statement hash үшін есептелмейді.

## Privacy және audit

Participant closure response тек aggregate financial state, statement hash, confirmation role/time және certificate metadata қайтарады.

Audit payload statement hash-пен шектеледі. Contact data, evidence object, payment evidence немесе dispute description audit payload-қа қосылмайды.

## MVP шекарасы

Бұл slice:

- full repayment closure;
- dual confirmation;
- deterministic final statement;
- immutable certificate snapshot

қамтиды.

ClosureCertificate жасалғаннан кейін participant Phase 2 [evidence summary/manifest](EVIDENCE_SUMMARY.md) baseline-ын бір рет freeze ете алады. Бұл JSON manifest PDF/ZIP немесе court-ready package емес.

Settlement арқылы disputed debt closure, legal PDF certificate, qualified signature/EDS, external trusted timestamp және court-oriented evidence export кейінгі Trust & Evidence кезеңіне жатады.


## Closure notifications

Closure lifecycle екі privacy-safe event шығарады:

- `CONTRACT_CLOSURE_READY` — contract closure guard-тардан өтіп, final statement растауға дайын болғанда;
- `CONTRACT_COMPLETED` — екі distinct party бірдей final statement hash-ті растағаннан кейін Contract `COMPLETED` болып, ClosureCertificate жасалғанда.

`CONTRACT_CLOSURE_READY` GET endpoint side effect-і емес. Ол notification runtime scan арқылы жасалады; бірінші explicit closure confirmation да дәл сол idempotent readiness intents-ті transaction ішінде қамтамасыз етеді.

`CONTRACT_COMPLETED` intents Contract status update және ClosureCertificate creation-мен бір transaction ішінде жазылады. Сондықтан completion state commit болып, notification intent жоғалатын аралық күй болмайды.

Екі event borrower және lender үшін IN_APP channel-ға, ал email preference рұқсат етсе EMAIL channel-ға fan-out жасалады.

Notification payload:

- readiness үшін: contractId + `READY_FOR_CLOSURE`;
- completion үшін: contractId + certificateId + `COMPLETED`.

Amount, email, phone, evidence, bank data, final statement financial fields немесе dispute description notification payload-қа кірмейді.

Readiness scheduler scan 500 бұрын notification алмаған ACTIVE + CONFIRMED candidate contract-ты bounded batch ретінде қарайды. Existing readiness intent бар contract scan-нан шығарылады, сондықтан бір batch-тің бірдей contract-тармен қайта толып, кейінгі contract-тарды starvation-ға ұшыратуына жол берілмейді.
