# Admin deployment

QaryzLinkAdmin — internal support/moderation/compliance console. Public consumer site ретінде ашылмауы тиіс.

## Runtime

- Node.js 24
- pnpm 12.4.2
- Next.js 16
- restricted HTTPS origin

## Environment

Public-safe liveness origin:

```text
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
```

Server-only Backend origin:

```text
QARYZLINK_API_BASE_URL=https://api.example.com
```

Server-only protected metrics token:

```text
METRICS_ACCESS_TOKEN=<secret>
```

Privacy-safe row-level operations үшін metrics token-нан бөлек credential:

```text
OPERATIONS_ACCESS_TOKEN=<different-secret>
```

Бұл token Backend және Admin server environment-терінде бірдей болуы тиіс, бірақ `METRICS_ACCESS_TOKEN`-мен бірдей болмауы керек.

Scoped support actions қосылса:

```text
SUPPORT_STAFF_TOKEN=<secret>
```

Production Admin authentication and mutation origin:

```text
ADMIN_BASIC_AUTH_USER=<dedicated-admin-user>
ADMIN_BASIC_AUTH_PASSWORD=<random-secret-at-least-32-bytes>
ADMIN_SITE_ORIGIN=https://admin.qaryzlink.kz
```

Production-та бұл credential жоқ немесе password 32 байттан қысқа болса, Admin proxy fail-closed күйінде console-ды ашпайды. `ADMIN_SITE_ORIGIN` exact HTTPS origin болуы тиіс; server-action mutation cross-origin болса fail-closed тоқтайды.

## Critical boundary

`METRICS_ACCESS_TOKEN`, `OPERATIONS_ACCESS_TOKEN` және `SUPPORT_STAFF_TOKEN` ешқашан `NEXT_PUBLIC_` prefix-пен берілмейді.

Олар server-only environment ішінде қалады.

Admin authentication credential-дары да server-only. Successful authenticated Admin response-тар `Cache-Control: no-store` арқылы browser/CDN cache-ке түспеуі тиіс.

## Build

```bash
corepack enable
corepack prepare pnpm@12.4.2 --activate
pnpm install --frozen-lockfile
pnpm release:preflight:strict
pnpm check
pnpm build
pnpm start
```

## Network policy

Admin үшін ұсынылатын модель:

- бөлек subdomain;
- қазіргі Basic Auth gate-тің үстіне VPN/SSO/IP allowlist немесе trusted access proxy;
- Backend internal/protected endpoints public browser ingress-тен бөлек;
- metrics/support routes restricted;
- public indexing өшірулі.

Мысал:

```text
https://admin.qaryzlink.kz
```

## Current functional boundary

Admin:
- қысқа Overview live counters + attention signals көрсетеді;
- privacy-safe Users / Contracts / Requests / Disputes / Audit workspaces береді;
- System workspace health/readiness/evidence/notifications/auth-retention сигналдарын бөлек жинайды;
- Privacy workspace account deletion және PII migration/key-rotation/plaintext-retirement aggregate status-ын бөлек көрсетеді;
- Moderation workspace marketplace report metrics пен cursor-paginated support-gated human review queue-ды бөлек ұстайды;
- row-level operations тек `OPERATIONS_ACCESS_TOKEN` арқылы server-side оқылады;
- email/phone/password/identity payload/dispute description/evidence body әдепкіде қайтарылмайды;
- evidence/storage/notification/account-deletion counters оқиды;
- high-risk mutations default-off.

Marketplace/support mutation feature gate ашылғанда ғана scoped staff credential қолданылады.

## Acceptance

Production/pilot алдында:
- production Basic Auth fail-closed behavior және 32-byte password requirement тексеру;
- `ADMIN_SITE_ORIGIN` deployed Admin origin-мен дәл сәйкес екенін тексеру;
- cross-origin server-action mutation reject болатынын тексеру;
- authenticated response-та `Cache-Control: no-store` барын тексеру;
- protected metrics server-side fetch тексеру;
- separate `OPERATIONS_ACCESS_TOKEN` арқылы row-level operations server-side fetch тексеру;
- metrics token row-level operations endpoint-ке рұқсат бермейтінін тексеру;
- browser bundle-де token жоқ екенін тексеру;
- restricted-origin access;
- admin E2E;
- privacy/log checks;
- staff credential expiry/scope acceptance.
