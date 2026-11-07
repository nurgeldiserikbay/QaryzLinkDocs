# ADR-0031: Provider-mediated money movement

- Status: Proposed (legal gate ашылғанша production-да өшірулі)
- Date: 2026-10-18
- Owners: Product, Backend, Legal
- Related: ADR-0003, ADR-0004, ADR-0009, ADR-0011, ADR-0013, ADR-0030

## Context

QaryzLink қазір жеке тұлғалар (көбіне туыстар) арасындағы қарызды тіркейді. Ақша платформадан тыс жүреді; funding және repayment фактісі екі тараптың растауымен (ADR-0009, ADR-0011) және tamper-evident hash-chained event log, signed receipt және external anchor арқылы (ADR-0030) дәлелденеді.

Owner болашақта ақшаның жүйе **арқылы** жүруін қалайды: Upwork сияқты кепілдік — шарт талаптары орындалғанша қаражат ұсталады. Бұл ADR осы бағыттың шекарасын, фазаларын және domain design-ын бекітеді. Бұл құқықтық қорытынды емес.

### Зерттеу нәтижелері (белгісіздік белгіленген)

- ҚР «Төлемдер және төлем жүйелері туралы» Заңы (26.07.2016 № 11-VI; 22.11.2024 № 138-VIII өзгерістер, 24.05.2025 күшіне енген): төлем қызметтерін тек payment service provider-лер (банктер, НБРК тізіліміне енген төлем ұйымдары, Казпочта және т.б.) көрсетеді. Тіркеусіз бөтен ақшаны ұстау немесе аудару заңсыз.
- «Escrow / безопасная сделка» үшін заңда жеке құқықтық мәртебе **табылмады** (расталмаған). Іс жүзінде банк немесе төлем ұйымы деңгейінде hold (two-stage payment) немесе transit/nominee account арқылы жасалады.
- Төлем ұйымдары AML/CFT заңының субъектілері: KYC, АФМ-ға есеп беру. Provider интеграцияланса, бұл міндеттер негізінен provider-ге жүктеледі — нақты бөлінісі provider шартында бекітілуі керек.
- Жүйелі қарыз беру микроқаржы режиміне (АРРФР) әкелуі мүмкін — заңгер қорытындысы міндетті. Бейтаныс адамдар арасындағы lending пайда болса, AIFC-те «Operating a Loan Crowdfunding Platform» лицензиясы бар (AFSA, 2023).
- Providers:
  - **Freedom Pay** (docs.freedompay.kz) — card/IBAN-ға payout, card-to-card Transfer, clearing/refund бар. Ең лайықты кандидат.
  - **TipTopPay KZ** (бұрынғы CloudPayments) — two-stage payment болуы ықтимал, KZ үшін **расталмаған**.
  - **Halyk ePay** — сұрау керек.
  - **Kaspi Pay** — жеке тұлғаларға payout жоқ, partner rules cash-out-қа тыйым салады → **жарамсыз**.
  - Marketplace split payment жаңа платформаларға шектеулі қолжетімді (Astana Hub tender).
- Тәуекелдер: chargeback (purchase емес, transfer сценарийі артық), fictitious loan арқылы fraud/AML, салық (пайыздық кіріс — жеке тұлғаның табысы; 01.01.2026 бастап жаңа Салық кодексі, мөлшерлемелер **расталмаған**), fee алынса consumer protection.

## Decision

### 1. Негізгі принцип

1. QaryzLink ешқашан бөтен қаражатты өз шотында ұстамайды, өз merchant settlement балансы арқылы өткізбейді және тараптардың орнына аудармайды.
2. Ақша қозғалысы тек лицензияланған provider (банк немесе тіркелген төлем ұйымы) инфрақұрылымында жүреді. QaryzLink — тек interface және evidence жазушы.
3. Provider-ді тек `PaymentRail` port арқылы қолданамыз; vendor lock-in domain-ге кірмейді.
4. Барлық фаза feature flag + legal gate арқылы қосылады. ADR-0004 (платформа ақша ұстамайды, amount-based commission жоқ) осы ADR-мен жойылмайды, тек Phase A/B шекарасында нақтыланады.

