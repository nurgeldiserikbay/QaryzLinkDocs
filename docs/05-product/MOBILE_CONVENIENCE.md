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

1. [x] aggregate outstanding overdue amount across active contracts;
2. [x] direct deep links from actionable contract cards to signing, funding confirmation or repayment sections;
3. [x] camera-first payment proof upload.

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
- [x] Front exposes explicit device opt-in/disable only when native capability + biometrics are reported available;
- [x] Login UI calls restore only through the native biometric bridge and only when a protected session is reported available;
- [x] logout/current-session revoke/logout-all/password-change web flows call a unified local + native protected-session cleanup boundary;
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


### Session cleanup rule

Any action that invalidates the current server session must also remove local session material.

Current Front behavior:

- normal logout calls the backend current-session revoke endpoint before local cleanup;
- current-session revoke from Settings clears browser and native protected material;
- logout-all clears browser and native protected material after the server revokes all sessions;
- password change clears browser and native protected material after the backend revokes active sessions;
- browser/PWA cleanup remains immediate even if the optional native bridge is unavailable.

The native host must independently guarantee protected-storage deletion on logout/revoke so a host-side failure cannot leave a reusable refresh token behind.


### Biometric UX gating

The Front now contains the user-facing biometric flow, but it is capability-gated:

- Settings shows biometric enable/disable only in native runtime and only when the host reports secure storage + biometrics available.
- Enabling stores the current server-issued session only through the native secure-session bridge.
- Login shows biometric unlock only when the host reports that a protected session already exists.
- Restore output is validated before it is copied into temporary browser session storage.
- A failed biometric restore falls back to normal password login.
- Web/PWA users never see these controls.

This does **not** mark native biometrics production-ready. Android/iOS host implementation and real-device acceptance are still required.


### Biometric restore validation

A restored native session is not trusted merely because the device biometric prompt succeeded.

Current Front behavior:

- the protected refresh token is sent to the normal backend `/auth/refresh` endpoint after native restore;
- backend session rotation produces a fresh access/refresh pair;
- the rotated pair replaces the protected native copy before entering the dashboard;
- if refresh fails because the session is revoked/expired/invalid, the protected native copy is cleared and biometric login is disabled until the user signs in normally again;
- stale access tokens from secure storage are never copied directly into the active browser session.

This keeps biometric unlock subordinate to backend session revocation and expiry.


### Automatic access-token renewal

The Front now treats the short-lived access token as renewable session state instead of forcing a password login every time it expires.

Current behavior:

- an authenticated API call that receives `401` may trigger one refresh-token rotation;
- concurrent callers share the same in-flight refresh instead of rotating the refresh token multiple times;
- after rotation, the original request is retried once with the new access token;
- a request that raced with an already-completed rotation retries with the current access token without starting another refresh;
- public/unauthenticated requests do not trigger this mechanism;
- the refresh endpoint itself is never recursively retried;
- if refresh is rejected, browser and native protected session material is cleared;
- when native biometric persistence was already enabled, the rotated token pair replaces the protected native copy;
- native protected persistence is never created automatically for a user who did not opt in.

This keeps the 15-minute access token lifetime usable without weakening refresh-token rotation or explicit logout/session revocation.


### Session renewal edge-case guarantees

Automatic session renewal is now covered for concurrency and mutation safety:

- concurrent authenticated `401` responses share one refresh-token rotation;
- a retried mutation preserves its HTTP method, request body and idempotency key;
- the retried request is attempted only once;
- a second `401` from that retry does not recurse into another refresh cycle;
- rejected refresh still clears local session material and surfaces the authentication failure.

These guards are important because refresh-token rotation is single-use and discovery/payment commands may carry idempotency semantics that must survive an access-token renewal.


### Action deep links

Dashboard contract cards now route directly to the relevant action section when the backend reports an action requirement:

- `SIGN_CONTRACT` → signing section;
- `CONFIRM_FUNDING` → funding confirmation section;
- `REPAYMENT_OVERDUE` → repayment section.

The target section uses scroll margin for the sticky/mobile header and a subtle `:target` outline so the user can immediately see why the dashboard sent them there. Contracts without a pending action still open at the normal contract overview.


### Overdue amount summary

The mobile dashboard now shows both the count of overdue payments and the aggregate outstanding overdue amount.

Rules:

- only next payments currently marked `OVERDUE` are included;
- outstanding amount is `totalMinor - paidMinor`;
- negative values are clamped to zero to avoid misleading totals if upstream data is temporarily inconsistent;
- calculation is covered by a dedicated unit test.

This gives the borrower a quicker sense of urgency without exposing any counterparty PII.
