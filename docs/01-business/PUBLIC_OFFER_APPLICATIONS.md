# Public offer applications

Бұл құжат Phase 3 public lender offer-ге borrower application flow-ын сипаттайды.

2026-09-27 күйі: backend implementation бар, бірақ бүкіл flow `PUBLIC_MARKETPLACE_ENABLED=false` default-off gate артында. Release preflight marketplace enablement-ті legal gate өтпейінше `fail` деп санайды.

## Flow

~~~mermaid
sequenceDiagram
    participant B as Borrower
    participant Q as QaryzLink
    participant L as Lender
    B->>Q: Existing exact LoanRequest
    L->>Q: Public LoanOffer
    B->>Q: Apply(requestId, offerId)
    Q->>Q: Snapshot offer terms
    Q-->>L: PENDING OfferApplication
    alt Lender rejects
        L->>Q: REJECT
        Q-->>B: Application rejected
    else Borrower withdraws
        B->>Q: WITHDRAW
    else Lender accepts
        L->>Q: ACCEPT
        Q->>Q: Create concrete Proposal from immutable snapshot
        Q-->>B: Proposal PENDING
        B->>Q: Explicit Proposal ACCEPT
        Q->>Q: Request MATCHED
    end
~~~

Lender application-ды ACCEPT еткенде Contract жасалмайды.

Concrete Proposal жасалады; borrower оны existing Proposal decision flow арқылы бөлек explicit ACCEPT етуі тиіс.

## Preconditions

Application жасау үшін:

- `PUBLIC_MARKETPLACE_ENABLED=true`;
- borrower active verified KZ personal account;
- lender active verified KZ personal account;
- borrower өзіне тиесілі ACTIVE request береді;
- request осы slice-та exact болуы тиіс:
  - `amountMinMinor = amountMaxMinor`;
  - `termMinDays = termMaxDays`;
- offer ACTIVE + PUBLIC;
- borrower offer owner емес;
- request amount/term толық lender offer range ішінде;
- екі тарап арасында block жоқ;
- request/offer мерзімі өтпеген;
- `MAX_OUTGOING_APPLICATIONS_PER_DAY` quota аспаған;
- бір `offerId + requestId` жұбына бір application ғана.

Range-based borrower negotiation кейінгі negotiation/versioning slice-қа қалдырылған.

## Immutable offer snapshot

Application жасалған сәтте offer-дің identity-free snapshot-ы сақталады:

- `version: 1` — snapshot schema version;
- `offerVersion` — application жасалған кездегі LoanOffer business revision;
- currency;
- amount min/max;
- term min/max;
- annualRateBps;
- responseHours.

Lender кейін application-ды ACCEPT еткенде concrete Proposal **current offer terms-тен емес**, осы snapshot-тан жасалады.

Immutable LoanOffer versioning іске асқаннан кейін бұл boundary нақты business revision-мен байланысады. Existing application snapshot rewrite болмайды.

Current offer acceptance кезінде әлі ACTIVE + PUBLIC болуы керек. Бірақ кейінгі `LoanOffer.currentVersion` өзгерісі application snapshot-ын өзгертпейді. Мысалы application v1 offer-да жасалып, current offer кейін v2 болса, lender ACCEPT concrete Proposal-ды application v1 snapshot terms-інен жасайды.

## Application lifecycle

~~~mermaid
stateDiagram-v2
    [*] --> PENDING
    PENDING --> ACCEPTED: lender accepts
    PENDING --> REJECTED: lender rejects
    PENDING --> WITHDRAWN: borrower withdraws
    PENDING --> EXPIRED: deadline passes
    PENDING --> SUPERSEDED: offer cancelled / another proposal wins
    ACCEPTED --> SUPERSEDED: another proposal wins
~~~

DB row expiry кезінде міндетті mutation жасамайды; participant read model expired PENDING row-ды effective `EXPIRED` ретінде көрсетеді.

## Lender acceptance

Lender ACCEPT алдында backend қайта тексереді:

- application әлі PENDING және expiry өтпеген;
- lender role дұрыс;
- request/offer/application қатынастары өзгермеген;
- request ACTIVE;
- offer ACTIVE + PUBLIC;
- borrower active verified;
- block relationship жоқ;
- exact borrower request snapshot offer range-ке сәйкес;
- lender proposal quota аспаған.

Success:

1. concrete Proposal жасалады;
2. Proposal `offerId` және `requestId` сақтайды;
3. financial terms immutable application snapshot + exact borrower request-тен құрылады;
4. OfferApplication `ACCEPTED`;
5. OfferApplication `proposalId` арқылы concrete Proposal-ға байланысады;
6. Contract әлі жоқ.

Borrower Proposal-ды кейін existing decision flow арқылы ACCEPT етеді.

## Competing applications

