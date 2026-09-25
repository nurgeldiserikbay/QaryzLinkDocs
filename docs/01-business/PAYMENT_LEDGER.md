# Repayment payments and ledger

Бұл кезең қарыз алушының төлем туралы хабарламасын, қарыз берушінің растауын және расталған соманың кестеге бөлінуін іске асырады. Платформа ақша сақтамайды және банк арқылы аудармайды.

## Күй ағымы

~~~mermaid
stateDiagram-v2
    [*] --> AWAITING_CONFIRMATION
    AWAITING_CONFIRMATION --> CONFIRMED: lender confirms
    AWAITING_CONFIRMATION --> DISPUTED: lender disputes
    CONFIRMED --> [*]
    DISPUTED --> [*]
~~~

Тек CONFIRMED payment schedule balance-ына әсер етеді.

## Негізгі шарттар

- тек Contract ACTIVE және Funding CONFIRMED кезінде жаңа payment қабылданады;
- payment-ті тек borrower жібереді;
- payment-ті тек lender CONFIRM немесе DISPUTE етеді;
- dispute reason кемінде үш таңба болуы керек;
- paidAt болашақ уақыт бола алмайды;
- қайталанған evidence SHA-256 сол payment view-ін қайтарады;
- confirmed payment UPDATE/DELETE арқылы өзгермейді.

## API

| Әрекет | Endpoint | Рөл | Нәтиже |
|---|---|---|---|
| Upload intent | POST /api/v1/evidence/upload-intents | Borrower | Single-use intent + server-generated objectKey |
| Payment evidence | POST /api/v1/payments/contracts/{contractId}/evidence | Borrower | AWAITING_CONFIRMATION |
| Payment list | GET /api/v1/payments/contracts/{contractId} | Екі тарап | Privacy-safe payment views |
| Confirmation | POST /api/v1/payments/{paymentId}/decision | Lender | CONFIRMED немесе DISPUTED |

Upload intent body:

~~~json
{
  "contractId": "contract-uuid",
  "purpose": "PAYMENT",
  "sha256": "64 hexadecimal characters",
  "sizeBytes": 4096,
  "mediaType": "application/pdf"
}
~~~

Server objectKey-ді өзі жасайды; endpoint тек ACTIVE + CONFIRMED funding contract-тағы verified borrower үшін intent шығарады. Storage signer configured болса response құрамында қысқа мерзімді `PUT` upload authorization беріледі.

Evidence body:

~~~json
{
  "intentId": "11111111-1111-4111-8111-111111111111",
  "amountMinor": "150000",
  "paidAt": "2026-09-18T12:00:00.000Z",
  "objectKey": "payments/receipt-uuid",
  "sha256": "64 hexadecimal characters",
  "mediaType": "application/pdf"
}
~~~

Decision body:

~~~json
{
  "decision": "CONFIRM",
  "reason": "optional; required for DISPUTE"
}
~~~

Response-та objectKey қайтарылмайды. Evidence view тек id, SHA-256, media type және createdAt береді.

Evidence submission бір реттік `intentId` талап етеді. Intent authenticated user + contract + PAYMENT purpose + objectKey + SHA-256 + media type + expected size-қа байланған; expired, mismatched немесе replay intent қабылданбайды. Intent consume және payment/evidence persistence бір database transaction ішінде жүреді.

Persistence алдында storage object scope prefix, SHA-256, media type, size және malware scan `CLEAN` күйі бойынша қайта тексеріледі. Missing/mismatched/pending/infected/failed-scan object evidence ретінде сақталмайды.

Intent issuance endpoint және provider-neutral signed upload authorization boundary орындалды. Object verification boundary да орындалды; нақты private-storage signer және inspector/scanner adapter бөлек follow-up болып қалады. Storage operationally verified болмайынша evidence feature gate жабық қалады.

## Allocation саясаты

~~~mermaid
flowchart TD
    P["Confirmed payment"] --> C["Charge"]
    C --> I["Interest"]
    I --> R["Principal"]
    R --> N["Next schedule item"]
    R --> U["Unallocated credit"]
~~~

- schedule item-дер sequence бойынша өңделеді;
- әр item үшін charge → interest → principal;
- paidMinor due total-ға жетсе status PAID;
- жартылай төленсе PARTIALLY_PAID;
- артық сома payment.unallocatedMinor ретінде қалады;
- MVP-де charge және penalty нөлге тең.

## Ledger

Растау транзакциясы бір atomic transaction ішінде:

1. Payment CONFIRMED және confirmedAt сақталады.
2. PaymentAllocation жазбалары жасалады.
3. ScheduleItem paidMinor және status жаңартылады.
4. LedgerEntry DEBIT BORROWER_OBLIGATION және CREDIT LENDER_RECEIVABLE ретінде қосылады.

Бұл ledger нақты банк шоттары емес, міндеттеменің ішкі audit journal-ы.

## Дерек байланысы

~~~mermaid
erDiagram
    CONTRACT ||--o{ PAYMENT : has
    PAYMENT ||--o{ PAYMENT_EVIDENCE : contains
    PAYMENT ||--o{ PAYMENT_ALLOCATION : allocates
    SCHEDULE_ITEM ||--o{ PAYMENT_ALLOCATION : receives
    PAYMENT ||--o{ LEDGER_ENTRY : records
~~~

## Келесі шекара

Келесі slice overdue worker, due-status materialization, notifications және reversal payment болады. Банк интеграциясы, custody және заңды өндіріп алу бөлек legal/operations gate арқылы ғана қосылады.
