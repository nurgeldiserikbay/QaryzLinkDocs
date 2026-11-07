# ADR-0030: Tamper-evident contract event chain with signed receipts and external anchors

- Status: Accepted for implementation
- Date: 2026-10-18
- Owners: QaryzLink backend, security and product
- Scope: every contract lifecycle fact (signing, funding, payments, overdue, amendments, closure, forgiveness)
- Related: ADR-0011, ADR-0013, ADR-0014, ADR-0029

## Context

QaryzLink records loans between private people, most often relatives. In a dispute the only thing that matters is what really happened and when. Neither party, nor support staff, nor the platform operator / DBA may be able to silently change that history. Each party must be able to prove the facts on their own, even offline and even if the platform is gone.

Mutable tables (`payments`, `schedule_items`, …) cannot give that guarantee: whoever controls the database can rewrite them consistently. We need history that is **tamper-evident**: any change after the fact is detectable by people who do not trust the operator.

## Decision

### 1. Per-contract hash chain (`contract_events`)

Every business fact is appended in the same transaction as the state change (`appendContractEvent`, `src/modules/integrity/infrastructure/contract-event-log.ts`):

- `payloadHash = sha256hex(canonicalJson(payload))`;
- `eventHash = sha256hex(canonicalJson({ v:1, contractId, seq, type, payloadHash, prevHash, occurredAt, actorUserId, actorPartyId }))`;
- event 1 has `prevHash = "0"×64`; every later event has `prevHash` = previous `eventHash`; `seq` is gap-free.

`canonicalJson` is the evidence-package canonical form: object keys sorted by UTF-16 code units, no whitespace, `JSON.stringify` for primitives. `bigint` and `Date` are converted to decimal strings / ISO-8601 before hashing.

Database triggers (migration `20261018140000_contract_event_chain`):

- `contract_events` rejects `UPDATE`, `DELETE`, `TRUNCATE`;
- `BEFORE INSERT` re-checks `seq = last + 1` and `prevHash = last eventHash`;
- appends are serialized by the contract row lock.

### 2. Signed receipts (`contract_event_receipts`)

A worker (outbox pattern, lifecycle code never waits for it) finds events without a receipt (`NOT EXISTS … FOR UPDATE OF e SKIP LOCKED`, batch `INTEGRITY_RECEIPT_BATCH_SIZE`) and signs with the platform Ed25519 key:

```
statement = canonicalJson({ v:1, kind:'QARYZLINK_CONTRACT_EVENT_RECEIPT', contractId, seq, type, eventHash, occurredAt })
signature = Ed25519(statement as UTF-8)    -- base64, 88 chars
```

- Key: `INTEGRITY_SIGNING_PRIVATE_KEY` (PKCS8 PEM or base64 DER) + `INTEGRITY_SIGNING_KEY_ID`. In development/test without a key an ephemeral key is generated with a warning; staging/production fail validation if receipts/anchors are enabled without a key.
- We did not reuse the evidence-package remote signer: its registry stores only fingerprints (no public keys), it is disabled by default and it is scoped to evidence archives. `IntegritySigner` is an abstract provider, so an HSM/remote implementation can be plugged in later.
- Every public key that ever signed is stored in the append-only `integrity_signing_keys` table (key id reuse with another key is refused) and published without auth at `GET /v1/integrity/keys`.
- `contract_event_receipts`, `integrity_signing_keys` are append-only (UPDATE/DELETE/TRUNCATE triggers); a receipt insert requires a registered key id.

After signing, **both parties** are notified through the existing notification outbox (event `CONTRACT_EVENT_RECEIPT`, aggregate `CONTRACT`, organization parties fan out to members as usual):

- in-app for every event; e-mail additionally for `CONTRACT_SIGNED`, `FUNDING_CONFIRMED`, `PAYMENT_CONFIRMED`, `PAYMENT_REVERSED`, `CONTRACT_COMPLETED`, `DEBT_FORGIVEN`, `ITEM_OVERDUE`;
- payload `{ contractId, seq, chainEventType, receiptCode, path, link? }`, where `receiptCode` = first 12 hex chars of `eventHash`; it passes the existing privacy checks (no PII);
- the in-app inbox exposes `receipt: { seq, receiptCode, chainEventType }` for these items.

