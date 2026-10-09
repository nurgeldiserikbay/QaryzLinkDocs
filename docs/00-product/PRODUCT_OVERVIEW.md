# Product Overview

## 1. Өнім

QaryzLink — қарыз беруші мен қарыз алушыны байланыстырып, талаптарды салыстыруға, соңғы шартты бекітуге, ақша берілгенін растауға және төлем кестесін басқаруға көмектесетін privacy-first платформа.

Бастапқы нарық — Қазақстан. Бастапқы аудитория — кәмелетке толған жеке тұлғалар. Архитектура болашақта заңды тұлғалар мен басқа country pack-терді қолдауы керек.

## 2. Құндылық ағыны

~~~mermaid
flowchart TD
    A["Тарапты табу"] --> B["Талаптарды салыстыру"]
    B --> C["Нақты ұсыныс"]
    C --> D["Екі тарап қол қояды"]
    D --> E["Ақша берілгенін растау"]
    E --> F["Төлем кестесін орындау"]
    F --> G["Жабу немесе dispute"]
~~~

## 3. Табу арналары

### Current pilot

- exact Public ID арқылы private invite;
- one-time private invitation link / QR;
- existing invite-only request relationship.

Current pilot UI email/phone contact lookup жасамайды. `searchableByContact` data/privacy capability future contact discovery үшін ғана reserved және user-facing contact search ретінде қарастырылмауы тиіс.

### Future gated channels

- public LenderOffer marketplace;
- richer/public BorrowerRequest publication;
- contact-based discovery;
- broader relationship graph.

Ашық іздеу мен matching production-да тек Қазақстан бойынша legal gate өткеннен кейін қосылады.

## 4. Пайдаланушы рөлдері

| Рөл | Мақсаты |
|---|---|
| Individual | Қарыз береді, алады, шартқа қол қояды |
| Lender | Соңғы қаржылық талаптарды ұсынады |
| Borrower | Preference жариялайды, ұсынысты қабылдайды немесе бас тартады |
| Guarantor | Болашақта кепілгерлік міндеттемесін қабылдайды |
| Organization owner | Болашақта ұйым кеңістігін басқарады |
| Signatory | Болашақта ұйым атынан қол қояды |
| Moderator | Ашық контент пен abuse жағдайларын тексереді |
| Support agent | Пайдаланушыға шектеулі қолжетімділікпен көмектеседі |
| Compliance officer | Verification және legal gate процестерін бақылайды |
| Auditor | Read-only audit алады |

Бір User бір міндеттемеде lender, екіншісінде borrower бола алады. Сондықтан Lender және Borrower жеке аккаунт түрі емес, ObligationParty рөлдері.

## 5. Сенім деңгейлері

| Level | Сипаттама |
|---|---|
| A0 Private | Бір тараптың жеке жазбасы |
| A1 Shared | Екінші тарапқа жіберілген |
| A2 Confirmed | Екі тарап талаптарды растаған |
| A3 Identity verified | Тұлғалар KYC арқылы расталған |
| A4 Electronically signed | Электрондық растау/қолтаңба |
| A5 Qualified signature | Ел мойындайтын ЭЦҚ/QES |
| A6 Regulated/notarial | Нотариус немесе арнайы реттелетін процесс |

## 6. Өнім шекарасы

### Платформа істейді

- тараптарды табуға көмектеседі;
- талаптарды құрылымдайды;
- matching түсіндірмесін береді;
- келіссөз нұсқаларын сақтайды;
- шарт snapshot-ын бекітеді;
- evidence және audit жүргізеді;
- schedule және balance есептейді;
- reminders жібереді;
- dispute материалдарын жинайды.

### Платформа бастапқыда істемейді

- өзі қарыз бермейді;
- несие мақұлдамайды;
- ақшаны өз шотында ұстамайды;
- қарыздың қайтарылуына кепілдік бермейді;
- кредиттік бюро ретінде рейтинг жарияламайды;
- сот немесе нотариус орнына шешім қабылдамайды;
- бір тарап жүктеген файлды автоматты ақиқат деп қабылдамайды.

## 7. Негізгі өнімдік метрикалар

- confirmed obligations саны;
- offer-to-contract conversion;
- contract-to-funded conversion;
- on-time payment ratio;
- funding dispute ratio;
- repayment dispute ratio;
- median time to agreement;
- closure rate;
- privacy/consent incidents;
- manual review rate.

Метрикалар пайдаланушыға жария рейтинг жасау үшін автоматты қолданылмайды.
