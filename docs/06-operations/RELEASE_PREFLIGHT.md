# Release preflight

`pnpm release:preflight` — QaryzLinkBack staging/production deploy алдында іске қосылатын privacy-safe one-shot readiness command.

Бұл команда staging acceptance-ті алмастырмайды. Ол machine-check жасауға болатын конфигурация мен database readiness-ті тексеріп, сыртқы/manual тексерістерді бөлек көрсетеді.

## Output

Command бір JSON object шығарады:

~~~json
{
  "status": "attention",
  "environment": "staging",
  "checks": [
    { "name": "database", "status": "pass", "code": "database_ready" },
    { "name": "mail", "status": "manual", "code": "mail_disabled" }
  ]
}
~~~

Secret, token, password, connection string, access key, sender address немесе bucket endpoint output-қа шығарылмайды.

### Status

- `pass` — барлық machine-checkable gate pass және manual item қалмады;
- `attention` — machine checks pass, бірақ external/manual acceptance әлі бар;
- `fail` — deploy/release жалғастырылмауы керек.

## Machine checks

Command:

- NODE_ENV staging/production екенін;
- PostgreSQL readiness;
- privacy-safe row-level Admin operations үшін dedicated `OPERATIONS_ACCESS_TOKEN` configured екенін, token value-ды output-қа шығармай;
- CORS exact origin configuration бар-жоғын;
- public marketplace өшірулі екенін;
- penalty өшірулі екенін;
- amount-based commission өшірулі екенін;
- PII contact storage mode күйін;
- contract signing/support mutation/API docs gates күйін;
- contract amendments enabled болса legal/process acceptance manual екенін;
- account data export enabled болса privacy/export scope acceptance manual екенін;
- account data export enabled болса versioned `ACCOUNT_DATA_EXPORT_POLICY_ID` governance reference бар-жоғын;
- evidence cryptographic sealing provider gate күйін;
- configured remote signer болса external KMS/HSM acceptance әлі manual екенін;
- evidence sealing enabled болса versioned signer deployment/IAM/key-ceremony/key-lifecycle references толық екенін;
- external timestamp authority configured болса provider/legal acceptance manual екенін;
- timestamping enabled болса standards profile/trust/revocation/legal-classification references толық екенін;
- identity verification enabled болса remote signed L2 adapter availability және provider contract/callback-auth/privacy-residency/legal-classification references толық екенін;
- contract PDF enabled болса pinned KZ/RU template identity + remote signed renderer acceptance manual екенін;
- contract PDF enabled болса template approval/legal sign-off/visual acceptance/font policy references толық екенін;
- signing key maintenance one-shot gate normal release кезінде disabled екенін;
- evidence sealing enabled болса configured signing key DB trust registry-де ACTIVE екенін;
- full evidence binary archive feature gate күйін;
- evidence storage enabled болса versioned retention policy reference және external bucket lifecycle policy reference бар-жоғын

санаттайды.

Мына жағдайлар fail:

- development/test environment;
- database unavailable;
- `OPERATIONS_ACCESS_TOKEN` configured емес;
- PUBLIC_MARKETPLACE_ENABLED=true;
- PENALTY_ENABLED=true;
- AMOUNT_BASED_COMMISSION_ENABLED=true;
- EVIDENCE_SEALING_ENABLED=true, бірақ current KMS/HSM provider adapter әлі unavailable;
- evidence storage enabled, бірақ `EVIDENCE_RETENTION_POLICY_ID` немесе `EVIDENCE_STORAGE_LIFECYCLE_POLICY_ID` жоқ;
- evidence sealing enabled, бірақ `EVIDENCE_SIGNER_DEPLOYMENT_ID`, `EVIDENCE_SIGNER_IAM_POLICY_ID`, `EVIDENCE_SIGNER_KEY_CEREMONY_ID` немесе `EVIDENCE_SIGNER_KEY_LIFECYCLE_POLICY_ID` жоқ;
- timestamping enabled, бірақ `EVIDENCE_TIMESTAMP_STANDARD_PROFILE_ID`, `EVIDENCE_TIMESTAMP_TRUST_POLICY_ID`, `EVIDENCE_TIMESTAMP_REVOCATION_POLICY_ID` немесе `EVIDENCE_TIMESTAMP_LEGAL_CLASSIFICATION_ID` жоқ;
- identity verification enabled, бірақ `IDENTITY_PROVIDER_CONTRACT_ID`, `IDENTITY_CALLBACK_AUTH_POLICY_ID`, `IDENTITY_PRIVACY_RESIDENCY_POLICY_ID` немесе `IDENTITY_LEGAL_CLASSIFICATION_ID` жоқ.
- identity verification enabled, бірақ provider adapter `remote-signed-l2` емес.
- account data export enabled, бірақ `ACCOUNT_DATA_EXPORT_POLICY_ID` жоқ.

