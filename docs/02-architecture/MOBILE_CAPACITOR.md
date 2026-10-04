# Mobile and Capacitor architecture

## Goal

QaryzLink uses one frontend codebase for three delivery modes:

- browser web application;
- installable PWA;
- Android/iOS application through Capacitor.

The user experience should stay consistent while platform-specific behavior is isolated behind a small runtime layer.

## Current approach

The frontend remains a Next.js application hosted over HTTPS. The native Capacitor shell opens the production frontend URL instead of trying to statically export the whole application.

This is intentional because the current frontend uses dynamic authenticated routes and server-rendered Next.js behavior. Forcing a static export at this stage would create unnecessary architectural constraints.

Native application identity:

- app name: QaryzLink
- application id: `kz.qaryzlink.app`
- production web origin: `https://qaryz-link-front.vercel.app` until a permanent custom domain is assigned.

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

Before a native release, set the production origin explicitly:

```bash
NATIVE_APP_URL=https://app.qaryzlink.kz pnpm mobile:configure
pnpm mobile:check
```

The configurator accepts only a clean HTTPS origin and keeps cleartext traffic disabled.

## Security requirements

1. Native production URLs must use HTTPS.
2. Cleartext traffic stays disabled.
3. PWA service-worker caching must not become a substitute for native secure storage.
4. Access/refresh tokens must never be copied into static native assets.
5. Native plugins must be introduced individually and reviewed for required permissions.
6. Camera, biometrics, push notifications, file access and secure storage require explicit feature-level decisions.
7. A custom production domain should replace the temporary Vercel domain before store release.

## Native package installation stage

Capacitor packages are deliberately not committed until the repository can update `package.json` and `pnpm-lock.yaml` together.

When native builds are enabled, install matching versions of:

```text
@capacitor/core
@capacitor/cli
@capacitor/android
@capacitor/ios
```

Then initialize/sync the platform projects and commit `android/` and `ios/` only after the build environment and signing strategy are decided.

## Planned sequence

1. Keep web/PWA CI green.
2. Assign the final production frontend domain.
3. Add Capacitor dependencies with lockfile update.
4. Generate Android project.
5. Validate Android deep links, keyboard, safe areas and back navigation.
6. Add secure storage only if token architecture requires it.
7. Add push notifications only after notification privacy rules are fixed.
8. Generate and validate iOS project.
9. Add store assets, privacy declarations and signing configuration.
10. Run end-to-end acceptance against the same backend used by production/staging.

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

If persistent native authentication becomes a product requirement, introduce a dedicated secure-storage adapter backed by an OS-protected credential store (for example Android Keystore / iOS Keychain through an audited Capacitor plugin), together with refresh-token lifecycle, logout/revocation and device-loss threat review.
