# Support staff access

Жаңартылған күні: 2026-09-28.

QaryzLink support/moderation mutation-дары shared static backend token-нан scoped, expiring staff credential registry-ге көшірілді. Бұл foundation actual enterprise SSO/JIT provider-ді алмастырмайды.

## Backend credential contract

`SUPPORT_STAFF_CREDENTIALS_JSON` әр staff credential үшін мынаны сақтайды:

- opaque `id` — name/email емес;
- `tokenHash` — raw token-ның SHA-256 hex hash-ы;
- `expiresAt` — credential expiry;
- explicit scopes.

Қолдау көрсетілетін scopes:

- `disputes:write`;
- `marketplace-reports:read`;
- `marketplace-reports:write`.

Raw support token backend registry ішінде сақталмайды. Caller token-ды existing `x-support-token` header арқылы береді; backend SHA-256 hash бойынша matching жасайды, expiry және scope-ты тексереді.

## Audit attribution

Successful support mutation audit payload-қа тек opaque `supportActorId` қосылады. Staff name, email, raw token, token hash немесе credential expiry audit payload-қа кірмейді.

Dispute status transition және marketplace moderation Resolve/Dismiss әрекеттері осы actor attribution-ды қолданады.

## Admin

Admin server-only `SUPPORT_STAFF_TOKEN` қолданады. Бұл мән browser bundle/props-қа берілмеуі тиіс. Backend token-ды registry арқылы actor/scope/expiry-ге resolve етеді.

Қазіргі Admin deployment credential-і бір server environment value. Сондықтан бұл implementation backend attribution foundation-ын береді, бірақ толық multi-user staff identity layer емес.

## Production gate

Production support/moderation enablement алдында:

- named staff identity provider немесе approved credential issuance process;
- әр staff үшін жеке short-lived credential;
- rotation/revocation process;
- support owner;
- restricted internal ingress/VPN;
- least-privilege scope assignment;
- audit review owner;
- JIT/expiry policy;
- lost credential emergency revoke process

бекітілуі тиіс.

Shared `SUPPORT_ACCESS_TOKEN` legacy/deprecated config ретінде ғана қалады және жаңа backend authorization flow оны қолданбайды.

## Verification status

Backend PR #177 және Admin PR #32 GitHub Actions quota/billing gate кезінде merge жасалды. Automated typecheck/unit/integration/browser verification quota қайта ашылғанда орындалуы тиіс.