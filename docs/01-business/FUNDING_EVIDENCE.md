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
- Object key, email, телефон, ЖСН және құжат деректері response-та шығарылмайды.
- SHA-256 және media type validation бар; қабылданатын форматтар PDF, JPEG, PNG.
- Лендор ғана evidence жібереді; borrower ғана confirmation береді.
- Funding deadline өткенде автоматты CONFIRMED болмайды.
- Бірдей evidence hash қайталанса, операция idempotent view қайтарады.

## Acceptance criteria

- Signed емес contract funding evidence қабылдамайды.
- Lender evidence жібермейінше borrower confirmation ашылмайды.
- Borrower CONFIRM бергенде ғана Contract ACTIVE болады.
- DISPUTE reason-сыз қабылданбайды.
- Deadline өткеннен кейін confirmation ACTIVE жасамайды.
