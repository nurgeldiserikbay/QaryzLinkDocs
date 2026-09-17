# ADR-0001: Multi-repository architecture

- Status: Accepted
- Date: 2026-09-17

## Context

Front, Back, Admin және ортақ Docs әртүрлі deployment/security lifecycle-ға ие.

## Decision

Төрт repository қолданылады:

- QaryzLinkFront;
- QaryzLinkBack;
- QaryzLinkAdmin;
- QaryzLinkDocs.

Backend OpenAPI contract source of truth болады. Front/Admin client генерациялайды.

## Consequences

Артықшылықтар:

- тәуелсіз deployment;
- admin access бөлек;
- агенттердің жұмыс аймағы анық;
- docs ownership анық.

Кемшіліктер:

- coordinated release қажет;
- cross-repo change tracking;
- contract drift тәуекелі.

Mitigation: OpenAPI generation, release manifest және cross-repo E2E.
