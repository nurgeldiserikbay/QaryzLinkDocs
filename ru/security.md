# Безопасность и privacy

<span class="doc-kicker">PRIVACY-FIRST</span>

<div class="doc-lead">Безопасность — это не только auth: identity, consent, evidence, secrets, logs и operator access рассматриваются как отдельные boundaries.</div>

## Security model

<div class="layer-stack">
<div class="layer-row"><strong>Identity</strong><span>Session, verification, scoped staff credentials</span></div>
<div class="layer-row"><strong>Authorization</strong><span>Participant ownership, role/scope checks, support gates</span></div>
<div class="layer-row"><strong>Privacy</strong><span>Default-hidden data + explicit disclosure/consent</span></div>
<div class="layer-row"><strong>PII</strong><span>Encrypted-mode migration, keyring, lookup HMAC, controlled scrub</span></div>
<div class="layer-row"><strong>Evidence</strong><span>Private storage, signed URLs, malware scan, hashes</span></div>
<div class="layer-row"><strong>Operations</strong><span>Metrics token, log hygiene, restricted ingress, audit</span></div>
</div>

## Network boundary

| Service | Public? |
|---|---:|
| Front | Да |
| API public routes | Controlled |
| Admin | Нет/restricted |
| PostgreSQL | Нет |
| Redis | Нет |
| Metrics | Internal |
| Support endpoints | Internal/restricted |
| Object storage | Private |

Полная модель: [Privacy & security](/docs/03-security/PRIVACY_SECURITY).
