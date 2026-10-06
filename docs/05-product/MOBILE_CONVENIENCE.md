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
- contract-level reminder status showing whether payment, overdue, in-app and email delivery are enabled.

## Notification rules

Users control optional reminder delivery. Security-critical messages may remain mandatory and must be handled separately from marketing or convenience preferences.

Current real channels:

- `IN_APP`;
- `EMAIL`.

Push and SMS must not be exposed as working toggles until an actual delivery provider, subscription/consent lifecycle and unsubscribe flow exist.

## Next priority: push notifications

Required pieces:

1. Device / browser push subscription model tied to the authenticated user.
2. Explicit browser permission request initiated by user action.
3. Subscription registration and revocation API.
4. `PUSH` notification channel.
5. Provider adapter with retry and safe failure handling.
6. Device-level unsubscribe.
7. Settings toggle only when the current device supports push.
8. No notification payload may expose sensitive debt details on a locked screen by default.

Recommended default push copy should be privacy-safe, e.g. “QaryzLink-та жаңа маңызды хабарлама бар”, with details visible after opening the authenticated app.

## Next priority: reminder timing

Add user-controlled reminder timing, initially with safe presets:

- 7 days before;
- 3 days before;
- 1 day before;
- due day;
- overdue reminder.

Avoid unlimited user-defined schedules in the first release. Presets are easier to understand and prevent notification spam.

## Quiet hours

Add optional quiet hours using the party timezone.

Recommended defaults:

- disabled by default;
- suggested interval 22:00–08:00;
- due/overdue reminders are delayed until quiet hours end;
- security-critical notifications are not silently dropped.

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

The mobile dashboard should prioritize only the most actionable information:

1. next payment amount and date;
2. overdue amount if any;
3. action waiting for the user;
4. active contracts count;
5. recent notifications.

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