Staging-та бұл жағдайлар command-тың structured `fail` snapshot-ында көрінеді. `OPERATIONS_ACCESS_TOKEN` application startup үшін optional болып қалады, сондықтан missing credential API-ды crash етпейді; protected row-level endpoint fail-closed deny жасайды, ал release preflight deployment-ты fail күйінде тоқтатады. Production-та storage enabled болса retention/lifecycle references, sealing enabled болса signer operations references, timestamping enabled болса timestamp governance references, identity verification enabled болса identity provider governance references жоқ конфигурация application startup кезінде fail-fast тоқтайды.

## Manual checks

Command әдейі келесілерді автоматты pass деп белгілемейді:

- TRUST_PROXY_HOPS нақты ingress topology-ге сәйкестігі;
- forwarded-header sanitization;
- SMTP sender/DNS/inbox delivery;
- evidence bucket least privilege;
- configured retention policy ID-дің нақты reviewed Kazakhstan policy version-ға сәйкестігі;
- configured lifecycle policy ID-дің provider/IaC applied version-ға сәйкестігі және legal-hold/persisted-object destructive expiry exclusion;
- malware scanner callback және CLEAN/INFECTED flow;
- evidence signed PUT/GET;
- enabled full binary archive max-size/concurrency/memory/latency acceptance;
- TLS certificate;
- backup/restore;
- alert owner/escalation;
- browser KZ/RU authenticated journey;
- KYC provider contract, callback authentication/session correlation, sensitive-data minimization, residency/processor controls және Kazakhstan legal classification;
- enabled contract signing legal gate;
- enabled account own-data export scope, third-party redaction, deletion ordering және Kazakhstan privacy/legal acceptance;
- enabled support mutation operational gate, соның ішінде evidence legal hold owner/process және scoped staff access;
- evidence signer TLS/private routing, configured deployment reference-тің нақты KMS/HSM deployment-қа сәйкестігі, least-privilege IAM review, independent key ceremony, provider-side key lifecycle policy, trust-registry rotation/revocation drill, pinned identity cutover және independent signature verification acceptance;
- timestamp authority TLS/auth/nonce/clock-skew/signature failure drills, configured standards profile/trust/revocation policy references-тің нақты provider controls-қа сәйкестігі және legal TSA classification;
- contract PDF renderer TLS/auth/template pin/source hash/PDF hash/signature failure drills, configured approval references-тің нақты KZ/RU legal artifacts/visual/font policy-ге сәйкестігі және owner+legal acceptance.

Олар `manual` ретінде қалады.

## Usage

Compiled application image ішінде:

~~~bash
pnpm release:preflight
~~~

Мысалы staging rollout реті:

1. immutable image digest таңдау;
2. migration Job;
3. `pnpm release:preflight`;
4. `status=fail` болса rollout тоқтайды;
5. `attention` болса manual acceptance checklist орындалады;
6. health/readiness және browser/provider checks;
7. owner + engineer review.

## CI contract

Backend CI compiled preflight command-ты staging-like configuration және disposable PostgreSQL-пен smoke жасайды.

CI:

- result JSON parse болуын;
- database check pass болуын;
- restricted financial features pass болуын;
- `operations_access` machine check pass болуын;
- output-та `password`, `secret`, `token`, `access key`, `DATABASE_URL` тәрізді secret-like атаулар болмауын

тексереді.

GitHub Actions quota/billing gate шешілмейінше бұл жаңа smoke current main үшін actual successful runner evidence алған жоқ.

## Acceptance evidence

Staging acceptance evidence-ке тек:

- environment;
- UTC timestamp;
- commit/image digest;
- preflight overall status;
- check name/status/code

сақтауға болады.

Raw environment values немесе secrets сақталмайды.
