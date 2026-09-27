# Repayment reminders

Repayment reminders — borrower-ға schedule due/overdue күйі туралы privacy-safe notification intent жасайтын MVP slice.

Бұл механизм төлем жасамайды, банк шотына қол жеткізбейді және overdue күйін жарияламайды.

## MVP cadence

Әр latest ScheduleItem үшін:

- due UTC calendar day келгенде бір рет `REPAYMENT_DUE`;
- due day өтіп, item әлі толық жабылмаса бір рет `REPAYMENT_OVERDUE`.

Әр event/channel комбинациясы stable idempotency key қолданады. Notification scheduler қанша рет іске қосылса да сол item/event/channel үшін duplicate outbox row пайда болмайды.

MVP-де күн сайын немесе агрессивті қайталанатын overdue reminder жоқ. Кейінгі cadence өзгерісі product/legal review арқылы versioned болуы керек.

## Eligibility

Reminder generator тек:

- Contract `ACTIVE`;
- Funding `CONFIRMED`;
- latest ScheduleVersion;
- `PAID` және `CANCELLED` емес item;
- `paidMinor < principal + interest + charge`

шарттарын өтетін schedule item-дерді қарайды.

Future schedule item reminder алмайды.

## Channels

Borrower үшін:

1. `IN_APP` — әрқашан intent жасалады;
2. `EMAIL` — existing privacy preference арқылы opt-out жасалуы мүмкін.

Email destination outbox payload-қа сақталмайды. Delivery кезінде verified active destination resolver арқылы уақытша анықталады.

## Privacy-safe payload

Reminder outbox payload тек:

- contractId;
- scheduleItemId;
- dueDate;
- normalized state (`DUE` немесе `OVERDUE`)

қамтиды.

Payload-та amount, email, phone, IIN/BIN, evidence object key, bank details, receipt contents немесе dispute description болмайды.

## Scheduler integration

Existing `pnpm notifications:run` one-shot command мына ретпен орындалады:

~~~mermaid
flowchart LR
    A["Materialize due/overdue"] --> B["Generate reminder intents"]
    B --> C["Claim outbox batch"]
    C --> D["Resolve destination"]
    D --> E["Deliver / retry"]
~~~

Due status materialization reminder scan-нан бұрын жүреді. Reminder generator latest schedule version-ды ғана қарайды.

## Event semantics

| Event | Recipient | Trigger | Aggregate |
|---|---|---|---|
| REPAYMENT_DUE | Borrower | Item due date = current UTC day және outstanding > 0 | SCHEDULE_ITEM |
| REPAYMENT_OVERDUE | Borrower | Item due date < current UTC day және outstanding > 0 | SCHEDULE_ITEM |

Reminder financial/legal truth емес. Қарыздың нақты балансы schedule/ledger/confirmed payment state арқылы анықталады.

## Operational limits

- Email delivery `MAIL_ENABLED` және provider readiness-ке тәуелді.
- In-app row durable outbox lifecycle арқылы жеткізіледі.
- Delivery retry notification worker policy-іне бағынады.
- GitHub Actions quota/billing gate шешілмейінше жаңа reminder slice automated CI quality gate арқылы қайта тексерілуі керек.
