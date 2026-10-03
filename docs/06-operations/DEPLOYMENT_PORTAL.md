# Deployment & integrations portal

Бұл бет QaryzLink-ті серверге шығару үшін не қажет екенін жоғары деңгейде түсіндіреді. Exact commands пен қауіпсіздік шарттары canonical [Server deployment](DEPLOYMENT.md) runbook-та сақталады.

## 1. Deployable компоненттер

| Компонент | Технология | Қайда deploy болады |
|---|---|---|
| QaryzLinkFront | Next.js | HTTPS public web origin |
| QaryzLinkBack | NestJS/Fastify | Private/internal API + controlled public API ingress |
| QaryzLinkAdmin | Next.js | Restricted staff origin/VPN/SSO boundary |
| PostgreSQL | PostgreSQL 17 | Private network |
| Redis | Redis | Private network |
| Object storage | S3-compatible | Private bucket |
| CronJobs/workers | Backend image | Kubernetes / scheduler |

QaryzLinkDocs HTML portal әдепкіде локалды development/preview үшін қолданылады. Оны public hosting-ке шығару міндетті емес.

## 2. Minimum infrastructure

Pilot/staging үшін минимум:

- Linux VM немесе Kubernetes/k3s;
- HTTPS domain + TLS certificate;
- PostgreSQL 17;
- Redis;
- Backend container/runtime;
- Front runtime;
- Admin runtime;
- secret store;
- backup destination;
- monitoring/alerting.

Evidence upload қосылса private S3-compatible object storage және malware scanner/event integration керек.

## 3. Міндетті integration топтары

### Database

**Required.**

- PostgreSQL
- `DATABASE_URL`
- release migration job
- backup/restore procedure

### Redis

**Required by current startup config.**

- `REDIS_URL`
- internet-ке ашылмауы тиіс

### Email / SMTP

**Optional at first, required when email verification/password reset is enabled.**

- SMTP provider
- verified sender
- SPF/DKIM/DMARC
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `SMTP_FROM`
- `EMAIL_VERIFICATION_URL`
- `PASSWORD_RESET_URL`

### Private evidence storage

**Default-off.**

Қажет болады:
- private S3-compatible bucket;
- signed upload/download URL;
- scanner callback;
- retention/lifecycle policy.

Негізгі variables:
- `EVIDENCE_STORAGE_ENABLED`
- `EVIDENCE_S3_BUCKET_ENDPOINT`
- `EVIDENCE_S3_REGION`
- `EVIDENCE_S3_ACCESS_KEY_ID`
- `EVIDENCE_S3_SECRET_ACCESS_KEY`
- `EVIDENCE_SCAN_CALLBACK_TOKEN`

### Identity verification

**Default-off until provider/legal acceptance.**

Generic signed L2 adapter бар, бірақ production үшін vetted provider қажет.

Негізгі variables:
- `IDENTITY_VERIFICATION_ENABLED`
- `IDENTITY_VERIFICATION_PROVIDER`
- `IDENTITY_VERIFICATION_REMOTE_URL`
- `IDENTITY_VERIFICATION_REMOTE_TOKEN`
- `IDENTITY_VERIFICATION_CALLBACK_TOKEN`

### Contract PDF renderer

**Default-off.**

Approved legal template + trusted renderer болғанда ғана қосылады.

Негізгі variables:
- `CONTRACT_PDF_ENABLED`
- `CONTRACT_PDF_PROVIDER`
- `CONTRACT_PDF_REMOTE_URL`
- `CONTRACT_PDF_REMOTE_TOKEN`
- KZ/RU template ID/hash values

### Evidence signer / KMS-HSM

**Default-off.**

Evidence ZIP sealing қосылса trusted remote signer қажет.

- `EVIDENCE_SEALING_ENABLED`
- `EVIDENCE_SEAL_PROVIDER`
- `EVIDENCE_SEAL_REMOTE_URL`
- `EVIDENCE_SEAL_REMOTE_TOKEN`
- signer identity/fingerprint variables

