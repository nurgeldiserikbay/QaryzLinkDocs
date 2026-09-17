# Calculation Model

## 1. Мақсат

Бұл құжат schedule, interest, balance, early repayment және overdue есептерінің canonical моделін анықтайды. MVP defaults [ADR-0004](../../adr/ADR-0004-kz-private-mvp-defaults.md) арқылы бекітілді; заңдық шектер CountryPack арқылы кейін нұсқаланады.

## 2. Money

- amount integer minor unit түрінде;
- KZT үшін 1 теңге = 100 тиын;
- floating point қолданылмайды;
- rounding mode: `HALF_UP`;
- әр операция currency және calculation policy version-мен бірге сақталады;
- соңғы installment жинақталған rounding difference-ті жабады.

## 3. MVP CalculationPolicy

| Параметр | MVP мәні |
|---|---|
| Methods | `INTEREST_FREE`, `SIMPLE` |
| Day count | `ACT_365_FIXED` |
| Accrual start | `FundingConfirmed.effectiveAt` |
| Funding | Бір tranche |
| Due-date adjustment | `NONE` |
| Rounding | `HALF_UP` |
| Late charge | `DISABLED` / 0 |
| Early repayment | `REDUCE_TERM` default |
| Allocation | allowed charge → interest → principal → credit |

Annuity, equal-principal, custom schedule және multi-tranche модельдері schema/domain extension ретінде сақталады, бірақ MVP production flow-ына кірмейді.

## 4. Interest-free

`total interest = 0`

`outstanding principal = confirmed funded principal − confirmed principal allocations`

## 5. Simple interest

`interest = outstanding principal × annual rate × actual accrual days / 365`

Annual rate basis points түрінде сақталады. Есеп аралық мәндерде жеткілікті precision қолданып, ақшаға айналдырғанда `HALF_UP` қолданылады.

## 6. Accrual start

~~~mermaid
flowchart LR
    S["Contract signed"] --> W["Waiting funding"]
    W --> F["Funding confirmed"]
    F --> A["Interest accrual starts"]
~~~

Contract қол қойылған күн accrual date емес. Funding екі тараппен расталмайынша balance өспейді.

## 7. Payment allocation

1. заңмен рұқсат етілген және шартта көрсетілген charge;
2. accrued interest;
3. principal;
4. credit balance.

MVP-де penalty disabled, сондықтан қалыпты allocation: interest → principal → credit. Policy version contract version-мен бірге бекітіледі.

## 8. Partial payment

- payment екі тараппен расталғанша balance-қа әсер етпейді;
- confirmed amount allocation policy бойынша бөлінеді;
- schedule item `PARTIALLY_PAID` болуы мүмкін;
- қалған due amount сақталады;
- overpayment credit balance немесе early repayment ретінде өңделеді.

## 9. Early repayment

~~~mermaid
flowchart TD
    A["Early repayment submitted"] --> B["Other party confirms"]
    B --> C["Allocate principal"]
    C --> D["Recalculate with REDUCE_TERM"]
    D --> E["ScheduleVersion +1"]
~~~

Екі тарап басқа режимді amendment арқылы таңдамаған болса, installment мөлшері сақталып, мерзім қысқарады. Ескі schedule өшірілмейді.

## 10. Due dates және overdue

Contract-тағы due date пайдаланушы timezone-ындағы calendar date ретінде сақталады және демалыс/мереке себебінен автоматты жылжымайды.

`overdue amount = due confirmed obligation − confirmed allocations`

Late charge MVP-де 0. UI overdue status пен күн санын көрсетеді, бірақ заңдық қорытындысыз айыппұл қоспайды.

## 11. Reversal

Confirmed payment қате болса:

- original Payment өзгермейді;
- ReversalPayment original ID-ға сілтейді;
- кері ledger entries жазылады;
- balance қайта құрылады;
- audit reason міндетті.

## 12. Determinism

Бірдей contract version, funding events, calculation policy version, payment events және effective date inputs бірдей schedule/balance беруі тиіс. Input hash `schedule_versions` кестесінде сақталады.

## 13. Міндетті тесттер

- interest-free және simple interest;
- leap year under ACT/365 fixed;
- one installment және month-end;
- partial payment және overpayment;
- early repayment;
- reversal және amendment;
- overdue without penalty;
- rounding accumulation;
- safe integer boundary;
- idempotent replay.

## 14. Legal gate арқылы ғана ашылатын мүмкіндіктер

- penalty/late charge;
- production rate/term limits;
- public marketplace calculation display;
- tax disclosure;
- legal payment allocation overrides;
- multi-tranche interest.
