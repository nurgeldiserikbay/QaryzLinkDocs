# Жобаға шолу

<span class="doc-kicker">PRODUCT OVERVIEW</span>

<div class="doc-lead">QaryzLink — екі тарап арасындағы жеке қарыз/міндеттеме lifecycle-ін privacy-first қағидасымен келісіп, дәлелдеп және бақылап жүргізуге арналған платформа.</div>

## Негізгі идея

Платформа "кім не деді?" деген чат деңгейінен **versioned, confirmed, traceable workflow** деңгейіне көшіреді.

<div class="system-grid">
<div class="system-card system-card--accent"><h3>Borrower</h3><p>Қажетті соманы/мерзімді көрсетеді, ұсынысты қарайды, final terms-ті қабылдайды, funding receipt және repayments-ті растайды.</p></div>
<div class="system-card system-card--accent"><h3>Lender</h3><p>Нақты қаржылық шарттарды ұсынады, funding evidence береді, төлемдерді растайды немесе дауласады.</p></div>
<div class="system-card"><h3>QaryzLink</h3><p>Lifecycle, immutable history, privacy, evidence және calculation policy-ді басқарады. MVP-де ақшаны сақтамайды.</p></div>
</div>

## Негізгі принциптер

| Принцип | Мағынасы |
|---|---|
| Біржақты жазба ≠ расталған қарыз | Екінші тарап explicit confirmation бермейінше ортақ факт болмайды |
| Signed ≠ Funded | Қол қойылған шарт ақша берілгенін дәлелдемейді |
| Uploaded ≠ Confirmed | Файл жүктелуі автоматты түрде оқиғаны растауға жеткіліксіз |
| Privacy by default | Жеке дерек әдепкіде жабық |
| Immutable history | Confirmed history үнсіз өзгертілмейді |
| Platform ≠ bank | MVP-де custody жоқ |

## Репозиторийлер

| Repo | Рөлі |
|---|---|
| QaryzLinkFront | Landing + user application |
| QaryzLinkBack | API + business logic + DB + workers + integrations |
| QaryzLinkAdmin | Internal operations/support/moderation |
| QaryzLinkDocs | Canonical specification + visual docs |

Келесі: [Бизнес схема](/kk/business-flow).
