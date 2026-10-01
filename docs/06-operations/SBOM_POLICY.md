# SBOM artifact retention and access policy

Жаңартылған күні: 2026-09-26.

QaryzLink Back, Front және Admin supply-chain workflow-тары CycloneDX JSON SBOM генерациялайды. Бұл құжат SBOM artifact-ін қалай сақтау және кім көре алатынын анықтайды.

## Retention

- CI artifact retention: 14 күн.
- Artifact атауы commit SHA-ға байланады.
- PR, main push және scheduled security run-дар үшін SBOM жасалады.
- 14 күн өткеннен кейін GitHub Actions artifact автоматты expire болады.
- Release SBOM-ды ұзақ мерзімге бөлек архивтеу public pilot/release process бекітілгенде ғана қосылады.

## Access

- Artifact GitHub Actions ішінде сақталады.
- Access repository visibility және GitHub permissions-ке бағынады.
- SBOM public customer document емес.
- Private repository болса тек repository access бар пайдаланушы оқиды.
- Repository public болса SBOM-да secret/PII болмауы міндетті; dependency inventory құпия дерек ретінде қаралмайды.

## Data classification

SBOM құрамында dependency/package metadata ғана болуы тиіс. Мыналар artifact-ке кірмеуі керек:

- passwords, API keys, JWT/refresh tokens;
- SMTP/storage/scanner credentials;
- user email/phone/IIN/BIN;
- raw evidence/document content;
- database dump немесе runtime logs.

Secret scan SBOM generation-нан бөлек gate болып қалады.

## Failure behavior

- SBOM generation fail болса supply-chain workflow fail.
- expected sbom.cdx.json файл табылмаса artifact upload fail.
- artifact upload failure supply-chain run-ды green деп есептеуге жол бермейді.

## Release usage

Security/release review кезінде SBOM commit/image identity-мен салыстырылады. Қажет болған жағдайда dependency advisory investigation осы artifact-тен басталады.

## Current rollout

14-day SBOM retention rollout acceptance жабылды:

- Back current-main run `36841447314` (`0340cf8`) — secret scan + SBOM generation successful, `sbom-0340cf8...` artifact 2026-10-15 дейін retained.
- Front current-main run `36841540997` (`0fdd155`) — secret scan + SBOM generation successful, `sbom-0fdd155...` artifact 2026-10-15 дейін retained.
- Admin current-main run `36841502025` (`1ecf1da`) — secret scan + SBOM generation successful, `sbom-1ecf1da...` artifact 2026-10-15 дейін retained.

Artifacts commit SHA-ға байланған және жоғарыдағы retention/access/data-classification policy-ге сәйкес сақталады.