import { defineConfig } from 'vitepress';

const base = process.env.DOCS_BASE_PATH || '/';

const kkSidebar = [
  {
    text: 'Жобаны түсіну',
    items: [
      { text: 'Басты бет', link: '/kk/' },
      { text: 'Жобаға шолу', link: '/kk/project-overview' },
      { text: 'Бизнес схема', link: '/kk/business-flow' },
      { text: 'Сайт құрылымы', link: '/kk/site-structure' }
    ]
  },
  {
    text: 'Техникалық құрылым',
    items: [
      { text: 'Архитектура', link: '/kk/architecture' },
      { text: 'Деректер базасы', link: '/kk/database' },
      { text: 'Интеграциялар және env', link: '/kk/integrations' },
      { text: 'Deployment', link: '/kk/deployment' },
      { text: 'Қауіпсіздік', link: '/kk/security' },
      { text: 'Release және staging', link: '/kk/release' }
    ]
  },
  {
    text: 'Толық specification',
    collapsed: true,
    items: [
      { text: 'Business logic (canonical)', link: '/docs/01-business/BUSINESS_LOGIC' },
      { text: 'System architecture', link: '/docs/02-architecture/SYSTEM_ARCHITECTURE' },
      { text: 'Data model', link: '/docs/02-architecture/DATA_MODEL' },
      { text: 'Mobile / Capacitor', link: '/docs/02-architecture/MOBILE_CAPACITOR' },
      { text: 'Mobile convenience & reminders', link: '/docs/05-product/MOBILE_CONVENIENCE' },
      { text: 'Privacy & security', link: '/docs/03-security/PRIVACY_SECURITY' },
      { text: 'Trust & risk analytics', link: '/docs/03-security/TRUST_RISK_ANALYTICS' },
      { text: 'Operations portal', link: '/docs/06-operations/DEPLOYMENT_PORTAL' },
      { text: 'Final release handoff', link: '/docs/06-operations/FINAL_RELEASE_HANDOFF' },
      { text: 'Mobile release checklist', link: '/docs/04-delivery/MOBILE_RELEASE_CHECKLIST' },
      { text: 'Release readiness', link: '/docs/04-delivery/RELEASE_READINESS' },
      { text: 'Production env matrix', link: '/docs/04-delivery/PRODUCTION_ENV_MATRIX' },
      { text: 'Render + Neon staging', link: '/docs/04-delivery/RENDER_NEON_STAGING' },
      { text: 'Release evidence template', link: '/docs/04-delivery/RELEASE_EVIDENCE_TEMPLATE' },
      { text: 'Staging GitHub config', link: '/docs/04-delivery/STAGING_GITHUB_CONFIG' },
      { text: 'Staging operator checklist', link: '/docs/04-delivery/STAGING_OPERATOR_CHECKLIST' }
    ]
  }
];

const ruSidebar = [
  {
    text: 'Понимание проекта',
    items: [
      { text: 'Главная', link: '/ru/' },
      { text: 'Обзор проекта', link: '/ru/project-overview' },
      { text: 'Бизнес-схема', link: '/ru/business-flow' },
      { text: 'Структура сайта', link: '/ru/site-structure' }
    ]
  },
  {
    text: 'Техническая структура',
    items: [
      { text: 'Архитектура', link: '/ru/architecture' },
      { text: 'База данных', link: '/ru/database' },
      { text: 'Интеграции и env', link: '/ru/integrations' },
      { text: 'Deployment', link: '/ru/deployment' },
      { text: 'Безопасность', link: '/ru/security' },
      { text: 'Release и staging', link: '/ru/release' }
    ]
  },
  {
    text: 'Полная specification',
    collapsed: true,
    items: [
      { text: 'Business logic (canonical)', link: '/docs/01-business/BUSINESS_LOGIC' },
      { text: 'System architecture', link: '/docs/02-architecture/SYSTEM_ARCHITECTURE' },
      { text: 'Data model', link: '/docs/02-architecture/DATA_MODEL' },
      { text: 'Mobile / Capacitor', link: '/docs/02-architecture/MOBILE_CAPACITOR' },
      { text: 'Mobile convenience & reminders', link: '/docs/05-product/MOBILE_CONVENIENCE' },
      { text: 'Privacy & security', link: '/docs/03-security/PRIVACY_SECURITY' },
      { text: 'Trust & risk analytics', link: '/docs/03-security/TRUST_RISK_ANALYTICS' },
      { text: 'Operations portal', link: '/docs/06-operations/DEPLOYMENT_PORTAL' },
      { text: 'Final release handoff', link: '/docs/06-operations/FINAL_RELEASE_HANDOFF' },
      { text: 'Mobile release checklist', link: '/docs/04-delivery/MOBILE_RELEASE_CHECKLIST' },
      { text: 'Release readiness', link: '/docs/04-delivery/RELEASE_READINESS' },
      { text: 'Production env matrix', link: '/docs/04-delivery/PRODUCTION_ENV_MATRIX' },
      { text: 'Render + Neon staging', link: '/docs/04-delivery/RENDER_NEON_STAGING' },
      { text: 'Release evidence template', link: '/docs/04-delivery/RELEASE_EVIDENCE_TEMPLATE' },
      { text: 'Staging GitHub config', link: '/docs/04-delivery/STAGING_GITHUB_CONFIG' },
      { text: 'Staging operator checklist', link: '/docs/04-delivery/STAGING_OPERATOR_CHECKLIST' }
    ]
  }
];

export default defineConfig({
  title: 'QaryzLink Docs',
  description: 'QaryzLink visual product, business, architecture and operations documentation.',
  base,
  cleanUrls: true,
  lastUpdated: true,
  srcDir: '.',
  outDir: '.vitepress/dist',
  ignoreDeadLinks: false,
  locales: {
    root: {
      label: 'Language',
      lang: 'kk-KZ'
    },
    kk: {
      label: 'Қазақша',
      lang: 'kk-KZ',
      link: '/kk/'
    },
    ru: {
      label: 'Русский',
      lang: 'ru-RU',
      link: '/ru/'
    }
  },
  themeConfig: {
    siteTitle: 'QaryzLink Docs',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/nurgeldiserikbay/QaryzLinkDocs' }
    ],
    search: { provider: 'local' },
    locales: {
      root: {
        nav: [
          { text: 'Қазақша', link: '/kk/' },
          { text: 'Русский', link: '/ru/' }
        ]
      },
      kk: {
        nav: [
          { text: 'Бизнес', link: '/kk/business-flow' },
          { text: 'Архитектура', link: '/kk/architecture' },
          { text: 'DB', link: '/kk/database' },
          { text: 'Deployment', link: '/kk/deployment' }
        ],
        sidebar: kkSidebar,
        outline: { level: [2, 3], label: 'Бұл бетте' },
        docFooter: { prev: 'Алдыңғы бет', next: 'Келесі бет' },
        lastUpdated: { text: 'Соңғы жаңарту' }
      },
      ru: {
        nav: [
          { text: 'Бизнес', link: '/ru/business-flow' },
          { text: 'Архитектура', link: '/ru/architecture' },
          { text: 'DB', link: '/ru/database' },
          { text: 'Deployment', link: '/ru/deployment' }
        ],
        sidebar: ruSidebar,
        outline: { level: [2, 3], label: 'На этой странице' },
        docFooter: { prev: 'Назад', next: 'Далее' },
        lastUpdated: { text: 'Обновлено' }
      }
    }
  }
});
