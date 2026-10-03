# Обзор проекта

<span class="doc-kicker">PRODUCT OVERVIEW</span>

<div class="doc-lead">QaryzLink — privacy-first платформа для согласованного, доказуемого и контролируемого ведения lifecycle частного долга/обязательства между двумя сторонами.</div>

## Основная идея

Платформа переводит отношения из уровня "кто что написал в чате" в **versioned, confirmed, traceable workflow**.

<div class="system-grid">
<div class="system-card system-card--accent"><h3>Borrower</h3><p>Указывает сумму/срок, рассматривает предложение, принимает final terms, подтверждает funding receipt и repayments.</p></div>
<div class="system-card system-card--accent"><h3>Lender</h3><p>Предлагает конкретные финансовые условия, предоставляет funding evidence, подтверждает или оспаривает платежи.</p></div>
<div class="system-card"><h3>QaryzLink</h3><p>Управляет lifecycle, immutable history, privacy, evidence и calculation policy. В MVP не хранит деньги.</p></div>
</div>

## Ключевые принципы

| Принцип | Значение |
|---|---|
| Односторонняя запись ≠ подтверждённый долг | Нужен explicit confirmation второй стороны |
| Signed ≠ Funded | Подписанный договор не доказывает выдачу денег |
| Uploaded ≠ Confirmed | Загруженный файл сам по себе не подтверждает событие |
| Privacy by default | Персональные данные закрыты по умолчанию |
| Immutable history | Подтверждённая история не меняется незаметно |
| Platform ≠ bank | В MVP нет custody |

## Репозитории

| Repo | Роль |
|---|---|
| QaryzLinkFront | Landing + user application |
| QaryzLinkBack | API + business logic + DB + workers + integrations |
| QaryzLinkAdmin | Internal operations/support/moderation |
| QaryzLinkDocs | Canonical specification + visual docs |

Далее: [Бизнес-схема](/ru/business-flow).
