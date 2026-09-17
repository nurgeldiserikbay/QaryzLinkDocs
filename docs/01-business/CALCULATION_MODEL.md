# Calculation Model

## 1. Мақсат

Бұл құжат schedule, interest, balance, early repayment және overdue есептерінің canonical моделін анықтайды. Қазақстанға арналған нақты шектер CountryPack және заңгерлік review арқылы бекітіледі.

## 2. Money

- amount integer minor unit түрінде;
- KZT үшін 1 теңге = 100 тиын;
- floating point қолданылмайды;
- әр операция currency-мен бірге;
- rounding mode policy version-да сақталады;
- UI rounded total мен detailed calculation-ды көрсетеді.

## 3. CalculationPolicy

~~~mermaid
flowchart TD
    P["Principal"] --> C["Calculation Policy"]
    R["Rate"] --> C
    T["Dates / term"] --> C
    S["Schedule type"] --> C
    D["Day-count basis"] --> C
    C --> I["Installments"]
    C --> B["Balance projection"]
    C --> X["Explanation breakdown"]
~~~

Policy параметрлері:

- method: INTEREST_FREE / SIMPLE / ANNUITY / EQUAL_PRINCIPAL / CUSTOM;
- annual rate;
- day-count convention;
- accrual start;
- payment frequency;
- due-date adjustment;
- rounding mode;
- payment allocation order;
- early repayment behavior;
- grace period;
- late charge rule;
- country rule version.

## 4. Interest-free

әр installment principal бөлігін ғана қамтиды:

total interest = 0  
outstanding principal = confirmed funded principal − confirmed principal allocations

## 5. Simple interest

Базалық формула:

interest = outstanding principal × annual rate × accrual days / day-count basis

Day-count basis 365/366/360 мәндерінің бірі болуы мүмкін, бірақ contract және rule нақты мәнді бекітуі тиіс.

## 6. Annuity

Periodic rate r, installment count n және principal P үшін:

payment = P × r × (1 + r)^n / ((1 + r)^n − 1)

Соңғы installment rounding difference-ті жабады. Rate conversion және compounding frequency policy-де explicit болуы керек.

## 7. Equal principal

principal part = original principal / installment count

Әр кезеңнің interest бөлігі сол кезең басындағы outstanding principal бойынша есептеледі.

## 8. Custom schedule

Custom schedule-де әр item principal/interest бөліктері алдын ала көрсетіледі. Validator:

- total principal allocation = funded principal;
- negative amount жоқ;
- due dates monotonic;
- interest/fee country rule-ға сай;
- final projected balance = 0.

## 9. Accrual start

~~~mermaid
flowchart LR
    S["Contract signed"] --> W["Waiting funding"]
    W --> F["Funding confirmed"]
    F --> A["Interest accrual starts"]
~~~

Default қағида: accrual FundingConfirmed effective date-тан басталады. Contract қол қойылған күн автоматты accrual date емес.

## 10. Payment allocation

Allocation order hardcode жасалмайды. Policy мысалы:

1. allowed overdue charges;
2. accrued interest;
3. principal;
4. future amount/credit balance.

Нақты тәртіп legal review және contract арқылы versioned болады.

## 11. Partial payment

- received amount confirmed болғанша balance-қа әсер етпейді;
- confirmed amount allocation policy бойынша бөлінеді;
- schedule item PARTIALLY_PAID болуы мүмкін;
- қалған due amount сақталады;
- overpayment credit balance немесе principal prepayment ретінде policy бойынша өңделеді.

## 12. Early repayment

Екі режим:

- REDUCE_TERM — installment шамасы сақталып, мерзім қысқарады;
- REDUCE_PAYMENT — мерзім сақталып, төлем азаяды.

~~~mermaid
flowchart TD
    A["Early repayment amount"] --> B["Confirm payment"]
    B --> C{"Policy"}
    C -->|Reduce term| D["New shorter schedule"]
    C -->|Reduce payment| E["New lower installments"]
    D --> F["ScheduleVersion +1"]
    E --> F
~~~

Ескі schedule өшірілмейді.

## 13. Overdue

overdue amount = due confirmed obligation − confirmed allocations

Overdue days timezone және due-date adjustment rule арқылы есептеледі. Penalty/late charge legal rule жоқ кезде 0 немесе warning/manual review болады.

## 14. Reversal

Confirmed payment қате болса:

- original Payment өзгермейді;
- ReversalPayment original ID-ға сілтейді;
- кері ledger entries жазылады;
- balance қайта құрылады;
- audit reason міндетті.

## 15. Schedule determinism

Бірдей:

- contract version;
- confirmed funding events;
- calculation policy version;
- payment events;
- effective date inputs

бірдей schedule және balance беруі керек. Input hash schedule_versions кестесінде сақталады.

## 16. Тестілеу

- zero rate;
- one installment;
- leap year;
- month-end dates;
- partial funding;
- multiple funding tranches;
- partial payment;
- early repayment;
- overpayment;
- reversal;
- amendment;
- overdue + grace;
- rounding accumulation;
- very large safe integer boundary;
- idempotent replay.

## 17. Ашық шешімдер

Implementation алдында бекітіледі:

- Қазақстан MVP day-count basis;
- rounding HALF_UP/HALF_EVEN;
- due date демалысқа түскендегі ереже;
- payment allocation legal order;
- multi-tranche accrual;
- late charge formula;
- tax disclosure;
- maximum supported term/rate.
