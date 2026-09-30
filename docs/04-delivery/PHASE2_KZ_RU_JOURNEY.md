# Phase 2 KZ/RU journey acceptance

Бұл құжат QaryzLinkFront Private Debt MVP үшін қазақша/орысша presentation coverage және browser acceptance boundary-ін бекітеді.

2026-09-27 күйі: critical user-facing routes KZ/RU catalog-тарына көшірілді. Бірақ GitHub Actions quota/billing gate салдарынан current main үшін actual browser runner execution жоқ. Сондықтан `KZ/RU full journey` implementation coverage бар, formal green acceptance әлі pending.

## Locale architecture

Front lightweight internal locale layer қолданады:

- default locale: `kk`;
- supported locale: `kk | ru`;
- user таңдауы `localStorage["qaryzlink.locale"]` ішінде сақталады;
- provider `document.documentElement.lang` мәнін синхрондайды;
- route ауысқанда және reload кезінде locale сақталады;
- external i18n runtime dependency қажет емес.

Language switch public/auth және authenticated navigation surface-терінде қолжетімді.

## Implementation slices

### Front PR #41 — locale foundation

Merged commit: `348023f`.

Қамтиды:

- landing;
- login/register;
- public/auth navigation;
- dashboard navigation;
- dashboard loading/auth/verification/error/empty states;
- new private request;
- discovery status/date presentation;
- persistent ҚАЗ/РУС switcher.

Негізгі catalog KZ/RU exact parity: 83/83 key.

### Front PR #42 — critical contract journey

Merged commit: `07d89bc`.

Қамтиды:

- request detail;
- exact Public ID invitation;
- lender proposal form;
- borrower proposal accept/reject;
- lender withdraw;
- accepted proposal → contract draft action;
- contract detail;
- contract status;
- funding status;
- repayment schedule/payment status;
- closure/final statement;
- evidence summary/manifest;
- dispute panel.

Critical journey catalog KZ/RU exact parity: 149/149 key.

Business/API values өзгермейді. Localization presentation layer-де ғана.

### Front PR #43 — account lifecycle

Merged commit: `4c9772d`.

Қамтиды:

- email verification;
- password recovery;
- password reset;
- notification inbox;
- notification event/aggregate/date presentation;
- profile/privacy settings;
- password change;
- active session management;
- logout-all;
- account deletion request.

Account catalog KZ/RU exact parity: 135/135 key.

Destructive confirmation phrase locale-specific және explicit:

- KZ: `ЖОЮ`;
- RU: `УДАЛИТЬ`.

Backend account-deletion API contract өзгермейді.

## Technical/domain wording

Кейбір атаулар әдейі translation жасамай сақталады, өйткені олар implementation/domain identifiers:

- Funding;
- ledger;
- Evidence;
- Public ID;
- proposal;
- contract;
- hash;
- manifest.

User-facing explanatory sentences, actions, validation/error states KZ/RU арқылы беріледі.

## Automated presentation tests

Unit-level regression:

- KZ default labels backwards-compatible;
- RU discovery/contract/funding/schedule/payment/closure/dispute labels;
- RU notification labels/targets/date fallback;
- барлық locale catalog-тары exact key parity;
- empty locale message жоқ;
- destructive confirmation phrase per-locale explicit.

Manual-only Playwright suite implementation:

1. RU landing → login locale persistence;
2. 390px RU landing horizontal overflow жоқ;
3. RU request unauthenticated state;
4. RU contract unauthenticated state;
5. RU verify-email unauthenticated state;
6. RU forgot/reset password;
7. RU notifications unauthenticated state;
8. RU settings unauthenticated state;
9. 390px account lifecycle horizontal overflow smoke.

Real-staging private-debt browser harness implementation (Front #69):

- two isolated verified participant browser contexts;
- private request → invite → proposal → accept → contract;
- dual signing;
- real signed funding evidence upload + borrower confirmation;
- schedule generation;
- real signed repayment evidence upload + lender confirmation;
- dual closure;
- immutable evidence manifest hash assertion.

Critical controls locale-independent selectors қолданады. Front #70 бір reusable full lifecycle flow-ды `kk` және `ru` үшін бөлек serialized staging test ретінде орындайды; mutation test retry өшірулі және Playwright staging worker саны 1.

## Нені бұл әлі дәлелдемейді

Static/unit/browser harness implementation actual successful staging run-ды өздігінен дәлелдемейді.

Қазір full two-user integrated browser scenario кодта бар, бірақ Actions runner/quota мәселесі салдарынан ол нақты staging-та successful орындалған жоқ. Сондықтан әлі дәлелденбегені:

- current deployed Front/Back/storage build-та lifecycle толық green екені;
- signed upload URL/CORS/object-storage path нақты staging provider-де green екені;
- email inbox-та нақты verification/reset delivery келгені;
- KZ full mutation journey successful run;
- RU full mutation journey successful run.

Formal acceptance үшін implementation емес, нақты run evidence керек.

## Formal Phase 2 locale acceptance

`KZ/RU full journey` green болу үшін:

1. Front current main quality workflow green;
2. manual/integrated browser runner қолжетімді;
3. KZ authenticated borrower/lender critical journey complete;
4. RU authenticated borrower/lender critical journey complete;
5. register → verify → request → invite → proposal → contract → funding/payment visibility → closure/evidence → notifications route-тары тексеріледі;
6. 390px mobile layout critical routes-те horizontal overflow жасамайды;
7. locale route/reload барысында сақталады;
8. backend error state-тері екі тілде privacy-safe rendering береді;
9. tested Front/Back commit SHA және browser run ID implementation status-қа жазылады.

Осы acceptance evidence шыққанша roadmap-та `KZ/RU full journey` **implementation coverage ready, execution pending** деп саналады.
