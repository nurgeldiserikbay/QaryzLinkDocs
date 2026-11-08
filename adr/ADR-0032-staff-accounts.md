# ADR-0032: Per-person back-office staff accounts with opaque sessions

- Status: Accepted for implementation
- Date: 2026-11-08
- Owners: QaryzLink backend, security and operations
- Scope: QaryzLinkAdmin and every internal endpoint (`/api/v1/internal/*`, `/api/v1/metrics/*`)
- Related: ADR-0026, ADR-0029, ADR-0030

## Context

QaryzLinkAdmin was protected by HTTP Basic Auth plus shared environment tokens forwarded to the backend:
`x-operations-token` (`OPERATIONS_ACCESS_TOKEN`), `x-metrics-token` (`METRICS_ACCESS_TOKEN`) and
`x-support-token` (hashed, scoped and expiring entries in `SUPPORT_STAFF_CREDENTIALS_JSON`).

Shared secrets cannot answer "who did this": they are copied between people, cannot be revoked per person,
have no MFA, no lockout and no session lifetime. Support mutations (dispute transitions, legal holds,
operational-risk assignment) need a named human actor in the audit trail.

## Decision

### 1. Staff identities live in the backend database, separate from end users

- `staff_accounts`: `email` (unique, normalized lowercase), `displayName`, `role` (`OWNER | ADMIN | SUPPORT | ANALYST`),
  `status` (`ACTIVE | DISABLED`), `passwordHash` (the same scrypt hasher and password policy as user accounts),
  `mustChangePassword`, `totpSecretEncrypted`, `totpEnabledAt`, `totpLastUsedStep` (replay protection),
  `failedLoginCount`, `lockedUntil`, `lastLoginAt`, `createdByStaffId`.
- Staff accounts are never linked to `users`/`parties`; a staff member who is also a customer has two identities.
- Migration: `20261108120000_staff_accounts`.

### 2. Opaque, server-side sessions

- Login returns `qls_<base64url(32 random bytes)>`; only `sha256(token)` is stored in `staff_sessions.tokenHash`.
- Absolute lifetime `STAFF_SESSION_TTL_HOURS` (default 12) and idle timeout `STAFF_SESSION_IDLE_MINUTES` (default 60).
  `lastSeenAt` is persisted at most once per minute.
- The token travels only in the `x-staff-session` header (never in URLs). Sessions are revoked on logout,
  password change (other sessions), admin password reset, disabling and explicit revocation.
- `ipHash` / `userAgentHash` are keyed HMACs; raw IPs and user agents are not stored.

### 3. Roles map to scopes in one exported constant

`STAFF_ROLE_SCOPES` (`src/modules/staff-auth/domain/staff-role.ts`) is the single source of truth; the admin may mirror it
for navigation only. Scopes are computed from the current role on every request, so role changes and disabling take
effect immediately.

| Scope | OWNER | ADMIN | SUPPORT | ANALYST |
| --- | --- | --- | --- | --- |
| operations:read | yes | yes | yes | yes |
| metrics:read | yes | yes | – | yes |
| analytics:read | yes | yes | yes | yes |
| exports:read | yes | yes | – | yes |
| disputes:write | yes | yes | yes | – |
| marketplace-reports:read | yes | yes | yes | – |
| marketplace-reports:write | yes | yes | yes | – |
| operational-risks:write | yes | yes | yes | – |
| evidence-holds:read | yes | yes | yes | – |
| evidence-holds:write | yes | yes | – | – |
| staff:manage | yes | – | – | – |

`staff:self` is a pseudo-requirement for the staff member's own account endpoints; every active session satisfies it.

### 4. Login hardening

- Generic `STAFF_INVALID_CREDENTIALS` for unknown email, wrong password and invalid email format; unknown emails run a
  dummy scrypt verification so timing does not reveal existence.
- Five failed attempts lock the account for 15 minutes (`423 STAFF_LOCKED` + `Retry-After`). Unknown emails get the same
  lock behaviour from a keyed rate bucket, so lockout does not enumerate accounts either.
