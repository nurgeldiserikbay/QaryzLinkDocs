# Support and dispute operations

Жаңартылған күні: 2026-09-26.

QaryzLink тараптар арасындағы қарыз/міндеттемені басқаруға көмектеседі. Платформа dispute кезінде бір тараптың мәлімдемесін автоматты түрде ақиқат деп жарияламайды, ақша ұстамайды және сот/арбитраж рөлін атқармайды.

## 1. Support scope

Support мыналарға көмектесе алады:

- аккаунтқа кіру және email verification;
- privacy/settings;
- request/proposal/contract күйін түсіндіру;
- payment/funding evidence upload техникалық қатесі;
- notification delivery;
- account deletion request күйі;
- incident немесе abuse report қабылдау.

Support қарыздың кімге тиесілі екенін өзі шешпейді және құқықтық шешім шығармайды.

## 2. Ticket data minimization

Ticket ішінде әдепкіде user-provided support reference, UTC timestamp, environment/app version, privacy-safe error code және қажет болса opaque contract/request reference ғана сақталады.

Қажет болмаса email/phone, IIN/BIN, bank details, raw documents, passwords, tokens, signed URLs және full message history жиналмайды.

## 3. Dispute intake

Қазіргі participant-facing MVP flow:

1. authenticated user өзі қатысатын contract-ті ашады;
2. contract бойынша dispute жоқ болса 5–1000 таңбалық қысқа description береді;
3. backend contract participant scope-ты тексереді;
4. бір contract-қа бір neutral dispute case жасалады;
5. қарсы тарап та сол case-ті read-only көре алады;
6. audit event тек case id сақтайды, description audit payload-қа көшірілмейді.

Dispute response opener party identity-сін шығармайды. Dispute ашылғаны payment/contract/ledger record-ты автоматты түрде өзгертпейді. Raw evidence dispute form арқылы қайта жүктелмейді.

## 4. Neutral handling

Support:

- екі тараптың access scope-тарын сақтайды;
- hidden/private profile data-ны қарсы тарапқа ашпайды;
- бір тараптың сөзімен ledger/history-ді қайта жазбайды;
- immutable event/evidence history-ді жоймайды;
- technical correction керек болса бөлек auditable operation арқылы жасайды.

Құқықтық талап, subpoena/court order немесе regulator request бөлек legal review-ға жіберіледі.

## 5. Evidence handling

- support raw evidence-ті email/chat арқылы сұрамайды;
- production evidence тек authorized application path арқылы қаралады;
- malware verdict CLEAN емес object ашылмайды;
- signed download URL ticket-ке сақталмайды;
- retained evidence deletion/retention legal policy-ге бағынады.

## 6. Abuse and safety

Credential theft/phishing, identity impersonation, coercion/threats, document manipulation, automated scraping, rate-limit bypass және unauthorized account access escalation алады.

Immediate safety risk туралы support құқық қорғау/жедел қызметті алмастырмайды; қолданушыға жергілікті emergency channel-ға жүгіну ұсынылады.

## 7. Resolution states

Dispute case OPEN, WAITING_USER, WAITING_INTERNAL, RESOLVED немесе CLOSED күйінде болады. Қазіргі public participant API case ашу және оқу операцияларын ғана береді; status transition support/admin workflow-ы әдейі қосылмаған.

Dispute resolution business record-ты өзгертуі керек болса, ол dedicated audited workflow арқылы ғана орындалады; support ticket state-і өзі financial truth source емес.

## 8. Pilot gate

Public pilot алдында support mailbox/helpdesk, response target, incident escalation owner, abuse escalation path, legal escalation contact, support-ticket retention және user-facing support/privacy notice бекітіледі.