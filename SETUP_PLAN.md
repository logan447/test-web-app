# Staging Setup Plan: Step-by-Step Guide

*This document will be populated once you receive access from the development team*

---

## 📋 Prerequisites

Before starting, ensure you have:

- [ ] GitHub repository access (fork or direct access)
- [ ] All environment variables from dev team
- [ ] Database connection string or access
- [ ] Sanity CMS access credentials
- [ ] Vercel account set up
- [ ] Node.js installed (version TBD from dev team)
- [ ] PostgreSQL client installed (optional, for debugging)
- [ ] Git configured on your machine

---

## Phase 1: Repository Setup

### Option A: If Using Fork Model (Recommended)

#### Step 1: Fork the Repository
```bash
# Navigate to the original repository on GitHub
# Click "Fork" button in top-right
# Fork to your personal GitHub account
```

#### Step 2: Clone Your Fork Locally
```bash
# Clone your fork
git clone https://github.com/[YOUR-USERNAME]/[REPO-NAME].git

# Navigate into directory
cd [REPO-NAME]

# Add upstream remote (to sync with original repo later)
git remote add upstream https://github.com/[DEV-TEAM-USERNAME]/[REPO-NAME].git

# Verify remotes
git remote -v
# Should show:
# origin    https://github.com/[YOUR-USERNAME]/[REPO-NAME].git (fetch)
# origin    https://github.com/[YOUR-USERNAME]/[REPO-NAME].git (push)
# upstream  https://github.com/[DEV-TEAM-USERNAME]/[REPO-NAME].git (fetch)
# upstream  https://github.com/[DEV-TEAM-USERNAME]/[REPO-NAME].git (push)
```

#### Step 3: Create Development Branch
```bash
# Create and switch to development branch
git checkout -b staging-development

# Or for specific features:
git checkout -b feature/your-feature-name
```

---

### Option B: If Using Shared Repository

#### Step 1: Clone the Repository
```bash
# Clone the main repository
git clone https://github.com/[DEV-TEAM-USERNAME]/[REPO-NAME].git

# Navigate into directory
cd [REPO-NAME]
```

#### Step 2: Create Your Working Branch
```bash
# Create your staging branch
git checkout -b [your-name]/staging

# Or create feature branches as needed:
git checkout -b [your-name]/feature-name
```

---

## Phase 2: Local Development Setup

### Step 1: Install Dependencies
```bash
# Check Node.js version (use version specified by dev team)
node --version

# If wrong version, use nvm to install correct version:
# nvm install [VERSION]
# nvm use [VERSION]

# Install dependencies
npm install
# or
npm ci  # if you want clean install based on package-lock.json
```

### Step 2: Set Up Environment Variables
```bash
# Create .env.local file in root directory
touch .env.local

# Add all environment variables from dev team
# Use the template they provide
```

**.env.local Template** (to be filled in with actual values):
```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID="..."
NEXT_PUBLIC_SANITY_DATASET="..."
SANITY_API_TOKEN="..."

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Loops (Email)
LOOPS_API_KEY="..."

# Add any other variables as specified by dev team
```

### Step 3: Set Up Database

#### Option A: Connect to Remote Staging Database
```bash
# If dev team provides staging database URL, use that in .env.local
DATABASE_URL="postgresql://[staging-db-url]"
```

#### Option B: Set Up Local Database
```bash
# If you need local PostgreSQL:

# 1. Ensure PostgreSQL is running locally

# 2. Create database
createdb olera_staging

# 3. Update DATABASE_URL in .env.local
DATABASE_URL="postgresql://localhost:5432/olera_staging"

# 4. Run migrations (if using Prisma)
npx prisma migrate dev

# 5. Seed database (if seed script exists)
npm run seed
# or
npx prisma db seed
```

### Step 4: Generate Prisma Client (if applicable)
```bash
# Generate Prisma client
npx prisma generate

# View database in Prisma Studio (optional)
npx prisma studio
```

### Step 5: Start Development Server
```bash
# Start the Next.js development server
npm run dev

# Server should start on http://localhost:3000 (or port specified)
```

### Step 6: Verify Local Setup
- [ ] Navigate to http://localhost:3000
- [ ] Site loads without errors
- [ ] Can navigate between pages
- [ ] Can see data from Sanity CMS
- [ ] Database connection works
- [ ] No console errors in browser
- [ ] Images load correctly

---

## Phase 3: Vercel Staging Setup

### Step 1: Create Vercel Account (if needed)
- Go to https://vercel.com
- Sign up with GitHub account
- Complete account setup

### Step 2: Create New Vercel Project
```bash
# Option A: Via Vercel CLI
npm install -g vercel
vercel login
cd [your-repo-directory]
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: olera-staging (or your preferred name)
# - Directory: ./ (root)
# - Override settings? No (use defaults)

# Option B: Via Vercel Dashboard
# 1. Go to https://vercel.com/new
# 2. Import Git Repository
# 3. Select your forked repository
# 4. Configure project settings
# 5. Click "Deploy"
```