The point: the parties hold copies of the chain head **outside** the platform (their mailbox, screenshots). 48 bits of the hash are enough for a human to detect a rewrite; the full hash is in the export.

### 3. External anchors (`chain_anchors`, `chain_anchor_leaves`)

When `INTEGRITY_ANCHOR_ENABLED=true`, a worker runs every `INTEGRITY_ANCHOR_INTERVAL_HOURS` (default 24; advisory lock + "last anchor older than interval" check, so replicas/cron never double-anchor):

- leaves: head `{ contractId, seq, eventHash }` of every contract whose head changed since its last anchor, `leaf = sha256hex(canonicalJson({ contractId, seq, eventHash }))`, ordered by `contractId` ascending (string order);
- node = `sha256(0x01 ‖ left ‖ right)` over raw 32-byte digests; an odd last node is promoted unchanged; a single leaf is its own root;
- the root is timestamped by an RFC 3161 TSA (`INTEGRITY_TSA_URL`, default `https://freetsa.org/tsr`): we build the DER `TimeStampReq` ourselves (sha256 imprint of the root, random nonce, `certReq=true`), check the response status, that the token embeds our exact imprint and nonce, and store the DER token;
- every anchor is also signed by the platform key: `canonicalJson({ v:1, kind:'QARYZLINK_CHAIN_ANCHOR', anchorId, merkleRoot, leafCount, anchoredAt })`;
- if the TSA fails, the anchor is stored as `method=PLATFORM_ED25519`, `status=PLATFORM_SIGNED` (weaker fallback);
- per-contract inclusion rows (`chain_anchor_leaves`) allow Merkle proofs in exports. Both tables are append-only.

The server does **not** verify the TSA CMS signature/certificate chain (marked "needs verification" in code). It is verified offline: `openssl ts -verify -token_in -in token.der -digest <merkleRoot> -sha256 -CAfile cacert.pem -untrusted tsa.crt` (checked against freetsa.org: `Verification: OK`).

Operations: in-process scheduler (`INTEGRITY_SCHEDULER_ENABLED`, default on only in development) or one-shot `pnpm integrity:run [--force-anchor]` / `POST /v1/internal/maintenance/integrity` with `x-scheduler-token` (same pattern as notifications, ADR-0024).

### 4. API (party-only)

Access follows evidence-package reads: verified KZ personal party, or ACTIVE KZ organization membership with `OWNER|ADMIN|OPERATOR|AUDITOR`; the acting party must be borrower or lender; otherwise 404.

- `GET /v1/contracts/:contractId/events` and `GET /v1/organizations/:organizationId/contracts/:contractId/events` → `{ contractId, valid, headHash, length, failure, events[{ seq, type, payload, payloadHash, prevHash, eventHash, occurredAt, actorRole, receipt }], anchors[{ anchorId, anchoredAt, merkleRoot, method, status, seq }] }`; `valid` is recomputed server-side with `verifyContractEventChain`.
- `GET …/integrity-export` → attachment `qaryzlink-integrity-export-v1` JSON with full events (incl. actor ids), receipts, the public keys used, anchors with leaf + Merkle proof + TSA token, and verification instructions. Each export is audited (`CONTRACT_INTEGRITY_EXPORTED`).
- `GET /v1/integrity/keys` (public) → current and historic public keys.

### 5. Offline verifiers

- `scripts/verify-integrity-export.mjs` — zero-dependency Node (`node:crypto`): chain, every receipt signature, Merkle proofs, anchor signatures, TSA token coverage; `--keys` pins keys saved earlier from `/v1/integrity/keys`; `--expect seq:code` checks receipt codes from notifications. Russian summary; exit 0/1/2.
- `scripts/integrity-verifier-browser.js` — the same algorithm as an ES module on WebCrypto (`verifyIntegrityExport(json): Promise<Report>`) for a static verification page.
- Both re-implement `canonicalJson`, chain hashing, statements and Merkle rules; a vitest spec builds an export through `IntegrityReadService` and requires both verifiers to return identical reports, and tampered copies to fail.