Borrower бір request үшін бірнеше public offer-ге application бере алады.

Егер бірнеше lender application-ды қабылдап concrete Proposal жасаса:

- Proposal-дар PENDING күйде қатар өмір сүре алады;
- borrower біреуін explicit ACCEPT етеді;
- request `MATCHED`;
- rival PENDING proposals `SUPERSEDED`;
- winning application `ACCEPTED` күйінде қалады;
- қалған PENDING/ACCEPTED applications `SUPERSEDED`.

Existing database unique accepted-proposal invariant бір request-ке бір ғана ACCEPTED Proposal болуын қорғайды.

## Offer cancellation

Owner ACTIVE offer-ді cancel еткенде:

- offer `CANCELLED`;
- сол offer-ге байланысты PENDING applications `SUPERSEDED`;
- бұрын ACCEPTED application/proposal history өзгертілмейді.

Cancel қауіпсіз deactivation болғандықтан active owner email verification кейін жоғалса да cancellation жасауға болады.

## Safe decline/withdraw

- lender REJECT;
- borrower WITHDRAW

ақша/contract state жасамайтын қауіпсіз terminal әрекеттер.

Олар actor active KZ account болғанда қайта email verification талап етпейді.

Lender ACCEPT verification-ды қайта талап етеді.

## Privacy-safe inbox

Participant application list тек borrower немесе lender тарапына көрінеді.

Read model:

- application id;
- viewer role;
- status;
- offer id;
- borrower request financial range;
- identity-free offer snapshot;
- optional proposalId;
- expiresAt;
- createdAt.

Мыналар шығарылмайды:

- userId;
- partyId;
- publicId;
- displayName;
- email;
- phone;
- internal ownership fields.

Offer/application ID identity disclosure болып саналмайды.

## Abuse controls

- application create idempotency key қолданады;
- daily outgoing application quota;
- actor row lock concurrent quota bypass-ты тежейді;
- block state apply кезінде және lender ACCEPT алдында қайта тексеріледі;
- command audit payload result status-пен шектеледі;
- endpoint-тер existing discovery authenticated rate-limit ішінде.

## Feature/legal gate

Бұл code public marketplace-ті production-да қоспайды.

`PUBLIC_MARKETPLACE_ENABLED=false` кезінде:

- offer publication/browse;
- application create;
- application decision;
- application inbox

fail-closed.

Current release preflight deployed environment-та `PUBLIC_MARKETPLACE_ENABLED=true` болса release-ті `fail` етеді.

Legal classification аяқталғанша flag production/staging-та қосылмайды.

## Lifecycle notifications

Application state changes durable IN_APP notification outbox-пен байланыстырылған:

| Event | Recipient | Payload |
|---|---|---|
| OFFER_APPLICATION_CREATED | lender | applicationId, offerId, requestId, PENDING |
| OFFER_APPLICATION_ACCEPTED | borrower | applicationId, offerId, requestId, ACCEPTED |
| OFFER_APPLICATION_REJECTED | borrower | applicationId, offerId, requestId, REJECTED |
| OFFER_APPLICATION_WITHDRAWN | lender | applicationId, offerId, requestId, WITHDRAWN |

Application state mutation және outbox enqueue бір database transaction ішінде орындалады. Command idempotency replay duplicate outbox row жасамайды.

Бұл event-тер IN_APP-only. Payload-та amount/rate/term, userId/partyId/publicId, display name, email/phone жоқ.

Front inbox metadata-only event/target labels-ты KZ/RU көрсетеді; raw payload Front-қа шығарылмайды.

## Front application workspace

QaryzLinkFront PR #45 application lifecycle-ды `/dashboard/marketplace` ішінде KZ/RU көрсетеді.

- borrower өзінің ACTIVE private request-ін compatible public offer-ға application ретінде жібереді;
- request selector offer amount/term range-іне сәйкес request-терді ғана ұсынады;
- lender participant inbox-та PENDING application-ды ACCEPT/REJECT етеді;
- borrower PENDING application-ды WITHDRAW етеді;
- accepted application үшін optional proposalId көрсетіледі;
- immutable offer snapshot UI алдында supported terms fields-ке narrow жасалады және source `offerVersion` көрсетіледі;
- identity/contact fields render path-қа кірмейді;
- unverified active participant safe REJECT/WITHDRAW/offer cancel әрекеттерін жоғалтпайды;
- lender ACCEPT және жаңа browse/publish verification талап етеді.

Front application action backend idempotency key contract-ын сақтайды. Backend ownership, block, expiry және snapshot guards authoritative болып қалады.

## Кейінгі Phase 3 жұмыстар

- borrower request public visibility;
- negotiation versions;
- explainable matching;
- moderation;
- spam/abuse controls;
- legal gate өткеннен кейін ғана ranking/search rollout.
