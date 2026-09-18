# ADR-0012: Idempotent overdue status materialization

- Status: Accepted
- Date: 2026-09-18
- Owners: QaryzLink product and backend
- Related: ADR-0010, ADR-0011

## Context

A schedule item can become due or overdue without a user API request. The platform must expose the current obligation state while preserving confirmed payment history. The first implementation needs to be safe for retries and multiple application replicas.

## Decision

1. OverdueWorker uses the database clock and UTC calendar dates, not an application server clock.
2. It updates only unpaid items belonging to ACTIVE contracts with CONFIRMED funding.
3. A due item for today becomes DUE; an unpaid item before today becomes OVERDUE; a partial future item remains PARTIALLY_PAID.
4. PAID and CANCELLED items are never reopened.
5. The mutation is one idempotent SQL transaction. Re-running it produces no additional event and no duplicate ledger entry.
6. The worker is exposed as an injectable application service. A deployment scheduler or queue adapter invokes it; no in-process cron is enabled in the multi-replica API yet.
7. Notifications, penalty calculation, reversal and legal collection are separate policies and are not triggered by this worker.

~~~mermaid
flowchart TD
    T["Database UTC date"] --> Q["Unpaid due items"]
    Q --> A["ACTIVE + CONFIRMED guard"]
    A --> D["DUE today"]
    A --> O["OVERDUE before today"]
    Q --> P["PAID/CANCELLED excluded"]
~~~

## Consequences

- Retries are safe and status reads are consistent across replicas.
- Scheduler ownership remains explicit for Kubernetes, a queue, or a managed cron.
- Due status is materialized without inventing a penalty or legal conclusion.
- Operations must schedule the worker at least daily before a public pilot.
