# ADR-0007: Private discovery және атомарлы proposal acceptance

- Status: Accepted engineering default
- Date: 2026-09-18

## Decision

- Write үшін ACTIVE, email-і расталған PERSON/KZ аккаунт қажет. Бұл KYC емес.
- Request author authenticated actor арқылы анықталады; body-де partyId қабылданбайды.
- LoanRequest ACTIVE/INVITE_ONLY, KZT, exact amountMinor және termDays, expiry 30 күн.
- Borrower exact publicId арқылы lender шақырады. Жасырын/жоқ/unverified/suspended/өз аккаунты 404 ретінде қайтарылады.
- Шақырылған lender ғана proposal жасайды; lender-лер бір-бірінің proposal-дарын көрмейді.
- Proposal terms immutable snapshot: integer amount, KZT, term, annualRateBps, INTEREST_FREE/SIMPLE, ACT_365_FIXED, HALF_UP, AT_MATURITY, REDUCE_TERM, penalty 0.
- ACCEPT/REJECT borrower үшін, WITHDRAW lender үшін. ACCEPT request row lock арқылы бір proposal-ды ACCEPTED, request MATCHED, қалған PENDING-ті SUPERSEDED етеді.
- ACCEPT contract, signature, funding немесе balance жасамайды.
- Әр write UUID Idempotency-Key талап етеді; бір key+payload replay алғашқы result-ты қайтарады, басқа payload 409.
- Лимиттер: request 10/day, invitation 10/day, proposal configurable default 10/day; UTC/PostgreSQL clock.
- Expiry scheduler жоқ; expiresAt mutation guard-та тексеріледі.
- Public marketplace, penalty және money custody осы ADR scope-ына кірмейді.

## Consequences

Private staging workflow дайын, бірақ invite revoke/block-list, notifications, pagination, business audit, negotiation және contract conversion келесі кезеңдерде.

## Acceptance

Үлкен integer сома precision жоғалтпайды; concurrent ACCEPT біреу ғана өтеді; foreign resource және rival proposal жасырын; expired/withdrawn/rejected proposal қабылданбайды.
