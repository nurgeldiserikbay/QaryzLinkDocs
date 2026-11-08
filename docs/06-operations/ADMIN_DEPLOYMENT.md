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

Бұл token Backend және Admin server environment-терінде бірдей болуы тиіс, бірақ `METRICS_ACCESS_TOKEN`-мен бірдей болмауы керек. Backend environment validation және Admin strict release preflight екі credential мәні бірдей болса fail-closed тоқтайды.

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

Repository root-та committed `pnpm-lock.yaml` болуы міндетті. Vercel үшін repo-level `vercel.json` install/build contract-ты бекітеді:

```text
installCommand = pnpm install --frozen-lockfile
buildCommand = pnpm build
```

Local/CI:

```bash
pnpm install --frozen-lockfile
pnpm release:preflight:strict
pnpm check
pnpm build
pnpm start
```

Vercel Project Settings ішінде custom Install Command repo config-ті override етпеуі тиіс. Егер build log әлі `npm install --global pnpm@12.4.2 && pnpm install --frozen-lockfile` деп көрсетсе, dashboard-level Install Command override-ты алып тастау керек. `ERR_PNPM_NO_LOCKFILE` кезінде алдымен deploy Root Directory/context пен committed root `pnpm-lock.yaml` сәйкестігі тексеріледі.

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
- offset-based operations directory navigation 400 page-мен bounded; үлкен dataset-та deep scan орнына Public ID/name/UUID search қолданылады;
- System workspace health/readiness/governance/evidence/notifications/auth-retention сигналдарын бөлек жинайды;
- Governance readiness operations-token қорғалған snapshot арқылы backup/recovery, audit/security retention және internal access credential configured/missing күйін ғана көрсетеді; policy IDs мен secret values UI-ға шықпайды;
- Privacy workspace account deletion және PII migration/key-rotation/plaintext-retirement aggregate status-ын бөлек көрсетеді;
- Disputes workspace privacy-safe case directory және support-gated audited status transitions береді;
- Moderation workspace marketplace report metrics пен cursor-paginated support-gated human review queue-ды бөлек ұстайды;
- row-level operations тек `OPERATIONS_ACCESS_TOKEN` арқылы server-side оқылады;
- email/phone/password/identity payload/dispute description/evidence body әдепкіде қайтарылмайды;
- evidence/storage/notification/account-deletion counters оқиды;
- high-risk mutations default-off.

Dispute/marketplace/evidence support mutation feature gate ашылғанда ғана scoped staff credential қолданылады.

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

## Internal analytics, reports and exports API

Admin redesign үшін Backend `src/modules/analytics` модулі (барлығы `GET`, `/api/v1/...`, `Cache-Control: no-store`, auth — operations credential: `x-operations-token` немесе staff session `x-staff-session`). Уақыт белдеуі — `Asia/Almaty`; күндер `YYYY-MM-DD` (inclusive); сомалар minor-unit string; аналитикада тек aggregates.

Қате кодтары: аналитика/отчеттар — `400 { code: "ANALYTICS_INVALID" }`; тізімдер/экспорт — `400 { code: "OPERATIONS_QUERY_INVALID" }` (белгісіз `sort`, `pageSize` 10..200 сыртында, қате күн, `from > to`, рұқсат етілмеген `mode`, белгісіз enum фильтр); `401` — credential жоқ/қате; `404` — contract табылмады.

### Analytics

- `internal/analytics/metrics` → `{ timezone, items: [{ key, unit, label_ru, modeAware }], overviewKpis, breakdownDimensions }`.
- `internal/analytics/timeseries?metric=&from=&to=&bucket=day|week|month&mode=ALL|STANDARD|FAMILY` → `{ metric, bucket, from, to, mode, timezone, unit: count|minor, points: [{ bucketStart, value }] }`. Bucket-тер `generate_series` арқылы нөлмен толтырылады; `bucketStart` — күн / ISO-апта дүйсенбісі / айдың 1-і. Default — соңғы 30 күн, max 731 күн. Метрикалар: `users_registered`, `user_logins` (жаңа sessions), `contracts_created`, `contracts_activated`, `contracts_completed`, `family_debts_recorded`, `family_debts_confirmed`, `family_debts_rejected`, `principal_issued_minor` (CONFIRMED funding, `effectiveAt`), `repayments_confirmed_minor` (CONFIRMED payments, forgiveness-сіз, `confirmedAt`), `debts_forgiven_minor`, `payments_reported`, `payments_disputed`, `items_overdue` (`ITEM_OVERDUE` events), `disputes_opened`, `disputes_resolved`, `notifications_sent`, `notifications_failed`. `mode` users/logins/notifications үшін ескерілмейді; family-only метрикалар `mode=STANDARD` кезінде 0.
- `internal/analytics/overview?from&to&mode` → `{ from, to, previousFrom, previousTo, mode, timezone, kpis: [{ key, unit, value, previousValue }] }`; KPI: `users_registered`, `contracts_activated`, `principal_issued_minor`, `repayments_confirmed_minor`, `outstanding_minor`, `overdue_outstanding_minor`, `overdue_contracts` (`to` соңындағы snapshot), `disputes_open` (`to` күйі), `family_share_pct` (кезеңдегі активациялардағы FAMILY үлесі, `unit: pct`).
- `internal/analytics/breakdown?dimension=&from&to&mode` → `{ dimension, from, to, mode, timezone, items: [{ key, count, amountMinor? }] }`; dimensions: `contract_status`, `contract_mode`, `principal_bucket` (`lt_50k`, `50k_200k`, `200k_1m`, `gt_1m` теңге), `term_bucket` (`le_30d`, `31_90d`, `91_365d`, `gt_365d`, `on_demand`), `interest` (`interest_free`, `with_interest`) — кезеңде құрылған contracts; `payment_status`, `payment_source` — кезеңде құрылған payments; `dispute_status` (amount жоқ); `overdue_aging` (`0-30`, `31-60`, `61-90`, `90+`, ең ескі overdue item бойынша, `to` күйі).

