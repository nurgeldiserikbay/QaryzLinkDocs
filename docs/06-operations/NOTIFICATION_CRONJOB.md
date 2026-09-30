# Notification scheduler Kubernetes CronJob

## Мақсаты

Бұл deployment adapter QaryzLinkBack-тағы бір реттік notification command-ті Kubernetes арқылы әр бес минут сайын шақырады:

~~~text
node dist/src/notification-scheduler.main.js
~~~

Application image ішінде command HTTP server ашпайды. Ол AppModule context іске қосып, outbox claim/retry және delivery lifecycle-ін бір рет орындайды.

Canonical release-bundle manifest QaryzLinkBack-та:

`ops/kubernetes/notification-scheduler-cronjob.yaml`

Осы repository-дегі [notification-scheduler-cronjob.yaml](kubernetes/notification-scheduler-cronjob.yaml) — review/reference copy; ол Backend #220 (`196e55a`) source manifest-пен синхрондалған.

## Қауіпсіздік және overlap policy

- concurrencyPolicy: Forbid — алдыңғы Job аяқталмай тұрып жаңа Job басталмайды;
- backoffLimit: 0 — Kubernetes bootstrap қатесін өздігінен бірнеше рет қайталамайды;
- application-level retry — outbox worker-дің lease және exponential backoff policy-і арқылы орындалады;
- automountServiceAccountToken: false — scheduler-ге Kubernetes API token қажет емес;
- runAsNonRoot және readOnlyRootFilesystem қосылған;
- image нақты immutable digest-пен deployment кезінде берілуі тиіс;
- runtime settings external Secret арқылы беріледі;
- Secret мазмұны және production namespace деректері репозиторийге жазылмайды.

PostgreSQL claim операциясындағы FOR UPDATE SKIP LOCKED multi-replica/қайталанған execution кезінде бір outbox event-тің екі рет өңделу қаупін азайтады. CronJob overlap policy бұл қорғаныстың deployment деңгейіндегі қосымша қабаты.

## Secret contract

`qaryzlink-back` Secret ішінде backend environment contract-іне сәйкес secret мәндер болуы керек; non-secret runtime configuration `qaryzlink-back` ConfigMap арқылы беріледі:

- DATABASE_URL;
- REDIS_URL;
- JWT_ACCESS_SECRET;
- NOTIFICATION_BATCH_SIZE;
- METRICS_ACCESS_TOKEN;
- MAIL_ENABLED және SMTP settings, егер email delivery staging-де қосылса.

Secret-ті kubectl command history-ге немесе Git-ке ашық мәнмен енгізбеңіз. Secret manager немесе sealed/external secret workflow қолданыңыз.

## Image және migration тәртібі

Backend release renderer `registry.example.com/qaryzlink/back@sha256:REPLACE_WITH_RELEASE_DIGEST` placeholder-ін дәл бір approved immutable digest-пен ауыстырады. `latest` немесе басқа mutable tag қолданбаңыз.

Notification CronJob migration job емес. Schema migration traffic ашылғанға дейін бөлек release job арқылы орындалады. Scheduler image-і migration-ға тәуелді schema дайын болғаннан кейін ғана іске қосылады.

## Staging acceptance

1. Backend image-ін immutable digest арқылы registry-ге орналастыру.
2. Runtime Secret-ті cluster secret manager арқылы беру.
3. Manifest-тегі image және namespace мәндерін staging үшін толтыру.
4. CronJob-ті қолдану.
5. Job бір рет сәтті аяқталғанын және жаңа Job overlap болмайтынын тексеру.
6. GET /api/v1/metrics/notifications endpoint-ін x-metrics-token header арқылы оқу.
7. Failed/pending counters және job logs ішінде PII жоқ екенін тексеру.
8. SMTP нақты staging mailbox-қа тек бақылаудағы test account арқылы тексеру.

### HTTP smoke checks

Командаларды internal staging ingress арқылы орындаңыз. METRICS_ACCESS_TOKEN мәнін shell secret manager-ден беріңіз; shell command tracing қосылмаған болсын:

~~~bash
BASE_URL="https://staging-internal.example.invalid"
METRICS_ACCESS_TOKEN="$(secret-manager read qaryzlink/staging/METRICS_ACCESS_TOKEN)"

curl --fail "${BASE_URL}/api/v1/health"

discovery_status="$(curl -s -o /dev/null -w '%{http_code}' "${BASE_URL}/api/v1/discovery/requests")"
test "${discovery_status}" = "401"

metrics_without_token_status="$(curl -s -o /dev/null -w '%{http_code}' "${BASE_URL}/api/v1/metrics/notifications")"
test "${metrics_without_token_status}" = "401"

metrics_with_token_status="$(curl -s -o /dev/null -w '%{http_code}' -H "x-metrics-token: ${METRICS_ACCESS_TOKEN}" "${BASE_URL}/api/v1/metrics/notifications")"
test "${metrics_with_token_status}" = "200"
~~~

example.invalid және secret-manager — тек placeholder. Нақты hostname мен Secret Manager командасын deployment ортасына сәйкес ауыстырыңыз. Token-ді URL query параметріне қоспаңыз және HTTP response body-ді әдепкі shell output-қа шығармаңыз.

CI compiled smoke test осы authorization contract-ті production-like process арқылы да тексереді: [run 35520106084](https://github.com/nurgeldiserikbay/QaryzLinkBack/actions/runs/35520106084).

Бұл manifest public launch рұқсаты емес. Backup/restore, ingress authentication, alerting, push provider және legal pilot gate бөлек орындалады.

Толық шешім: [ADR-0024](../../adr/ADR-0024-notification-kubernetes-cronjob.md).
