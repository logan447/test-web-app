# Technical Questions Checklist for Development Team
*Use this checklist to ensure you have all the information needed for setup*

---

## 📋 Repository & Codebase

### Version Control
- [ ] What is the GitHub repository URL?
- [ ] What is the default/main branch name? (main, master, develop?)
- [ ] What branching strategy do you use? (git-flow, trunk-based, feature branches?)
- [ ] Are there any branch protection rules I should know about?
- [ ] What's the typical Git workflow? (PR process, review requirements, etc.)
- [ ] How do you handle merge conflicts?
- [ ] What commit message conventions do you follow?

### Codebase Structure
- [ ] Can you provide a high-level overview of the directory structure?
- [ ] Where is the business logic primarily located?
- [ ] How are components organized?
- [ ] Where are API routes/endpoints defined?
- [ ] What's the folder structure for pages/routes?
- [ ] Where are utilities and helper functions?
- [ ] How is styling organized? (CSS modules, Tailwind, styled-components?)

### Dependencies & Package Management
- [ ] What Node.js version is required?
- [ ] What package manager? (npm, yarn, pnpm?)
- [ ] Are there any known dependency issues or version constraints?
- [ ] How often are dependencies updated?
- [ ] Are there any custom or private packages?

---

## 🗄️ Database (PostgreSQL)

### Production Database
- [ ] What is the current database size (approximate)?
- [ ] How many tables are there?
- [ ] What's the current row count for major tables?
- [ ] Are there any particularly large or complex tables?
- [ ] What's the backup strategy?
- [ ] Who has access to production database?

### Staging Database Strategy
- [ ] Should I clone production database for staging?
- [ ] Should I create a separate, smaller staging database?
- [ ] Are there any PII/sensitive data concerns with cloning?
- [ ] How do I anonymize data if needed?
- [ ] What's the best way to keep schema in sync?
- [ ] Do you have database seed scripts?

### Schema & Migrations
- [ ] How are database migrations managed? (Prisma migrate, raw SQL, other?)
- [ ] Where are migration files located?
- [ ] What's the process for creating new migrations?
- [ ] How do you test migrations before production?
- [ ] Are there any pending migrations not yet in production?
- [ ] What's the rollback process for migrations?

### Database Access
- [ ] Will I need direct database access or just through ORM?
- [ ] What database client/tool do you recommend?
- [ ] Are there connection string templates for local/staging?
- [ ] Any connection pooling considerations?
- [ ] Are there any database-level permissions I should know about?

### Prisma ORM
- [ ] Where is the Prisma schema file?
- [ ] What Prisma version is being used?
- [ ] Are there any custom Prisma configurations?
- [ ] How do you handle Prisma Client generation?
- [ ] Any known Prisma-related gotchas?

---

## 🎨 Sanity CMS

### Sanity Setup
- [ ] What Sanity project ID is used for production?
- [ ] Should staging use a separate Sanity project or separate dataset?
- [ ] Where is Sanity configuration located in the codebase?
- [ ] What Sanity version/libraries are being used?
- [ ] Are there any Sanity plugins or custom input components?

### Content Schema
- [ ] Can you provide documentation or overview of Sanity schemas?
- [ ] What are the main content types/documents?
- [ ] How are providers/listings structured in Sanity?
- [ ] Are there any complex content relationships?
- [ ] How is content versioning handled?
- [ ] What's the content review/publishing workflow?

### Content Flow
- [ ] How does content get from Sanity to the Next.js app?
- [ ] Is content fetched at build time (SSG), request time (SSR), or both?
- [ ] Are there any caching layers for Sanity content?
- [ ] How often does content update?
- [ ] Are there any Sanity webhooks triggering rebuilds?
- [ ] How do you preview unpublished content?

### Local Development
- [ ] How do I develop against Sanity locally?
- [ ] Do I need Sanity Studio access?
- [ ] What are the authentication requirements?
- [ ] Can I run Sanity Studio locally?
- [ ] What's the process for making schema changes?

---

## 🔐 Environment Variables & Secrets

### Required Variables
- [ ] What are ALL environment variables needed for local dev?
- [ ] What are the differences between local/staging/production env vars?
- [ ] Can you provide a `.env.example` template?
- [ ] Which variables are secrets vs. configuration?
- [ ] Where are secrets stored? (Vercel, 1Password, other?)

### Third-Party Service Credentials

#### Stripe
- [ ] What Stripe account/mode is used? (test/live)
- [ ] Do I need separate Stripe test keys for staging?
- [ ] What Stripe products/prices are configured?
- [ ] Are there any Stripe webhooks?
- [ ] What webhook signing secrets are needed?

#### Loops (Email)
- [ ] What Loops API key do I need?
- [ ] Should staging use a separate Loops environment?
- [ ] What email templates/transactional emails exist?
- [ ] Are there any email-triggered workflows?
- [ ] How do you test emails locally/staging?