### Timestamp authority

**Default-off.**

Signed timestamp foundation бар, бірақ qualified/RFC3161 production status provider/legal acceptance-ке тәуелді.

### Monitoring

Production/pilot үшін:
- Backend metrics;
- internal-only metrics ingress;
- external alert provider;
- failure routing/escalation.

`METRICS_ACCESS_TOKEN` staging/production-та required.

## 4. Core backend variables

### Runtime

```text
NODE_ENV
HOST
PORT
TRUST_PROXY_HOPS
CORS_ALLOWED_ORIGINS
EXPOSE_API_DOCS
```

### Data/services

```text
DATABASE_URL
REDIS_URL
JWT_ACCESS_SECRET
METRICS_ACCESS_TOKEN
```

### Product safety gates

```text
PUBLIC_MARKETPLACE_ENABLED=false
PENALTY_ENABLED=false
AMOUNT_BASED_COMMISSION_ENABLED=false
CONTRACT_SIGNING_ENABLED=false
```

Default-off gate-ті тек code бар болғаны үшін production-та қоспау керек. Әр gate release/legal/provider acceptance талабымен бірге қаралады.

## 5. Front environment

Front browser-ге тек public-safe configuration шығуы тиіс.

Негізгі variable:

```text
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
```

Backend secret-тер, support token, metrics token немесе provider credentials Front environment-ке салынбайды.

## 6. Admin environment

Admin API-мен бөлек restricted origin арқылы жұмыс істегені дұрыс.

Admin browser-ге де server secret шығарылмайды. Staff mutation/JIT credential architecture server-side/restricted boundary арқылы берілуі тиіс.

## 7. Recommended domain layout

Мысал:

```text
https://qaryzlink.kz          -> QaryzLinkFront
https://api.qaryzlink.kz      -> QaryzLinkBack
https://admin.qaryzlink.kz    -> QaryzLinkAdmin (restricted)
https://docs.qaryzlink.kz     -> QaryzLinkDocs (optional)
```

API metrics/support internal ingress public API-дан бөлек болуы керек.

## 8. Deployment sequence

1. Exact release commit freeze.
2. Backend image build + immutable digest.
3. CI/supply-chain checks.
4. PostgreSQL backup.
5. Migration job.
6. Backend deploy.
7. Release preflight.
8. Front deploy.
9. Admin deploy.
10. CronJobs/workers deploy.
11. Staging smoke/E2E.
12. Provider acceptance.
13. Final approval evidence.
14. Pilot/production promotion.

Толық sequence: [Final release handoff](FINAL_RELEASE_HANDOFF.md).

## 9. Secret management

Secret ретінде қараңыз:

- DB connection credentials;
- JWT secret;
- SMTP password;
- storage access keys;
- scanner callback token;
- metrics access token;
- support credentials;
- identity provider tokens;
- PDF renderer token;
- signer/timestamp tokens;
- PII encryption/HMAC keyring.

Оларды Git, Markdown, screenshots, browser env немесе CI artifact ішіне салмаңыз.

## 10. Қайдан жалғастыру керек?

- Environment matrix: [Environment & integrations quick reference](ENV_INTEGRATIONS_REFERENCE.md)
- Backend: [Server deployment](DEPLOYMENT.md)
- Front: [Front deployment](FRONT_DEPLOYMENT.md)
- Admin: [Admin deployment](ADMIN_DEPLOYMENT.md)
- Release validation: [Release preflight](RELEASE_PREFLIGHT.md)
- Storage: [Evidence storage](EVIDENCE_STORAGE.md)
- Email: [Notification SMTP](NOTIFICATION_SMTP.md)
- Monitoring: [Monitoring](MONITORING.md)
- Backup: [Backup & restore](BACKUP_RESTORE.md)
- Final acceptance: [Final release handoff](FINAL_RELEASE_HANDOFF.md)
