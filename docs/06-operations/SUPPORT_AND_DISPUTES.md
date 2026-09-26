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

1. Тарап dispute бар екенін белгілейді.
2. Affected obligation/contract reference көрсетіледі.
3. Қысқа description беріледі.
4. Existing platform evidence-ке сілтеме беріледі; duplicate raw evidence support ticket-ке қайта жүктелмейді.
5. Support case ID беріледі.

Dispute ашылғаны payment/contract record-ты автоматты түрде өзгертпейді.

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

Support case OPEN, WAITING_USER, WAITING_INTERNAL, RESOLVED немесе CLOSED күйінде болады.

Dispute resolution business record-ты өзгертуі керек болса, ол dedicated audited workflow арқылы ғана орындалады; support ticket state-і өзі financial truth source емес.

## 8. Pilot gate

Public pilot алдында support mailbox/helpdesk, response target, incident escalation owner, abuse escalation path, legal escalation contact, support-ticket retention және user-facing support/privacy notice бекітіледі.