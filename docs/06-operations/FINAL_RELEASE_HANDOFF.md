# Final release handoff

Жаңартылған күні: 2026-10-07

Бұл құжат QaryzLink repository-side production-readiness жұмыстары аяқталғаннан кейінгі handoff нүктесін бекітеді. Мұнда код репозиторийлерінде дайын болған tooling пен нақты staging/provider ортада әлі жиналуы тиіс evidence бөлек көрсетіледі.

## Repository-side status

2026-10-03 жағдайы бойынша MVP implementation complete. Backend-та production-readiness tooling тізбегі Back #263–#268 арқылы аяқталды:

- exact release commit + immutable image digest binding;
- release-bound migration және rollback evidence;
- in-cluster release preflight execution evidence;
- aggregate staging platform acceptance;
- release-bound external provider evidence validation;
- final fail-closed release approval gate.

Front және Admin main branch-терінде typecheck/lint/unit/build, browser E2E және staging browser E2E workflow foundation бар. Final audit кезінде ашық PR немесе айқын TODO/FIXME implementation gap табылған жоқ.

Docs осы құжат арқылы соңғы operator handoff contract-ты бекітеді.

## 2026-10-07 repository extension checkpoint

The repository-side MVP boundary remains complete. Since the original handoff, the web/PWA product received a bounded contract-chat extension without changing the financial/legal mutation model:

- private borrower/lender contract-scoped messages;
- immutable chat persistence and privacy-safe role projection;
- rate-limited writes and in-app notification delivery;
- per-contract unread counts and grouped read handling;
- bounded cursor history pagination;
- visible-tab polling optimization;
- chat text remains non-authoritative for contract terms, funding, payment or amendments;
- organization/company accounts remain architecture-only and are not part of this release candidate.

These additions do not replace any real-environment/provider/legal gate below. Staging acceptance must be run against the exact candidate commit selected after all repository CI/security checks are green.

Current frozen staging application candidate: [STAGING_CANDIDATE_2026-10-07_V2.md](../04-delivery/STAGING_CANDIDATE_2026-10-07_V2.md).

The earlier 2026-10-07 candidate is superseded and must not be used for new acceptance evidence.

Operator run sequence and exact workflow inputs: [Staging execution sheet v2](../04-delivery/STAGING_EXECUTION_SHEET_2026-10-07_V2.md).

## Release candidate freeze

Production/pilot acceptance басталғанда бір Backend release candidate freeze жасалады:

1. exact 40-character Git commit SHA;
2. immutable Backend container digest;
3. сол commit-тен render жасалған release bundle;
4. successful CI және supply-chain evidence.

Acceptance барысында commit немесе digest өзгерсе, бұрынғы release-bound evidence жаңа candidate үшін жарамсыз деп есептеледі.

## Required real-environment evidence

Repository tooling дайын болғанымен, төмендегі acceptance нақты staging/provider ортада орындалуы керек:

- staging deploy + HTTPS/ingress reachability;
- release identity check;
- database migration Job;
- rollback compatibility rehearsal;
- backup/restore drill;
- in-cluster release preflight;
- aggregate platform/network/container/readiness acceptance;
- encrypted PII mode acceptance;
- staging log privacy scan;
- controlled-mailbox email verification;
- controlled-mailbox password reset;
- private evidence storage signed upload;
- CLEAN malware-scanner verdict;
- INFECTED/EICAR malware-scanner verdict;
- external monitoring alert receipt/routing/escalation;
- Front KZ/RU authenticated core browser E2E;
- Admin staging operational E2E where enabled;
- notification delivery/retry acceptance.

Provider credentials, mailbox tokens, access tokens, object URLs, private payloads немесе PII retained evidence-ке салынбайды.

## External boundary evidence

Нақты provider smoke-тар аяқталғаннан кейін Backend-тағы:

`ops/staging-external-boundary-acceptance.sh`

exact release commit + digest-ке bind болған metadata-only evidence set-ті тексереді. Operator және reviewer бөлек болуы керек.

Бұл validator provider acceptance-ті өзі жасамайды; ол тек real-environment evidence толық әрі release-bound екенін тексереді.

## Final approval

Барлық required gate pass болғаннан кейін Backend-та final approval record жасалып:

`ops/final-release-approval.sh`

арқылы тексеріледі.

Final approval тек келесі шарттарда pass болады:

- барлық required gate explicit `true`;
- unresolved blocker жоқ;
- exact release commit + image digest сәйкес;
- required evidence reference толық;
- operator және reviewer бөлек;
- sensitive field сақталмаған.

## When a new PR is needed

Жаңа repository PR тек мына жағдайлардың бірінде керек:

- real staging/provider acceptance кезінде нақты defect табылса;
- CI немесе acceptance harness-та reproducible bug анықталса;
- external provider integration contract implementation өзгерісін қажет етсе;
- legal/product decision canonical business rule-ды өзгертсе;
- production incident remediation code/config change талап етсе.

Тек evidence жетіспеуі өздігінен code PR ашуға себеп емес.

## Current boundary

Repository-side MVP және production-readiness tooling complete деп саналады.

Production/pilot readiness-тің remaining work бөлігі — real staging/provider execution, independent review және final approval evidence. Бұл environment-owned work код дайын емес дегенді білдірмейді.

## Owner handoff sequence

Operator үшін canonical sequence:

1. release candidate freeze;
2. staging deploy;
3. release identity;
4. migration;
5. rollback + backup/restore rehearsal;
6. in-cluster preflight;
7. aggregate platform acceptance;
8. privacy/log acceptance;
9. SMTP/storage/scanner/monitoring provider acceptance;
10. Front/Admin staging E2E;
11. notification delivery acceptance;
12. external-boundary evidence validation;
13. final release approval validation;
14. production/pilot promotion decision.

Promotion автоматты бизнес немесе legal approval болып саналмайды; applicable legal/provider gates бөлек retained evidence-пен жабылады.