### Step 3: Configure Environment Variables in Vercel
```bash
# Via Vercel Dashboard:
# 1. Go to your project
# 2. Settings → Environment Variables
# 3. Add all variables from your .env.local
# 4. Set environment: Production, Preview, Development (as needed)

# Via Vercel CLI:
vercel env add DATABASE_URL
# Paste value when prompted
# Select environment: Production

# Repeat for each environment variable
```

**Important Variables to Set:**
- [ ] DATABASE_URL (staging database)
- [ ] NEXTAUTH_SECRET
- [ ] NEXTAUTH_URL (set to your Vercel staging URL)
- [ ] Sanity credentials
- [ ] Stripe keys (test mode)
- [ ] Loops API key
- [ ] Any other required variables

### Step 4: Configure Build Settings
```bash
# In Vercel Dashboard → Project Settings → General:

# Build Command (if different from default):
# npm run build

# Output Directory:
# .next

# Install Command:
# npm install

# Root Directory:
# ./

# Node.js Version:
# [Version specified by dev team, e.g., 18.x]
```

### Step 5: Configure Git Integration
```bash
# In Vercel Dashboard → Project Settings → Git:

# Production Branch:
# main (or staging-production, or your preferred branch)

# Preview Deployments:
# Enable automatic deployments for:
#   - All branches
#   OR
#   - Specific branches: staging-development, feature/*

# Deployment Protection:
# [ ] Vercel Authentication (optional, for private staging)
```

### Step 6: Deploy to Staging
```bash
# Push to your repo to trigger deployment
git add .
git commit -m "Initial staging setup"
git push origin [your-branch-name]

# Vercel will automatically deploy

# Or deploy manually:
vercel --prod  # Deploy to production environment
vercel         # Deploy to preview environment
```

### Step 7: Verify Staging Deployment
- [ ] Visit your Vercel staging URL: https://[project-name].vercel.app
- [ ] Site loads correctly
- [ ] All pages accessible
- [ ] Data from Sanity CMS loads
- [ ] Database queries work
- [ ] No errors in browser console
- [ ] No build/deployment errors in Vercel logs

---

## Phase 4: Configure Claude Code

### Step 1: Open Repository in Claude Code
```bash
# If using cursor or VS Code with Claude Code extension:
code [repo-directory]

# Or open Claude Code interface and navigate to repository
```

### Step 2: Configure Claude Code Session
```bash
# Ensure Claude Code is connected to the correct repository
# Verify git remotes are correct:
git remote -v

# Ensure you're on the right branch:
git branch --show-current
```

### Step 3: Test Claude Code Workflow
1. Make a small test change (e.g., update a comment)
2. Ask Claude Code to commit the change
3. Push to your repository
4. Verify Vercel auto-deploys the change
5. Check staging URL to see the change

---

## Phase 5: Sync Workflow Setup

### Keeping Your Fork in Sync (If Using Fork Model)

```bash
# Periodically sync with upstream (dev team's repo)

# 1. Fetch latest from upstream
git fetch upstream

# 2. Checkout your main/master branch
git checkout main

# 3. Merge upstream changes
git merge upstream/main

# 4. Push to your fork
git push origin main

# 5. Merge into your working branch
git checkout staging-development
git merge main

# Or rebase your working branch:
git rebase main
```

**Recommended Sync Frequency:**
- Before starting new feature work
- Weekly (if dev team is actively developing)
- Before coordinating production deployment

---

## Phase 6: First Feature Test

### Goal: Validate the Entire Workflow

**Test Feature:** Make a small UI change (e.g., update homepage heading)

#### Step 1: Create Feature Branch
```bash
git checkout -b test-feature-workflow
```

#### Step 2: Make a Small Change
```typescript
// Example: Update a heading in a page component
// app/page.tsx

export default function HomePage() {
  return (
    <div>
      <h1>Welcome to Olera - TEST UPDATE</h1>
      {/* rest of component */}
    </div>
  )
}
```

#### Step 3: Test Locally
```bash
# Ensure dev server is running
npm run dev

# Navigate to http://localhost:3000
# Verify your change appears
```

#### Step 4: Commit and Push
```bash
git add .
git commit -m "Test: Update homepage heading to validate workflow"
git push origin test-feature-workflow
```

#### Step 5: Verify Staging Deployment
- Go to Vercel Dashboard
- Check that preview deployment was triggered
- Visit preview URL
- Verify your change appears

#### Step 6: Review & Validate
- [ ] Change appears correctly
- [ ] No console errors
- [ ] No build errors
- [ ] All other pages still work
- [ ] Database connections work
- [ ] Sanity content loads

#### Step 7: Clean Up Test
```bash
# If test was successful, revert the change
git checkout staging-development
git branch -D test-feature-workflow

# Or keep the branch for reference
```

---

## Phase 7: Coordination Setup

