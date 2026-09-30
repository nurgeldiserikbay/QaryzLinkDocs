# Staging acceptance checklist

Жаңартылған күні: 2026-09-26.

Бұл checklist QaryzLink-ті public pilot-қа дейін нақты staging environment-те тексеруге арналған. Code/CI green болуы staging acceptance орнына жүрмейді.

## 1. Release identity

- [ ] Deploy commit SHA жазылған.
- [ ] API/worker/CronJob image бір immutable digest қолданады.
- [ ] CI және supply-chain checks green.
- [ ] Migration Job сол digest-пен аяқталды.
- [ ] Сол image/config ішінде `pnpm release:preflight` іске қосылды; overall status `fail` емес және JSON evidence secret-free сақталды.

## 2. Network және TLS

- [ ] HTTPS certificate valid.
- [ ] API ingress restricted.
- [ ] Database/Redis/object storage management ports public емес.
- [ ] TRUST_PROXY_HOPS нақты ingress topology-ге сәйкес.
- [ ] Ingress caller-supplied Forwarded/X-Forwarded-* headers-ді overwrite/sanitize етеді.
- [ ] CORS тек нақты Front/Admin origin-дерге рұқсат етеді.
- [ ] Metrics endpoint public internet-тен қолжетімсіз.

## 3. Health және rollout

- [ ] /api/v1/health 200.
- [ ] /api/v1/health/ready 200 және database=up.
- [ ] Kubernetes readiness probe дәл ready endpoint-ті қолданады.
- [ ] Rolling update кезінде available replica нөлге түспейді.
- [ ] Last-known-good digest rollback rehearsal орындалды.

## 4. Auth және privacy smoke

- [ ] register/login/refresh rotation/logout.
- [ ] replayed refresh token 401.
- [ ] forged forwarded IP rate-limit budget-ті айналып өтпейді.
- [ ] жаңа profile privacy-closed.
- [ ] account deletion request active sessions-ды revoke етеді.
- [ ] production Swagger/docs жабық.

## 5. Email

- [ ] MAIL_ENABLED=false немесе verified sender толық дайын.
- [ ] SPF/DKIM/DMARC provider жағында тексерілген.
- [ ] verification email test mailbox-қа жетті.
- [ ] expired/reused verification token fail-closed.
- [ ] log-та email body/token/SMTP secret жоқ.

## 6. Evidence storage

- [ ] private bucket және least-privilege credential.
- [ ] signed PUT expected metadata/size шекарасымен жұмыс істейді.
- [ ] CLEAN verdict evidence persistence-ке жол береді.
- [ ] INFECTED/FAILED/unknown verdict блоктайды.
- [ ] infected object purge.
- [ ] participant-only signed download.
- [ ] expired unconsumed cleanup CronJob.
- [ ] storage/scanner outage кезінде fail-closed.

### 6.1 Evidence KMS/HSM signer operations

- [ ] `EVIDENCE_SIGNER_DEPLOYMENT_ID` reviewed deployment/IaC version-ға сәйкес.
- [ ] `EVIDENCE_SIGNER_IAM_POLICY_ID` signer gateway үшін least-privilege policy version-ға сәйкес.
- [ ] IAM signing permission нақты expected key scope-пен шектелген.
- [ ] Runtime credential key create/delete/admin permission алмайды.
- [ ] `EVIDENCE_SIGNER_KEY_CEREMONY_ID` independent key creation/activation record-қа сәйкес.
- [ ] Ceremony кезінде public SPKI/fingerprint independent channel/tool арқылы тексерілген.
- [ ] `EVIDENCE_SIGNER_KEY_LIFECYCLE_POLICY_ID` rotation/revocation/old-key disable-delete procedure version-ға сәйкес.
- [ ] Active key compromise drill: provider signing permission тоқтайды, registry revoke болады, жаңа seal fail-closed.
- [ ] Rotation drill: жаңа key accepted, previous ACTIVE → RETIRED, expected pin cutover және v1/v2 seal verify.
- [ ] Old key disable/delete timing retention/legal policy-ге қайшы емес.
- [ ] Signer audit/log acceptance secret/private key/raw evidence шығармайтынын тексереді.
- [ ] Release preflight `evidence_signer_operations=manual` көрсетеді; бұл checklist owner+engineer review арқылы жабылады.