#### Analytics & Monitoring
- [ ] What analytics services are integrated? (Google Analytics, Mixpanel, etc.)
- [ ] Should staging use separate analytics properties?
- [ ] Any error monitoring? (Sentry, Rollbar, etc.)
- [ ] Performance monitoring? (Vercel Analytics, other?)
- [ ] Logging services?

#### Other Services
- [ ] Any search services? (Algolia, Elasticsearch, etc.)
- [ ] Image hosting/CDN? (Cloudinary, Vercel, other?)
- [ ] Authentication services beyond NextAuth?
- [ ] Any AI/ML APIs?
- [ ] Background job processors?
- [ ] Any other APIs or services I should know about?

### Webhooks
- [ ] What incoming webhooks are configured? (Stripe, Sanity, etc.)
- [ ] How should webhooks be configured for staging?
- [ ] Are there any webhook secrets/signatures to verify?
- [ ] How do you test webhooks locally? (webhook forwarding tools?)
- [ ] Any outgoing webhooks to third parties?

---

## ☁️ Vercel Deployment

### Production Setup
- [ ] What Vercel account/team is production under?
- [ ] What's the production Vercel project name?
- [ ] What domain(s) are connected? (olera.care, www.olera.care)
- [ ] What's the production deployment branch? (main, master?)
- [ ] Are automatic deployments enabled?
- [ ] What environment variables are set in Vercel production?

### Build Configuration
- [ ] What build command is used? (`next build`, custom script?)
- [ ] What output directory? (`.next`, `out`?)
- [ ] What Node.js version is specified?
- [ ] Are there any build-time environment variables?
- [ ] How long does a typical build take?
- [ ] Any custom build steps or scripts?

### Framework & Rendering
- [ ] What Next.js version?
- [ ] What rendering modes are used? (SSG, SSR, ISR, client-side?)
- [ ] Are there any API routes?
- [ ] Middleware configuration?
- [ ] Any edge functions or edge config?
- [ ] Image optimization settings?

### Deployment Process
- [ ] What triggers a production deployment? (push to main, manual?)
- [ ] Who has deployment permissions?
- [ ] Is there a deployment checklist or approval process?
- [ ] How long does deployment take?
- [ ] How do you monitor deployment success?
- [ ] What's the rollback process?

### Preview Deployments
- [ ] Are preview deployments currently used?
- [ ] What branches get preview deployments?
- [ ] How are preview URLs accessed?
- [ ] Do previews have separate environment variables?
- [ ] Are preview deployments password-protected?

### Staging Environment
- [ ] Does a staging environment already exist?
- [ ] What's the staging URL?
- [ ] How is staging different from production?
- [ ] When/how is staging deployed?
- [ ] What environment variables differ in staging?

---

## 🔧 Local Development Setup

### Getting Started
- [ ] What's the typical local setup process? (step-by-step)
- [ ] What commands to install dependencies? (`npm install`, `npm ci`?)
- [ ] What commands to start dev server? (`npm run dev`?)
- [ ] What port does local dev run on? (3000, 3001, other?)
- [ ] How long does initial setup typically take?

### Database Setup Locally
- [ ] Do developers run PostgreSQL locally or connect to remote?
- [ ] How do you create/seed local database?
- [ ] What's the local database connection string format?
- [ ] Any Docker containers for local database?
- [ ] How do you run migrations locally?

### Environment Setup
- [ ] Where should I put my `.env.local` file?
- [ ] What's the minimum set of env vars for local dev?
- [ ] Are there any `localhost` URLs I need to configure?
- [ ] Any hosts file entries needed?
- [ ] Any local SSL/HTTPS requirements?

### Development Workflow
- [ ] What's the typical feature development workflow?
- [ ] How do you test changes locally?
- [ ] Any linting or formatting tools? (ESLint, Prettier)
- [ ] Pre-commit hooks?
- [ ] How do you test API routes locally?
- [ ] How do you test Sanity integration locally?

### Troubleshooting
- [ ] What are common local setup issues?
- [ ] Who should I ask if I get stuck?
- [ ] Any debugging tools or tips?
- [ ] Known platform-specific issues? (Mac/Windows/Linux)

---

## 🧪 Testing & Quality Assurance

### Testing Setup
- [ ] What testing frameworks are used? (Jest, Vitest, Playwright?)
- [ ] Where are test files located?
- [ ] What's the command to run tests? (`npm test`, other?)
- [ ] Are there unit tests, integration tests, e2e tests?
- [ ] What's the current test coverage?
- [ ] Are tests run in CI/CD?

