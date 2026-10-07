# Contract chat

Status: repository-side foundation implemented.

## Scope

The chat is bound to a single contract and is visible only to that contract's borrower and lender.

Current behavior:

- authenticated contract parties can read the latest 50 messages;
- messages are immutable after creation;
- message body is limited to 2000 characters;
- clients receive sender identity only as `BORROWER` or `LENDER`, not raw party identifiers;
- Front polls every 5 seconds for lightweight near-real-time updates while the tab is visible; hidden tabs skip network polling and refresh immediately when visible again;
- message sending is rate-limited to 30 messages per minute per authenticated user;
- the other party receives a privacy-safe in-app notification event with no message body in the payload;
- the notification respects the existing contract/in-app notification preferences;
- in-app chat notifications deep-link directly to the contract chat section from both the notification inbox and dashboard recent-notification cards;
- contract lists expose an unread chat count derived from unread chat notification rows;
- opening the chat marks only that contract's unread chat notifications as read, including still-pending in-app rows so a delayed scheduler dispatch cannot resurrect a stale unread badge; read sync is not repeated on every polling tick;
- dashboard contract cards show the unread count and, when no higher-priority financial action exists, open directly at the chat section;
- older history loads in bounded 50-message pages using a contract-scoped `beforeId` cursor without disabling lightweight polling, and sending a new message does not discard already-loaded older history;
- KZ/RU UI and session/rate-limit error states are included.

## Legal boundary

Chat text is communication, not contract mutation.

A message such as “let us change the interest rate” does not alter the signed contract. Any legal terms change must continue through the formal amendment/version/signing workflow.

The chat therefore must never:

- update `termsSnapshot` directly;
- modify a signed contract version;
- activate an amendment;
- confirm funding or payment merely from message text.

## Privacy boundary

- no public chat endpoint;
- non-parties receive the same inaccessible-contract boundary as other private contract reads;
- no email/phone/publicId is embedded in message responses;
- messages are contract-scoped and are not globally searchable.

## Future extensions

Not required for the first chat release:

- [x] cursor pagination for older messages;
- WebSocket/SSE transport instead of polling;
- evidence/document attachment references;
- system messages for contract lifecycle events;
- moderation/reporting tools;
- retention/legal-hold policy specific to chat.

Any attachment feature should reuse the existing evidence/storage security boundary rather than accepting arbitrary direct file uploads inside chat.