### Set Up Communication with Dev Team

#### Regular Sync Meeting
- **Frequency:** Weekly or bi-weekly
- **Duration:** 15-30 minutes
- **Agenda:**
  - My staging progress/updates
  - Upcoming features I'm working on
  - Any blockers or questions
  - Coordinating production deployments
  - Syncing forks (if applicable)

#### Production Deployment Process

**When I Have a Feature Ready for Production:**

1. **Notify Dev Team:**
   ```
   Subject: Ready for Production: [Feature Name]

   Hi team,

   I have [feature name] fully tested and validated in staging:
   - Staging URL: [link]
   - Branch: [branch-name]
   - Test results: [summary]
   - Known limitations: [any]

   Proposed deployment: [date/time]

   Please review and let me know if you need anything else.
   ```

2. **Coordination Options:**
   - **Option A:** Send PR to dev team repo, they deploy
   - **Option B:** They review, I deploy with their approval
   - **Option C:** We schedule pairing session to deploy together

3. **Post-Deployment:**
   - Monitor production for issues
   - Verify feature works in production
   - Update documentation if needed

---

## Ongoing Workflow

### Daily Development Flow

```bash
# 1. Start your day
git checkout staging-development
git pull origin staging-development

# Sync with upstream if using fork:
git fetch upstream
git merge upstream/main

# 2. Create feature branch
git checkout -b feature/new-feature-name

# 3. Work with Claude Code
# - Make changes
# - Test locally (npm run dev)
# - Iterate quickly

# 4. Commit often
git add .
git commit -m "Add: [clear description of change]"

# 5. Push to trigger preview deployment
git push origin feature/new-feature-name

# 6. Review in Vercel preview
# - Check preview URL
# - Test thoroughly
# - Validate feature

# 7. When ready, merge to staging-development
git checkout staging-development
git merge feature/new-feature-name
git push origin staging-development

# 8. Coordinate production deployment with dev team
```

---

## Troubleshooting

### Common Issues & Solutions

#### Build Fails in Vercel
```bash
# Check Vercel build logs for specific error
# Common causes:
# - Missing environment variables
# - TypeScript errors
# - Failed dependency installation
# - Wrong Node.js version

# Solutions:
# - Verify all env vars are set in Vercel
# - Run `npm run build` locally to catch errors
# - Check Node.js version matches
# - Review build logs in Vercel dashboard
```

#### Database Connection Fails
```bash
# Check:
# - DATABASE_URL is correct in Vercel env vars
# - Database is accessible from Vercel (firewall rules)
# - Connection string format is correct
# - Database exists and has correct schema

# Test locally first:
# - Update .env.local with staging DB URL
# - Run npm run dev
# - Check if database queries work
```

#### Sanity Content Not Loading
```bash
# Check:
# - Sanity credentials are correct
# - NEXT_PUBLIC_SANITY_PROJECT_ID is set (public var)
# - SANITY_API_TOKEN has correct permissions
# - Sanity dataset is correct (production vs staging)
# - Network requests in browser console

# Test in browser console:
# - Check if Sanity API requests are succeeding
# - Verify correct project ID in requests
```

#### Merge Conflicts When Syncing Fork
```bash
# When merging upstream into your fork:
git fetch upstream
git checkout main
git merge upstream/main

# If conflicts occur:
# 1. Resolve conflicts in editor
# 2. Stage resolved files: git add [file]
# 3. Complete merge: git commit
# 4. Push to your fork: git push origin main
```

---

## Success Checklist

You'll know you're fully set up when:

- [ ] ✅ Local development works perfectly
- [ ] ✅ Can make changes and see them immediately
- [ ] ✅ Vercel staging auto-deploys on push
- [ ] ✅ Staging environment matches production functionality
- [ ] ✅ Database queries work in staging
- [ ] ✅ Sanity content loads correctly
- [ ] ✅ Can iterate quickly with Claude Code
- [ ] ✅ Can coordinate deployments with dev team
- [ ] ✅ Have clear communication channel with team
- [ ] ✅ Understand how to sync fork (if applicable)
- [ ] ✅ Know how to troubleshoot common issues

---

## Next Steps After Setup

Once your staging environment is running smoothly:

1. **Resume UX/UI Audit:**
   - Use `AUDIT_JOURNEY_MAPS.md` as guide
   - Start with Phase 1: Family Journey
   - Document findings in audit report

2. **Identify Quick Wins:**
   - Low-effort, high-impact improvements
   - Test in staging
   - Build confidence with deployment process

3. **Plan First Production Feature:**
   - Choose a validated improvement
   - Coordinate with dev team
   - Execute first production deployment

4. **Establish Regular Cadence:**
   - Weekly staging iterations
   - Bi-weekly production deployments
   - Monthly product planning

---

**Remember:** The goal is to move fast while keeping production stable. Don't hesitate to ask the dev team questions early - better to clarify than to break production!

**Good luck!** 🚀
