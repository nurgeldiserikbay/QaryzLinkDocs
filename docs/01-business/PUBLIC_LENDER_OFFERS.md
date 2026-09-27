# Public lender offer foundation

Бұл құжат Phase 3 Offers & Matching кезеңінің public lender offer foundation-ын, application bridge-ін және default-off Front workspace-ын сипаттайды.

2026-09-27 күйі: lender public offer publication/browse/cancel backend implementation-ы және KZ/RU Front marketplace workspace бар. Бірақ **PUBLIC_MARKETPLACE_ENABLED=false** әдепкі күйде және current release preflight deployed environment үшін бұл flag true болса `fail` береді. Сондықтан UI кодының болуы production/staging launch рұқсаты емес.

## Қазіргі scope

Backend мыналарды қолдайды:

- verified active KZ personal lender public offer жасайды;
- бір lender үшін active public offer саны `MAX_ACTIVE_PUBLIC_OFFERS` арқылы шектеледі;
- create/cancel command-тары idempotency key және audit event қолданады;
- active owner offer-ді pause/cancel ете алады;
- paused owner offer-ді verified account resume ете алады;
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
    NEW --> PAUSE["Owner PAUSE"]
    PAUSE -->|verified + quota + not expired| NEW
    NEW --> CANCEL["Owner cancel"]
    PAUSE --> CANCEL
    NEW --> EXP["Expiry hides from browse"]
    PAUSE --> EXP
~~~

Pause/resume implementation бар; financial terms versioning әлі implementation-да жоқ.

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
- pause/cancel active owner үшін email re-verification-сыз қолжетімді, сондықтан қауіпсіз deactivation blocked болмайды;
- resume қайта public publication болғандықтан verified email талап етеді және active-offer quota қайта тексеріледі;
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
- financial terms version history;
- moderation queue;
- spam reputation;
- offer lifecycle email notifications;
- Admin moderation UI.

## Application slice

Borrower application → lender concrete Proposal flow енді [Public offer applications](PUBLIC_OFFER_APPLICATIONS.md) ішінде іске асқан.

Келесі safe backend work notification/outbox metadata, offer versioning және explainable matching foundation болып қалады. Open/public matching recommendation/search ranking legal classification-тан кейін ғана production enablement алады.


## Front marketplace workspace

QaryzLinkFront PR #45 public marketplace-тің default-off user workspace-ын қосты.

Navigation:

- `/dashboard/marketplace`;
- KZ/RU persistent locale;
- 390px mobile responsive layout.

Lender view:

- bounded public offer create;
- own offer list;
- ACTIVE offer cancel;
- effective expired offer presentation;
- email verification жоғалса да existing own offer-ді қауіпсіз cancel етуге болады.

Borrower view:

- identity-free public offer list;
- amount/term сәйкес келетін өзінің ACTIVE private request-тері ғана application selector-да көрінеді;
- incompatible request UI деңгейінде ұсынылмайды;
- backend бәрібір exact ownership/range/block/expiry guard-тарын қайта тексереді.

Application inbox:

- borrower/lender role;
- application lifecycle status;
- request financial terms;
- identity-free immutable offer snapshot;
- optional proposal id;
- lender ACCEPT/REJECT;
- borrower WITHDRAW.

UI lender/borrower userId, partyId, publicId, display name, email немесе phone көрсетпейді.

Verification жоғалған active participant үшін workspace толық жабылмайды: own offer cancel және safe application reject/withdraw backend contract-ына сәйкес қолжетімді болып қалады. Жаңа publish/browse және lender ACCEPT verification талап етеді.

`PUBLIC_MARKETPLACE_ENABLED=false` болса Front feature-disabled state көрсетеді; flag-ты Front өзі қоспайды.

Front implementation marketplace-ті legal/release gate-тен айналып өтпейді.


## Pause / resume semantics

QaryzLinkBack PR #170 және QaryzLinkFront PR #46 offer lifecycle-ға reversible suspension қосты.

### Pause

Owner ACTIVE offer-ды PAUSED күйіне ауыстыра алады.

- email re-verification талап етілмейді;
- offer public browse-тан жоғалады;
- жаңа application қабылдамайды;
- existing PENDING applications жойылмайды;
- lender ACCEPT paused күйде blocked;
- borrower WITHDRAW және lender REJECT сияқты safe terminal actions application history үшін қолжетімді;
- audit payload status-пен шектеледі.

Pause command idempotent.

### Resume

PAUSED offer қайта ACTIVE болуы үшін:

- owner verified active KZ account;
- offer expiry өтпеген;
- current active public offer count `MAX_ACTIVE_PUBLIC_OFFERS` шегінен аспайды.

Resume quota actor/user row serialization ішінде қайта тексеріледі, сондықтан concurrent create/resume quota bypass жасамайды.

### Cancel from PAUSED

PAUSED offer terminal CANCEL бола алады.

Cancel:

- re-verification талап етпейді;
- pending applications-ды `SUPERSEDED` етеді;
- кейін resume мүмкін емес.

### Front behavior

Own-offer card:

- ACTIVE → Pause / Cancel;
- PAUSED → Resume / Cancel;
- EXPIRED/CANCELLED → read-only state.

Verification жоғалған owner PAUSED offer-ды cancel ете алады, бірақ Resume UI verification guidance көрсетеді.

Lender application ACCEPT linked own offer PAUSED/expired/cancelled екені Front-қа белгілі болса disabled болады. Backend guard authoritative болып қалады.