### 2. Фазалар

~~~mermaid
flowchart LR
    M["Қазір: manual evidence + ADR-0030 chain"] --> A["Phase A: verified transfer"]
    A --> B["Phase B: conditional hold"]
    B -.->|scale + legal| C["Phase C: AIFC/PO licensing (optional)"]
~~~

**Phase A — Verified transfer.**

1. Lender app ішінде provider card-to-card transfer бастайды (provider hosted page / SDK, 3DS міндетті). Card data QaryzLink-ке түспейді.
2. Алушы картасы — borrower-дің KYC-тен өткен картасы (бір рет тіркеледі, provider token ретінде сақталады).
3. Provider webhook + `getStatus` pull-растауы — funding/repayment-тің ең күшті дәлелі. Ол contract event ретінде ADR-0030 chain-ге жазылады.
4. Manual evidence жолы (ADR-0009, ADR-0011) сақталады: provider — қосымша, міндетті емес арна.
5. Repayment симметриялы: borrower lender-дің тіркелген картасына transfer бастайды.

**Phase B — Conditional hold.**

1. Borrower шарт талаптарын қабылдап, екі тарап sign еткенде (ADR-0003/0008) lender картасында two-stage payment арқылы **hold** (authorization) қойылады.
2. Borrower «ақшаны алуға дайынмын» деп растағанда немесе шартта көрсетілген шарттар орындалғанда → capture + borrower картасына payout.
3. Timeout ережелері:
   - hold мерзімі өтсе (card hold мерзімі provider/issuer-ге тәуелді, шамамен 7–30 күн — **расталмаған**) → автоматты void/release, ешқашан auto-capture емес;
   - funding deadline өтсе → void, contract `EXPIRED_UNFUNDED` (ADR-0004);
   - lender hold-ты void ете алады тек borrower растауына дейін.
4. Repayment симметриялы: borrower картасында hold → due date-те немесе borrower растауымен capture → lender-ге payout. Lender confirm қадамы provider-confirmed жағдайда міндетті емес (төмендегі 4-бөлімді қараңыз).
5. Hold және capture арасында қаражат **provider-дің** nominee/transit схемасында болуы керек, QaryzLink merchant балансында емес. Бұл расталмайынша Phase B іске қосылмайды.

**Phase C — Licensing (optional).** Тек көлем, unit economics немесе бейтаныс адамдар арасындағы lending талап етсе: AIFC/AFSA лицензиясы немесе НБРК-да төлем ұйымы ретінде тіркелу. Жеке ADR және толық legal/compliance бюджеті қажет.

### 3. `PaymentRail` port

~~~ts
interface PaymentRail {
  initiateTransfer(cmd: {
    idempotencyKey: string;        // QaryzLink-генерацияланған, бір transfer-ге бір
    mode: 'DIRECT' | 'HOLD';       // Phase A | Phase B
    amountMinor: bigint; currency: 'KZT';
    payerPartyId: string; payeeTokenRef: string;
    contractId: string; purpose: 'FUNDING' | 'REPAYMENT';
  }): Promise<{ providerTxnId: string; redirectUrl?: string }>;
  capture(providerTxnId: string, idempotencyKey: string): Promise<void>;   // Phase B
  void(providerTxnId: string, idempotencyKey: string): Promise<void>;      // Phase B
  getStatus(providerTxnId: string): Promise<ProviderTxnStatus>;
  verifyWebhookSignature(rawBody: Uint8Array, headers: Record<string, string>): boolean;
  refund(providerTxnId: string, amountMinor: bigint, idempotencyKey: string): Promise<void>;
}
~~~

Adapter-лер: `FreedomPayRail`, `TipTopPayRail`, `FakeRail` (test/staging). Signature схемасы, timeout және retry semantics adapter ішінде.

