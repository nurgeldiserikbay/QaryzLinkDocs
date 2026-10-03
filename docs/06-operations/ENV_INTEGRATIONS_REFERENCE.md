# Environment & integrations quick reference

Бұл бет deployment кезінде қай variable қай компонентке жататынын жылдам табуға арналған. Exact validation source — тиісті repository schema және `.env.example`.

## Front

| Variable | Scope | Secret |
|---|---|---:|
| NEXT_PUBLIC_API_BASE_URL | Browser API origin | Жоқ |

## Admin

| Variable | Scope | Secret |
|---|---|---:|
| NEXT_PUBLIC_API_BASE_URL | Browser liveness API origin | Жоқ |
| QARYZLINK_API_BASE_URL | Server-side Backend origin | Жоқ |
| METRICS_ACCESS_TOKEN | Protected metrics | Иә |
| SUPPORT_STAFF_TOKEN | Scoped support actions | Иә |

## Backend core

| Variable | Purpose | Secret |
|---|---|---:|
| NODE_ENV | Runtime profile | Жоқ |
| HOST / PORT | Listen address | Жоқ |
| TRUST_PROXY_HOPS | Reverse proxy trust | Жоқ |
| CORS_ALLOWED_ORIGINS | Exact browser origins | Жоқ |
| DATABASE_URL | PostgreSQL connection | Иә |
| REDIS_URL | Redis connection | Иә/credentialed |
| JWT_ACCESS_SECRET | Access-token signing | Иә |
| METRICS_ACCESS_TOKEN | Protected metrics | Иә |
| EXPOSE_API_DOCS | Non-production API docs gate | Жоқ |

## Email

| Variable | Purpose |
|---|---|
| MAIL_ENABLED | Email integration gate |
| SMTP_HOST / SMTP_PORT / SMTP_SECURE | Provider transport |
| SMTP_USER / SMTP_PASSWORD | Provider credential |
| SMTP_FROM | Verified sender |
| EMAIL_VERIFICATION_URL | Front verification URL |
| PASSWORD_RESET_URL | Front reset URL |

SMTP credentials — secret store ішінде.

## Evidence storage

`EVIDENCE_STORAGE_ENABLED=false` әдепкіде.

Қосылғанда қажет:
- S3-compatible private bucket;
- region/endpoint;
- access credentials;
- scanner callback credential;
- retention/lifecycle policy;
- signed URL acceptance.

## Identity verification

`IDENTITY_VERIFICATION_ENABLED=false` әдепкіде.

Қосу үшін:
- vetted provider;
- signed remote adapter config;
- callback authentication;
- provider contract reference;
- privacy/residency acceptance;
- legal classification.

## Contract PDF

`CONTRACT_PDF_ENABLED=false` әдепкіде.

Қосу үшін:
- approved KZ/RU templates;
- template hashes;
- renderer identity/fingerprint;
- renderer token;
- legal signoff;
- visual/font acceptance.

## Evidence sealing and timestamp

Default-off.

External signer/KMS-HSM және timestamp authority integration-дары production provider acceptance талап етеді.

## Product gates

Қазақстандағы initial private-debt pilot үшін high-risk функциялар default-off:

```text
PUBLIC_MARKETPLACE_ENABLED=false
PENALTY_ENABLED=false
AMOUNT_BASED_COMMISSION_ENABLED=false
CONTRACT_SIGNING_ENABLED=false
```

Feature code бар болуы оның production-да қосылуы керек дегенді білдірмейді.

## Secret rule

Мыналарды browser, Git, screenshots немесе Docs ішіне нақты мәнімен салмаңыз:

- DB password;
- JWT keys;
- SMTP password;
- object storage key;
- scanner callback token;
- identity provider token;
- renderer token;
- signer/timestamp token;
- PII encryption keys;
- metrics/support staff tokens.

## Related guides

- [Deployment portal](DEPLOYMENT_PORTAL.md)
- [Backend deployment](DEPLOYMENT.md)
- [Front deployment](FRONT_DEPLOYMENT.md)
- [Admin deployment](ADMIN_DEPLOYMENT.md)
- [Evidence storage](EVIDENCE_STORAGE.md)
- [Notification SMTP](NOTIFICATION_SMTP.md)
- [Final release handoff](FINAL_RELEASE_HANDOFF.md)