Outstanding есебі: CONFIRMED funding бар contracts, cut-off алдындағы соңғы schedule version; item paid = `paidMinor − cut-off кейінгі allocations`; төлем ретімен charge → interest → principal; overdue = `dueDate < asOf` және қалдық > 0.

### Reports

- `internal/reports/portfolio?asOf&mode` → `{ asOf, mode, timezone, totals: { contractsActive, principalOutstandingMinor, interestOutstandingMinor, overdueMinor }, aging: [{ key: current|0-30|31-60|61-90|90+, contracts, outstandingMinor, overdueMinor }], byMode: [{ mode, ...totals }] }` (`interestOutstandingMinor` charges/penalties қоса).
- `internal/reports/repayments?from&to&bucket&mode` → `{ ..., totals, points: [{ bucketStart, dueMinor, collectedMinor, forgivenMinor, collectionRatePct }] }` (`due` — соңғы schedule version item-дерінің `dueDate` бойынша сомасы; `collectionRatePct = collected / due`, due = 0 болса `null`).
- `internal/reports/funnel?from&to` → `{ family: { recorded, outcomes: [{ key: CONFIRMED|REJECTED|EXPIRED|CANCELLED|AWAITING_COUNTERPARTY, count, conversionPct }] }, standard: { proposals, stages: [{ key: requests|requests_with_proposals|contracts|signed|active, count, conversionFromPreviousPct, conversionFromStartPct }] } }` (кезеңде құрылған STANDARD request-тер когортасы).

### Operations lists

Бар тізімдер (`users`, `contracts`, `disputes`, `requests`, `organizations`, `audit-events`) backward-compatible қосымша параметрлер алады: `pageSize` (10..200; default бұрынғыдай 25, audit 50), `sort`, `order=asc|desc` (default `desc`), `from`/`to` (`createdAt`, audit үшін `occurredAt`, Asia/Almaty), contracts үшін `mode`. Response: `{ items, page, pageSize, total, hasMore }`; contracts item-ына `mode` қосылды. Sort keys: users — `createdAt, updatedAt, status, publicId`; contracts — `createdAt, updatedAt, principalMinor, status, activatedAt, completedAt, fundingDeadline`; disputes — `createdAt, updatedAt, status`; requests — `createdAt, updatedAt, status, expiresAt, amountMaxMinor`; organizations — `createdAt, updatedAt, displayName`; audit-events — `occurredAt, action, entityType`; payments — `createdAt, paidAt, confirmedAt, amountMinor, status`; family-debts — `createdAt, givenOn, dueOn, amountMinor, status, expiresAt`.

Жаңа:
- `internal/operations/payments?q&status&source&mode&from&to&amountMin&amountMax&page&pageSize&sort&order` → items `{ id, contractId, status, source, amountMinor, currency, paidAt, confirmedAt, createdAt, contractMode }` (`q` — payment/contract UUID; legacy `source = NULL` repository-дегідей шығарылады).
- `internal/operations/family-debts?q&status&from&to&page&pageSize&sort&order` → items `{ id, status, direction, amountMinor, currency, givenOn, dueOn, createdAt, expiresAt, contractId }` (counterpartyLabel/note/rejectionReason қайтарылмайды).
- `internal/operations/contracts/:id/events` → `{ contractId, valid, headHash, length, failure, events: [{ seq, type, occurredAt, actorRole, eventHash, hasReceipt }] }` (integrity domain verify; payload қайтарылмайды).

### CSV exports

`internal/exports/<dataset>.csv`, dataset: `users`, `contracts`, `payments`, `disputes`, `requests`, `organizations`, `audit-events`, `family-debts`. Фильтрлер тиісті тізіммен бірдей; жолдар — сол privacy-safe list projection. Streamed `text/csv; charset=utf-8`, UTF-8 BOM, comma separator, CRLF, `Content-Disposition: attachment; filename="qaryzlink-<dataset>-<YYYY-MM-DD>.csv"`, max 50 000 жол (`X-Export-Truncated: true` кесілсе, `X-Export-Row-Count`). `= + - @ tab CR` басталатын string ұяшықтарға `'` prefix (formula injection). Әр экспорт `AuditEvent INTERNAL_EXPORT_CREATED` (`entityType INTERNAL_EXPORT`, `entityId <dataset>`, payload `{ dataset, filters, rowCount, truncated }`; free-text `q` орнына тек `hasQuery: true`) жазады.

Индекстер: migration `20261108130000_analytics_indexes` (users/sessions/contracts/payments/fundings/dispute_cases/family_debt_drafts/notification_outbox/loan_requests/audit_events/parties date columns).
