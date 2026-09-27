# Public lender offer foundation

Бұл құжат Phase 3 Offers & Matching кезеңінің алғашқы backend slice-ын сипаттайды.

2026-09-27 күйі: lender public offer publication/browse/cancel backend implementation-ы бар, бірақ **PUBLIC_MARKETPLACE_ENABLED=false** әдепкі күйде және current release preflight deployed environment үшін бұл flag true болса `fail` береді. Сондықтан feature production/staging-та legal gate өтпейінше қосылмайды.

## Қазіргі scope

Backend мыналарды қолдайды:

- verified active KZ personal lender public offer жасайды;
- бір lender үшін active public offer саны `MAX_ACTIVE_PUBLIC_OFFERS` арқылы шектеледі;
- create/cancel command-тары idempotency key және audit event қолданады;
- active owner offer-ді cancel ете алады;
- verified KZ borrower public offer list-ін қарай алады;
- browse amount және term range бойынша сүзеді;
- cursor pagination бар;
- expired offer browse-тан шықпайды;
- user өз offer-ын public browse-тан көрмейді;
- PartyBlock екі бағытта browse visibility-ді жабады.

## Privacy boundary

Public browse response lender identity-ін шығармайды.

Response ішінде:

- offer id;
- status;
- currency;
- min/max amount;
- min/max term;
- annualRateBps;
- responseHours;
- expiresAt

ғана бар.

Мыналар browse response-қа кірмейді:

- lender userId;
- lender partyId;
- publicId;
- display name;
- email/phone;
- verification raw data;
- block relationship;
- private profile fields.

Public offer id lender identity орнына жүрмейді.

## Lifecycle

Қазіргі implementation:

~~~mermaid
flowchart LR
    OFF["Feature flag OFF"] -->|legal gate passed later| ON["Marketplace enabled"]
    ON --> NEW["Create ACTIVE PUBLIC offer"]
    NEW --> BROWSE["Privacy-safe browse"]
    NEW --> CANCEL["Owner cancel"]
    NEW --> EXP["Expiry hides from browse"]
~~~

PAUSED/resume/versioning әлі implementation-да жоқ.

## Validation

Offer:

- KZT only;
- positive bigint-compatible min/max amount;
- min <= max;
- term 1–3650 days;
- termMin <= termMax;
- annualRateBps 0–1,000,000 technical bound;
- responseHours 1–720.

Бұл rate bound заңдық пайыз лимиті емес.

## Security and abuse controls

- write path verified active KZ personal account талап етеді;
- cancel active owner үшін email re-verification-сыз қолжетімді, сондықтан қауіпсіз deactivation blocked болмайды;
- existing discovery authenticated rate-limit қолданылады;
- active-offer quota user-row serialization арқылы concurrent create кезінде де сақталады;
- audit payload financial terms/contact identity сақтамайды;
- unauthenticated offer endpoints 401.

## Feature gate

`PUBLIC_MARKETPLACE_ENABLED=false` болса:

- create;
- cancel;
- owner list;
- public browse

`DISCOVERY_MARKETPLACE_DISABLED` арқылы fail-closed болады.

Environment default false.

Release preflight-та public marketplace true болса `restricted_financial_features = fail`.

Осы себепті backend кодтың болуы public launch рұқсаты емес.

## Нені бұл slice әлі жасамайды

- automatic matching;
- ranking/recommendation;
- lender public profile;
- verification badges;
- automatic matching/ranking;
- negotiation versions;
- pause/resume;
- moderation queue;
- spam reputation;
- notifications;
- Front UI;
- Admin UI.

## Application slice

Borrower application → lender concrete Proposal flow енді [Public offer applications](PUBLIC_OFFER_APPLICATIONS.md) ішінде іске асқан.

Келесі safe backend work notification/outbox metadata, offer versioning және explainable matching foundation болып қалады. Open/public matching recommendation/search ranking legal classification-тан кейін ғана production enablement алады.
