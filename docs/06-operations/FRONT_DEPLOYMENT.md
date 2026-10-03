# Front deployment

QaryzLinkFront — public landing және authenticated user application. Ол Next.js арқылы deploy болады.

## Runtime

- Node.js 24
- pnpm 12.4.2
- Next.js 16
- HTTPS public origin

## Environment

Негізгі browser-safe variable:

```text
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
```

Production мәні exact HTTPS origin болуы керек. Credentials, path, query немесе fragment қоспаңыз.

## Build

```bash
corepack enable
corepack prepare pnpm@12.4.2 --activate
pnpm install --no-frozen-lockfile
pnpm check
pnpm build
pnpm start
```

`pnpm check` typecheck, lint, tests және production build орындайды.

## Deployment rules

- Browser-ге backend secret берілмейді.
- `NEXT_PUBLIC_*` ішіне token/password/key салынбайды.
- Backend CORS allowlist Front origin-мен exact сәйкес болуы керек.
- Front HTTPS қолдануы тиіс.
- Security headers/CSP build smoke арқылы тексеріледі.
- Staging-де authenticated E2E acceptance іске қосылады.

## Suggested production origin

```text
https://qaryzlink.kz
```

Backend мысалы:

```text
NEXT_PUBLIC_API_BASE_URL=https://api.qaryzlink.kz
```

## Localization

Қазіргі интерфейс:
- қазақша (`kk`)
- орысша (`ru`)

Жаңа locale registry арқылы кейін басқа тілдер қосылады. Қаржылық/legal мәтіндер толық reviewed translation bundle ретінде енгізілуі керек.

## Release check

Front release backend-пен API contract және staging browser journey арқылы тексеріледі. Backend release identity/evidence acceptance бөлек орындалады.
