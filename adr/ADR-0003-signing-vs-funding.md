# ADR-0003: Signing and funding are separate

- Status: Accepted
- Date: 2026-09-17

## Context

Екі тарап шартқа қол қоюы ақшаның нақты берілгенін дәлелдемейді. Қол қою сәтінен пайыз басталса, ақша берілмеген жағдайда жалған баланс пайда болады.

## Decision

- Fully signed contract: SIGNED_PENDING_FUNDING.
- Қарыз ACTIVE тек FundingConfirmed кейін.
- Бір тараптың evidence upload-ы confirmation емес.
- Borrower confirmation, trusted provider немесе external resolution қажет.
- Interest accrual confirmed funding effective date-тан басталады.

## Consequences

Қосымша state және confirmation flow қажет, бірақ ledger дұрыстығы мен дауды басқару күшейеді.
