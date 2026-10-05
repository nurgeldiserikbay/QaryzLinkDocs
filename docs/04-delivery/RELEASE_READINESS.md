# QaryzLink release readiness

_Last updated: 2026-10-04_

This page is a delivery status snapshot, not a product promise. It separates web/PWA readiness from native-store readiness.

## Current status

### Web / PWA

Status: **release-candidate level**

Completed:

- product landing and authenticated dashboard flows are implemented;
- public SEO metadata, robots and sitemap are configured;
- account/dashboard utility routes are excluded from indexing;
- installable PWA manifest and service worker are present;
- private financial pages/API responses are intentionally not used as offline cache;
- mobile dashboard navigation and safe-area behavior are implemented;
- request, contract, marketplace, notifications and settings mobile UX has been polished;
- web/PWA runtime is separated from prepared native runtime;
- latest frontend Vercel deployments are green.

Remaining before a permanent public launch:

- run the manual `Release Preflight` workflow in strict mode and require the full frontend quality gate to pass;
- assign final production frontend domain;
- confirm production backend origin and environment values;
- run final browser/staging acceptance against the production-like deployment;
- complete legal/privacy acceptance for Kazakhstan launch;
- complete final content/copy review.

## Backend

Status: **implemented and deployment-ready, final production acceptance still required**

The backend already contains the lending/obligation lifecycle, security controls and deployment work. The latest repository activity includes a build fix for Prisma generation and TypeScript build boundaries.

Completed deployment preparation:
- Render staging Blueprint exists with database-aware readiness;
- Neon connection is injected as a secret, not committed;
- Redis/Key Value wiring and generated runtime secrets are defined;
- migration-before-start behavior is covered by a repository safety test;
- Render + Neon + Vercel staging runbook is documented.

Remaining:
- create the actual Render Blueprint deployment from the exact backend commit;
- provide Neon DATABASE_URL and exact CORS origins;
- verify migrations on the deployed Neon database;
- run staging/production smoke and acceptance tests;
- confirm monitoring, backup/recovery and secrets configuration.

## Admin

Status: **release-candidate level**

Completed:

- admin frontend exists;
- server API origin validation is implemented;
- staging browser acceptance work exists;
- latest Vercel deployment status is green.

Completed release preparation:
- strict Admin release preflight validates exact HTTPS backend origins;
- public/server backend origins must match in strict mode;
- server-only metrics/support credentials are checked against public exposure;
- CI enforces the strict preflight.

Remaining:
- final deployed Admin API origin;
- operator access/role acceptance;
- production/staging smoke test against the deployed backend;
- operational runbook confirmation.

## Documentation

Status: **substantially complete and maintained**

Completed:

- product/business/system/security/deployment documentation;
- full Kazakh HTML documentation;
- mobile/Capacitor architecture;
- Android/iOS release checklist;
- mobile authentication storage boundary.

Remaining:

- keep production URLs, release SHA/digests and final legal decisions synchronized after launch;
- use the Release evidence template to record exact SHAs, origins, feature state and acceptance results without secrets.

## Android / iOS

Status: **architecture prepared; native projects not generated yet**

Completed:

- Capacitor configuration draft;
- native fallback shell;
- web/PWA/native runtime separation;
- service worker disabled in native runtime;
- native deep-link/back-navigation contract;
- HTTPS-only native origin configuration;
- signing/build artifacts excluded from Git;
- mobile preflight checks and release checklist.

Still required:

1. pin/install Capacitor packages with a correct pnpm lockfile;
2. generate Android project;
3. generate iOS project;
4. configure final custom domain;
5. configure Android App Links / iOS Universal Links;
6. decide secure persistent authentication strategy, if persistent login is required;
7. configure Android/iOS signing;
8. test keyboard, back navigation, safe areas, downloads and deep links on devices;
9. build signed AAB / iOS archive;
10. complete Play Console / App Store privacy and release forms.

## Practical completion view

For the **web/PWA product**, the remaining work is primarily final production acceptance, legal/privacy sign-off and production-domain configuration.

For the **full project including Android/iOS store apps**, the project is **not finished** because native platform generation, signing and store acceptance have not yet been performed.

## Definition of done

QaryzLink can be called fully delivered when all of the following are true:

- web frontend deployed on the final production domain;
- backend production deployment and migrations verified;
- admin production deployment verified;
- production/staging acceptance flows are green;
- legal/privacy launch gates are accepted;
- monitoring/backups/runbooks are confirmed;
- Android release is signed and accepted through the intended Play track;
- iOS release is archived/TestFlight-tested if iOS is part of launch scope;
- release commit SHAs and deployment artifacts are documented.


## Trust & risk analytics

Status: **release-candidate**

Implemented and covered:

- lender-only, relationship-scoped risk access;
- no generic public/user-id risk lookup;
- request-stage grant lifecycle;
- request-to-contract access transition;
- automatic revoke after contract closure;
- immutable lender-view snapshots and audit events;
- explainable repayment metrics from confirmed history;
- thin-file / insufficient-history state;
- borrower disclosure history in Settings;
- KZ/RU lender-facing UI;
- browser acceptance checks for request visibility, contract continuity and closure revocation;
- account anonymization revokes active risk access and deletes live repayment aggregates.

Remaining before production enablement:

- production migration deployment;
- production-like authenticated browser acceptance against the deployed backend/front SHAs;
- final privacy/legal review of disclosure wording, retention period and lender-visible metric set;
- operational monitoring for failed metric recomputation / access-grant inconsistencies.

Predictive ML probability scoring is not part of the current release scope.
