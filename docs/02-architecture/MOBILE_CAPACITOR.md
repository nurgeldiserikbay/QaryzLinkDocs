# Mobile and Capacitor architecture

## Goal

QaryzLink uses one frontend codebase for three delivery modes:

- browser web application;
- installable PWA;
- Android/iOS application through Capacitor.

The user experience should stay consistent while platform-specific behavior is isolated behind a small runtime layer.

## Current approach

The browser/PWA frontend remains a Next.js application hosted over HTTPS. The current Capacitor configuration still contains a remote HTTPS `server.url`, but this is explicitly a preview/development bridge only.

A production Android/iOS store binary must not depend on that remote `server.url`. Store promotion is blocked until reviewed web assets are packaged into the native bundle, Capacitor dependencies are pinned in the lockfile, generated Android/iOS projects exist, the remote server override is removed, and `pnpm native:preflight` passes.

Native application identity:

- app name: QaryzLink
- application id: `kz.qaryzlink.app`
- current remote preview origin: `https://qaryz-link-front.vercel.app`;
- browser/PWA production requires the permanent custom production origin;
- Android/iOS store release requires bundled reviewed web assets rather than a runtime remote `server.url`.

## Runtime modes

The frontend detects three runtime modes:

```text
web     -> ordinary browser tab
pwa     -> installed standalone web application
native  -> Capacitor Android/iOS shell
```

Capacitor native mode has priority over standalone/PWA detection.

The root document receives runtime hooks:

- `html.is-native`
- `html.is-pwa`
- `data-runtime="web|pwa|native"`

These hooks are used only for presentation/platform behavior. Business rules must not depend on CSS runtime classes.

## PWA versus native behavior

### Web/PWA

- service worker may register;
- install prompt may be shown;
- static application assets may be cached;
- private financial pages and API responses are not intentionally cached.

### Capacitor native

- PWA install controls are hidden;
- the service worker is not registered by the frontend;
- safe-area insets are respected;
- mobile bottom navigation remains available;
- native overscroll behavior is constrained;
- no private financial data is placed in the bundled fallback shell.

## Offline boundary

QaryzLink is not an offline financial ledger.

The bundled native fallback page contains only generic application branding and connectivity guidance. It must never contain:

- contract data;
- payment data;
- authentication tokens;
- personal identity data;
- cached API responses.

If a future requirement introduces encrypted offline access, it requires a separate threat model and architecture decision.

## Capacitor shell configuration

The frontend repository contains:

```text
capacitor.config.json
native-shell/index.html
scripts/mobile-check.mjs
src/lib/platform/runtime.ts
src/components/runtime-class.tsx
```

The CI/check flow validates the mobile preparation configuration with:

```bash
pnpm mobile:check
```

Store readiness additionally requires:

```bash
pnpm native:preflight
```

For remote native preview/testing only, configure an HTTPS origin explicitly:

```bash
NATIVE_APP_URL=https://app.qaryzlink.kz pnpm mobile:configure
pnpm mobile:check
```

The configurator accepts only a clean HTTPS origin and keeps cleartext traffic disabled. This command does not make the native binary store-ready. Strict release preflight intentionally fails while `capacitor.server.url` remains configured.

## Security requirements

1. Browser/PWA production URLs must use HTTPS.
2. Remote Capacitor `server.url` is preview-only and must be absent from an accepted store release.
3. Cleartext traffic stays disabled.
4. PWA service-worker caching must not become a substitute for native secure storage.
5. Access/refresh tokens must never be copied into static native assets.
6. Native plugins must be introduced individually and reviewed for required permissions.
7. Camera, biometrics, push notifications, file access and secure storage require explicit feature-level decisions.
8. A custom production domain should replace the temporary Vercel domain for browser/PWA production.

## Native package installation stage

Capacitor packages are deliberately not committed until the repository can update `package.json` and `pnpm-lock.yaml` together.

When native builds are enabled, install matching versions of:

```text
@capacitor/core
@capacitor/cli
@capacitor/android
@capacitor/ios
```

Then initialize/sync the platform projects and commit `android/` and `ios/` only after the build environment and signing strategy are decided. `native:preflight` intentionally fails while either generated platform is missing.

## Planned sequence

1. Keep web/PWA CI green and validate installability with 192/512 PNG plus maskable icons.
2. Assign the final production frontend/API domains.
3. Add Capacitor dependencies with lockfile update.
4. Create a reviewed bundled web-asset build path for the native shell and remove the runtime `server.url` override.
5. Generate Android project and verify the bundled application starts without a remote web-origin dependency.
6. Validate Android deep links, keyboard, safe areas and back navigation.
7. Implement the existing secure-session bridge in Android Keystore / iOS Keychain and complete real-device biometric acceptance.
8. Add push notifications only after notification privacy rules are fixed.
9. Generate and validate iOS project using the same bundled asset contract.
10. Add store assets, privacy declarations and signing configuration.
11. Run strict native preflight and end-to-end acceptance against production/staging backend APIs.

## Release principle

Capacitor is a delivery shell, not a separate product implementation. Business rules, validation, privacy constraints and lifecycle behavior remain in the shared QaryzLink frontend/backend architecture.


## Native navigation bridge

The shared frontend now exposes a dependency-free bridge contract so Android/iOS integration can be added without coupling product code directly to Capacitor plugins.

Native shell -> frontend events:

```text
qaryzlink:native-url
qaryzlink:native-back
```

For `qaryzlink:native-url`, the event detail contains:

```json
{ "url": "https://<production-origin>/dashboard/contracts/<id>" }
```

The frontend accepts only HTTPS URLs from the current QaryzLink origin and rejects unknown application paths.

For `qaryzlink:native-back`:

- nested dashboard routes fall back to `/dashboard`;
- dashboard root/public routes fall back to `/`;
- if the current route already equals its fallback, the frontend emits `qaryzlink:native-exit-request` for the native shell to decide whether to exit/minimize.

This keeps native navigation policy testable without requiring Capacitor packages in the web build.


## Authentication storage boundary

The current browser, PWA and prepared native-shell runtimes use ephemeral `sessionStorage` for the client session.

This is intentional:

- credentials are not copied to `localStorage`;
- malformed session payloads are rejected and removed;
- the UI tolerates unavailable browser storage without crashing;
- app/process termination may require the user to sign in again.

Persistent native login must not be implemented by moving tokens into ordinary WebView storage.

The shared Front now already contains a native secure-session bridge contract plus capability-gated biometric UX, backend refresh revalidation, single-flight rotation and unified cleanup semantics. This is only the web/native boundary. Real persistence still requires an Android Keystore / iOS Keychain host implementation through an audited native layer, plus device-loss and real-device release acceptance.
