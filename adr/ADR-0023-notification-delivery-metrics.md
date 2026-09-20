# ADR-0023: Notification delivery metrics

- **Status:** Accepted
- **Date:** 2026-09-20
- **Owners:** QaryzLink maintainers

## Context

QaryzLink-та transactional notification outbox, leased claim/retry worker, provider-neutral delivery және one-shot scheduler бар. Бірақ scheduler нәтижелері тек command log-ында көрінеді. Deployment owner pending/failed көлемін және execution duration-ды қауіпсіз operational contract арқылы тексере алуы керек.

Metrics-ке PII, notification payload, payment, contract немесе ledger деректері кірмеуі тиіс. Қазіргі backend production monitoring stack-і әлі таңдалмаған.

## Decision

NotificationMetricsService memory ішінде мына counters-ті жинайды:

- runs;
- claimed;
- sent;
- pending;
- failed;
- lastRunAt;
- lastRunDurationMs.

GET /api/v1/metrics/notifications осы privacy-safe snapshot-ты қайтарады. Scheduler әр сәтті аяқталған runOnce execution-нан кейін metrics-ті жаңартады.

Endpoint internal deployment boundary ішінде қалуы керек. Бұл кезең authentication, Prometheus exporter, persistent storage немесе alerting қоспайды.

## Alternatives

1. Әр run нәтижесін тек log-қа жазу — автоматты monitoring үшін жеткіліксіз.
2. Metrics-ті PostgreSQL-ге сақтау — notification transaction-ына артық coupling және бастапқы MVP үшін қажетсіз күрделілік.
3. Бірден Prometheus client қосу — нақты deployment/observability stack таңдалмай тұрып premature dependency болады.

## Consequences

### Positive

- Pending/failed delivery және scheduler duration operational түрде көрінеді.
- Metrics payload және PII boundary-ін бұзбайды.
- Кейін Prometheus/OpenTelemetry adapter-ін осы contract үстіне қосуға болады.
- Scheduler-дің бизнес логикасы өзгермейді.

### Negative

- Process restart болғанда counters жоғалады.
- Endpoint өздігінен authentication бермейді; ingress private болуы керек.
- Alerting және historical trend кейінгі delivery slice-ке қалады.

## Security and legal boundary

Бұл ADR notification delivery telemetry-ін ғана қамтиды. Ол ақша сақтау/аудару, debt collection, legal adjudication, scoring немесе public marketplace қоспайды. Platform әлі де private, invite-only MVP шекарасында қалады.
