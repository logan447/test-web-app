# Vercel Deployment Guide - Dual-Mode System

Follow these steps **on your local computer** to deploy the dual-mode system to Vercel.

## Prerequisites

- Git repository pushed to GitHub/GitLab/Bitbucket
- Branch: `claude/build-olera-platform-UL93n`

---

## Step 1: Prepare Your Local Environment

**On your local machine**, clone the repository if you haven't:

```bash
git clone <your-repo-url>
cd test-web-app
git checkout claude/build-olera-platform-UL93n
```

---

## Step 2: Install Vercel CLI

```bash
npm install -g vercel
```

---

## Step 3: Login to Vercel

```bash
vercel login
```

This will:
1. Ask for your email
2. Send verification email
3. Click link to verify

---

## Step 4: Set Up Free PostgreSQL Database

**Option A: Neon (Recommended - Free)**

1. Go to https://neon.tech
2. Sign up for free account
3. Create new project: "olera-staging"
4. Copy the connection string (looks like: `postgresql://user:pass@host/db`)

**Option B: Vercel Postgres**

1. In Vercel dashboard
2. Go to Storage tab
3. Create Postgres database
4. Copy connection string

---

## Step 5: Deploy to Vercel

Run this command in your project directory:

```bash
vercel
```

Answer the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Your account
- **Link to existing project?** → No
- **Project name?** → olera-staging (or your choice)
- **Directory?** → ./
- **Override settings?** → No

Vercel will give you a deployment URL like: `https://olera-staging-xxx.vercel.app`

---

## Step 6: Configure Environment Variables

### Option A: Via Vercel Dashboard (Easier)

1. Go to https://vercel.com/dashboard
2. Select your project (olera-staging)
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```
NEXTAUTH_SECRET=edxubqLUSAu3KBpmsvI1M5N4BHBUEYdLY+YpU+vxI0k=
DATABASE_URL=<your-postgresql-connection-string>
NEXTAUTH_URL=<your-vercel-url>
```

### Option B: Via CLI

```bash
vercel env add NEXTAUTH_SECRET
# Paste: edxubqLUSAu3KBpmsvI1M5N4BHBUEYdLY+YpU+vxI0k=

vercel env add DATABASE_URL
# Paste your PostgreSQL connection string

vercel env add NEXTAUTH_URL
# Paste your Vercel URL
```

Then redeploy:
```bash
vercel --prod
```

---

## Step 7: Run Database Migrations

After environment variables are set:

```bash
# Install dependencies locally first
npm install

# Run migrations against your staging database
DATABASE_URL="<your-connection-string>" npx prisma migrate deploy
```

---

## Step 8: Test the Deployment! 🎉

1. **Visit your Vercel URL**
2. **Sign up** as a new user
3. **Log in**
4. **Click your name/avatar** in the top right
5. **Look for "For Providers" button** in the dropdown! ✨

---

## Step 9: Test the Complete Flow

Follow this checklist:

- [ ] Sign up with new email
- [ ] Verify account created (check database)
- [ ] Log in successfully
- [ ] Account dropdown shows your name
- [ ] **"For Providers" button appears in dropdown** ✅
- [ ] Click "For Providers" → Redirects to `/provider/onboarding`
- [ ] Select provider type (Organization or Individual)
- [ ] Click "Create Provider Profile"
- [ ] Redirects to `/provider/requests`
- [ ] Dropdown now shows "Switch to Family"
- [ ] Click "Switch to Family" → Returns to family view

### Verify in Database

Connect to your staging database and run:

```sql
-- Check your user
SELECT email, name, "activeMode" FROM "User" WHERE email = 'your-email@test.com';

-- Check provider identity
SELECT u.email, pi.type, pi."onboardingComplete"
FROM "User" u
LEFT JOIN "ProviderIdentity" pi ON u.id = pi."userId"
WHERE u.email = 'your-email@test.com';
```

---

## Troubleshooting

### Build Fails

Check build logs in Vercel dashboard. Common issues:
- Missing environment variables
- TypeScript errors (should be fixed)
- Database connection (check if DATABASE_URL is set)

### "For Providers" Button Not Showing

1. **Hard refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Clear browser cache completely**
3. **Try incognito/private mode**
4. **Check browser console** for errors (F12 → Console)
5. **Verify session data** at `/mode-test` page

### Login Fails

1. Check NEXTAUTH_SECRET is set in Vercel
2. Check NEXTAUTH_URL matches your Vercel domain
3. Clear all cookies
4. Try signup instead of login with fresh email

### Database Connection Fails

1. Verify DATABASE_URL is correct
2. Check database allows connections from anywhere (0.0.0.0/0)
3. For Neon: Ensure connection pooling is enabled
4. Check Vercel logs for connection errors

---

## Quick Commands Reference

```bash
# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs <deployment-url>

# Rollback to previous deployment
vercel rollback

# Run migrations
DATABASE_URL="your-url" npx prisma migrate deploy

# Check database
DATABASE_URL="your-url" npx prisma studio
```

---

## Success Criteria

✅ You'll know it's working when:

1. You can sign up and log in
2. Account dropdown shows "For Providers" button
3. Clicking button takes you to onboarding
4. After onboarding, you can switch between modes
5. Database shows `activeMode` changing

---

## Important URLs

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Neon Dashboard**: https://console.neon.tech
- **Your Deployment**: Will be at `https://<project-name>.vercel.app`
- **Mode Test Page**: `https://<your-url>/mode-test`

---

## Need Help?

If you encounter issues:

1. Check Vercel build logs
2. Check browser console (F12)
3. Verify environment variables are set
4. Try `/mode-test` page to see session data
5. Check database connection with Prisma Studio

---

**Once deployed successfully, you'll finally see the dual-mode system working!** 🎉

The button WILL appear, mode switching WILL work, and you'll be able to toggle between Family and Provider experiences.