### 6.2 External timestamp authority

- [ ] Timestamp feature disabled немесе approved staging authority configured.
- [ ] Authority endpoint HTTPS және expected routing/TLS policy-ге сәйкес.
- [ ] Wrong bearer credential rejected.
- [ ] Redirect/timeout/oversized/malformed response fail-closed.
- [ ] Wrong authority ID және wrong Ed25519 key fingerprint rejected.
- [ ] Nonce mismatch/replay rejected.
- [ ] Authority time configured clock-skew шекарасынан шықса rejected.
- [ ] Changed attestation payload signature verification-нан өтпейді.
- [ ] v1 metadata ZIP және v2 full ZIP seal verified external attestation алады.
- [ ] Authority outage timestamp-required seal-ды audit/response-қа дейін fail-closed тоқтатады.
- [ ] `EVIDENCE_TIMESTAMP_STANDARD_PROFILE_ID` reviewed protocol/standards profile artifact-ке сәйкес.
- [ ] `EVIDENCE_TIMESTAMP_TRUST_POLICY_ID` authority certificate/path trust policy version-ға сәйкес.
- [ ] `EVIDENCE_TIMESTAMP_REVOCATION_POLICY_ID` revocation/OCSP/CRL/long-term validation policy version-ға сәйкес.
- [ ] `EVIDENCE_TIMESTAMP_LEGAL_CLASSIFICATION_ID` Kazakhstan legal classification record-қа сәйкес.
- [ ] Release preflight `evidence_timestamp_governance=manual` көрсетеді; refs өзі standards/legal acceptance емес.
- [ ] Acceptance record бұл foundation RFC3161/qualified legal timestamp емес екенін көрсетеді.
- [ ] Егер legal gate RFC3161/qualified TSA талап етсе, standards-based provider, certificate path/revocation және legal acceptance бөлек орындалды.

### 6.3 Contract PDF renderer

- [ ] Approved KZ template artifact + independent SHA-256 recorded.
- [ ] Approved RU template artifact + independent SHA-256 recorded.
- [ ] Legal owner template IDs/hashes-ты sign-off етті.
- [ ] `CONTRACT_PDF_TEMPLATE_APPROVAL_ID` reviewed KZ/RU template artifact set/version-ға сәйкес.
- [ ] `CONTRACT_PDF_LEGAL_SIGNOFF_ID` Kazakhstan legal wording/sign-off record-қа сәйкес.
- [ ] `CONTRACT_PDF_VISUAL_ACCEPTANCE_ID` KZ/RU pagination/layout visual acceptance record-қа сәйкес.
- [ ] `CONTRACT_PDF_FONT_EMBEDDING_POLICY_ID` approved deterministic font/embedding policy version-ға сәйкес.
- [ ] Release preflight `contract_pdf_governance=manual` көрсетеді; refs өзі acceptance емес.
- [ ] Жаңа contract draft дәл сол pins-ті ContractVersion-ға snapshot етеді.
- [ ] Signed documentHash template identity-ді қамтиды.
- [ ] Legacy contract templatePinned=false және retroactive render жасалмайды.
- [ ] Renderer endpoint HTTPS және expected routing/TLS policy-ге сәйкес.
- [ ] Wrong bearer token rejected.
- [ ] Redirect/timeout/oversized response fail-closed.
- [ ] Wrong renderer ID/key fingerprint rejected.
- [ ] Wrong locale/template/source/renderInput binding rejected.
- [ ] Malformed PDF/header/EOF/hash/size mismatch rejected.
- [ ] Renderer detached signature independently verify болады.
- [ ] KK және RU PDF fonts/pagination/line breaks visual approval өтті.
- [ ] Same source + locale + pinned template deterministic PDF hash береді.
- [ ] Audit PDF bytes/token/PII сақтамайды.
- [x] Final verified PDF bytes + metadata ZIP v2 evidence chain-ге bound; archive build source/hash binding қайта тексереді.