### 4. Evidence source `PROVIDER_CONFIRMED`

1. Funding және Payment evidence-ке `source` өрісі қосылады: `MANUAL_UPLOAD` (қазіргі) | `PROVIDER_CONFIRMED`.
2. `PROVIDER_CONFIRMED` evidence: `provider`, `providerTxnId`, amount, currency, payer/payee masked card, provider timestamp, raw webhook object key және оның SHA-256.
3. Raw webhook body өзгертілмей private storage-да сақталады; SHA-256 ADR-0030 chain-ге `PROVIDER_TRANSFER_STATUS_CHANGED` event payload ретінде жазылады.
4. Webhook жалғыз өзі state өзгертпейді: signature тексеріледі → `getStatus` арқылы pull-растау → сонда ғана transition.
5. Расталу ережесі:
   - Funding: provider `PAID_OUT` → Funding `AWAITING_CONFIRMATION` (evidence дайын). Borrower бәрібір confirm/dispute жасайды. Contract-та екі тарап алдын ала келіскен «provider confirmation = receipt» тармағы болса ғана автоматты `CONFIRMED` — бұл legal gate (ADR-0004 «timeout auto-confirm жоқ» ережесі бұзылмайды, себебі бұл timeout емес, үшінші тарап дәлелі).
   - Repayment: дәл осындай; lender dispute ете алады, бірақ reason + provider evidence-ке сілтеме міндетті.
6. Admin provider evidence-ті қолмен жасай да, өзгерте де алмайды.

### 5. Transfer state machine

`ProviderTransfer` — Funding/Payment-тен бөлек aggregate, `fundingId` немесе `paymentId`-ге сілтеме жасайды.

~~~mermaid
stateDiagram-v2
    [*] --> INITIATED
    INITIATED --> HELD: authorization OK (HOLD mode)
    INITIATED --> PAID_OUT: transfer OK (DIRECT mode)
    INITIATED --> FAILED
    HELD --> CAPTURED: capture
    HELD --> VOIDED: void / hold expired
    CAPTURED --> PAID_OUT: payout OK
    CAPTURED --> FAILED: payout failed
    FAILED --> REFUNDED: refund to payer
    PAID_OUT --> REFUNDED: agreed refund
    PAID_OUT --> CHARGEBACK: issuer dispute
    CHARGEBACK --> PAID_OUT: chargeback won
~~~

| ProviderTransfer | Funding (ADR-0009) | Payment (ADR-0011) |
|---|---|---|
| `INITIATED`, `HELD`, `CAPTURED` | `EVIDENCE_REQUIRED` (pending transfer бар) | жоқ немесе draft |
| `PAID_OUT` | `AWAITING_CONFIRMATION` → `CONFIRMED` | `AWAITING_CONFIRMATION` → `CONFIRMED` |
| `FAILED`, `VOIDED`, `REFUNDED` (payout-қа дейін) | `EVIDENCE_REQUIRED` сақталады; deadline өтсе `EXPIRED_UNFUNDED` | payment жасалмайды |
| `REFUNDED` (payout-тан кейін) | dispute/amendment арқылы | ADR-0013 reversal |
| `CHARGEBACK` | `CONFIRMED` сақталады + Dispute | `CONFIRMED` сақталады + Dispute |

`CAPTURED → FAILED` (ақша ұсталды, payout өтпеді) — ең қауіпті күй: автоматты refund, alert және reconciliation міндетті.

### 6. Payout-тан кейінгі chargeback

1. Chargeback ешқашан silent rollback емес. Funding/Payment күйі, allocation және ledger өзгермейді.
2. `PROVIDER_CHARGEBACK_OPENED` event chain-ге жазылады, contract-та `Dispute` ашылады, екі тарапқа хабарлама.
3. Chargeback final (provider ұтылды деп растаса):
   - Repayment үшін — `PROVIDER_CHARGEBACK` түріндегі reversal (ADR-0013 механизмі). ADR-0013 «тек lender reversal бастайды» ережесіне provider-source үшін ерекшелік қажет — бөлек amendment.
   - Funding үшін — borrower ақшаны алды, бірақ lender оны issuer арқылы қайтарды. Obligation автоматты жойылмайды; Dispute тараптар келісімімен немесе сыртқы шешіммен жабылады.
