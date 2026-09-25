# Funding evidence және borrower confirmation

Бұл кезең қол қойылған шартты ақша берілген деп автоматты түрде санамайды. Қарыз беруші аударым түбіртегін сыртқы private storage-ке жүктейді, платформаға оның метадеректері мен SHA-256 хэшін береді, ал қарыз алушы растау немесе dispute шешімін қабылдайды.

## Күй ағымы

~~~mermaid
stateDiagram-v2
    [*] --> EVIDENCE_REQUIRED
    EVIDENCE_REQUIRED --> AWAITING_CONFIRMATION: lender submits metadata
    AWAITING_CONFIRMATION --> CONFIRMED: borrower confirms
    AWAITING_CONFIRMATION --> DISPUTED: borrower disputes
    AWAITING_CONFIRMATION --> CONFIRMATION_OVERDUE: deadline passes
    CONFIRMED --> [*]
    DISPUTED --> [*]
    CONFIRMATION_OVERDUE --> [*]
    REJECTED --> [*]
~~~

Шарт күйлерімен байланыс:

~~~mermaid
flowchart LR
    S["Contract SIGNED"] --> E["Funding EVIDENCE_REQUIRED"]
    E --> A["AWAITING_CONFIRMATION"]
    A -->|CONFIRM| C["Funding CONFIRMED"]
    C --> ACTIVE["Contract ACTIVE"]
    A -->|DISPUTE| D["Funding DISPUTED / Contract DISPUTED"]
    A -->|deadline| X["EXPIRED_UNFUNDED"]
~~~

## API

| Әрекет | Endpoint | Рөл | Нәтиже |
|---|---|---|---|
| Evidence metadata | POST /api/v1/funding/contracts/{contractId}/evidence | Lender | AWAITING_CONFIRMATION |
| Funding view | GET /api/v1/funding/contracts/{contractId} | Екі тарап | Evidence/status view |
| Confirmation | POST /api/v1/funding/{fundingId}/decision | Borrower | CONFIRMED немесе DISPUTED |

Evidence body:

~~~json
{
  "intentId": "11111111-1111-4111-8111-111111111111",
  "objectKey": "funding/receipt-uuid",
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

## Қауіпсіздік

- Файлдың байты API арқылы қабылданбайды; object key ішкі storage-ке ғана сілтейді.
- Evidence metadata бір реттік `intentId`-пен байланысады. Intent дәл сол user + contract + FUNDING purpose + objectKey + SHA-256 + media type үшін шығарылған, мерзімі өтпеген және бұрын қолданылмаған болуы тиіс.
- Intent consume және funding evidence persistence бір database transaction ішінде орындалады; persistence rollback болса intent те consumed болып қалмайды.
- Object key, email, телефон, ЖСН және құжат деректері response-та шығарылмайды.
- SHA-256 және media type validation бар; қабылданатын форматтар PDF, JPEG, PNG.
- Лендор ғана evidence жібереді; borrower ғана confirmation береді.
- Funding deadline өткенде автоматты CONFIRMED болмайды.
- Бірдей evidence hash қайталанса, операция idempotent view қайтарады.

## Upload intent rollout күйі

Backend persisted single-use intent-ті consume етеді, бірақ client-facing issuance endpoint және нақты private-storage signed upload adapter әлі аяқталмаған. Сондықтан `EVIDENCE_STORAGE_ENABLED` operational storage тексерілмей production-да қосылмайды.

## Acceptance criteria

- Signed емес contract funding evidence қабылдамайды.
- Lender evidence жібермейінше borrower confirmation ашылмайды.
- Borrower CONFIRM бергенде ғана Contract ACTIVE болады.
- DISPUTE reason-сыз қабылданбайды.
- Deadline өткеннен кейін confirmation ACTIVE жасамайды.
