# Бизнес схема

<span class="doc-kicker">END-TO-END LIFECYCLE</span>

<div class="doc-lead">QaryzLink-тегі негізгі бизнес lifecycle request-тен басталып, екі тарап растаған closure-мен аяқталады.</div>

## Негізгі flow

<div class="flow-strip">
<div class="flow-node"><small>01</small><strong>Request</strong></div>
<div class="flow-node"><small>02</small><strong>Proposal</strong></div>
<div class="flow-node"><small>03</small><strong>Contract</strong></div>
<div class="flow-node"><small>04</small><strong>Funding</strong></div>
<div class="flow-node"><small>05</small><strong>Repayment</strong></div>
<div class="flow-node"><small>06</small><strong>Closure</strong></div>
</div>

## 1. Request
Borrower сома, мерзім және preference енгізеді. Бұл **contract terms емес**, тек matching/request context.

## 2. Proposal
Lender нақты шарттарын ұсынады: principal, term, interest policy, response deadline және repayment policy. Borrower қабылдайды, бас тартады немесе counter suggestion береді.

## 3. Contract
Final lender proposal borrower тарапынан explicit қабылданғаннан кейін immutable ContractVersion жасалады.

## 4. Funding
Lender platform-нан тыс ақша береді және evidence ұсынады. Borrower "алдым/алмадым" деп жауап береді. **Тек confirmed funding** obligation-ды ACTIVE етеді.

## 5. Repayment

<div class="flow-strip">
<div class="flow-node"><small>A</small><strong>Payment claim</strong></div>
<div class="flow-node"><small>B</small><strong>Evidence</strong></div>
<div class="flow-node"><small>C</small><strong>Confirm</strong></div>
<div class="flow-node"><small>D</small><strong>Allocation</strong></div>
<div class="flow-node"><small>E</small><strong>Balance</strong></div>
<div class="flow-node"><small>F</small><strong>Schedule</strong></div>
</div>

Confirmed payment ledger-ге кіреді. Қате төлем өшірілмейді — reversal event жасалады.

## 6. Closure
Principal және applicable balance жабылып, unresolved dispute болмай, final confirmations берілгенде ClosureCertificate қалыптасады.

## Ерекше жағдайлар

| Жағдай | Не болады |
|---|---|
| Proposal мерзімі бітті | EXPIRED, жаңа version керек |
| Funding дауланды | FUNDING_DISPUTED |
| Payment дауланды | Dispute workflow |
| Қате confirmed payment | Immutable reversal |
| Terms өзгерді | New ContractVersion / amendment |
| Overdue | Worker + reminders |

Толық canonical detail: [Business logic](/docs/01-business/BUSINESS_LOGIC).