4. Chargeback-тен кейін бастамашы account-та `CHARGEBACK_ABUSE` flag, provider арналары уақытша бұғатталады.

### 7. Idempotency және reconciliation

1. Әр `initiateTransfer/capture/void/refund` QaryzLink idempotency key-мен шақырылады; бір contract purpose үшін бір белсенді transfer.
2. Webhook dedup кілті: `(provider, providerTxnId, providerStatus, providerEventId)`. Қайталанған webhook — 200 OK, ешбір әсер жоқ.
3. Transitions monotonic; кеш келген ескі status (мысалы, `PAID_OUT`-тан кейін `HELD`) тек сақталады, қолданылмайды.
4. Reconciliation job (күн сайын + `INITIATED/HELD/CAPTURED` күйінде N минуттан асқан transfer-лер үшін жиірек) provider report/`getStatus`-пен салыстырады. Сәйкессіздік → `RECONCILIATION_MISMATCH` event + alert; contract күйін автоматты «жөндемейді».
5. Outbox pattern (ADR-0014) арқылы notification және chain append бір transaction-да.

### 8. Лимиттер және AML flags

1. Конфигурацияланатын лимиттер: бір transfer, ай сайынғы көлем, бір пайдаланушыдағы белсенді provider-funded contract саны. Бастапқы мәндер provider лимиттерінен төмен және legal review-дан кейін бекітіледі.
2. Flags (manual review, transfer уақытша тоқтатылады):
   - circular flow: A→B→A немесе A→B→C→A қысқа мерзімде;
   - funding-тен кейін бірден толық early repayment (round-tripping);
   - бір borrower-ге көп lender немесе керісінше, velocity spike;
   - card holder name ≠ KYC name, бір карта бірнеше account-та;
   - бөлшектенген сомалар (лимиттен сәл төмен structuring).
3. QaryzLink АФМ-ға өзі есеп бермейді (егер заңгер басқаша айтпаса); flag деректерін provider шартында келісілген тәртіппен береді.

### 9. KYC

1. Provider KYC (payout алушы үшін provider талаптары) — міндетті.
2. QaryzLink жағында: verified identity (Kazakhstan Digital ID/eGov feasibility, OPEN_QUESTIONS 3-бөлім), card holder name және мүмкін болса ЖСН KYC деректерімен сәйкес келуі.
3. 3DS міндетті; card token тек provider-де, QaryzLink-те masked PAN ғана.
4. Organization party (ADR-0029) Phase A/B-ден тыс.

### 10. Fees

1. Provider fee төлеушіге (transfer бастаушыға) растау алдында анық көрсетіледі; QaryzLink markup қоспайды.
2. Amount-based platform commission ADR-0004 және legal gate бойынша жоқ. Subscription моделі өзгеріссіз.
3. Fee қарыз сомасынан ұсталмайды: borrower шарттағы толық соманы алуы керек.

### 11. Салық

Платформа салық агенті ретінде ұстап қалмайды. Пайыздық кірістің декларациясы туралы ескерту (UI disclosure) береді; мәтін жаңа Салық кодексі бойынша заңгер растағаннан кейін бекітіледі.

## Legal gates және ашық сұрақтар

**Заңгерге:**

