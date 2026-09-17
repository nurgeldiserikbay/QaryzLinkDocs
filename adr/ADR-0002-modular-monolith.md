# ADR-0002: Modular monolith backend

- Status: Accepted
- Date: 2026-09-17

## Context

Domain күрделі, бірақ MVP кезеңінде microservice network complexity қажет емес.

## Decision

NestJS modular monolith:

- bounded context module-дері;
- бір PostgreSQL cluster;
- schema/table ownership;
- module public services/events;
- outbox және workers;
- external provider ports/adapters.

## Consequences

Жылдам transaction және deployment. Module boundary тестпен және dependency rules-пен қорғалады. Notification, evidence, verification сияқты модульдер нақты қажеттілік туған кезде бөлінеді.
