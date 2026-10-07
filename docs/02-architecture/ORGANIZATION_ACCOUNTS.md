# Organization accounts foundation

Status: architecture-ready, product implementation deferred.

QaryzLink already models `PartyType.ORGANIZATION`. The next B2B step should therefore extend party authorization instead of creating a second account system.

## Core model

A person always authenticates with their own `User` account.

An organization is represented by a `Party` with `type = ORGANIZATION`.

Users gain authority to act for an organization through membership records:

```text
User
  ├─ Personal Party
  └─ OrganizationMembership
         └─ Organization Party
```

Recommended future model:

```text
OrganizationMembership
- id
- organizationPartyId
- userId
- role
- status
- invitedByUserId
- joinedAt
- suspendedAt
- createdAt
- updatedAt
```

Suggested initial roles:

- `OWNER`
- `ADMIN`
- `FINANCE`
- `LEGAL`
- `VIEWER`

Roles should map to explicit permissions rather than be checked ad hoc across controllers.

Examples:

- `member:invite`
- `member:suspend`
- `loan:create`
- `loan:approve`
- `contract:view`
- `contract:sign`
- `payment:confirm`
- `audit:view`

## Acting-party rule

Every business action must preserve both identities:

```text
actorUserId = the human who authenticated
actingPartyId = personal or organization party represented by that human
```

Audit records for organization actions must never record only “Company signed”. They must retain the human actor and represented organization.

## Membership lifecycle

Recommended flow:

1. organization owner/admin creates an invitation;
2. invitation uses a short-lived opaque one-time token;
3. employee logs in or registers with their own account;
4. employee accepts the invitation;
5. membership becomes ACTIVE;
6. suspension/removal immediately blocks future organization actions without deleting historical audit identity.

The existing private invite-link pattern can be reused conceptually, but organization invitation tokens must have their own scope and storage.

## Security constraints

- no shared organization passwords;
- no organization member may impersonate another member;
- permissions checked server-side on every organization-scoped command;
- signing permission must be distinct from ordinary contract access;
- OWNER transfer must require an explicit controlled workflow;
- membership deletion must not erase historical actor attribution;
- organization verification and legal representative checks remain separate from membership.

## Rollout

### Phase A — architecture only

- keep current personal account behavior unchanged;
- document acting-party semantics;
- reserve organization membership/permission concepts;
- ensure new code avoids assuming every `Party` has an `ownerUserId`.

### Phase B — organization access

- membership schema + invitation flow;
- organization switcher;
- role/permission authorization;
- organization audit trail.

### Phase C — legal-entity lending

- organization verification;
- representative authority;
- organization loan/request/contract flows;
- organization signing policy;
- legal/compliance acceptance.

Do not expose organization lending in production until Phase C legal and operational acceptance is complete.