### 6.4 Contract amendment N+1 + pre-payment financial transition

- [ ] `CONTRACT_AMENDMENTS_ENABLED=true` және `CONTRACT_SIGNING_ENABLED=true` тек approved staging config-та қосылды.
- [ ] OTHER amendment base terms-ті inherit етеді және financial state-ке әсер етпейді.
- [ ] TERMS_CHANGE кемінде termDays немесе annualRateBps нақты өзгертеді; no-op rejected.
- [ ] SCHEDULE_CHANGE тек termDays қабылдайды; annualRateBps берілсе rejected.
- [ ] Participant amendment response proposedFinancialTerms ретінде тек bounded termDays/rate көрсетеді.
- [ ] Financial start-signing тек ACTIVE contract + CONFIRMED funding + funding effectiveAt кезінде allowed.
- [ ] Principal/currency өзгерту әрекеті fail-closed.
- [ ] Contract-та кез келген Payment row бар болса financial start/final activation fail-closed.
- [ ] Funding effectiveAt + amended termDays current UTC date-тен кейін болмаса activation blocked.
- [ ] Start-signing exact current signed baseVersion-нан N+1 SIGNING ContractVersion жасайды.
- [ ] Financial N+1 documentHash proposed terms + amendment document hash + base document provenance + pinned templates-ті bind етеді.
- [ ] Default document routes unsigned N+1-ді active document ретінде көрсетпейді; explicit version routes candidate review береді.
- [ ] Бірінші signature currentVersion/schedule/payment/ledger-ді өзгертпейді.
- [ ] Financial amendment SIGNING кезінде new repayment evidence PAYMENT_CONFLICT арқылы blocked.
- [ ] Екінші signature алдында zero-payment/funding/maturity guards қайта тексеріледі.
- [ ] Successful financial activation previous unpaid schedule items-ті CANCELLED етеді.
- [ ] New ScheduleVersion sourceContractVersion=N+1 және sourceAmendmentId exact amendment ID сақтайды.
- [ ] New ScheduleVersion inputHash normal schedule generation-мен бірдей signed N+1 documentHash/source contract қолданады.
- [ ] N+1→SIGNED, base→SUPERSEDED, currentVersion→N+1, amendment→ACTIVATED бір transaction ішінде.
- [ ] New Funding row жасалмайды; original funding effectiveAt сақталады.
- [ ] Generic schedule generation Proposal terms емес, exact signed Contract.currentVersion termsSnapshot қолданады.
- [ ] Schedule generation unsigned current version болса fail-closed.
- [ ] New evidence package schema v6 proposed terms + schedule provenance + accounting snapshot/cutover history + ContractVersion sourceCutoverPreviewId binding-ті canonical manifest-ке bind етеді.
- [ ] Existing persisted evidence v1/v2/v3/v4/v5 package retroactive rewrite болмайды.
- [ ] Payment history бар APPROVED TERMS_CHANGE/SCHEDULE_CHANGE үшін accounting-preview participant-only жұмыс істейді.
- [ ] Preview тек ACTIVE + CONFIRMED funding + exact current signed ContractVersion + one-item latest schedule кезінде жасалады.
- [ ] Persisted paidMinor charge → interest → principal policy бойынша paid/outstanding component split-ке детерминистік реконструкцияланады.
- [ ] Confirmed active payment total = schedule paidMinor + unallocated credit reconciliation бұзылса preview fail-closed.
- [ ] Exact same accounting state retry жаңа row жасамайды және same stateHash/snapshot қайтарады.
- [ ] Confirmed payment/reversal/unresolved state өзгергеннен кейін жаңа stateHash және snapshot version жасалады; prior snapshot immutable қалады.
- [ ] GET accounting-previews тек borrower/lender participant-қа snapshot history береді.
- [ ] Preview response policyStatus=PREVIEW_ONLY, activationEligible=false, activationReason=POST_PAYMENT_ACCOUNTING_POLICY_PENDING.
- [ ] Accounting preview ContractVersion/ScheduleVersion/PaymentAllocation/LedgerEntry/currentVersion mutation жасамайды.
- [ ] Accounting snapshot history source contract/schedule hashes, component split, reconciliation totals және stateHash-пен evidence v5 ішінде бар.
- [ ] POST cutover-preview exact latest accountingSnapshotId талап етеді; arbitrary effective/cutover date request қабылдамайды.
- [ ] Selected snapshot current signed ContractVersion, latest ScheduleVersion, paidMinor/components, payment counts/totals және canonical stateHash-пен қайта verify болады.
- [ ] Payment/reversal/unresolved state snapshot-тан кейін өзгерсе old snapshot cutover projection үшін stale болып rejected.
- [ ] Current schedule full-term interest base ACT/365 half-up formula-ға сәйкес болмаса cutover projection fail-closed.
- [ ] Snapshot reference day-ға дейінгі technical accrued interest және historical paid-interest бөлек көрсетіледі.
- [ ] paidInterest > accruedInterest болса айырма interestReclassificationCandidateMinor болады; ол refund/credit/principal allocation жасамайды.
- [ ] Existing unallocated credit те creditsNotApplied ішінде бөлек қалады және projectedRemainingDue-дан автоматты шегерілмейді.
- [ ] Proposed maturity original funding effective date + proposed total termDays бойынша есептеледі және reference day-дан кейін болуы тиіс.
- [ ] Projected future interest proposed rate бойынша тек opening outstanding principal + remaining days арқылы есептеледі.
- [ ] Same accounting snapshot retry same previewHash/row қайтарады; historical preview immutable қалады.
- [ ] GET cutover-previews тек contract participant-қа versioned history береді.
- [ ] Cutover response policyStatus=PREVIEW_ONLY, activationEligible=false, activationReason=POST_PAYMENT_CUTOVER_POLICY_PENDING.
- [ ] Cutover preview ContractVersion/ScheduleVersion/PaymentAllocation/LedgerEntry/currentVersion mutation жасамайды.
- [ ] Evidence v6 exact accountingSnapshotId, state/preview hashes, policy version, projection amounts/dates және sourceCutoverPreviewId-ті қамтиды.
- [ ] `CONTRACT_POST_PAYMENT_AMENDMENT_SIGNING_ENABLED` default false; amendments/signing gates off болса enable validation fail болады.
- [ ] Release preflight post_payment_amendment_signing=manual / post_payment_accounting_legal_acceptance_required көрсетеді.
- [ ] POST start-post-payment-signing exact latest cutoverPreviewId талап етеді және stale preview/stateHash rejected.
- [ ] N+1 sourceCutoverPreviewId exact selected preview-ге тең; calculationPolicy previewHash/accountingSnapshotId/accountingStateHash/policyVersion/referenceAt сақтайды.
- [ ] Cutover preview hash немесе accounting state hash өзгерсе N+1 documentHash та өзгереді.
- [ ] Same preview start retry idempotent; different preview retry conflict.
- [ ] Post-payment SIGNING/SIGNED_PENDING_ACTIVATION кезінде repayment submit/confirm/dispute/reversal blocked.
- [ ] First signature currentVersion/schedule/payment/ledger-ді өзгертпейді.
- [ ] Second signature N+1→SIGNED және amendment→SIGNED_PENDING_ACTIVATION ғана жасайды.
- [ ] SIGNED_PENDING_ACTIVATION кезінде base version SUPERSEDED болмайды, currentVersion өзгермейді, жаңа schedule/ledger entry жасалмайды.
- [ ] SIGNED_PENDING_ACTIVATION amendment үшін POST activation-plan exact signed N+1 sourceCutoverPreview relation-ын қайта verify етеді.
- [ ] Activation plan stale accounting/cutover state кезінде fail-closed.
- [ ] Planned schedule principal + accrued interest + future interest + charge = planned total due және cutover projectedRemainingDue-пен exact.
- [ ] Interest reclassification candidate және existing unallocated credit schedule total-дан автоматты шегерілмейді.
- [ ] Осы credit candidates бар болса requiresLedgerAdjustment=true.
- [ ] Same exact source state retry same planHash/row қайтарады; activation plan history immutable.
- [ ] Zero-adjustment activation plan activationEligible=true/reason=null; ledger-adjustment plan activationEligible=false/POST_PAYMENT_LEDGER_ADJUSTMENT_REQUIRED.
- [ ] Activation plan preparation өзі currentVersion/base version/schedule/payment allocations/ledger mutation жасамайды.
- [ ] POST ledger-adjustment-plan тек SIGNED_PENDING_ACTIVATION + exact latest activation plan requiresLedgerAdjustment=true кезінде жұмыс істейді.
- [ ] Ledger-adjustment prepare signed N+1, latest cutover preview және accounting state-ті current DB state-пен қайта verify етеді; stale source fail-closed.
- [ ] Interest reclassification candidate және existing unallocated credit бөлек persisted component болып қалады; totalAdjustmentCandidateMinor олардың exact қосындысына тең.
- [ ] Same exact source state retry same adjustmentPlanHash/row қайтарады; historical ledger-adjustment plan versions immutable.
- [ ] GET ledger-adjustment-plans тек borrower/lender participant-қа history береді.
- [ ] Ledger-adjustment response policyStatus=PREVIEW_ONLY, applicationEligible=false, applicationReason=POST_PAYMENT_LEDGER_ADJUSTMENT_POLICY_PENDING.
- [ ] Ledger-adjustment plan preparation Contract.currentVersion/ContractVersion/amendment/ScheduleVersion/Payment/PaymentAllocation/LedgerEntry/funding mutation жасамайды.
- [ ] Ledger-adjustment audit amount-тарды көшірмейді; source/plan hashes, version және component-presence metadata ғана сақтайды.
- [ ] `CONTRACT_POST_PAYMENT_AMENDMENT_ACTIVATION_ENABLED=false` default және parent gates өшірулі болса enablement rejected.
- [ ] Release preflight `post_payment_amendment_activation=manual` / `post_payment_activation_accounting_legal_acceptance_required` көрсетеді.
- [ ] activate-post-payment exact latest activationPlanId талап етеді және plan барлық persisted fields current rebuilt plan-пен exact болмаса rejected.
- [ ] requiresLedgerAdjustment=true немесе unapplied reclassification/credit > 0 болса activation fail-closed.
- [ ] Safe activation жаңа ScheduleVersion жасайды: sourceContractVersion=N+1, sourceAmendmentId және sourceActivationPlanId exact.
- [ ] Historical schedule items, PaymentAllocation және LedgerEntry mutation жасалмайды.
- [ ] Safe activation base→SUPERSEDED, currentVersion→N+1, amendment→ACTIVATED жасайды және ledgerAdjustmentApplied=false audit сақтайды.
- [ ] generic schedule.generate activation-plan schedule-ды authoritative қайтарады; duplicate full-principal schedule жасамайды.
- [ ] overdue worker тек latest ScheduleVersion-ды materialize етеді; superseded schedule status өзгермейді.
- [ ] Old schedule allocation-ына байланған payment reversal fail-closed; new latest-schedule payment reversal қалыпты flow-да қалады.
- [ ] Evidence schema v9 activated schedule sourceActivationPlanId және immutable ledger-adjustment-plan provenance-ін bind етеді.
- [ ] Existing persisted evidence v1-v8 packages retroactive rewrite болмайды.
- [ ] Reclassification/unallocated-credit preview plan бар, бірақ actual application/activation әлі unsupported; acceptance record ledger/effective-date policy pending екенін көрсетеді.
- [ ] Kazakhstan legal owner pre-payment rate/term amendment wording, retroactive funding-effectiveAt accrual және signature effect-ті бекітті.

