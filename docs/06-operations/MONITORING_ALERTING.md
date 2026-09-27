# Monitoring and alerting contract

Жаңартылған күні: 2026-09-27.

Бұл құжат QaryzLink public pilot алдындағы provider-neutral monitoring contract-ты анықтайды. Prometheus, Grafana, Datadog, cloud-native monitor немесе басқа collector кейін таңдалуы мүмкін; application code нақты vendor-ға байланбайды.

## 1. Source signals

Ішкі collector мына authenticated aggregate endpoint-терді ғана оқиды:

- `/api/v1/health/ready` — database readiness;
- `/api/v1/metrics/notifications` — notification scheduler/delivery aggregates;
- `/api/v1/metrics/evidence` — upload/scanner/orphan state;
- `/api/v1/metrics/account-deletions` — deletion lifecycle backlog/age;
- `/api/v1/metrics/auth-retention` — expired auth metadata backlog;
- `/api/v1/metrics/pii-migration` — encrypted-storage migration backlog;
- `/api/v1/metrics/pii-key-rotation` — old-key ciphertext backlog;
- `/api/v1/metrics/audit` — privacy-safe audit aggregate.

Metrics endpoint-тер public internet-ке шығарылмайды. Collector server-side `METRICS_ACCESS_TOKEN` қолданады; browser/client бұл token-ді алмайды.

## 2. Required alert classes

| Signal | Minimum condition | Severity guidance |
|---|---|---|
| readiness | consecutive non-200/503 or database=down | critical |
| CronJob execution | Job failed or missed expected execution window | warning → critical if repeated |
| notification delivery | FAILED growth between observations or scheduler stale | warning/critical |
| evidence cleanup | expired unconsumed backlog grows or oldest age exceeds operational target | warning |
| evidence scanner | FAILED verdict growth / scanner unavailable | critical for upload enablement |
| account deletion | READY backlog grows; oldest pending exceeds approved operational target | warning |
| auth retention | expired verification/rate-limit backlog persists across cleanup windows | warning |
| PII migration | encrypted cutover requested while backlog > 0 | critical/block release |
| key rotation | old-key backlog remains before planned key retirement | critical/block retirement |
| backup/restore | scheduled backup missing or restore rehearsal overdue | critical for release |

## 3. Threshold ownership

Application repository hard-code етпейді:

- traffic-volume thresholds;
- response-time SLO;
- support response targets;
- legal deletion SLA;
- backup RPO/RTO;
- alert paging window.

Бұл мәндерді staging baseline + owner/legal/operations approval анықтайды. Threshold changes infrastructure/monitoring config history-де versioned болуы тиіс.

## 4. Notification rules

Alert payload data-minimized болуы керек. Мыналар alert body-ға кірмейді:

- email/phone/IIN/BIN;
- JWT/refresh token;
- storage/scanner/metrics secret;
- signed URL;
- object key/sha256;
- raw document/evidence;
- contract/payment free-text payload.

Alert-ке environment, UTC timestamp, service, coarse signal name, aggregate counter/status және release image digest жеткілікті.

## 5. Collector behavior

- HTTPS/internal network only;
- bounded timeout;
- failed metrics fetch өзі observable болуы тиіс;
- metrics token secret store-да сақталады;
- retry exponential/backoff;
- one transient failure page жібермеуі мүмкін, бірақ readiness/security-critical repeated failure escalate етеді;
- no mutation endpoint collector-ға берілмейді.

## 6. Release acceptance

Public pilot алдында нақты monitoring provider таңдалып, осы contract бойынша кемінде мыналар human-verified болуы керек:

1. readiness failure alert;
2. CronJob failure alert;
3. notification failure/stale scheduler alert;
4. evidence scanner/cleanup alert;
5. backup/restore alert;
6. account deletion backlog alert;
7. alert routing owner және escalation channel.

Actual alert delivery screenshot/record ішінде secret немесе PII болмауы тиіс.

## 7. Current status

Application-level aggregate sources дайын. External collector/provider, threshold tuning және paging/escalation integration environment owner-ға тәуелді және әлі release gate болып қалады.