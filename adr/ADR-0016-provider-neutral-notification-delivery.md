# ADR-0016: Provider-neutral notification delivery port

- Status: Accepted
- Date: 2026-09-19
- Owners: QaryzLink product/backend

## Context

The outbox worker can claim and retry events, but provider-specific code must not leak into payment or outbox state logic. SMTP, push and SMS providers have different credentials, limits and legal/operational requirements.

## Decision

1. Define NotificationDeliveryPort as the only provider contract used by the dispatch service.
2. Dispatch a claimed event through the port, then mark SENT only after the port resolves successfully.
3. If the port rejects, delegate to the outbox worker's retry/FAILED transition.
4. Register an UnavailableNotificationAdapter by default. It fails closed until an explicitly configured provider is reviewed and enabled.
5. Keep the claim payload metadata-only; provider adapters cannot infer or receive payment credentials or document contents from this boundary.
6. Provider configuration, secrets, templates and consent checks remain separate adapters and deployment concerns.

## Alternatives

- Embed SMTP calls in the outbox worker: rejected because infrastructure and retry state become coupled.
- Mark SENT without a provider: rejected because it would lose delivery intent.
- Enable a generic provider automatically: rejected because production secrets, templates and legal notices require review.

## Consequences

- Adapter tests can run without network access or external credentials.
- A future SMTP or push implementation can be swapped through module configuration.
- The current default intentionally retries and eventually marks events FAILED; no messages leave the system.
