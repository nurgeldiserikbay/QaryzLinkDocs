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
- CORS exact origin configuration бар-жоғын;
- public marketplace өшірулі екенін;
- penalty өшірулі екенін;
- amount-based commission өшірулі екенін;
- PII contact storage mode күйін;
- contract signing/support mutation/API docs gates күйін;
- evidence cryptographic sealing provider gate күйін;
- configured remote signer болса key lifecycle acceptance әлі manual екенін;
- full evidence binary archive feature gate күйін

санаттайды.

Мына жағдайлар fail:

- development/test environment;
- database unavailable;
- PUBLIC_MARKETPLACE_ENABLED=true;
- PENALTY_ENABLED=true;
- AMOUNT_BASED_COMMISSION_ENABLED=true;
- EVIDENCE_SEALING_ENABLED=true, бірақ current KMS/HSM provider adapter әлі unavailable.

## Manual checks

Command әдейі келесілерді автоматты pass деп белгілемейді:

- TRUST_PROXY_HOPS нақты ingress topology-ге сәйкестігі;
- forwarded-header sanitization;
- SMTP sender/DNS/inbox delivery;
- evidence bucket least privilege;
- malware scanner callback және CLEAN/INFECTED flow;
- evidence signed PUT/GET;
- enabled full binary archive max-size/concurrency/memory/latency acceptance;
- TLS certificate;
- backup/restore;
- alert owner/escalation;
- browser KZ/RU authenticated journey;
- enabled contract signing legal gate;
- enabled support mutation operational gate, соның ішінде evidence legal hold owner/process және scoped staff access;
- evidence signer TLS/private routing, key IAM/rotation/revocation, pinned fingerprint cutover және independent signature verification acceptance.

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
