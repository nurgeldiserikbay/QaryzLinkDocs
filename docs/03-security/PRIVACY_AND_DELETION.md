# Privacy and account deletion hardening

## Privacy defaults

QaryzLink is closed by default. New profiles are not searchable by public ID or contact details and do not expose a public profile unless the user explicitly enables the corresponding setting.

The backend migration also disables public-ID discovery for existing profiles whose public profile is disabled. Profiles that are already explicitly public are not changed by that migration.

## Account deletion lifecycle

Account deletion is a retention-aware workflow rather than an immediate destructive delete:

```text
REQUESTED -> RETENTION_HOLD
          -> READY -> COMPLETED
```

- `REQUESTED`: the user requested deletion; active sessions are revoked immediately.
- `RETENTION_HOLD`: active contractual obligations prevent anonymization.
- `READY`: the engineering grace period has elapsed and no active contractual hold exists.
- `COMPLETED`: direct identity has been anonymized while financial/evidentiary relations remain referentially intact.

The current 30-day grace period is an engineering default, not a validated Kazakhstan statutory retention period. Legal review must confirm or replace it before production.

## Race-condition protection

The readiness processor checks contractual holds before marking a request READY. The anonymization processor repeats the active-contract check inside its transaction immediately before identity mutation. If a qualifying contract appeared after readiness evaluation, the request returns to `RETENTION_HOLD` and no identity fields are anonymized.

## Anonymization behavior

Anonymization removes direct contact identity, disables privacy/discovery surfaces, revokes sessions and verification material, tombstones the password/public ID, and marks the user DELETED. It preserves internal identifiers required by retained contractual, payment and evidentiary records.

The password verifier treats anonymization tombstone hashes as invalid credentials and fails closed without throwing.

## Front request flow

Authenticated user deletion request-ті `/dashboard/settings` арқылы бастай алады. Frontend бұл әрекетті immediate hard delete ретінде көрсетпейді:

- destructive action profile/privacy save form-нан бөлек орналасқан;
- user `ЖОЮ` confirmation phrase-ін explicit енгізбей request жіберілмейді;
- request `POST /api/v1/profile/me/deletion-request` endpoint-іне Bearer session арқылы жіберіледі;
- Backend request қабылданған сәтте active sessions revoke етеді;
- Front successful response-тен кейін local `sessionStorage` session-ын өшіреді;
- UI grace period және contractual retention checks бар екенін түсіндіреді;
- UI fixed completion date уәде етпейді, себебі grace configuration және legal retention policy production алдында бекітілуі керек;
- cancellation endpoint қазіргі contract-та жоқ, сондықтан UI request-ті кері қайтару мүмкіндігін көрсетпейді.

Request idempotent: сол user қайта request жасаған жағдайда Backend бұрынғы request lifecycle-ын қайталамай сақтайды.

## Operations

The maintenance command is:

```sh
pnpm accounts:deletion:run
```

Automatic production scheduling is intentionally not defined yet. Deployment ownership, cadence, retention policy and incident procedures must be approved before enabling a scheduler.

## Private discovery safeguards

Private discovery currently includes:

- invitation-only access;
- invitation revocation;
- bidirectional block handling;
- identity-free list/detail responses;
- cursor visibility validation;
- authenticated-user rate limiting;
- configurable daily request, invitation and proposal quotas;
- privacy-safe business audit events.

Public marketplace discovery remains disabled until product/legal approval.
