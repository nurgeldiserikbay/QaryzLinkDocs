# Dispute support status transitions

Жаңартылған күні: 2026-09-27.

QaryzLink dispute lifecycle үшін support-side mutation boundary кодта бар, бірақ әдепкіде толық өшірулі. Ол нақты support owner/process және legal escalation тәртібі бекітілмейінше production-та қосылмайды.

## Enablement

- `SUPPORT_DISPUTE_TRANSITIONS_ENABLED=false` — default;
- `SUPPORT_ACCESS_TOKEN` кемінде 32 таңба және тек server-side secret store-да;
- endpoint: `PATCH /api/v1/internal/support/disputes/:disputeId/status`;
- header: `x-support-token`;
- Admin UI mutation intentionally absent.

Gate disabled болса немесе token жоқ/қате болса endpoint generic 401 қайтарады.

## Allowed transitions

- OPEN → WAITING_USER | WAITING_INTERNAL | RESOLVED;
- WAITING_USER → WAITING_INTERNAL | RESOLVED;
- WAITING_INTERNAL → WAITING_USER | RESOLVED;
- RESOLVED → CLOSED;
- CLOSED → no transitions.

Same-status request idempotent read ретінде қайтады және жаңа audit mutation жасамайды.

## Audit and privacy

Әр нақты өзгеріс `DISPUTE_STATUS_CHANGED` audit event жасайды. Payload тек `fromStatus` және `toStatus` сақтайды. Dispute description, contract/payment content, contact data немесе support token audit-ке кірмейді.

## Operational gate

Production enablement алдында:

- named support owner;
- support mailbox/helpdesk;
- response targets;
- legal escalation contact;
- abuse/safety escalation path;
- support token custody/rotation owner;
- internal ingress restriction;
- staging mutation smoke;
- audit observation

бекітілуі тиіс.

Бұл boundary support-қа financial truth source болуға рұқсат бермейді: contract/payment/ledger автоматты өзгермейді.