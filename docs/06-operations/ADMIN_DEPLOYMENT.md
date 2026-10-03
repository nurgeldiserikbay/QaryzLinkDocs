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

## Critical boundary

`METRICS_ACCESS_TOKEN` және `SUPPORT_STAFF_TOKEN` ешқашан `NEXT_PUBLIC_` prefix-пен берілмейді.

Олар server-only environment ішінде қалады.

## Build

```bash
corepack enable
corepack prepare pnpm@12.4.2 --activate
pnpm install --no-frozen-lockfile
pnpm check
pnpm build
pnpm start
```

## Network policy

Admin үшін ұсынылатын модель:

- бөлек subdomain;
- VPN/SSO/IP allowlist немесе trusted access proxy;
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
- protected metrics server-side fetch тексеру;
- browser bundle-де token жоқ екенін тексеру;
- restricted-origin access;
- admin E2E;
- privacy/log checks;
- staff credential expiry/scope acceptance.