### 6.5 Account own-data export

- [ ] `ACCOUNT_DATA_EXPORT_ENABLED=true` тек approved staging config-та қосылған.
- [ ] Release preflight `account_data_export=manual` / `privacy_export_scope_acceptance_required` көрсетеді.
- [ ] `ACCOUNT_DATA_EXPORT_POLICY_ID` reviewed export/redaction/deletion-ordering policy version-ға сәйкес; missing policy production startup/preflight-та fail болады.
- [ ] Authenticated user `POST /api/v1/profile/me/data-export` арқылы тек өзінің export-ын алады.
- [ ] Бір authenticated user 1 минут ішінде екінші export сұраса `429 ACCOUNT_DATA_EXPORT_RATE_LIMITED` және `Retry-After` алады.
- [ ] Бір authenticated user 1 сағат ішінде 5 export-тан кейін келесі сұрауда bounded 429 алады; басқа user bucket-іне әсер етпейді.
- [ ] Rate bucket key raw user ID-ды сақтамайды; HMAC-hashed identity scope қолданылады.
- [ ] Front 429 state-ті generic error емес, KZ/RU explicit wait-and-retry copy ретінде көрсетеді.
- [ ] Encrypted-mode storage кезінде own email/phone PII protection layer арқылы дұрыс decrypt болады; ciphertext envelope response-та жоқ.
- [ ] Wrong/missing PII key/decryption failure generic fail-closed болады және partial export/audit success жазылмайды.
- [ ] Contract summary counterparty party ID шығармайды; тек own role BORROWER/LENDER көрсетеді.
- [ ] Payment summary counterparty party ID шығармайды; тек own role PAYER/PAYEE көрсетеді.
- [ ] Response-та userId/partyId/passwordHash/session/token/lookupHash/ciphertext/objectKey/signed URL/provider raw reference жоқ.
- [ ] Same selected account state repeated export бірдей dataHash береді; generatedAt hash-ке кірмейді.
- [ ] Export audit payload тек schemaVersion/dataHash/contractCount/paymentCount сақтайды; email/phone/full export body audit-қа көшірілмейді.
- [ ] Account deletion request active sessions-ды revoke ететіндіктен Settings UX export-before-deletion ordering-ті анық көрсетеді.
- [ ] Feature off болса endpoint generic unavailable response береді және export query/audit mutation жасалмайды.
- [ ] Legal/privacy owner current v1 scope пен intentionally excluded categories-ті acceptance record-та бекітті.

