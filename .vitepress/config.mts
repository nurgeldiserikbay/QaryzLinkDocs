import { defineConfig } from 'vitepress';

const base = process.env.DOCS_BASE_PATH || '/';

export default defineConfig({
  lang: 'kk-KZ',
  title: 'QaryzLink Docs',
  description: 'QaryzLink product, business logic, architecture and operations documentation.',
  base,
  cleanUrls: true,
  lastUpdated: true,
  srcDir: '.',
  outDir: '.vitepress/dist',
  ignoreDeadLinks: false,
  themeConfig: {
    siteTitle: 'QaryzLink Docs',
    nav: [
      { text: 'Бастау', link: '/docs/00-product/START_HERE' },
      { text: 'Бизнес логика', link: '/docs/01-business/BUSINESS_LOGIC' },
      { text: 'Архитектура', link: '/docs/02-architecture/SYSTEM_ARCHITECTURE' },
      { text: 'Deployment', link: '/docs/06-operations/DEPLOYMENT_PORTAL' },
      { text: 'Release', link: '/docs/06-operations/FINAL_RELEASE_HANDOFF' }
    ],
    sidebar: [
      {
        text: 'Бастау',
        items: [
          { text: 'Құжаттама басты беті', link: '/' },
          { text: 'Start here', link: '/docs/00-product/START_HERE' },
          { text: 'Product overview', link: '/docs/00-product/PRODUCT_OVERVIEW' },
          { text: 'Glossary', link: '/docs/00-product/GLOSSARY' },
          { text: 'Master specification', link: '/docs/MASTER_SPEC' }
        ]
      },
      {
        text: 'Бизнес логика',
        collapsed: false,
        items: [
          { text: 'Негізгі бизнес логика', link: '/docs/01-business/BUSINESS_LOGIC' },
          { text: 'State machines', link: '/docs/01-business/STATE_MACHINES' },
          { text: 'Private discovery', link: '/docs/01-business/PRIVATE_DISCOVERY' },
          { text: 'Proposal negotiation', link: '/docs/01-business/PROPOSAL_NEGOTIATION' },
          { text: 'Contract signing', link: '/docs/01-business/CONTRACT_SIGNING' },
          { text: 'Funding evidence', link: '/docs/01-business/FUNDING_EVIDENCE' },
          { text: 'Repayment schedule', link: '/docs/01-business/REPAYMENT_SCHEDULE' },
          { text: 'Payment ledger', link: '/docs/01-business/PAYMENT_LEDGER' },
          { text: 'Contract closure', link: '/docs/01-business/CONTRACT_CLOSURE' },
          { text: 'Evidence summary', link: '/docs/01-business/EVIDENCE_SUMMARY' }
        ]
      },
      {
        text: 'Архитектура және қауіпсіздік',
        items: [
          { text: 'System architecture', link: '/docs/02-architecture/SYSTEM_ARCHITECTURE' },
          { text: 'Domain model', link: '/docs/02-architecture/DOMAIN_MODEL' },
          { text: 'Data model', link: '/docs/02-architecture/DATA_MODEL' },
          { text: 'Privacy & security', link: '/docs/03-security/PRIVACY_SECURITY' }
        ]
      },
      {
        text: 'Deployment және интеграциялар',
        items: [
          { text: 'Deployment portal', link: '/docs/06-operations/DEPLOYMENT_PORTAL' },
          { text: 'Environment & integrations', link: '/docs/06-operations/ENV_INTEGRATIONS_REFERENCE' },
          { text: 'Backend deployment', link: '/docs/06-operations/DEPLOYMENT' },
          { text: 'Front deployment', link: '/docs/06-operations/FRONT_DEPLOYMENT' },
          { text: 'Admin deployment', link: '/docs/06-operations/ADMIN_DEPLOYMENT' },
          { text: 'Release preflight', link: '/docs/06-operations/RELEASE_PREFLIGHT' },
          { text: 'Evidence storage', link: '/docs/06-operations/EVIDENCE_STORAGE' },
          { text: 'Notification SMTP', link: '/docs/06-operations/NOTIFICATION_SMTP' },
          { text: 'Monitoring', link: '/docs/06-operations/MONITORING' },
          { text: 'Backup & restore', link: '/docs/06-operations/BACKUP_RESTORE' },
          { text: 'Owner checklist', link: '/docs/06-operations/OWNER_CHECKLIST' }
        ]
      },
      {
        text: 'Delivery',
        items: [
          { text: 'Implementation status', link: '/docs/04-delivery/IMPLEMENTATION_STATUS' },
          { text: 'Roadmap', link: '/docs/04-delivery/ROADMAP' },
          { text: 'Release checklist', link: '/docs/06-operations/RELEASE_CHECKLIST' },
          { text: 'Final release handoff', link: '/docs/06-operations/FINAL_RELEASE_HANDOFF' }
        ]
      },
      {
        text: 'Governance',
        items: [
          { text: 'Open questions', link: '/docs/05-governance/OPEN_QUESTIONS' },
          { text: 'ADRs', link: '/adr/' }
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/nurgeldiserikbay/QaryzLinkDocs' }
    ],
    search: {
      provider: 'local'
    },
    outline: {
      level: [2, 3],
      label: 'Бұл бетте'
    },
    docFooter: {
      prev: 'Алдыңғы бет',
      next: 'Келесі бет'
    },
    lastUpdated: {
      text: 'Соңғы жаңарту'
    }
  }
});
