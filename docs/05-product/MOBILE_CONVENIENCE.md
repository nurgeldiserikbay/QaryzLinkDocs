# Mobile convenience and reminders

QaryzLink should be comfortable to use as a mobile-first web/PWA experience and should evolve toward a native-like experience without weakening privacy or consent controls.

## Implemented now

- responsive web/PWA shell;
- payment schedule on contract page;
- next payment summary;
- payment schedule totals: total / paid / outstanding;
- `.ics` repayment calendar export;
- in-app notification center;
- email notification channel;
- automatic `REPAYMENT_DUE` reminders;
- automatic `REPAYMENT_OVERDUE` reminders;
- per-user notification preferences;
- separate payment / overdue / contract / dispute / marketplace toggles;
- master automatic payment reminder toggle in Settings;
- contract-level reminder status showing whether payment, overdue, in-app and email delivery are enabled;
- reminder timing presets for 7 days / 3 days / 1 day / due day;
- optional quiet hours with party-timezone delivery deferral;
- push subscription database foundation;
- authenticated push subscription register/list/revoke API;
- current-device push unsubscribe;
- PII-protected push endpoint/key storage;
- VAPID Web Push delivery adapter;
- expired push subscription retirement;
- privacy-safe push payloads for repayment due / overdue reminders;
- explicit browser permission and per-device push controls in Settings;
- PWA service worker push/click handling;
- mobile dashboard active-contract list with next payment summary;
- dashboard action summary with active-contract count, overdue-payment count and nearest payment;
- relationship-scoped action-required summary for signing, funding confirmation and overdue borrower repayment;
- recent in-app notifications preview on the dashboard with a link to the full inbox;
- camera-first funding and repayment proof picker on supported mobile browsers, while retaining PDF/file upload.

## Notification rules

Users control optional reminder delivery. Security-critical messages may remain mandatory and must be handled separately from marketing or convenience preferences.

Current channels:

- `IN_APP`;
- `EMAIL`;
- `PUSH` when the environment has Web Push enabled and the user explicitly opts in on a supported device.

Push remains default-off at deployment level and default-off per user. Both conditions must be enabled before a push event can enter the outbox.

Current push scope is deliberately narrow:

- `REPAYMENT_DUE`;
- `REPAYMENT_OVERDUE`.

Marketplace, dispute and other general events are not sent by push yet.

Web Push uses VAPID. The private key remains backend-only; the matching public key may be exposed to the Front as `NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY`.

The lock-screen payload is privacy-safe. It does not contain debt amount, due date or aggregate identifiers. Details are shown only after opening the authenticated app.

SMS remains unavailable until a real provider, verified-phone consent flow and unsubscribe controls exist.

## Reminder timing

Implemented presets:

- 7 days before;
- 3 days before;
- 1 day before;
- due day;
- overdue reminder.

Each preset can be controlled independently, while a master payment-reminder control can enable or disable the payment reminder set. Unlimited custom schedules remain intentionally excluded to avoid confusing or spam-prone configurations.

## Quiet hours

Implemented using the party timezone.

Current behavior:

- disabled by default;
- default interval 22:00–08:00 when enabled;
- queued notifications are delayed until quiet hours end;
- reminder delivery is not dropped;
- security-critical notification policy remains separate from convenience preferences.

## SMS

SMS should be optional and limited because it has cost and privacy implications.

Suitable events:

- security / recovery events;
- selected due-date reminder;
- selected overdue reminder.

Requirements before enabling:

- verified phone number;
- explicit consent;
- provider integration;
- delivery status and retry policy;
- unsubscribe / channel disable;
- cost controls and rate limits;
- privacy-safe message body.

## Mobile dashboard

The mobile dashboard now surfaces active contracts and the next unpaid payment directly on the first screen.

It also includes an actionable summary with:

1. active contract count;
2. overdue payment count;
3. nearest payment amount/date;
4. overdue marker when the nearest payment is already late.

The backend also derives whether the authenticated participant currently needs to sign the agreement, confirm funding, or address an overdue borrower payment. This is shown without exposing counterparty PII.

Recent in-app notifications are also previewed on the dashboard while the full notification inbox remains a separate page.

Further dashboard improvements should prioritize:

1. richer overdue amount aggregation when needed;
2. direct deep links to the exact pending action where useful;
3. camera-first payment proof upload.

Secondary analytics should stay below the fold.

## Payment proof on phone

Implemented now:

- separate camera-first capture action for funding evidence;
- separate camera-first capture action for repayment evidence;
- existing gallery/file/PDF picker remains available;
- existing evidence validation, hashing and secure upload flow is reused;
- upload busy state remains visible.

Still useful as a later refinement:

- image preview/confirmation before upload;
- richer upload progress;
- explicit retry UI after interrupted object upload.

## QR and deep links

Useful later:

- [x] borrower creates a short-lived one-time QR/deep link for the private request;
- [x] lender scans/opens the link and redeems it while authenticated;
- [x] QR contains only a random opaque token — no amount, email, phone or publicId;
- [x] token is stored server-side only as SHA-256, expires after 15 minutes and is single-use;
- [x] block checks and request state are revalidated at redeem time;
- [x] preserve the invite URL through login with a validated internal return path.

## Biometric login

Native biometric/session foundation is now defined without pretending browser JavaScript can provide device-grade secure storage by itself.

Implemented web/native boundary:

- [x] native-only secure-session bridge contract with explicit capability/store/restore/clear actions;
- [x] bounded timeout and fail-closed behavior when the native host is unavailable or returns malformed data;
- [x] strict restored-session shape validation before any session is accepted;
- [x] no automatic persistent token storage from browser/PWA flows;
- [x] private `/invite/...` routes allowed through the same-origin native deep-link allowlist;
- [x] `mobile:check` verifies that the bridge contract remains present.

Still required in the real Android/iOS host before biometric unlock can be exposed as working UI:

- [ ] Android Keystore / iOS Keychain-backed encrypted session storage;
- [ ] platform biometric prompt with device enrollment/change handling;
- [ ] explicit user opt-in and device-level disable/clear;
- [ ] restore only after successful biometric/device authentication;
- [ ] logout/session-revoke integration must clear local protected material;
- [ ] native threat review and release acceptance on real devices.

Biometrics unlock a locally protected server-issued session. They never replace backend authorization, token expiry, session revocation or account security rules.

## Calendar integration

Current `.ics` export is sufficient for the first release. Later integrations may add direct Google Calendar / Apple Calendar flows after consent and provider review.

## Product principle

The mobile product should behave as a private obligation assistant:

- show what is due next;
- remind at the right time;
- let the user control optional channels;
- make proof/confirmation easy;
- avoid exposing sensitive debt information in public notifications;
- keep all risk/history access relationship-scoped and private.


### Native platform bootstrap

The repository still does not contain generated `android/` or `ios/` projects. This is intentional until the native toolchain is added reproducibly.

Reviewed platform baseline: Capacitor **8.5.2** for `@capacitor/core`, `@capacitor/cli`, `@capacitor/android` and `@capacitor/ios`.

Before generating native projects:

1. install all four packages at exactly 8.5.2;
2. regenerate `pnpm-lock.yaml`;
3. commit `package.json` and `pnpm-lock.yaml` together;
4. run `node scripts/native-bootstrap.mjs`;
5. generate `android/` and `ios/` with the local Capacitor CLI;
6. only then implement the secure-session host adapter against Android Keystore / iOS Keychain.

The bootstrap guard deliberately fails instead of silently downloading a different CLI version or allowing a stale frozen lockfile.
