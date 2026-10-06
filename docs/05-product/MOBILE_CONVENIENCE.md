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
- PII-protected push endpoint/key storage;
- PWA service worker push/click handling;
- mobile dashboard active-contract list with next payment summary.

## Notification rules

Users control optional reminder delivery. Security-critical messages may remain mandatory and must be handled separately from marketing or convenience preferences.

Current real channels:

- `IN_APP`;
- `EMAIL`.

Push and SMS must not be exposed as working toggles until an actual delivery provider, subscription/consent lifecycle and unsubscribe flow exist.

## Next priority: push delivery

Completed foundation:

1. device/browser push subscription model tied to the authenticated party;
2. authenticated subscription registration/list/revocation API;
3. subscription secrets stored under the existing PII protection mode;
4. PWA service worker can display privacy-safe push messages and open same-origin routes.

Remaining before push can be advertised as enabled:

1. explicit browser permission/subscription UI initiated by user action;
2. `PUSH` notification channel in the outbox policy;
3. provider adapter with retry and safe failure handling;
4. VAPID/provider runtime configuration;
5. device-level unsubscribe from Settings;
6. delivery metrics and invalid-subscription retirement;
7. no notification payload may expose sensitive debt details on a locked screen by default.

Recommended default push copy should be privacy-safe, e.g. “QaryzLink-та жаңа маңызды хабарлама бар”, with details visible after opening the authenticated app.

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

Further dashboard improvements should prioritize:

1. overdue amount/state with stronger visual priority;
2. action waiting for the user;
3. active contracts count summary;
4. recent notifications.

Secondary analytics should stay below the fold.

## Payment proof on phone

High-priority mobile flow:

- choose camera or file;
- capture receipt / transfer confirmation;
- preview before upload;
- clear upload progress;
- lender confirmation state;
- safe retry after network interruption.

## QR and deep links

Useful later:

- lender shows QR;
- borrower scans QR;
- app opens a private request/invite flow;
- no private profile information is exposed by the QR itself.

## Biometric login

For Capacitor/native builds, add Face ID / fingerprint using platform secure storage for session material. Biometrics should unlock a locally protected session and must not replace server-side authorization.

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
