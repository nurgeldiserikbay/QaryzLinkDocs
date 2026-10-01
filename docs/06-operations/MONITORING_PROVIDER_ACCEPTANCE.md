# Monitoring provider acceptance record

Жаңартылған күні: 2026-10-01.

Бұл record QaryzLink public pilot үшін нақты monitoring collector/provider, alert routing, thresholds және escalation path-ты versioned түрде approve етуге арналған.

**Бұл template-тің болуы provider немесе production monitoring-ті approve етпейді.** Барлық provider, owner, threshold және evidence өрістері нақты staging review өткенше `PENDING` болып қалады.

Technical signal contract: [Monitoring and alerting contract](MONITORING_ALERTING.md).

## 1. Provider and deployment identity

| Field | Value |
|---|---|
| Provider/collector legal or product name | **PENDING** |
| Deployment/profile version | **PENDING** |
| Staging environment | **PENDING** |
| Production region/residency | **PENDING** |
| Internal collector network location | **PENDING** |
| Dashboard/alert configuration version | **PENDING** |
| Review date | **PENDING** |

No secret value, metrics token, kubeconfig, signed URL or customer identifier belongs in this record.

## 2. Collection boundary

The approved collector must remain read-only and data-minimized.

Acceptance:

- [ ] collector reaches QaryzLink only through approved HTTPS/internal network paths;
- [ ] metrics endpoints are not exposed to the public internet;
- [ ] `METRICS_ACCESS_TOKEN` is stored in an approved secret store and never delivered to browsers;
- [ ] collector has no mutation/support/admin credential;
- [ ] request/response bodies are not retained by default;
- [ ] retries use bounded timeout/backoff;
- [ ] failed collection is itself observable;
- [ ] dashboard dimensions cannot expose user ID, email, phone, IIN/BIN, object key, document content or raw free text.

Record:

| Boundary | Reference/status |
|---|---|
| Internal ingress/network policy | **PENDING** |
| Metrics credential storage | **PENDING** |
| Collector service identity | **PENDING** |
| Egress policy | **PENDING** |
| Log/telemetry retention | **PENDING** |

## 3. Required signal coverage

Map the provider configuration to the application/provider-neutral signal contract.

| Signal class | Source | Provider rule/reference | Accepted |
|---|---|---|---|
| API readiness/database | `/api/v1/health/ready` | **PENDING** | [ ] |
| Notification failed/stale scheduler | `/api/v1/metrics/notifications` | **PENDING** | [ ] |
| Evidence scanner/cleanup | `/api/v1/metrics/evidence` | **PENDING** | [ ] |
| Account deletion backlog | `/api/v1/metrics/account-deletions` | **PENDING** | [ ] |
| Auth-retention backlog | `/api/v1/metrics/auth-retention` | **PENDING** | [ ] |
| PII migration/cutover | `/api/v1/metrics/pii-migration` | **PENDING** | [ ] |
| PII key rotation | `/api/v1/metrics/pii-key-rotation` | **PENDING** | [ ] |
| Audit aggregate | `/api/v1/metrics/audit` | **PENDING** | [ ] |
| Dispute backlog | `/api/v1/metrics/disputes` | **PENDING** | [ ] |
| Kubernetes CronJob/Job failure | cluster scheduler/job signal | **PENDING** | [ ] |
| Backup freshness/restore failure | provider backup/recovery signal | **PENDING** | [ ] |

A provider-specific dashboard may add infrastructure signals, but it must not silently remove any required class.

## 4. Threshold ownership

Traffic/SLO/legal/operations thresholds are not invented in application code.

For every alert record:

| Field | Value |
|---|---|
| Signal | **PENDING** |
| Warning condition/window | **PENDING** |
| Critical condition/window | **PENDING** |
| Baseline/staging evidence | **PENDING** |
| Owner approving threshold | **PENDING** |
| Configuration/version reference | **PENDING** |
| Review/expiry date | **PENDING** |

Threshold changes must remain versioned in infrastructure/monitoring configuration history.

## 5. Alert payload privacy

Human-visible and machine-routed alerts may contain only the minimum operational context, for example:

- environment;
- UTC timestamp/window;
- service/component;
- coarse signal name;
- aggregate status/counter;
- release commit/image identity where required.

The following are prohibited in alert payloads:

- email/phone/IIN/BIN;
- JWT, refresh token, metrics token or provider secret;
- signed URLs;
- object keys/hashes when they identify private evidence;
- raw document/evidence bytes;
- request/response body;
- contract/payment free text.

Acceptance:

- [ ] representative warning payload reviewed;
- [ ] representative critical payload reviewed;
- [ ] provider notification history reviewed for secret/PII leakage;
- [ ] retained alert evidence is metadata-only or privacy-approved.

## 6. Routing and escalation

| Field | Value |
|---|---|
| Primary on-call owner | **PENDING** |
| Secondary/escalation owner | **PENDING** |
| Warning destination | **PENDING** |
| Critical/paging destination | **PENDING** |
| Acknowledgement expectation | **PENDING** |
| Incident runbook reference | **PENDING** |
| After-hours policy | **PENDING** |

Do not mark production monitoring accepted if the alert destination has no accountable human owner.

## 7. Staging test alerts

Public pilot approval requires human-verified delivery evidence for at least:

- [ ] readiness/database failure;
- [ ] CronJob/Job failure or missed execution signal;
- [ ] notification failure or stale scheduler;
- [ ] evidence scanner/cleanup failure;
- [ ] backup missing/restore failure signal;
- [ ] account-deletion backlog signal;
- [ ] collector/metrics fetch failure;
- [ ] recovery/clear notification where the provider supports it.

For each test retain only:

- environment;
- UTC timestamp;
- release/config version;
- coarse scenario name;
- expected severity;
- observed destination;
- pass/fail;
- reviewer reference.

Do not retain metrics token, kubeconfig, raw response body, customer data or production backup bytes.

## 8. Failure and rollback behavior

- [ ] monitoring provider outage does not break API/business mutations;
- [ ] collector retries are bounded and do not overload QaryzLink;
- [ ] compromised metrics credential can be rotated/revoked;
- [ ] incorrect/noisy rule can be disabled without application redeploy where practical;
- [ ] routing changes are attributable/versioned;
- [ ] provider outage has a fallback operational contact/process.

## 9. Approval record

| Field | Value |
|---|---|
| Monitoring acceptance ID/version | **PENDING** |
| Provider/config version | **PENDING** |
| Internal ingress review reference | **PENDING** |
| Threshold policy reference | **PENDING** |
| Successful staging alert-test reference | **PENDING** |
| Operations reviewer | **PENDING** |
| Security reviewer | **PENDING** |
| Privacy reviewer | **PENDING** |
| Product/owner reviewer | **PENDING** |
| Effective/review date | **PENDING** |

## 10. Final gate

External collector/provider, tuned thresholds, paging және escalation production-ready болып тек осы record approved болғанда және required staging test alerts нақты destination-ға жеткенде есептеледі. Versioned config немесе template-тің өзі production acceptance емес.
