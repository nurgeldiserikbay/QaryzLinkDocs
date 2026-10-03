# Бизнес-схема

<span class="doc-kicker">END-TO-END LIFECYCLE</span>

<div class="doc-lead">Основной lifecycle QaryzLink начинается с request и заканчивается closure, подтверждённым обеими сторонами.</div>

## Основной flow

<div class="flow-strip">
<div class="flow-node"><small>01</small><strong>Request</strong></div>
<div class="flow-node"><small>02</small><strong>Proposal</strong></div>
<div class="flow-node"><small>03</small><strong>Contract</strong></div>
<div class="flow-node"><small>04</small><strong>Funding</strong></div>
<div class="flow-node"><small>05</small><strong>Repayment</strong></div>
<div class="flow-node"><small>06</small><strong>Closure</strong></div>
</div>

## 1. Request
Borrower задаёт сумму, срок и preference. Это **не contract terms**, а context для matching/request.

## 2. Proposal
Lender предлагает конкретные условия: principal, term, interest policy, response deadline и repayment policy. Borrower принимает, отклоняет или делает counter suggestion.

## 3. Contract
После explicit acceptance final lender proposal создаётся immutable ContractVersion.

## 4. Funding
Lender передаёт деньги вне платформы и прикладывает evidence. Borrower подтверждает получение или оспаривает. **Только confirmed funding** переводит obligation в ACTIVE.

## 5. Repayment

<div class="flow-strip">
<div class="flow-node"><small>A</small><strong>Payment claim</strong></div>
<div class="flow-node"><small>B</small><strong>Evidence</strong></div>
<div class="flow-node"><small>C</small><strong>Confirm</strong></div>
<div class="flow-node"><small>D</small><strong>Allocation</strong></div>
<div class="flow-node"><small>E</small><strong>Balance</strong></div>
<div class="flow-node"><small>F</small><strong>Schedule</strong></div>
</div>

Confirmed payment попадает в ledger. Ошибка не удаляется — создаётся reversal event.

## 6. Closure
Когда principal и applicable balance закрыты, нет unresolved dispute и получены final confirmations, создаётся ClosureCertificate.

## Особые случаи

| Ситуация | Что происходит |
|---|---|
| Proposal истёк | EXPIRED, нужна новая version |
| Funding оспорен | FUNDING_DISPUTED |
| Payment оспорен | Dispute workflow |
| Ошибочный confirmed payment | Immutable reversal |
| Изменились terms | New ContractVersion / amendment |
| Overdue | Worker + reminders |

Полная детализация: [Business logic](/docs/01-business/BUSINESS_LOGIC).
