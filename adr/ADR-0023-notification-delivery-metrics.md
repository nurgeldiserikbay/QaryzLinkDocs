# ADR-0023: Notification delivery metrics

- **Status:** Accepted — amended 2026-09-26
- **Date:** 2026-09-20
- **Amended:** 2026-09-26
- **Owners:** QaryzLink maintainers

## Context

QaryzLink-та transactional notification outbox, leased claim/retry worker, provider-neutral delivery және one-shot scheduler бар. Deployment owner pending/failed көлемін және execution duration-ды privacy-safe operational contract арқылы тексере алуы керек.

Бастапқы 2026-09-20 шешім counters-ты API process memory-сінде сақтаған. Кейін scheduler production model-і бөлек one-shot command/Kubernetes CronJob ретінде бекітілді. Осы екі process бір memory state-ті бөліспейтіндіктен API endpoint scheduler орындаған нақты counters-ты көрмеуі мүмкін еді. Process-local snapshot operational тұрғыда misleading zero values беру қаупін тудырды.

Metrics-ке PII, notification payload, payment, contract, ledger немесе contact деректері кірмеуі тиіс.

## Decision

Notification metrics PostgreSQL-де бір singleton aggregate row ретінде сақталады:

- runs;
- claimed;
- sent;
- pending;
- failed;
- lastRunAt;
- lastRunDurationMs.

Scheduler әр аяқталған `runOnce` execution-нан кейін atomic upsert/increment жасайды. API process `GET /api/v1/metrics/notifications` арқылы дәл сол persisted snapshot-ты оқиды. Row жоқ болса zero snapshot қайтарылады.

Per-run notification немесе telemetry history сақталмайды. Сондықтан бұл persistent aggregate state, бірақ time-series event store емес.

Staging және production-да endpoint `METRICS_ACCESS_TOKEN` + `x-metrics-token` арқылы қорғалады және internal operations ingress ішінде қалуы керек.

## Alternatives

1. **Process-local memory counters** — қарапайым, бірақ one-shot scheduler мен API әртүрлі process болғандықтан operationally дұрыс емес.
2. **Әр scheduler run үшін жеке history row** — trend analysis береді, бірақ retention, growth және operational data lifecycle талабын ерте енгізеді.
3. **Тек command log** — автоматты monitoring/Admin visibility үшін жеткіліксіз.
4. **Бірден Prometheus/OpenTelemetry client** — deployment observability stack толық таңдалмай тұрып provider dependency қосады.
5. **PostgreSQL singleton aggregate** — process boundary-ді жабады, bounded storage береді және PII қоспайды; осы нұсқа таңдалды.

## Consequences

### Positive

- Counters scheduler process restart-ынан кейін жоғалмайды.
- One-shot CronJob және API process бір persisted state-ті көреді.
- Storage көлемі bounded: бір aggregate row.
- Recipient, payload, contact және financial identifiers сақталмайды.
- Кейін collector/exporter осы stable endpoint немесе DB-backed contract үстіне қосыла алады.

### Negative

- Scheduler completion metrics write үшін PostgreSQL availability-ге тәуелді.
- Per-run history және time-series trend жоқ.
- Alerting, dashboards және external telemetry collector бөлек production slice болып қалады.
- Metrics write dispatch аяқталғаннан кейін орындалатындықтан write failure command-ті failed етеді, бірақ бұрын persisted delivery state-ті rollback етпейді.

## Security and legal boundary

Бұл ADR notification delivery telemetry-ін ғана қамтиды. Metrics endpoint token-protected және internal operations boundary-де қалуы тиіс. Admin интеграциясы server-side secret қолданады; browser token алмайды.

Бұл шешім ақша сақтау/аудару, debt collection, legal adjudication, scoring немесе public marketplace қоспайды. Platform private, invite-only MVP шекарасында қалады.
