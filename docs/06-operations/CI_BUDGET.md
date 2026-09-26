# GitHub Actions free-quota policy

Жаңартылған күні: 2026-09-26.

QaryzLink CI/CD тегін GitHub Actions лимитін үнемдеуге бейімделген. Мақсат — PR сапасын сақтау, бірақ бір өзгерісті бірнеше ауыр pipeline арқылы қайталамау.

## Pull request режимі

- Back, Front және Admin PR-ларында тек негізгі CI quality workflow жүреді.
- Markdown/docs-only өзгерістер code CI-ды іске қоспайды.
- Бір PR-ға жаңа commit келсе алдыңғы unfinished run automatic cancel болады.
- Main-ге merge болғаннан кейін сол quality workflow қайтадан қайталанбайды.

## Supply-chain режимі

- Secret scan және CycloneDX SBOM әр PR-да емес.
- Олар main push кезінде, апталық schedule-де немесе manual workflow dispatch арқылы орындалады.
- Backend Docker build + Trivy HIGH/CRITICAL image scan тек апталық немесе manual run-да орындалады.
- SBOM artifact 14 күн сақталады.

## Front/Admin build reuse

Front және Admin quality workflow `pnpm check` ішіндегі Next.js production build-ті бір рет жасайды.
`NEXT_PUBLIC_API_BASE_URL` сол build кезінде беріледі, сондықтан CSP exact API origin-мен жасалады.
Security-header smoke сол дайын build-ті қайта қолданады; екінші `next build` орындалмайды.

## Қауіпсіздік trade-off

Бұл режим PR feedback-ті сақтайды, бірақ ауыр image/supply-chain scan-ды әр commit үшін қайталамайды. Weekly/manual container scan dependency/base-image өзгерістерін ұстап қалады. Release алдында supply-chain run manual түрде де іске қосылуы керек.

## Billing exhaustion

GitHub Actions free quota немесе billing gate таусылса job мүлде басталмауы мүмкін. Ондай failure code failure ретінде есептелмейді. Quota жаңарғаннан кейін қажет workflow manual dispatch арқылы қайта орындалады.

## Қалған gap

Backend `pnpm-lock.yaml` + `--frozen-lockfile` қолданады. Front және Admin repository-лерінде initial `pnpm-lock.yaml` әлі commit етілмеген, сондықтан олар әзірге `--no-frozen-lockfile` қолданады. Бұл бөлек reproducibility gate ретінде ашық қалады; lockfile resolver output сенімді түрде алынғанда ғана frozen install-ға ауыстырылады.