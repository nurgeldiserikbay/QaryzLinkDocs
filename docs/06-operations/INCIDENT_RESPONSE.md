# Incident response runbook

Жаңартылған күні: 2026-09-26.

Бұл runbook QaryzLink staging/public pilot кезеңіндегі техникалық және security incident-терге арналған. Ол нақты on-call провайдерін немесе заңдық міндеттемені алмастырмайды; жауапты адам мен байланыс арналары owner тарапынан release алдында бекітіледі.

## 1. Incident санаттары

| Severity | Мысал | Бастапқы әрекет |
|---|---|---|
| SEV-1 | credentials leak, unauthorized data access, evidence confidentiality breach, destructive production corruption | жаңа deploy/жазу операцияларын тоқтату, secret rotation, access containment, owner escalation |
| SEV-2 | login/refresh outage, database unavailable, queue/cleanup stuck, malware scanner outage | affected feature-ді fail-closed ұстау, rollback/disable, diagnostics |
| SEV-3 | partial UI/API degradation, delayed notifications, non-sensitive background failure | issue тіркеу, bounded mitigation, next release fix |

Құпиялылық белгісіз болса, incident жоғары severity ретінде өңделеді.

## 2. Алғашқы 15 минут

1. Incident басталған UTC уақытты, environment және deploy commit/image digest-ті жазу.
2. Қандай component әсер еткенін анықтау: API, Front, Admin, PostgreSQL, SMTP, object storage, scanner, CronJob.
3. Жаңа destructive action немесе risky integration-ды қажет болса feature gate/rollout арқылы тоқтату.
4. Token/credential exposure күдігі болса secret-ті log/chat-қа көшірмей rotation бастау.
5. Production data-ға ad-hoc SQL немесе destructive migration жасамау.
6. Evidence ретінде тек privacy-safe metadata сақтау: commit SHA, timestamp, status code, aggregate counter, sanitized error code.

## 3. Containment

- auth compromise: JWT/SMTP/storage/metrics/scanner credentials scope бойынша rotate;
- suspicious session: server-side session revoke;
- evidence compromise: signed access тоқтату, scanner verdict-ті fail-closed, affected object prefix access-ін шектеу;
- database issue: write traffic-ті шектеу, backup күйін тексеру, migration-ды қайталамау;
- bad release: last-known-good immutable image digest-ке rollback;
- CronJob runaway: CronJob suspend, overlapping job-тарды тоқтату, manual rerun тек root cause анықталғаннан кейін.

## 4. Recovery

Recovery алдында:

- latest CI green;
- migration state тексерілген;
- readiness /api/v1/health/ready green;
- қажет болса isolated restore drill;
- secret rotation аяқталған;
- affected integration smoke test орындалған.

Traffic бірден толық ашылмайды; алдымен staging/canary acceptance жасалады.

## 5. Communication

External communication тек расталған фактілерге сүйенеді. Хабарламада:

- не істемей тұрғаны;
- user не істеуі керек/керек емес;
- known impact window;
- келесі update уақыты;
- расталмаған себептерді факт ретінде көрсетпеу.

Password, token, full email/phone, IIN/BIN, document content, signed URL немесе raw evidence чат/issue/ticket-ке салынбайды.

## 6. Post-incident

Incident жабылғаннан кейін:

1. timeline;
2. customer/data impact;
3. root cause;
4. containment/recovery actions;
5. қандай guard/test жетіспеді;
6. нақты follow-up owner;
7. due date;
8. runbook/test/monitoring change.

Blameless analysis қолданылады, бірақ қауіпсіздік boundary бұзылған болса corrective action міндетті.

## 7. Release gate

Public pilot алдында нақты incident owner, escalation channel, credential rotation қолжетімділігі, backup restore access, hosting/storage/SMTP provider contacts және user communication owner бекітілуі тиіс.