# Evidence legal hold foundation

QaryzLink evidence legal hold — contract-level destructive-retention override.

Бұл feature заңдық сақтау мерзімін өзі анықтамайды. Оның мақсаты — named support/legal decision болған кезде application cleanup evidence object-терін жоймауын enforce ету.

## Scope

Current v1:

- contract-level hold;
- enum-only reason;
- immutable hold history row;
- one active hold per contract;
- explicit release by hold ID;
- scoped support read/write credentials;
- placement/release audit;
- expired unconsumed upload cleanup exclusion.

Reasons:

- `DISPUTE`;
- `LEGAL_REQUEST`;
- `REGULATORY_REQUEST`;
- `FRAUD_REVIEW`.

Free-text legal notes application DB-да сақталмайды.

## Access boundary

Feature default-off:

`SUPPORT_EVIDENCE_LEGAL_HOLDS_ENABLED=false`

Enabled болса staff credential-де екі scope болуы тиіс:

- `evidence-holds:read`;
- `evidence-holds:write`.

Endpoints:

- `GET /api/v1/internal/support/contracts/:contractId/evidence-holds/active`;
- `POST /api/v1/internal/support/contracts/:contractId/evidence-holds`;
- `DELETE /api/v1/internal/support/contracts/:contractId/evidence-holds/:holdId`.

Raw support token browser/public API contract-қа шықпайды.

## Concurrency and idempotency

Placement contract row-ды `FOR UPDATE` арқылы serializes.

Cleanup әр selected intent үшін дәл сол contract row-ды `FOR UPDATE` арқылы қайта lock етеді және storage delete алдында active hold-ты қайта тексереді. Сондықтан selection мен delete аралығында hold қойылса, операция commit ordering арқылы анық реттеледі: hold бірінші commit болса delete skipped; cleanup lock бірінші алса cleanup аяқталғаннан кейін ғана жаңа hold қойылады.

Database partial unique index:

`UNIQUE(contractId) WHERE releasedAt IS NULL`

бір contract үшін бір ғана active hold болуын DB деңгейінде enforce етеді.

Repeat placement existing active hold-ты қайтарады және duplicate audit жасамайды.

Release нақты hold ID-ге байланған. Already-released hold-ты қайта release ету current released state-ті қайтарады және duplicate audit жасамайды. Осылайша кеш келген old release request кейін қойылған жаңа hold-ты босата алмайды.

## Cleanup protection

`EvidenceExpiredUploadCleanupService` expired/unconsumed upload intent таңдағанда active legal hold бар contract-тарды query деңгейінде алып тастайды.

Сондықтан hold active болса:

- object storage delete шақырылмайды;
- malware-scan cleanup орындалмайды;
- upload-intent row cleanup орындалмайды.

Consumed/persisted evidence бұл cleanup worker-ге бұрыннан кірмейді.

## Audit

Placement:

`EVIDENCE_LEGAL_HOLD_PLACED`

Release:

`EVIDENCE_LEGAL_HOLD_RELEASED`

Audit payload:

- hold ID;
- enum reason;
- opaque support actor ID.

Free text, object key, evidence hash/content, user contact немесе support token сақталмайды.

## Important limitations

Бұл foundation толық legal-retention implementation емес.

Әлі ашық:

- Kazakhstan-specific retention periods;
- legal owner/process approval;
- object-store lifecycle rules legal hold-ты айналып өтпейтініне staging/provider verification;
- consumed evidence үшін scheduled retention/delete policy;
- account deletion/pseudonymization мен legal hold interaction;
- support/admin UI;
- cross-system legal hold propagation;
- restore/backup preservation semantics.

Object storage provider lifecycle rule application DB-ды айналып өтіп object delete етсе, current application hold оны тоқтата алмайды. Production-та bucket lifecycle configuration legal hold policy-мен бірге бөлек acceptance-тан өтуі тиіс.

## Production enablement gate

`SUPPORT_EVIDENCE_LEGAL_HOLDS_ENABLED=true` тек:

1. named legal/support owner;
2. documented placement/release process;
3. scoped expiring staff identity;
4. restricted support ingress;
5. bucket lifecycle review;
6. staging place → cleanup skip → release → cleanup scenario;
7. audit review

өткеннен кейін қосылады.


## Implementation evidence — 2026-09-28

QaryzLinkBack PR #187 merged at `b5c7f11`: contract-level legal hold schema/migration, scoped support API, one-active-hold invariant, idempotent release-by-hold-id, audit және race-safe cleanup serialization.

Back CI run `36464196233` quality job құрды, бірақ runner step орындалмады. Automated Prisma/typecheck/lint/test/build verification pending; application code бұл run-да орындалмаған.
