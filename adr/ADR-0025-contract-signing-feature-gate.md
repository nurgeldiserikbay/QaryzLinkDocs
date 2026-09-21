# ADR-0025: Contract signing feature gate

- Status: Accepted
- Date: 2026-09-21
- Owners: QaryzLink product, backend and release owners
- Related: ADR-0003, ADR-0008

## Context

QaryzLink-тің current contract flow immutable draft және екі тараптың acknowledgement моделін қолдайды. Backend-та signature mutation route болғанымен, оның legal meaning-і мен release readiness-і әлі толық тексерілмеген. Signing mutation екі тараптың signature rows-ын жазып, contract state-ін өзгертіп, келесі funding workflow-ына әсер етуі мүмкін.

## Decision

1. CONTRACT_SIGNING_ENABLED — boolean runtime feature flag.
2. Flag барлық ортада әдепкіде false; .env.example осы default-ты бекітеді.
3. Flag true болмаса, POST /api/v1/contracts/:id/sign ешқандай repository mutation орындамай, CONTRACT_SIGNING_DISABLED conflict қайтарады.
4. Contract draft жасау және contract-ті екі тарапқа read-only көрсету бұл gate-пен өшірілмейді.
5. Front/Admin clients signing mutation control-ын flag explicit enablement және approved release болмаса көрсетпейді.
6. Flag-ті қосу legal review, security review, release approval және funding boundary тексерілгеннен кейін ғана рұқсат етіледі.
7. Бұл gate platform acknowledgement-ді qualified electronic signature, заңды қорытынды немесе ақша аударымының дәлелі деп өзгертпейді.

## Consequences

- Құқықтық шешім аяқталмай тұрып production/staging-та signing mutation кездейсоқ іске қосылмайды.
- Draft/read-only contract slice-ін қауіпсіз дамытуға болады.
- Flag-ті қосу операциялық өзгеріс емес, бақыланатын release decision болады.
- Flag өзгерісі audit/release evidence-те сақталуы тиіс.

## Operational checklist

- CONTRACT_SIGNING_ENABLED=false staging және production secret/config-те тексерілген.
- Signing endpoint disabled response-ы integration smoke test-пен расталған.
- Backend және client contract tests CONTRACT_SIGNING_DISABLED кодын тексереді.
- Legal/security/release approval құжатталғанға дейін flag true болмайды.
