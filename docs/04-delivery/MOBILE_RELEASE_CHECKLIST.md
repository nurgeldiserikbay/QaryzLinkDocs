# Mobile release checklist

This checklist covers the Android/iOS delivery shell for QaryzLink.

## Repository-side foundation already completed

- [x] Native runtime detection is isolated from business rules.
- [x] Same-origin HTTPS native deep-link allowlist exists.
- [x] Native Back/exit bridge contract exists.
- [x] Service worker registration is disabled in native runtime.
- [x] Generic native fallback shell contains no private financial payload.
- [x] Browser/PWA session material is not moved to localStorage.
- [x] Capability-gated native secure-session bridge defines store/restore/clear.
- [x] Biometric restore revalidates through backend refresh-token rotation.
- [x] Logout, current-session revoke, logout-all, password change and account-deletion request use unified local/native cleanup.
- [x] Automatic access-token renewal is single-flight and bounded to one retry.
- [x] `mobile:check` validates the prepared native bridge/config contract.

These checks do **not** mean Android/iOS production readiness. Generated native projects, OS-protected storage implementation, signing, verified links and real-device acceptance remain pending below.

## Before generating native projects

- [ ] Web/PWA production build is green.
- [ ] Permanent HTTPS frontend domain is assigned.
- [ ] Backend production HTTPS origin is assigned.
- [ ] `NATIVE_APP_URL` points to the permanent frontend origin.
- [ ] `pnpm mobile:configure` succeeds.
- [ ] `pnpm mobile:check` succeeds.
- [ ] Capacitor core/cli/android/ios versions are pinned to the same stable release.
- [ ] `package.json` and `pnpm-lock.yaml` are updated together.

## Android

- [ ] Generate the Android project with Capacitor.
- [ ] Confirm application id: `kz.qaryzlink.app`.
- [ ] Keep cleartext traffic disabled.
- [ ] Validate edge-to-edge/safe-area behavior.
- [ ] Validate Android hardware Back behavior.
- [ ] Validate keyboard resize on login, registration and money forms.
- [ ] Validate file/document download behavior.
- [ ] Validate external links open outside the financial workflow where appropriate.
- [ ] Create a release keystore outside the repository.
- [ ] Store signing credentials only in the release/CI secret store.
- [ ] Record SHA-256 signing certificate fingerprints.
- [ ] Configure Android App Links only after the final production domain is known.
- [ ] Publish `.well-known/assetlinks.json` using the final package id and signing fingerprint.
- [ ] Test app links from email verification/password reset flows.
- [ ] Build signed AAB and test through an internal Play track.

## iOS

- [ ] Generate the iOS project with Capacitor.
- [ ] Confirm bundle id matches the approved Apple identifier.
- [ ] Validate safe areas on notched and Dynamic Island devices.
- [ ] Validate keyboard behavior on authentication and amount forms.
- [ ] Configure Associated Domains only after the final production domain is known.
- [ ] Publish `.well-known/apple-app-site-association`.
- [ ] Test universal links from email verification/password reset flows.
- [ ] Keep provisioning profiles/certificates outside the repository.
- [ ] Validate App Transport Security remains HTTPS-only.
- [ ] Test archive through TestFlight before App Store submission.

## Authentication and privacy

- [ ] Do not move tokens to localStorage for native persistence.
- [ ] Decide whether ephemeral login is acceptable for the first native release.
- [ ] If persistent login is required, select and audit a Keychain/Keystore-backed secure storage plugin.
- [ ] Confirm logout invalidates local session state.
- [ ] Confirm server-side refresh/session revocation rules for lost devices.
- [ ] Confirm no contract/payment/identity payload is bundled in native static assets.
- [ ] Confirm service worker is not registered inside Capacitor runtime.

## Deep links

Supported frontend route families currently include:

```text
/
/login
/register
/forgot-password
/reset-password
/verify-email
/dashboard/**
```

The frontend native bridge rejects non-HTTPS links, foreign origins and unsupported route families.

Do not enable OS-level verified links until the final production domain and signing identities are available.

## Store privacy and permissions

The initial native shell should request no device permission that is not required by an active feature.

Before adding any native plugin, document:

1. why the permission/API is needed;
2. what user data it accesses;
3. whether data leaves the device;
4. retention/deletion behavior;
5. corresponding Google Play Data Safety / Apple Privacy answers.

Typical future features requiring separate review:

- push notifications;
- biometrics;
- camera/document upload;
- photo/file picker;
- contacts;
- device identifiers.

## Release acceptance

- [ ] Login/register/verification works.
- [ ] Borrower request lifecycle works.
- [ ] Lender proposal lifecycle works.
- [ ] Contract signing/funding/payment flows work.
- [ ] Marketplace and notifications render correctly.
- [ ] Logout and session expiry work.
- [ ] Network loss shows a generic safe fallback without private cached data.
- [ ] App resumes after background/foreground transition.
- [ ] Deep links route to the intended authenticated/public screen.
- [ ] No development labels, debug controls or internal phase names are visible.
- [ ] Production API/frontend origins are confirmed.
- [ ] Crash-free smoke test completed on at least one current and one older supported OS version.