### 6.6 Identity/KYC provider


- [ ] `IDENTITY_VERIFICATION_PROVIDER=remote-signed-l2` тек approved staging config-та қосылған.
- [ ] `IDENTITY_PROVIDER_CONTRACT_ID` vetted L2 provider profile/contract version-ға сәйкес.
- [ ] Session endpoint HTTPS/routing policy-ге сәйкес және wrong bearer credential rejected.
- [ ] Provider session response request-тегі random opaque `subjectRef`-ті exact қайтарады.
- [ ] Wrong provider code немесе wrong Ed25519 key fingerprint rejected.
- [ ] Changed redirect/expiry/session attestation detached-signature verification-нан өтпейді.
- [ ] Provider-ге app user ID, email, phone, IIN/BIN немесе profile payload жіберілмейтіні network/log review арқылы тексерілді.
- [ ] `IDENTITY_CALLBACK_AUTH_POLICY_ID` callback token + Ed25519 signature/authentication/replay policy version-ға сәйкес.
- [ ] Wrong `x-identity-callback-token` claim mutation-ға жетпейді.
- [ ] Wrong callback signature/key/provider code fail-closed.
- [ ] Callback generatedAt configured clock-skew шекарасынан тыс болса reject.
- [ ] Unknown немесе invalid session correlation claim жасамайды.
- [ ] Duplicate exact callback idempotent; completed session-ге altered replay rejected.
- [ ] VERIFIED callback claim write + session completion atomic transaction ретінде орындалады.
- [ ] Raw callback subjectRef/providerReference/signature, document image, biometric/liveness payload product DB/log/audit-ке көшірілмейді.
- [ ] `IDENTITY_PRIVACY_RESIDENCY_POLICY_ID` data minimization, processor/subprocessor, residency және retention policy version-ға сәйкес.
- [ ] `IDENTITY_LEGAL_CLASSIFICATION_ID` Kazakhstan L2 KYC legal/privacy classification record-қа сәйкес.
- [ ] Signed REVOKED callback wrong token/signature/key/provider code кезінде fail-closed.
- [ ] Revocation callback raw provider reference-ті сақтамай SHA-256 tombstone жасайды.
- [ ] REVOKED event VERIFIED event-тен бұрын келсе кейінгі stale verification claim blocked.
- [ ] Same/lower revocation retry idempotent; newer revocation tombstone-ды алға жылжытады.
- [ ] Concurrent VERIFIED/REVOKED callback бір hashed provider subject advisory lock арқылы serialise болады.
- [ ] Revocation-нан кейін provider кейінгі жаңа `verifiedAt` берсе re-verification policy бойынша allowed.
- [ ] Actual provider event names/status mapping generic `QARYZLINK_IDENTITY_REVOCATION_V1` contract-қа сәйкестендірілген.
- [ ] Provider outage/start-session failure generic fail-closed behavior береді.
- [ ] Release preflight remote adapter + governance refs-ті `manual` acceptance ретінде көрсетеді; refs/provider config өздігінен production approval емес.
- [ ] KZ/RU UI email verification-ды KYC деп көрсетпейді және provider raw identifiers-ді шығармайды.

