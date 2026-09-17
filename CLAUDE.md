# CLAUDE.md

QaryzLinkDocs — Claude Code және Codex бірге пайдаланатын ортақ specification repository.

## Міндетті оқу реті

1. README.md
2. docs/00-product/PRODUCT_OVERVIEW.md
3. docs/01-business/BUSINESS_LOGIC.md
4. docs/01-business/STATE_MACHINES.md
5. docs/02-architecture/DOMAIN_MODEL.md
6. docs/02-architecture/DATA_MODEL.md
7. docs/03-security/PRIVACY_SECURITY.md
8. docs/04-delivery/ROADMAP.md
9. adr/

## Негізгі шектеулер

- Платформа бастапқыда ақша сақтамайды немесе аудармайды.
- Қол қою ақша берілгенін білдірмейді.
- Interest accrual тек FundingConfirmed оқиғасынан кейін басталады.
- BorrowerRequest — preference; LenderOffer/ContractVersion — міндеттеме талаптарының көзі.
- Ашық matching legal gate артында.
- User-entered record confirmed debt ретінде көрсетілмейді.
- Public profile-де нақты қарыз, ЖСН және контрагент ашылмайды.
- Business logic өзгерісі құжаттар мен тест acceptance criteria-ға бірге енгізіледі.

## Handoff

Әр тапсырмадан кейін өзгертілген құжаттарды, қабылданған шешімдерді, ашық қалған сұрақтарды және келесі агентке қажет әрекетті қысқаша жаз.
