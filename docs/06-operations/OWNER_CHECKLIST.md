# Жоба иесінен қажет мәліметтер

Құпия мәндерді чатқа жіберудің қажеті жоқ. Оларды таңдалған платформаның secret settings-іне енгізу жеткілікті.

| Не қажет | Қашан | Қайда қолданылады |
|---|---|---|
| Staging және production hosting таңдауы | Deploy алдында | Node platform, VPS немесе k3s |
| Домен және DNS басқару мүмкіндігі | HTTPS/email алдында | API, Front, Admin және sender |
| Қазақстан аудиториясы үшін дерек сақтау аймағы | Public launch алдында | Database, backup, files және logs |
| Private object storage bucket/endpoint және least-privilege credential | Evidence staging алдында | Signed upload/download, HEAD verification және orphan cleanup |
| Malware scanner/event integration және callback secret | Evidence staging алдында | CLEAN/INFECTED/FAILED verdict flow |
| KMS/HSM signer deployment, least-privilege IAM, key ceremony және key lifecycle policy version-дері | Evidence sealing staging алдында | ZIP seal private-key custody, rotation/revocation және release acceptance |
| Timestamp standards profile, authority trust/revocation policy және Kazakhstan legal classification version-дері | Trusted timestamp staging алдында | RFC3161/QTSA selection және timestamp legal/cryptographic acceptance |
| KZ/RU legal PDF template approval, legal sign-off, visual acceptance және font policy version-дері | Contract PDF production enablement алдында | Immutable template pins, renderer acceptance және court/export package |
| L2 KYC provider contract/profile, callback-auth policy, privacy/residency policy және legal classification version-дері | Identity verification staging алдында | Provider adapter, callback trust және Kazakhstan privacy/legal acceptance |
| L2 KYC staging session endpoint, bearer/callback credentials, provider signing-key fingerprint және test account | Identity provider integration staging алдында | Signed session/callback verification, correlation/replay және fail-closed drills |
| SMTP провайдер және расталған sender | Email қосқанда | SMTP secrets және DNS |
| Test mailbox | Staging verification кезінде | Өзіңіз бақылайтын қабылдаушы |
| Backup retention және restore мақсаттары | Production алдында | Операциялық регламент |
| Support және incident жауаптысы | Pilot алдында | Incident response және support/dispute runbook-тары, қате, шағым және қолжетімділік |
| Заңгердің scope/privacy/retention қорытындысы | Public launch алдында | Legal gates және terms |
| Алғашқы pilot қатысушылары | Негізгі workflow дайын болғанда | Invite-only сынақ |

Алғашқы backend staging үшін hosting, PostgreSQL және secret configuration жеткілікті; email уақытша өшірулі бола алады.
KYC, банк немесе ЭЦҚ провайдерін дәл қазір қосу міндетті емес: бөлек интеграция кезеңінде таңдалады.
Қолданыстағы жүйені өшіретін migration, production деректерін ауыстыру және шығын әкелетін сервиске жазылу бөлек нақты жоспармен орындалады.
