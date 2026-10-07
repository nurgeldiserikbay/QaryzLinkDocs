# ADR-0029: Organization access uses individual users plus acting-party authorization

- Status: Accepted for architecture foundation
- Date: 2026-10-07
- Scope: future QaryzLink organization/company accounts

## Context

QaryzLink already has a `Party` abstraction and `PartyType.ORGANIZATION`, while current production-facing authorization is primarily personal-account based through `Party.ownerUserId`.

Organization support must not introduce shared company credentials or lose the identity of the human who performed a legally meaningful action.

## Decision

An organization never authenticates directly.

Each employee or representative uses an individual `User` account. Organization authority is granted through a future membership/representation record.

Every organization-scoped command must carry two separate identities:

- `actorUserId` — authenticated human;
- `actingPartyId` — personal or organization party represented by that human.

Authorization must validate the membership/representation and permission for the specific command before domain mutation.

## Initial role model

The first B2B implementation may expose coarse roles:

- `OWNER`;
- `ADMIN`;
- `FINANCE`;
- `LEGAL`;
- `VIEWER`.

Controllers and domain services must not depend directly on role names. Roles map to explicit permissions such as:

- `member:invite`;
- `member:suspend`;
- `loan:create`;
- `loan:approve`;
- `contract:view`;
- `contract:sign`;
- `payment:confirm`;
- `audit:view`.

## Audit rule

Audit records for organization actions must retain both the authenticated user and represented organization.

A record equivalent to “Organization X signed” without the human actor is insufficient.

Historical actor attribution survives membership suspension/removal.

## Invitation rule

Organization membership invitations use their own short-lived opaque one-time token scope.

The request-invite token design may be reused as a security pattern, but organization invite tokens must not share rows, namespaces or redemption semantics with private loan-request invitations.

## Signing authority

Organization membership alone does not imply signing authority.

A future organization contract-signing path must verify an explicit signing permission and, where required, separate legal-representative/authority evidence.

## Migration boundary

Current personal flows remain unchanged.

The organization rollout should introduce membership/permission infrastructure first, then organization switching/acting-party resolution, then legal-entity lending only after organization verification and legal acceptance.

Existing code must gradually stop assuming that every actionable `Party` has a non-null `ownerUserId`.

## Non-goals

This ADR does not implement:

- organization registration UI;
- BIN/БСН verification;
- employee invitations;
- organization contract signing;
- power-of-attorney verification;
- beneficial-owner checks;
- legal-entity lending.

## Consequences

QaryzLink can evolve from person-only authorization into multi-user company accounts without replacing the existing Party model or creating shared credentials.

The detailed target model and rollout are documented in [Organization accounts foundation](../docs/02-architecture/ORGANIZATION_ACCOUNTS.md).
