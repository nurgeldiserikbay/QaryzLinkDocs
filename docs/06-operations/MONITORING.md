# Monitoring және alerting runbook

Жаңартылған күні: 2026-09-21.

Monitoring жүйесі availability және operational failure-ді бақылауға арналған. Ол user profiling, public reputation немесе PII analytics құралы емес.

## Monitoring boundaries

- Dashboard-тарда user ID, email, телефон, ЖСН/БСН, document content және token көрсетілмейді.
- Metrics endpoint protected және internal access boundary ішінде қалады.
- Public health response тек liveness snapshot береді.
- Readiness, database және dependency health іске қосылмаған болса, оларды іске қосылған деп жариялауға болмайды.
- Alert payload-тар sensitive request/response body қамтымайды.

## Негізгі сигналдар

| Signal | Threshold/condition | Action |
|---|---|---|
| HTTP liveness | health 5xx немесе timeout | On-call тексеруі |
| API errors | sustained 5xx өсімі | release/infra triage |
| Auth failures | әдеттен тыс 401/429 burst | rate-limit және abuse review |
| Metrics access | invalid token burst | internal ingress review |
| Database | connection/migration failure | release тоқтату, DB review |
| Notification worker | repeated failed/pending | provider/outbox review |
| CronJob | missed/overlap/non-zero exit | scheduler review |
| Backup | stale немесе restore failure | backup incident |
| Storage | upload/read/signing failure | storage review |

Threshold-тер provider және traffic baseline бекітілгеннен кейін ғана санмен белгіленеді; ойдан шығарылған сан production alert ретінде қолданылмайды.

## Dashboard minimum

- availability және latency aggregate;
- HTTP status class;
- auth/rate-limit aggregate;
- notification counters;
- scheduler run result;
- backup freshness;
- deployment commit SHA;
- migration status.

Small cohort немесе жеке пайдаланушы бойынша analytics қоспаңыз. Aggregate аз топта re-identification қаупі болса, suppression қолданылады.

## Log hygiene

Рұқсат етіледі:

- correlation/request ID;
- route template;
- method және status class;
- duration;
- deployment commit SHA;
- coarse error code;
- worker run counters.

Тыйым салынады:

- Authorization header;
- JWT, refresh token және metrics token;
- password;
- email/phone;
- ЖСН/БСН;
- document content;
- notification body;
- full query/body payload;
- signed URL query string.

## Incident flow

1. Alert-ті acknowledge ету.
2. Commit, environment және aggregate signal-дарды тексеру.
3. Secret немесе PII log-қа түспегенін растау.
4. User-facing impact-ті тек aggregate түрде бағалау.
5. Қажет болса traffic-ті staging/restricted режимге қайтару.
6. Дерек өзгеретін операцияларды approval-сыз орындамау.
7. Rollback немесе forward fix шешімін жазбаша бекіту.
8. Recovery smoke test орындау.
9. Root cause және follow-up task жазу.

Production monitoring толық іске қосылды деп есептелмейді, егер alert destination, on-call owner, retention және test alert нәтижелері бекітілмесе.
