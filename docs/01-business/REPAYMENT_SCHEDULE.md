# Repayment schedule

Бұл кезең Funding CONFIRMED болғаннан кейін өтеу міндеттемесінің алғашқы детерминистік көрінісін жасайды. Ол ақша қабылдамайды, төлемді растамайды және банктік аударымды орындамайды.

## Негізгі бизнес ағымы

~~~mermaid
stateDiagram-v2
    [*] --> NOT_READY
    NOT_READY --> GENERATABLE: Contract ACTIVE + Funding CONFIRMED
    GENERATABLE --> GENERATED: generate
    GENERATED --> GENERATED: same inputHash
    GENERATED --> [*]
~~~

- Contract ACTIVE және Funding CONFIRMED болмаса, генерация қабылданбайды.
- Кесте exact signed `Contract.currentVersion -> ContractVersion.termsSnapshot` және Funding effectiveAt арқылы есептеледі.
- Қайта шақыру сол inputHash үшін бұрынғы нұсқаны қайтарады.
- Кестені оқу тек lender немесе borrower тараптарына ашық.

## Есептеу саясаты

| Өріс | MVP ережесі |
|---|---|
| Principal | minor unit ретінде BigInt |
| Rate | жылдық basis points (annualRateBps), 100 bps = 1% |
| Day count | ACT/365 Fixed |
| Rounding | HALF_UP, ең кіші ақша бірлігіне |
| Item shape | Бір AT_MATURITY item |
| Due date | UTC күнтізбесі: effectiveAt + termDays |
| Policy id | ACT_365_FIXED_HALF_UP_V1 |

Пайыздың концептуалдық формуласы:

interestMinor = HALF_UP(principalMinor × annualRateBps × termDays / (365 × 10000))

dueTotalMinor = principalMinor + interestMinor + chargeMinor

Бұл кезеңде chargeMinor = 0; айыппұл, комиссия және бөлшек төлем кейінгі versioned policy болады.

## API

| Әрекет | Endpoint | Рөл | Нәтиже |
|---|---|---|---|
| Generate | POST /api/v1/schedules/contracts/{contractId}/generate | Екі тарап | ScheduleVersion |
| Read | GET /api/v1/schedules/contracts/{contractId} | Екі тарап | Соңғы кесте |

Response-тағы item негізгі өрістері: sequence, dueDate, principalMinor, interestMinor, chargeMinor, paidMinor, status.

## Дерек моделі

~~~mermaid
erDiagram
    CONTRACT ||--o{ SCHEDULE_VERSION : has
    SCHEDULE_VERSION ||--o{ SCHEDULE_ITEM : contains
    SCHEDULE_VERSION {
        uuid id
        int version
        string policyVersion
        string inputHash
        int sourceContractVersion
        uuid sourceAmendmentId
    }
    SCHEDULE_ITEM {
        int sequence
        date dueDate
        bigint principalMinor
        bigint interestMinor
        bigint chargeMinor
        bigint paidMinor
        string status
    }
~~~

## Version source және amendment

Schedule generation unsigned/draft contract version-нан terms алмайды. Current version міндетті түрде `SIGNED` және documentHash-bound.

Financial amendment activation жаңа ScheduleVersion жасаса, ол `sourceContractVersion` және `sourceAmendmentId` provenance сақтайды. Same signed contract version + funding effectiveAt + financial terms + policy бірдей inputHash береді.

Historical ScheduleVersion және PaymentAllocation rewrite болмайды.

## Келесі шекара

Post-payment financial amendment actual cutover earned/unearned interest және historical allocation semantics үшін бөлек accounting/legal policy талап етеді. Overdue calculation background worker арқылы жасалады. Бұл schedule slice платформаның заңды шешімі немесе qualified electronic signature болып саналмайды.
