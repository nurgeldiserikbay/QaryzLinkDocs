# Data retention baseline

Жаңартылған күні: 2026-09-26.

Бұл құжат QaryzLink MVP үшін қандай дерек автоматты түрде тазаланатынын және қай санаттар legal/product шешімі шыққанша сақталатынын бөледі. Бұл заңдық retention қорытындысы емес; public pilot алдында Қазақстанға арналған legal review қажет.

## 1. Автоматты тазаланатын ephemeral metadata

| Санат | Қазіргі behavior | Себеп |
|---|---|---|
| Email verification challenge | Expired немесе consumed record daily cleanup арқылы жойылады | Email көшірмесі мен token hash-ты қажетсіз ұзақ сақтамау |
| Auth rate-limit bucket | Expired bucket cleanup арқылы жойылады | Қысқа мерзімді abuse-control metadata ғана |
| Expired unconsumed evidence upload intent/object | Evidence cleanup job арқылы тазаланады | Persisted evidence емес, orphan upload |

Бұл cleanup contract/payment/ledger/session history-ге тимейді.

## 2. Account deletion

Account deletion request бірден hard-delete емес.

- active sessions request қабылданғанда revoke болады;
- grace/retention evaluation account-ты REQUESTED, RETENTION_HOLD, READY немесе COMPLETED күйіне әкеледі;
- active contractual obligation болса deletion retention hold-қа өтеді;
- eligible account anonymization кезінде external/public identifiers random opaque placeholder-ға ауысады;
- retained contract/payment/ledger/evidence records legal/accounting міндеттерге байланысты бөлек policy-ге бағынады.

## 3. Legal retention шешімі қажет санаттар

Төмендегі деректерге automatic destructive cleanup әзірге қосылмайды:

- contracts және signed contract versions;
- funding/payment records;
- immutable ledger entries және reversals;
- persisted funding/payment evidence;
- dispute records;
- audit events;
- expired/revoked session metadata;
- notification outbox history;
- support/dispute tickets.

Оларды жою мерзімі Қазақстан pilot scope, accounting/legal obligations, dispute limitation periods және privacy notice бекітілгеннен кейін ғана анықталады.

## 4. Data minimization rules

- жаңа profile public visibility әдепкіде false;
- optional analytics consent әдепкіде false;
- metrics aggregate-only және identity/object payload шығармайды;
- support ticket-ке raw document/token/signed URL көшірілмейді;
- evidence object тек authorized application path және CLEAN malware verdict арқылы қолданылады;
- account anonymization retained internal user id-ден deterministic external identifier жасамайды.

## 5. PII encryption status

Database-at-rest PII field encryption әлі толық cutover жасалған жоқ. Additive encrypted/hash columns мен crypto primitive дайын, бірақ current runtime әдепкіде `plaintext` mode қолданады және user email/phone lookup/uniqueness үшін legacy plaintext field-тер сақталады. Мұны қауіпсіз өзгерту үшін бір уақытта:

1. encryption key management;
2. deterministic/blind lookup key;
3. dual-write/backfill migration;
4. login/email-verification/profile adapters;
5. key rotation;
6. rollback strategy

қажет. Partial migration жасалмайды. Бұл public pilot алдындағы ашық security gate.

## 6. Verification status

Backend PR #124 ephemeral auth retention cleanup-ты қосты. Ол GitHub Actions free-quota/billing gate салдарынан automated CI орындалмай тұрған кезде merge жасалды; quota қайта ашылғанда quality/runtime verification қайта жүргізілуі тиіс.

## 7. Owner decisions before public pilot

- contract/payment/ledger retention duration;
- persisted evidence retention және legal hold;
- audit retention;
- revoked/expired session retention;
- support ticket retention;
- PII encryption/key custody/rotation owner;
- privacy notice-та deletion және retained records түсіндірмесі.