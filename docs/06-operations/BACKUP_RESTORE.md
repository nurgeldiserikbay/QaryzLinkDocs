# Backup және restore runbook

Жаңартылған күні: 2026-10-08.

Бұл runbook PostgreSQL, object storage және application release деректерін жоғалтудан қорғау тәртібін сипаттайды. Нақты provider, retention, RPO және RTO адам review арқылы бекітілмейінше бұл құжат production backup орындалды дегенді білдірмейді.

## Міндетті шекаралар

- Backup тек бөлек storage account/project-ке жазылады.
- Backup encryption және access policy provider secret store арқылы басқарылады.
- Database URL, storage key, encryption key және backup файлдары чатқа немесе repository-ге түспейді.
- Restore тек isolated disposable database-ке жасалады.
- Production database-ке restore жасау бөлек approval талап етеді.
- Backup ішіндегі email, телефон, identity және құжат дерегі private data ретінде өңделеді.

## Backup құрамдары

1. PostgreSQL logical немесе managed snapshot.
2. Object storage файлдары және metadata.
3. Migration history және release commit/image metadata.
4. Notification/outbox operational state — business policy-ге сай.
5. Backup encryption және access audit metadata.

## Release алдында

- [ ] Migration backward-compatible екені тексерілді.
- [ ] Staging backup жасалып, checksum/size тіркелді.
- [ ] Backup encrypted және restricted storage-та.
- [ ] Restore isolated database-ке орындалды.
- [ ] Schema version және migration history сәйкес.
- [ ] Object storage sample файлдары read-back арқылы тексерілді.
- [ ] Access log-та secret және PII жоқ.
- [ ] Backup retention және жауапты адам бекітілді.

## Restore drill

1. Restore target ретінде production-нан бөлек database таңдаңыз.
2. Backup artifact integrity/checksum мәнін тексеріңіз.
3. PostgreSQL restore жасаңыз.
4. Migration history және негізгі кестелердің row count-ын салыстырыңыз.
5. Object storage файлдарын isolated prefix-ке restore етіңіз.
6. Backend-ті read-only verification mode-та іске қосыңыз.
7. Health, auth, privacy және evidence read сценарийлерін орындаңыз.
8. Sensitive output, log және signed URL-дың public болып кетпегенін тексеріңіз.
9. Restore уақытын және табылған айырмашылықтарды тіркеңіз.
10. Isolated restore data-ны cleanup policy бойынша өшіріңіз.

## Rollback қағидасы

- Application rollback — бұрын тексерілген commit/image-ке қайту.
- Database schema rollback автоматты down migration арқылы жасалмайды.
- Қауіпсіз жол: backward-compatible schema және қажет болса forward fix.
- Data correction immutable audit және approval арқылы орындалады.
- Payment, funding, contract және audit records үнсіз өшірілмейді.

## Restore evidence

| Field | Required value |
|---|---|
| Backup timestamp | UTC |
| Source environment | staging / production |
| Target environment | isolated only |
| Commit SHA | exact SHA |
| Schema version | migration identifier |
| Restore duration | minutes |
| Result | pass/fail |
| Data discrepancy | PII-сыз сипаттама |
| Reviewer | owner/reviewer |

RPO және RTO нақты бизнес талабымен бекітілмейінше бос күйде қалады. Олардың бекітілген мәндері, retention, backup custody және restore ownership versioned policy ішінде сақталады; production Backend сол policy-дің opaque reference-ін `BACKUP_RECOVERY_POLICY_ID` арқылы талап етеді. Backup бар деген белгі restore drill-сыз жеткілікті acceptance болып саналмайды.


## Encrypted contact restore rehearsal

Back #249 isolated CI restore rehearsal-ды encrypted contact fixture-пен кеңейтеді. Rehearsal әр run сайын synthetic AES/HMAC key material және synthetic password жасайды; source row-да plaintext email `NULL`, ал `emailCiphertext` және `emailLookupHash` populated болады. Logical dump isolated database-қа restore болғаннан кейін application `PII_CONTACT_STORAGE_MODE=encrypted` күйінде іске қосылады, exact email blind-index login орындалады және authenticated `/api/v1/profile/me` restored ciphertext-ті дұрыс decrypt ететіні тексеріледі.

Key material, synthetic email/password, ciphertext және backup bytes retained evidence-ке кірмейді. Бұл provider-side encrypted backups, PITR, retention/custody және measured RTO/RPO evidence-ті алмастырмайды.
