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

`METRICS_ACCESS_TOKEN` және `SUPPORT_STAFF_TOKEN` ешқашан `NEXT_PUBLIC_` prefix-пен берілмейді.

Олар server-only environment ішінде қалады.

Admin authentication credential-дары да server-only. Successful authenticated Admin response-тар `Cache-Control: no-store` арқылы browser/CDN cache-ке түспеуі тиіс.

## Build

```bash
corepack enable
corepack prepare pnpm@12.4.2 --activate
pnpm install --no-frozen-lockfile
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
- aggregate operational metrics көрсетеді;
- privacy-safe audit visibility береді;
- evidence/storage/notification/account-deletion counters оқиды;
- identity-level user feed әдепкіде көрсетпейді;
- high-risk mutations default-off.

Marketplace/support mutation feature gate ашылғанда ғана scoped staff credential қолданылады.

## Acceptance

Production/pilot алдында:
- production Basic Auth fail-closed behavior және 32-byte password requirement тексеру;
- `ADMIN_SITE_ORIGIN` deployed Admin origin-мен дәл сәйкес екенін тексеру;
- cross-origin server-action mutation reject болатынын тексеру;
- authenticated response-та `Cache-Control: no-store` барын тексеру;
- protected metrics server-side fetch тексеру;
- browser bundle-де token жоқ екенін тексеру;
- restricted-origin access;
- admin E2E;
- privacy/log checks;
- staff credential expiry/scope acceptance.
