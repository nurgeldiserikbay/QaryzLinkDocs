# Marketplace moderation reporting baseline

Бұл құжат Phase 3 public marketplace үшін user-driven abuse reporting және privacy-safe moderation visibility contract-ын сипаттайды.

2026-09-28 күйі: Backend offer report write-path, Front report control, aggregate backlog және default-off row-level human review workflow іске асқан. Marketplace өзі әлі `PUBLIC_MARKETPLACE_ENABLED=false` default legal/release gate артында.

## Мақсаты

Бұл baseline user-ге күмәнді public lender offer туралы moderation signal жіберуге мүмкіндік береді.

Ол:

- automatic ban емес;
- automatic offer hide емес;
- lender reputation score емес;
- matching/ranking input емес;
- fraud verdict емес;
- legal conclusion емес.

Report тек human review үшін bounded signal.

## Report target

Current slice тек public lender offer-ды report етеді.

Report жасау үшін offer:

- ACTIVE;
- PUBLIC;
- expiry өтпеген;
- reporter-дің өз offer-ы емес;
- lender account ACTIVE;
- lender email verified;
- reporter/lender арасында екі бағытта block жоқ.

Осы visibility guard-тардың бірі бұзылса Backend privacy-safe unavailable shape қолданады.

## Reason codes

Report free-text қабылдамайды.

Allowed reason codes:

- `SPAM`;
- `MISLEADING_TERMS`;
- `SUSPICIOUS`;
- `OTHER`.

Reason code moderation signal ғана. Ол offer немесе lender туралы дәлелденген факт деп саналмайды.

## Write contract

Endpoint:

~~~text
POST /api/v1/discovery/offers/:offerId/report
Idempotency-Key: <uuid>

{
  "reason": "SPAM"
}
~~~

Success:

~~~json
{
  "id": "<report uuid>",
  "status": "OPEN"
}
~~~

Write path:

- verified active KZ personal account талап етеді;
- `PUBLIC_MARKETPLACE_ENABLED=true` gate талап етеді;
- offer lifecycle row lock арқылы pause/cancel race-пен serialize болады;
- command idempotent;
- бір account бір offer-ды бір рет қана report етеді;
- duplicate report `DISCOVERY_CONFLICT`;
- daily report quota `MAX_MARKETPLACE_REPORTS_PER_DAY`;
- engineering default 5;
- validation hard max 50;
- quota user-row serialized command boundary ішінде орындалады.

## Stored data

`MarketplaceReport` сақтайды:

- report id;
- reporter user/party internal references;
- offer internal reference;
- enum reason;
- moderation status;
- timestamps.

Free-text complaint, email, phone, displayName, publicId немесе financial snapshot report row-ға қосылмайды.

Internal references participant/public APIs арқылы шықпайды.

## Status lifecycle

Current data model:

~~~mermaid
stateDiagram-v2
    [*] --> OPEN
    OPEN --> RESOLVED: human review
    OPEN --> DISMISSED: human review
~~~

Қазіргі implementation `OPEN` report жасайды, aggregate backlog көрсетеді және бөлек default-off support gate арқылы `RESOLVED` / `DISMISSED` human-review transition орындай алады.

Бұл transition report row статусын ғана өзгертеді. Offer visibility/status, lender account status, matching/ranking және reputation автоматты өзгермейді.

## Audit privacy

Report command existing Discovery idempotency/audit transaction boundary-ын қолданады.

Audit payload:

~~~json
{
  "status": "OPEN"
}
~~~

ғана сақтайды.

Audit payload-та:

- reason;
- offer terms;
- amount/rate/term;
- email/phone;
- publicId

жоқ.

## Front behavior

QaryzLinkFront public offer card:

- compact “report offer” control көрсетеді;
- reason enum selector қолданады;
- free-text input жоқ;
- duplicate және daily quota errors privacy-safe түсіндіріледі;
- success moderation queue-ға signal жіберілгенін ғана айтады;
- автоматты sanction болды деп көрсетпейді.

KZ/RU marketplace catalog report UI қосылғаннан кейін 112/112 key parity сақтайды.

## Admin visibility

Admin екі бөлек surface қолданады.

### Aggregate operations visibility

Protected endpoint:

~~~text
GET /api/v1/metrics/marketplace-reports
x-metrics-token: <server secret>
~~~

Response тек aggregate counters:

- OPEN;
- RESOLVED;
- DISMISSED;
- last 24h created count;
- reason buckets;
- oldest OPEN age;
- capturedAt.

Admin strict response validator unexpected top-level немесе nested field болса response-ты reject етеді.

Admin-ға мыналар берілмейді:

- report id;
- reporter userId/partyId;
- offerId;
- lender identity;
- complaint content;
- contact fields.

Бұл aggregate operations baseline.

### Row-level human review

Row-level queue бөлек support gate артында:

~~~text
GET /api/v1/internal/support/marketplace-reports?status=OPEN
x-support-token: <server-only secret>

PATCH /api/v1/internal/support/marketplace-reports/:reportId/status
x-support-token: <server-only secret>

{
  "status": "RESOLVED"
}
~~~

Allowed terminal outcomes:

- `RESOLVED`;
- `DISMISSED`.

Queue moderator-ға тек:

- report id;
- reason code;
- report status/timestamps;
- offer-дың non-identity financial/expiry terms

береді.

Queue reporter/lender userId/partyId/publicId/displayName/email/phone немесе free-text complaint бермейді.

Admin `SUPPORT_ACCESS_TOKEN` мәнін browser props/JS-ке шығармайды. Resolve/Dismiss server action арқылы Backend-ке жіберіледі.

Backend gate:

~~~text
SUPPORT_MARKETPLACE_REPORT_TRANSITIONS_ENABLED=false
~~~

әдепкіде false.

Transition status-only audit event жасайды және same terminal status replay idempotent. Бір terminal outcome-ды екіншісіне ауыстыру conflict береді.

## Abuse controls

- authenticated discovery rate limit;
- exact enum validation;
- no free-text payload;
- one account + one offer unique constraint;
- daily quota;
- idempotency key;
- offer visibility/ownership/block recheck;
- offer lifecycle row lock;
- aggregate-only Admin metrics;
- default-off row-level support gate;
- server-only support token;
- exact queue response-shape validation;
- audited terminal review transitions.

Report count offer visibility-ге, ranking-ке немесе account status-қа автоматты әсер етпейді.

## Release/legal boundary

Бұл feature public marketplace-ті enable етпейді.

`PUBLIC_MARKETPLACE_ENABLED=false` болса report write fail-closed.

Release preflight marketplace enablement-ті Қазақстандағы legal classification аяқталғанша `fail` деп ұстайды.

## Кейінгі moderation жұмыстары

Кейін бөлек design/review талап етеді:

- per-staff least-privilege/JIT identity және attributable staff audit;
- moderation retention policy;
- repeated-target abuse analytics;
- automated spam/fraud signals;
- sanctions/offer visibility changes.

Automated sanctions немесе reputation scoring тек policy/legal/security design бекітілгеннен кейін қарастырылады.
