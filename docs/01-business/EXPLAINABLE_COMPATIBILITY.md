# Explainable request / offer compatibility

Бұл құжат Phase 3 public marketplace ішіндегі deterministic compatibility explanation contract-ын сипаттайды.

2026-09-27 күйі: Backend exact private borrower request пен visible public lender offer арасындағы amount/term сәйкестігін түсіндіре алады; Front осы explanation-ды application алдында көрсетеді. Feature **PUBLIC_MARKETPLACE_ENABLED=false** default gate артында қалады.

## Бұл не

Compatibility explanation бір нақты borrower request пен бір нақты lender offer үшін:

- сәйкес пе;
- сома offer диапазонына кіре ме;
- мерзім offer диапазонына кіре ме;
- сәйкес емес болса нақты reason code қандай

дегенді ғана береді.

Бұл:

- recommendation емес;
- ranking емес;
- score емес;
- lender quality бағасы емес;
- approval/creditworthiness шешімі емес;
- application acceptance prediction емес.

## Endpoint

~~~text
GET /api/v1/discovery/offers/:offerId/compatibility?requestId=:requestId
~~~

Authenticated verified KZ personal borrower ғана қолданады.

Response mode:

~~~json
{
  "mode": "EXACT_REQUEST_V1",
  "offerVersion": 2,
  "compatible": false,
  "reasonCodes": ["AMOUNT_ABOVE_MAX"],
  "amount": {
    "requestedMinor": "60000",
    "minimumMinor": "10000",
    "maximumMinor": "50000",
    "fits": false
  },
  "term": {
    "requestedDays": 60,
    "minimumDays": 30,
    "maximumDays": 90,
    "fits": true
  }
}
~~~

## Reason codes

Stable order:

1. `AMOUNT_BELOW_MIN`;
2. `AMOUNT_ABOVE_MAX`;
3. `TERM_BELOW_MIN`;
4. `TERM_ABOVE_MAX`.

Бірнеше axis сәйкес болмаса бірнеше reason code қайтарылады.

Reason order ranking емес; ол тек deterministic serialization/testing contract.

## Request eligibility

Request:

- current actor-ға тиесілі;
- ACTIVE;
- expiry өтпеген;
- exact amount:
  - `amountMinMinor = amountMaxMinor`;
- exact term:
  - `termMinDays = termMaxDays`.

Басқа user request-і accessible емес.

Range request бұл `EXACT_REQUEST_V1` mode-да unsupported және application mismatch ретінде rejected.

## Offer eligibility

Offer explanation үшін:

- ACTIVE;
- PUBLIC;
- expiry өтпеген;
- borrower-дің own offer-ы емес;
- lender account ACTIVE;
- lender email verified;
- lender және borrower арасында екі бағытта block жоқ.

Offer amount/term fit болмауы resource-ты жасырмайды; дәл сол mismatch explanation-ның мақсаты.

Бірақ identity/availability/privacy guard бұзылса resource inaccessible shape-қа өтеді.

## Lender eligibility consistency

Public browse енді offer owner user үшін де:

- ACTIVE status;
- verified email

талап етеді.

Сондықтан lender verification/status жоғалса offer browse-тан бірден шығады және borrower кейін application сәтінде ғана кеш reject алмайды.

Owner өзінің offer history/cancel сияқты safe owner actions-ынан автоматты түрде айырылмайды; бұл public visibility rule.

## Version binding

Response `offerVersion` current `LoanOffer.currentVersion` мәнін береді.

Compatibility explanation immutable application snapshot емес. Ол query орындалған сәттегі current public offer terms-ті түсіндіреді.

Borrower кейін application жіберсе backend application transaction ішінде offer eligibility/range-ті қайта тексеріп, сол сәттегі immutable `offerVersion` snapshot-ын сақтайды.

Сондықтан UI explanation application authorization орнына жүрмейді.

## Privacy boundary

Response-та мыналар жоқ:

- lender/borrower userId;
- partyId;
- publicId;
- display name;
- email;
- phone;
- profile data;
- block metadata;
- score;
- rank;
- recommendation.

Public offer financial range және borrower-дің өз request amount/term мәндері ғана салыстырылады.

## Front behavior

QaryzLinkFront marketplace:

1. borrower-дің ACTIVE private request-терін selector-да көрсетеді;
2. request таңдалғанда Backend compatibility endpoint-ін шақырады;
3. amount және term бойынша fit/mismatch explanation көрсетеді;
4. `compatible=true` болмайынша Apply disabled;
5. score/ranking қолданылмайтынын UI-де explicit көрсетеді.

Алдыңғы client-side "тек compatible request-терді ғана көрсету" filter жойылды. Бұл user-ге неге request сәйкес емес екенін көруге мүмкіндік береді және compatibility business rule Backend-та authoritative болып қалады.

## Security / release boundary

- endpoint existing discovery auth/rate-limit boundary ішінде;
- unauthenticated access 401 smoke-қа кіреді;
- malformed requestId UUID transport validation арқылы rejected;
- cross-user request, own offer және blocked/ineligible offer privacy-safe unavailable shape қолданады;
- whole feature `PUBLIC_MARKETPLACE_ENABLED=false` кезінде fail-closed.

Бұл implementation public marketplace launch немесе automated matching/ranking рұқсаты емес.
