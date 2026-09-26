# Operational security review

Жаңартылған күні: 2026-09-26.

Бұл checklist release алдындағы human security review үшін. Ол automated CI gate-терді толықтырады.

## Identity and access

- [ ] production secrets development/staging-тен бөлек;
- [ ] least-privilege database/storage credentials;
- [ ] metrics/scanner/SMTP credentials secret store ішінде;
- [ ] repo, image, logs және browser bundle ішінде secret жоқ;
- [ ] departed/unused access revoked;
- [ ] admin console identity-level feed және mutation әдепкіде өшірулі.

## Application boundary

- [ ] public endpoints PII leak жасамайды;
- [ ] auth/session revoke және refresh rotation тексерілген;
- [ ] rate limits shared backend state қолданады;
- [ ] request body limit bounded;
- [ ] Swagger production-та жабық;
- [ ] exact CORS allowlist және trusted-proxy topology review жасалған.

## Data

- [ ] sensitive fields inventory бар;
- [ ] retention/legal hold policy бекітілген;
- [ ] account deletion anonymization expected fields-ті ғана сақтайды;
- [ ] backups encrypted және restore access шектелген;
- [ ] evidence storage private және malware-gated;
- [ ] logs/support tickets data-minimized.

## Supply chain

- [ ] dependency high/critical audit green;
- [ ] secret scan green;
- [ ] container HIGH/CRITICAL scan green;
- [ ] SBOM generated және retention policy бойынша сақталады;
- [ ] release image immutable digest-пен pin.

## Operations

- [ ] incident owner/escalation channel;
- [ ] rollback және restore rehearsed;
- [ ] background job failure alerting;
- [ ] metrics internal-only;
- [ ] support/dispute runbook owner-ға таныстырылған.

## Review result

Review нәтижесінде PASS, PASS_WITH_ACTIONS немесе BLOCKED күйі беріледі. BLOCKED issue жабылмайынша public pilot release жасалмайды. PASS_WITH_ACTIONS тек user data/security boundary-ға әсер етпейтін follow-up үшін қолданылады.

Review record secret/PII сақтамайды: commit/image digest, reviewer, UTC date, findings IDs және status жеткілікті.