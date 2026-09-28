# Public lender offer foundation

Бұл құжат Phase 3 Offers & Matching кезеңінің public lender offer foundation-ын, application bridge-ін және default-off Front workspace-ын сипаттайды.

2026-09-27 күйі: lender public offer publication/browse/pause/resume/cancel, immutable financial-term versioning backend implementation-ы және KZ/RU Front marketplace workspace бар. Бірақ **PUBLIC_MARKETPLACE_ENABLED=false** әдепкі күйде және current release preflight deployed environment үшін бұл flag true болса `fail` береді. Сондықтан UI кодының болуы production/staging launch рұқсаты емес.

## Қазіргі scope

Backend мыналарды қолдайды:

- verified active KZ personal lender public offer жасайды;
- бір lender үшін active public offer саны `MAX_ACTIVE_PUBLIC_OFFERS` арқылы шектеледі;
- create/cancel command-тары idempotency key және audit event қолданады;
- active owner offer-ді pause/cancel ете алады;
- paused owner offer-ді verified account resume ете алады;
- verified owner ACTIVE немесе PAUSED offer terms-ін immutable жаңа version ретінде revise ете алады;
- owner version history-ді identity data-сыз қарай алады;
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
- currentVersion;
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

Pause/resume және immutable financial terms versioning implementation бар.

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
- revise verified owner талап етеді, status/expiry-ді өзгертпейді және no-op revision қабылдамайды;
- version history `MAX_OFFER_VERSIONS` арқылы default 20, hard max 100 болып шектеледі;
- existing discovery authenticated rate-limit қолданылады;
- active-offer quota user-row serialization арқылы concurrent create кезінде де сақталады;
- audit payload financial terms/contact identity сақтамайды;
- unauthenticated offer endpoints 401.

## Feature gate

`PUBLIC_MARKETPLACE_ENABLED=false` болса:

- create;
- pause/resume/revise/cancel;
- owner list және version history;
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
- negotiation/counter-offer versions;
- row-level moderator review queue;
- automated spam reputation/sanctions;
- offer lifecycle email notifications;
- Admin moderation UI.

## Application slice

Borrower application → lender concrete Proposal flow енді [Public offer applications](PUBLIC_OFFER_APPLICATIONS.md) ішінде іске асқан.

User-driven moderation reporting baseline іске асты: [Marketplace moderation](MARKETPLACE_MODERATION.md). Келесі safe work negotiation/counter-offer versions, controlled moderator workflow және borrower-side discovery evolution болып қалады. Deterministic compatibility explanation іске асты; automated ranking/recommendation әлі legal gate артында. Open/public matching recommendation/search ranking legal classification-тан кейін ғана production enablement алады.


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
- өзінің ACTIVE private request-тері selector-да көрсетіледі;
- таңдалған request үшін Backend exact compatibility explanation қайтарады;
- amount/term сәйкес болмаса reason code UI-де түсіндіріледі және Apply disabled қалады;
- backend exact ownership/range/block/expiry guard-тарын application transaction ішінде қайта тексереді.

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


## Immutable financial-term versions

QaryzLinkBack PR #171 және QaryzLinkFront PR #47 public offer terms revision-ды immutable history арқылы іске асырды.

### Data model

`LoanOffer` current materialized browse state ретінде:

- `currentVersion`;
- current amount min/max;
- current term min/max;
- current annualRateBps;
- current responseHours

сақтайды.

Әр revision үшін бөлек immutable `LoanOfferVersion` row жасалады:

- offerId;
- monotonically increasing version;
- identity-free termsSnapshot;
- createdAt.

`termsSnapshot.schemaVersion=1` JSON schema evolution-ды білдіреді. Бұл business revision number емес.

Migration `20260927233500_offer_versions`:

1. existing `LoanOffer.currentVersion=1` backfill жасайды;
2. әр existing offer үшін version 1 immutable snapshot жасайды;
3. existing application snapshot-тарына `offerVersion=1` қосады.

### Revision contract

Owner ACTIVE немесе PAUSED, expiry өтпеген offer-ды revise ете алады.

Revision:

- verified active KZ personal account талап етеді;
- idempotency key қолданады;
- кемінде бір financial term өзгеруін талап етеді;
- offer status-ын өзгертпейді;
- expiry-ді ұзартпайды;
- `currentVersion + 1` immutable row жасайды;
- materialized current terms-ті жаңа version-ға сәйкестендіреді;
- audit payload-қа terms/contact data қоспайды.

History default `MAX_OFFER_VERSIONS=20`, validation hard max 100.

### Existing applications

Revision existing application-дарды rewrite немесе supersede етпейді.

Application snapshot екі бөлек version ұғымын сақтайды:

- `version: 1` — application snapshot schema version;
- `offerVersion: N` — application жасалған кездегі LoanOffer business revision.

Сондықтан v1 кезінде жасалған application lender offer кейін v2/v3 болып өзгерсе де v1 terms-пен қалады. Lender оны ACCEPT етсе concrete Proposal дәл сол historical snapshot terms-тен жасалады.

New application әрқашан current `LoanOffer.currentVersion` snapshot-ын алады.

### Front

Marketplace UI:

- public/own offer card-та current `vN` көрсетеді;
- verified owner ACTIVE/PAUSED offer terms-ін жаңа immutable version ретінде өзгерте алады;
- no-op revision Front-та да blocked;
- owner version history-ді on-demand қарайды;
- history currentVersion өзгерсе refetch болады;
- application card source `offerVersion` көрсетеді;
- history identity/contact fields көрсетпейді.

Version history read қауіпсіз owner action болғандықтан email verification жоғалған active owner үшін де қолжетімді; жаңа revision verified account талап етеді.


## Explainable compatibility

Exact request → public offer compatibility explanation іске асқан: [Explainable compatibility](EXPLAINABLE_COMPATIBILITY.md).

Бұл primitive:

- current offerVersion-ды көрсетеді;
- amount/term fit-ті deterministic reason code-пен түсіндіреді;
- score/rank/recommendation шығармайды;
- public browse сияқты verified active lender eligibility және block privacy rules-ын қолданады;
- application authorization орнына жүрмейді — write transaction барлық guard-ты қайта тексереді.


## Moderation reporting

Public offer user-driven reporting baseline іске асқан: [Marketplace moderation](MARKETPLACE_MODERATION.md).

- reason enum-only;
- free-text жоқ;
- one account + one offer duplicate guard;
- daily quota default 5;
- visible ACTIVE PUBLIC offer ғана report болады;
- automatic hide/ban/rank/score жоқ;
- Admin тек aggregate backlog көреді.

Row-level moderator review және RESOLVED/DISMISSED mutation әлі кейінгі workflow.
