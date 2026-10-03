---
layout: home

hero:
  name: QaryzLink
  text: Product & Engineering Docs
  tagline: Бизнес логикадан production deployment-ке дейінгі QaryzLink source of truth.
  actions:
    - theme: brand
      text: Қайдан бастау керек
      link: /docs/00-product/START_HERE
    - theme: alt
      text: Deployment және integrations
      link: /docs/06-operations/DEPLOYMENT_PORTAL

features:
  - title: Бизнес логика
    details: Request, proposal, contract, funding, repayment, closure және evidence lifecycle-ін бірізді түсініңіз.
    link: /docs/01-business/BUSINESS_LOGIC
  - title: Архитектура
    details: Front, Back, Admin, PostgreSQL, Redis, storage және external provider boundary-ларын қараңыз.
    link: /docs/02-architecture/SYSTEM_ARCHITECTURE
  - title: Серверге орнату
    details: Required infrastructure, environment variables, migrations, ingress және production gates.
    link: /docs/06-operations/DEPLOYMENT_PORTAL
  - title: Қауіпсіздік
    details: Privacy-by-default, consent, encryption, access control және audit қағидалары.
    link: /docs/03-security/PRIVACY_SECURITY
  - title: Release readiness
    details: Staging evidence, provider acceptance және final production approval sequence.
    link: /docs/06-operations/FINAL_RELEASE_HANDOFF
  - title: Implementation status
    details: Қай бөлік кодта дайын, қай бөлік external staging/provider acceptance-ке тәуелді екенін тексеріңіз.
    link: /docs/04-delivery/IMPLEMENTATION_STATUS
---

## QaryzLink-ті қалай оқу керек

Егер жобамен алғаш танысып жатсаңыз, **Start here** бетінен бастаңыз. Ол product идеясын, екі тараптың рөлдерін және негізгі lifecycle-ті қысқаша түсіндіреді.

Егер серверге шығарғыңыз келсе, **Deployment portal** арқылы инфраструктура, integration және environment variable топтарын қараңыз. Ол нақты runbook-тарға сілтеме береді.

> Бұл documentation portal source Markdown файлдардан тікелей build болады. Сондықтан GitHub-тағы specification пен HTML сайттағы ақпарат бір source of truth болып қалады.
