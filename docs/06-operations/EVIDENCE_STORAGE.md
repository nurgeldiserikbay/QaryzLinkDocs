# Evidence storage operations

Жаңартылған күні: 2026-09-26.

Бұл нұсқаулық QaryzLinkBack-тағы private evidence storage flow-дың қазіргі implementation күйін сипаттайды. Кодта S3-compatible signed upload/download, object verification, malware verdict registry және expired unconsumed upload cleanup бар. Бұл staging/production storage провайдері operationally тексерілді дегенді білдірмейді.

## 1. Қазіргі flow

~~~mermaid
flowchart LR
    C["Client"] --> I["POST upload-intents"]
    I --> U["Short-lived signed PUT"]
    U --> S["Private S3-compatible object"]
    S --> M["External malware scanner"]
    M --> V["Trusted verdict callback"]
    C --> E["Funding/payment evidence submit"]
    E --> H["Signed HEAD inspection"]
    H --> X{"metadata exact + CLEAN?"}
    X -->|Yes| P["Persist evidence + consume intent"]
    X -->|No| R["Reject fail-closed"]
~~~

Backend мыналарды орындайды:

- object key-ді server өзі генерациялайды;
- upload intent user + contract + purpose + SHA-256 + media type + expected size-қа байланады;
- PUT және GET URL-дар AWS Signature V4 арқылы қысқа мерзімге қол қойылады;
- storage object-ке HEAD request арқылы content type, content length және upload-bound metadata тексеріледі;
- evidence тек malware verdict `CLEAN` болса ғана қабылданады;
- malware verdict objectKey + SHA-256 бойынша PostgreSQL-де сақталады және severity downgrade-қа жол берілмейді;
- expired және ешқашан consume болмаған upload object-тер бөлек cleanup job арқылы жойылады;
- consumed/persisted evidence orphan cleanup-қа кірмейді.

## 2. Міндетті configuration

`EVIDENCE_STORAGE_ENABLED=true` тек staging немесе production ортада қолданылуы тиіс.

| Variable | Мақсаты |
|---|---|
| EVIDENCE_STORAGE_ENABLED | Evidence storage feature gate |
| EVIDENCE_UPLOAD_INTENT_TTL_SECONDS | Single-use upload intent TTL; 60–3600 sec, default 600 |
| EVIDENCE_MAX_UPLOAD_BYTES | Максималды upload size; default 10 MiB |
| EVIDENCE_SIGNED_URL_TTL_SECONDS | Signed PUT/GET TTL; 60–900 sec, default 300 |
| EVIDENCE_CLEANUP_BATCH_SIZE | Бір cleanup run ішіндегі max orphan саны; 1–100, default 50 |
| EVIDENCE_S3_BUCKET_ENDPOINT | Private bucket HTTPS endpoint |
| EVIDENCE_S3_REGION | Signature V4 region |
| EVIDENCE_S3_ACCESS_KEY_ID | Secret store-дағы storage credential |
| EVIDENCE_S3_SECRET_ACCESS_KEY | Secret store-дағы storage credential |
| EVIDENCE_S3_SESSION_TOKEN | Optional temporary credential token |
| EVIDENCE_SCAN_CALLBACK_TOKEN | Scanner callback үшін кемінде 32 таңбалық secret |

Bucket endpoint HTTPS болуы және URL ішінде credential, query немесе fragment болмауы керек.

## 3. Storage credential policy

Runtime credential:

- тек evidence bucket/prefix үшін minimum permission алуы тиіс;
- public-read permission берілмейді;
- bucket listing application flow үшін қажет болмаса өшіріледі;
- upload/download/delete signing үшін қажет операциялар ғана беріледі;
- credential secret store арқылы беріледі;
- repository, image, log немесе browser bundle-ге кірмейді;
- production credential staging credential-дан бөлек болады;
- rotation procedure staging-та тексеріледі.

Қазіргі code IAM policy-ді өзі құрмайды. Нақты provider policy environment owner-дің жауапкершілігінде.

## 4. Malware scanner integration

Backend scanner engine іске қоспайды. External trusted scanner немесе bucket-event worker объектті тексеріп, internal callback-қа terminal verdict жібереді:

- `CLEAN`;
- `INFECTED`;
- `FAILED`.

Callback token тұрақты уақытпен салыстырылады. Verdict objectKey + SHA-256-ға байланады. Кейін келген төмен severity verdict бұрынғы жоғары severity result-ті downgrade етпейді.

Production enablement алдында:

1. scanner uploaded object-ті автоматты қабылдайтыны дәлелденсін;
2. CLEAN verdict үшін end-to-end latency өлшенсін;
3. INFECTED файл application evidence ретінде қабылданбайтыны тексерілсін;
4. scanner outage кезінде evidence fail-closed қалатыны тексерілсін;
5. callback сыртқы интернетке ашық болса ingress allowlist/WAF/provider authentication бөлек қарастырылсын.

## 5. Expired upload cleanup

Expired және `consumedAt = null` intent-тер үшін:

~~~bash
pnpm evidence:cleanup:run
~~~

Command HTTP server ашпайды. Ол storage disabled болса іске қосылмайды, aggregate `selected/purged/failed` counters логтайды және кемінде бір object cleanup сәтсіз болса non-zero exit code қайтарады.

Kubernetes template:

`ops/kubernetes/evidence-cleanup-cronjob.yaml`

Engineering cadence — сағатына бір рет. `concurrencyPolicy: Forbid`, bounded runtime және immutable image placeholder қолданылады. Нақты namespace, registry digest, Secret/ConfigMap және alerting staging-та тексерілуі керек.

Бұл cleanup **consumed/persisted evidence-ті жоймайды**. Legal retention evidence үшін бөлек policy қажет.

## 6. Staging acceptance

`EVIDENCE_STORAGE_ENABLED=true` жасау алдында және жасағаннан кейін кемінде мына сценарийлер тексеріледі:

1. verified lender funding upload intent ала алады;
2. verified borrower active funded contract үшін payment upload intent ала алады;
3. outsider сол contract/object туралы ақпарат ала алмайды;
4. signed PUT тек expected object key/metadata/size арқылы өтеді;
5. HEAD inspection metadata mismatch-ті қабылдамайды;
6. scan verdict жоқ кезде evidence қабылданбайды;
7. CLEAN verdict кейін evidence persist болады;
8. INFECTED және FAILED verdict evidence-ті блоктайды;
9. participant-only signed GET жұмыс істейді;
10. outsider download request privacy-safe not-found қайтарады;
11. expired unconsumed upload cleanup object пен stale scan verdict-ті жояды;
12. cleanup storage error болса row retry үшін қалады.

Evidence ретінде secret, signed URL, token, raw PII немесе document content сақталмайды. Тек commit SHA, environment, UTC timestamp, scenario және pass/fail сақталады.

## 7. Production gate

Мыналар аяқталмайынша evidence storage production-ready деп саналмайды:

- нақты private bucket және least-privilege credentials;
- external malware scanner/event integration;
- staging end-to-end acceptance;
- alerting және scanner/storage outage ownership;
- consumed evidence retention/deletion policy бойынша заңгерлік шешім;
- backup/restore және incident procedure;
- data residency талабының орындалуы.