## 7. Background jobs

- [ ] notification CronJob immutable digest-пен іске қосылды.
- [ ] account deletion CronJob immutable digest-пен іске қосылды.
- [ ] evidence cleanup CronJob immutable digest-пен іске қосылды.
- [ ] concurrencyPolicy және deadline жұмыс істейді.
- [ ] failed Job alert source-қа түседі.

## 8. Backup/restore

- [ ] staging backup алынды.
- [ ] бөлек isolated database-ке restore орындалды.
- [ ] application restored DB-ға readiness check өткізді.
- [ ] restore evidence-те secret/PII жоқ.

## 9. Monitoring

Signal/alert contract: `MONITORING_ALERTING.md`.

- [ ] readiness failure alert.
- [ ] notification failed/pending growth alert.
- [ ] evidence orphan/verdict failure alert.
- [ ] account deletion READY/backlog age alert.
- [ ] CronJob failure alert.
- [ ] alert owner және escalation channel бекітілген.

## 10. Acceptance evidence

Әр scenario үшін тек environment, UTC timestamp, commit/image digest, scenario name және pass/fail сақталады. Password, token, full email/phone, IIN/BIN, signed URL, raw document немесе database dump acceptance evidence-ке кірмейді.

Front browser workflow implementation осы contract-тың application-side бөлігін орындайды: commit/run metadata + scenario title/status artifact; authenticated Playwright trace әдейі өшірулі. Deployment image digest нақты staging orchestrator/deploy evidence-тен бөлек bind болуы тиіс.

Acceptance-ті owner және кемінде бір инженер review етеді.

Release preflight тек machine-checkable бөлікті алдын ала бөледі; `manual` checks осы checklist арқылы нақты environment-те жабылады. Толық contract: [Release preflight](RELEASE_PREFLIGHT.md).