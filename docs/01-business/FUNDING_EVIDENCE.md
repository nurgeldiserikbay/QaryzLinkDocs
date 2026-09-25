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
| Upload intent | POST /api/v1/evidence/upload-intents | Lender | Single-use intent + server-generated objectKey |
| Evidence metadata | POST /api/v1/funding/contracts/{contractId}/evidence | Lender | AWAITING_CONFIRMATION |
| Funding view | GET /api/v1/funding/contracts/{contractId} | Екі тарап | Evidence/status view |
| Evidence download | POST /api/v1/evidence/{evidenceId}/download | Екі тарап | Short-lived signed GET authorization |
| Confirmation | POST /api/v1/funding/{fundingId}/decision | Borrower | CONFIRMED немесе DISPUTED |

Upload intent body:

~~~json
{
  "contractId": "contract-uuid",
  "purpose": "FUNDING",
  "sha256": "64 hexadecimal characters",
  "sizeBytes": 4096,
  "mediaType": "application/pdf"
}
~~~

Server objectKey-ді өзі жасайды; client arbitrary key таңдамайды. Endpoint тек verified lender және funding қабылдайтын contract state үшін intent шығарады. Storage signer configured болса response құрамында қысқа мерзімді `upload` authorization (`PUT`, URL, required headers, expiresAt) болады.

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
- Evidence metadata бір реттік `intentId`-пен байланысады. Intent дәл сол user + contract + FUNDING purpose + objectKey + SHA-256 + media type + expected size үшін шығарылған, мерзімі өтпеген және бұрын қолданылмаған болуы тиіс.
- Intent consume және funding evidence persistence бір database transaction ішінде орындалады; persistence rollback болса intent те consumed болып қалмайды.
- Metadata persistence алдында storage object authenticated user/contract/FUNDING prefix-іне жатуы, SHA-256/media type/size дәл сәйкесуі және malware scan күйі `CLEAN` болуы тиіс. Missing, mismatched немесе non-clean object `EVIDENCE_OBJECT_NOT_VERIFIED` арқылы қабылданбайды.
- Object key, email, телефон, ЖСН және құжат деректері list/view response-та шығарылмайды. Evidence binary-ге қолжетімділік тек contract borrower/lender үшін қысқа мерзімді signed GET authorization арқылы беріледі; outsider және unknown evidence бірдей `EVIDENCE_NOT_FOUND` береді.
- SHA-256, media type және expected file size validation бар; жаңа intent configured upload limit-тен үлкен файлға берілмейді. қабылданатын форматтар PDF, JPEG, PNG.
- Лендор ғана evidence жібереді; borrower ғана confirmation береді.
- Funding deadline өткенде автоматты CONFIRMED болмайды.
- Бірдей evidence hash қайталанса, операция idempotent view қайтарады.

## Upload intent rollout күйі

Backend persisted single-use intent-ті шығарады және consume етеді. Provider-neutral signed upload authorization boundary бар, бірақ нақты private-storage signer әлі configured емес; әдепкі adapter fail-closed жұмыс істеп `EVIDENCE_STORAGE_UNAVAILABLE` қайтарады. QaryzLinkBack PR #100 provider-neutral object inspection/verifier boundary қосты. Әдепкі inspector unavailable болғандықтан нақты storage metadata/hash/size inspection және malware scan provider integration әлі operational gate болып қалады. Сондықтан `EVIDENCE_STORAGE_ENABLED` concrete signer + inspector/scanner staging-та дәлелденбей production-да қосылмайды.

## Acceptance criteria

- Signed емес contract funding evidence қабылдамайды.
- Lender evidence жібермейінше borrower confirmation ашылмайды.
- Borrower CONFIRM бергенде ғана Contract ACTIVE болады.
- DISPUTE reason-сыз қабылданбайды.
- Deadline өткеннен кейін confirmation ACTIVE жасамайды.