1. Phase A (provider card-to-card, біз тек бастамашы UI) QaryzLink-ті төлем қызметін көрсетуші етеді ме?
2. Phase B hold/capture/payout схемасы (provider nominee/transit шотында) бізге тіркеу талап ете ме? Ақша қандай жағдайда «біздің merchant балансымызда» деп саналады?
3. «Escrow / безопасная сделка» үшін арнайы құқықтық режим немесе НБРК түсіндірмесі бар ма?
4. Provider-confirmed evidence + келісілген шарт тармағы funding-ті автоматты растау үшін жеткілікті дәлел ме?
5. Жүйелі пайыздық қарыз + платформа арқылы ақша жүруі микроқаржы режиміне (АРРФР) қашан әкеледі?
6. Біз AML/CFT субъектісі боламыз ба, әлде міндеттер толық provider-де ме?
7. Provider fee-ді көрсету және subscription consumer protection талаптарына қалай сай келеді?
8. 2026 Салық кодексі бойынша пайыздық кірістің мөлшерлемесі және платформаның ақпарат беру міндеті бар ма?
9. Phase C: AIFC loan crowdfunding лицензиясы мен НБРК PO тіркеуінің талаптары, мерзімі, капиталы.

**Freedom Pay / TipTopPay / Halyk ePay-ге:**

1. Card-to-card transfer және card/IBAN payout жаңа платформа үшін қолжетімді ме, қандай шартпен (merchant category, P2P рұқсаты)?
2. Two-stage payment (authorization → capture/void) KZ-та бар ма? Hold-тың максимал мерзімі қанша?
3. Capture пен payout арасында қаражат қай шотта тұрады — provider nominee/transit ме, әлде біздің merchant балансымыз ба? Split/marketplace схемасы бар ма?
4. Chargeback жауапкершілігі payout-тан кейін кімде (біз, payer, provider)? Chargeback webhook және reason code береді ме?
5. KYC: payout алушыны кім тексереді? Card holder name/ЖСН match API бар ма?
6. Лимиттер: бір transfer, күн/ай, бір карта бойынша.
7. Fee құрылымы (transfer, payout, refund, chargeback) және оны payer-ге аудару мүмкіндігі.
8. Webhook signature алгоритмі, retry саясаты, event id, status API және daily reconciliation report форматы.
9. AML: provider бізден қандай деректер мен flag-тарды талап етеді?
10. Sandbox, SLA, КЗТ-дан басқа валюта.

## Consequences

- Domain provider-ден тәуелсіз қалады; manual evidence жолы fallback ретінде жұмыс істей береді.
- Provider-confirmed evidence dispute санын азайтады және ADR-0030 chain-ді үшінші тарап дәлелімен күшейтеді.
- Жаңа aggregate (`ProviderTransfer`), webhook ingestion, reconciliation job және AML flag review жұмыс көлемін қосады.
- ADR-0013-ке provider-source reversal ерекшелігі бойынша amendment қажет.
- Phase B provider жауаптары мен заңгер қорытындысынсыз басталмайды.

## Не істемеу керек

- Тараптардың ақшасын QaryzLink шотына немесе merchant балансына қабылдап, кейін «өзіміз» аудару.
- Kaspi Pay немесе «Kaspi Gold-қа аударыңыз» сияқты cash-out-қа тыйым салынған схемаларды қолдану.
- Purchase/«қызметке төлем» ретінде loan funding-ті маскалау (chargeback, MCC бұзу).
- Webhook-қа signature және `getStatus` тексерусіз сену.
- Chargeback немесе refund кезінде Funding/Payment/ledger-ді үнсіз rollback жасау.
- Hold timeout-та auto-capture.
- Card data-ны QaryzLink-те сақтау немесе логтау.
- Amount-based commission немесе пайыздан үлес алу (legal gate-сіз).
- Бейтаныс адамдар арасындағы public lending-ті provider rails-пен қосу (Phase C-сіз).

## Alternatives

- Өз nominee шотымыз арқылы escrow — тіркеусіз заңсыз төлем қызметі болғандықтан қабылданбады.
- Бірден НБРК-да төлем ұйымы ретінде тіркелу — қазіргі масштабқа шамадан тыс, Phase C-ге қалдырылды.
- Тек bank statement парсинг/open banking — KZ-та қолжетімділігі шектеулі; кейінгі evidence source ретінде қарастырылуы мүмкін.
- Kaspi Pay — payout жоқ, partner rules тыйым салады.