### Pre-deployment Checks
- [ ] Is there a pre-deployment checklist?
- [ ] Any manual testing required before production?
- [ ] Who does QA review?
- [ ] Any automated checks before deploy? (tests, linting, type checking)
- [ ] Load testing or performance checks?

### Code Quality
- [ ] TypeScript configuration and strictness level?
- [ ] ESLint rules and configuration?
- [ ] Prettier configuration?
- [ ] Any code review guidelines?
- [ ] Branch protection requiring reviews?

---

## 🚨 Production & Monitoring

### Production Health
- [ ] How do you monitor production health?
- [ ] What metrics are tracked?
- [ ] Any uptime monitoring? (UptimeRobot, Pingdom, etc.)
- [ ] Error rate tracking?
- [ ] Performance monitoring?
- [ ] Database performance monitoring?

### Incident Response
- [ ] What's the process if production goes down?
- [ ] Who gets alerted?
- [ ] What's the rollback process?
- [ ] Post-incident review process?
- [ ] Any on-call rotation?

### Maintenance
- [ ] Regular maintenance windows?
- [ ] How are users notified of maintenance?
- [ ] Database backup schedule and process?
- [ ] How often are dependencies updated?
- [ ] Security patching process?

---

## 👥 Team & Communication

### Roles & Responsibilities
- [ ] Who are the key people on the dev team?
- [ ] Who should I contact for:
  - [ ] Database questions?
  - [ ] Sanity CMS questions?
  - [ ] Deployment issues?
  - [ ] Architecture questions?
  - [ ] Emergency production issues?

### Communication
- [ ] What's the best way to reach the team? (Slack, email, etc.)
- [ ] How quickly can I expect responses?
- [ ] Are there regular team meetings I should know about?
- [ ] How should I share updates on my staging work?
- [ ] How should we coordinate production deployments?

### Ongoing Coordination
- [ ] Should we set up regular sync meetings?
- [ ] How often should I update you on staging progress?
- [ ] How much advance notice for production deployments?
- [ ] What's the process for urgent/hotfix deployments?
- [ ] How do we handle conflicts or blocking issues?

---

## 📝 Documentation

### Existing Documentation
- [ ] Where is existing documentation located?
- [ ] Architecture overview or diagrams?
- [ ] API documentation?
- [ ] Onboarding guide for new developers?
- [ ] Troubleshooting guide?
- [ ] Coding standards or style guide?

### Documentation I'll Create
- [ ] Where should I document my staging setup?
- [ ] How should I document new features I build?
- [ ] Format preference for documentation? (Markdown, Notion, etc.)
- [ ] Should I add inline code comments?
- [ ] Should I create ADRs (Architecture Decision Records)?

---

## 🎯 Current Work & Roadmap

### Active Development
- [ ] What features are you currently working on?
- [ ] What's the current sprint/iteration timeline?
- [ ] Are there any branches I should be aware of?
- [ ] Any upcoming changes that might affect my staging setup?
- [ ] Any known bugs or issues being worked on?

### Future Plans
- [ ] What's on the product roadmap for next 3-6 months?
- [ ] Any major refactors or migrations planned?
- [ ] Any technology stack changes planned?
- [ ] How does my staging work fit into the roadmap?

---

## ⚠️ Known Issues & Gotchas

### Known Issues
- [ ] Any known bugs in production?
- [ ] Any technical debt areas to be aware of?
- [ ] Any parts of codebase that are "fragile"?
- [ ] Any performance bottlenecks?
- [ ] Any browser compatibility issues?

### Gotchas & Warnings
- [ ] What should I absolutely NOT touch/change?
- [ ] Any dangerous operations to avoid?
- [ ] Any complexity hotspots that need special care?
- [ ] Common mistakes new developers make?
- [ ] Any "here be dragons" areas of the code?

---

## ✅ Access Checklist

Before I can start, I need:

- [ ] **GitHub repository access** (read or write)
- [ ] **Vercel account access** (viewer for production, admin for my staging)
- [ ] **Database access** (connection string or credentials)
- [ ] **Sanity CMS access** (project access, studio access if needed)
- [ ] **Environment variables** (all required env vars)
- [ ] **Stripe account** (test mode access if needed)
- [ ] **Loops account** (API access or separate environment)
- [ ] **Documentation access** (wherever docs are stored)
- [ ] **Communication channels** (Slack workspace, etc.)

---

## 🎉 Success Criteria

I'll know I'm set up successfully when I can:

- [ ] Clone the repository locally
- [ ] Install dependencies without errors
- [ ] Run the development server locally
- [ ] See the site running on localhost
- [ ] Connect to database successfully
- [ ] Fetch content from Sanity
- [ ] Deploy to my own Vercel staging project
- [ ] Make a test change and see it in staging
- [ ] Run tests (if they exist)
- [ ] Navigate all pages without errors

---

**Questions or clarifications?** Don't hesitate to reach out!
