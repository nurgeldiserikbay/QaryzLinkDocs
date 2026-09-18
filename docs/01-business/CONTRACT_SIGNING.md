# Contract draft және dual acknowledgement

Бұл кезең accepted proposal-ды тараптарға ортақ, өзгермейтін шарт нұсқасына айналдырады. Платформа қарызды өзі бермейді және ақша қозғалысын тіркемейді; ол тек келісілген талаптардың дәлелді нұсқасын сақтайды.

## Негізгі бизнес ережесі

~~~mermaid
flowchart TD
    A["Proposal ACCEPTED"] --> G{"Contract бар ма?"}
    G -->|Иә| X["Қайта draft жасауға болмайды"]
    G -->|Жоқ| V["ContractVersion v1 + SHA-256 hash"]
    V --> S["PENDING_SIGNATURES / SIGNING"]
    S --> B["Borrower acknowledgement"]
    S --> L["Lender acknowledgement"]
    B --> W["1/2 signatures"]
    L --> W
    W -->|2 distinct parties| D["SIGNED"]
    D --> F["Funding evidence кезеңі"]
~~~

- Proposal.status = ACCEPTED және Proposal.contract бос болуы тиіс.
- Шарт нұсқасы proposal-дың termsSnapshot, сомасы, валютасы және екі party ID мәндерінен canonical hash арқылы есептеледі.
- Екі тараптың тек нақты party жазбасы жарамды; басқа аккаунт үшін жауап бірдей жасырын CONTRACT_FORBIDDEN қатесіне түседі.
- Бір тараптың қайталап, сол hash-пен жіберуі қауіпсіз retry; басқа hash — conflict.
- SIGNED мәртебесі қаржы берілді дегенді білдірмейді.

## API

| Әрекет | Endpoint | Нәтиже |
|---|---|---|
| Draft | POST /api/v1/contracts/from-proposal/{proposalId} | PENDING_SIGNATURES, version 1, documentHash |
| Read | GET /api/v1/contracts/{contractId} | Тек borrower/lender үшін privacy-safe view |
| Acknowledge | POST /api/v1/contracts/{contractId}/sign | Біріншіде pending, екіншісінде SIGNED |

Acknowledge body:

~~~json
{"documentHash":"64 hexadecimal characters"}
~~~

## Деректер байланысы

~~~mermaid
erDiagram
    PROPOSAL ||--o| CONTRACT : creates
    CONTRACT ||--|{ CONTRACT_VERSION : contains
    CONTRACT_VERSION ||--o{ CONTRACT_SIGNATURE : receives
    PARTY ||--o{ CONTRACT_SIGNATURE : makes
    CONTRACT {
      uuid id
      uuid proposalId
      enum status
      bigint principalMinor
      char currency
    }
    CONTRACT_VERSION {
      uuid id
      int version
      enum status
      string documentHash
      json termsSnapshot
    }
    CONTRACT_SIGNATURE {
      uuid id
      uuid partyId
      string method
      datetime signedAt
    }
~~~

## Құпиялылық

API response ішіне email, телефон, ЖСН, құжат object key және басқа PII кірмейді. Қатысушы рөлі (BORROWER/LENDER), шарт статусы, сома, валюта, hash, terms snapshot және растау уақыты ғана беріледі. Құқықтық немесе identity verification талабы кейін country-pack және legal gate арқылы қосылады.

## Acceptance criteria

- Қабылданбаған, мерзімі өткен немесе бұрын шарт жасалған proposal draft болмайды.
- Бірінші растаудан кейін contract PENDING_SIGNATURES болып қалады.
- Екінші нақты тарап дәл сол hash-пен растағанда ғана contract SIGNED болады.
- Қате hash, бөгде party және қайта жазу әрекеті өзгермейтін API қатесімен тоқтайды.
- Funding confirmation болмаған кезде contract ACTIVE болмайды.