- `STAFF_DISABLED` and `STAFF_TOTP_REQUIRED` are only revealed after the correct password.
- Per-IP (20/min) and per-email (10/15 min) budgets reuse `auth_rate_buckets` with HMAC keys (`429 STAFF_RATE_LIMITED`).

### 5. MFA (TOTP)

- RFC 6238, HMAC-SHA1, 6 digits, 30 s, ±1 step, implemented with `node:crypto` (no new dependency).
- Secrets are AES-256-GCM encrypted at rest with `STAFF_TOTP_ENCRYPTION_KEY`, bound to the staff id via AAD.
  The key is mandatory in staging/production when staff accounts are enabled; development falls back to a key derived
  from `JWT_ACCESS_SECRET` with a warning.
- `STAFF_MFA_REQUIRED=true` (recommended for production) limits sessions without enabled TOTP to the staff-auth
  endpoints until TOTP is enrolled, and forbids disabling TOTP.

### 6. Temporary passwords and bootstrap

- Accounts created by an OWNER (or by the CLI) get a random temporary password shown exactly once and
  `mustChangePassword=true`. Until the password is changed the session can only use the staff-auth endpoints.
- The first OWNER is created with `node dist/src/staff-bootstrap.main.js --email … --name … --role OWNER`
  (works in the runtime image without npx). A second account with the same email is refused.
- No account may demote or disable the last ACTIVE OWNER (serialized with a PostgreSQL advisory lock), and nobody can
  disable themselves.

### 7. Internal endpoints accept env tokens OR staff sessions

`InternalAccessGuard` + `@InternalAccess(policy)` (`src/common/security/internal-access.ts`) is the single authorization
path for internal controllers:

- operations endpoints: `x-operations-token` or `x-staff-session` with `operations:read` (analytics → `analytics:read`,
  exports → `exports:read`);
- metrics endpoints: `x-metrics-token` or `x-staff-session` with `metrics:read`;
- support mutations: `x-support-token` (env credentials) or `x-staff-session` with the same scope name; the existing
  `SUPPORT_*_ENABLED` feature flags still apply.

Env tokens stay valid for automation and CI. When a staff session performs a support mutation the recorded support
actor is `staff:<uuid>`, and operational-risk assignment accepts active `staff:<uuid>` assignees.

### 8. Audit

Security-relevant actions write `audit_events` with `actorUserId = null`, `entityType = STAFF_ACCOUNT`,
`entityId = staffId` and a payload carrying `staffId`/`actorStaffId`: `STAFF_LOGIN_SUCCEEDED`, `STAFF_LOGIN_FAILED`
(keyed `emailHash`, never the email), `STAFF_LOGOUT`, `STAFF_CREATED`, `STAFF_UPDATED`, `STAFF_PASSWORD_CHANGED`,
`STAFF_PASSWORD_RESET`, `STAFF_MFA_ENABLED`, `STAFF_MFA_DISABLED`, `STAFF_SESSION_REVOKED`. Payloads never contain
passwords, TOTP secrets, raw tokens, emails or display names (also enforced by the audit payload privacy trigger).

## Consequences

- Each admin action is attributable to a person; access can be revoked per person instantly.
- `STAFF_AUTH_ENABLED` defaults to on in development and off elsewhere; staging/production must set it together with
  `STAFF_TOTP_ENCRYPTION_KEY`.
- The admin keeps Basic Auth only as an optional outer perimeter; the env tokens should move to server-only automation.
- Staff sessions are bearer secrets: the admin must keep them server-side (httpOnly cookie on the admin domain) and
  never expose them to client-side JavaScript or logs. The log privacy scanner flags `qls_` tokens.

## Rejected alternatives

- JWT access tokens for staff: cannot be revoked instantly without a server-side lookup, which we need anyway.
- Reusing end-user accounts with a role flag: mixes customer PII and staff privileges and complicates deletion.
- External IdP (OIDC) now: preferable at larger scale; the session/scope model here can later be fed by an IdP.
