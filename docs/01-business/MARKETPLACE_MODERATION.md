# Marketplace moderation reporting baseline

Бұл құжат Phase 3 public marketplace үшін user-driven abuse reporting және privacy-safe moderation visibility contract-ын сипаттайды.

2026-09-28 күйі: Backend offer report write-path, Front report control және Admin aggregate backlog visibility іске асқан. Marketplace өзі әлі `PUBLIC_MARKETPLACE_ENABLED=false` default legal/release gate артында.

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
    OPEN --> RESOLVED: future human moderation workflow
    OPEN --> DISMISSED: future human moderation workflow
~~~

Қазіргі slice `OPEN` report жасайды және aggregate backlog көрсетеді.

`RESOLVED` / `DISMISSED` moderator mutation workflow әлі implementation-да жоқ. Сондықтан бұл status-тардың schema-да болуы current Admin-ға report row mutation құқығын бермейді.

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

Admin row-level report list алмайды.

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

Бұл intentional aggregate-only operations baseline.

## Abuse controls

- authenticated discovery rate limit;
- exact enum validation;
- no free-text payload;
- one account + one offer unique constraint;
- daily quota;
- idempotency key;
- offer visibility/ownership/block recheck;
- offer lifecycle row lock;
- aggregate-only Admin metrics.

Report count offer visibility-ге, ranking-ке немесе account status-қа автоматты әсер етпейді.

## Release/legal boundary

Бұл feature public marketplace-ті enable етпейді.

`PUBLIC_MARKETPLACE_ENABLED=false` болса report write fail-closed.

Release preflight marketplace enablement-ті Қазақстандағы legal classification аяқталғанша `fail` деп ұстайды.

## Кейінгі moderation жұмыстары

Кейін бөлек design/review талап етеді:

- moderator row-level review queue;
- least-privilege/JIT report access;
- OPEN → RESOLVED / DISMISSED controlled transition;
- moderation audit trail;
- retention policy;
- repeated-target abuse analytics;
- automated spam/fraud signals;
- sanctions/offer visibility changes.

Automated sanctions немесе reputation scoring тек policy/legal/security design бекітілгеннен кейін қарастырылады.