## Threat model

| Actor / attack | Result |
| --- | --- |
| Other party edits/deletes a payment through the app | Impossible: the fact is an appended event; corrections are new events (e.g. `PAYMENT_REVERSED`). |
| Support / DBA runs `UPDATE`/`DELETE` on `contract_events` | Rejected by triggers. |
| DBA disables triggers and rewrites a row | Chain breaks (`valid=false`); receipts and anchors no longer match. |
| Operator rewrites the whole chain consistently and re-signs with a new key | Detected by receipt codes users already received (e-mail), by pinned keys, and by earlier anchors whose TSA token proves the old head existed at time T. |
| Operator re-signs with the **same** key | Old receipts still verify for the original hashes, and the party's saved codes / exports contradict the new history. |
| Platform disappears | Exports verify offline; TSA tokens verify with openssl. |

## Residual risks

- **Refusal to record**: the operator can stop writing events or block a party (censorship). Mitigation: receipts arrive asynchronously, so a missing receipt for an action the user performed is itself a signal; parties should export regularly.
- **Dropping the database entirely**: history disappears from the platform. Mitigation: receipts in the users' mailboxes, exports kept by the parties, TSA anchors.
- **Before receipt/anchor**: an event can be altered between append and the first receipt/anchor (seconds for receipts, up to the anchor interval). The DB trigger is the only protection in that window.
- **Key compromise**: a stolen platform key lets an attacker forge receipts; anchors with an independent TSA and user-held codes remain. Keys must be rotated with a new `INTEGRITY_SIGNING_KEY_ID`; there is no revocation list yet.
- **Notification preferences**: users who disable contract notifications or e-mail do not receive receipt copies.
- **Receipt code length**: 48 bits are a human-checkable fingerprint, not a full cryptographic commitment; the full `eventHash` is in the export.
- **TSA trust**: the server only checks token structure; legal weight depends on the chosen TSA (freetsa.org is a free, non-qualified service — use an accredited TSA for production).
- **SELECT … FOR UPDATE** on `contract_events` requires the UPDATE privilege for the application role; the append-only trigger, not privileges, is what prevents modification.

## Alternatives

- Public blockchain anchoring — rejected for now (cost, operational complexity, legal ambiguity in KZ); can be added as another `ChainTimestampProvider`.
- Signing inside the lifecycle transaction — rejected: lifecycle would depend on the signer's availability.
- Reusing the evidence remote signer — rejected for now (see Decision §2).

## Consequences

- New tables: `contract_event_receipts`, `integrity_signing_keys`, `chain_anchors`, `chain_anchor_leaves` (migration `20261018143000_integrity_receipts_anchors`).
- New notification event `CONTRACT_EVENT_RECEIPT` (in-app + e-mail for major events).
- New env vars: `INTEGRITY_RECEIPTS_ENABLED`, `INTEGRITY_SCHEDULER_ENABLED`, `INTEGRITY_SIGNING_PRIVATE_KEY`, `INTEGRITY_SIGNING_KEY_ID`, `INTEGRITY_RECEIPT_BATCH_SIZE`, `INTEGRITY_RECEIPT_INTERVAL_SECONDS`, `INTEGRITY_PUBLIC_APP_URL`, `INTEGRITY_ANCHOR_ENABLED`, `INTEGRITY_ANCHOR_INTERVAL_HOURS`, `INTEGRITY_ANCHOR_MAX_LEAVES`, `INTEGRITY_TSA_URL`, `INTEGRITY_TSA_TIMEOUT_MS`.
- Any change to canonicalization or hashing requires a new `chainVersion` and synchronized updates to both verifiers.
