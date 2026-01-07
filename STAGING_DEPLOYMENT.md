# Deploying Dual-Mode System to Staging

## Option 1: Vercel (Recommended for Next.js)

### Prerequisites
- Vercel account (free tier works)
- PostgreSQL database (can use Vercel Postgres or external like Railway/Neon)

### Steps

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Create staging deployment**
```bash
# From your project directory
git checkout claude/build-olera-platform-UL93n
vercel --prod=false
```

4. **Set environment variables in Vercel dashboard:**
- Go to project settings → Environment Variables
- Add:
  - `DATABASE_URL` - Your PostgreSQL connection string
  - `NEXTAUTH_SECRET` - Run: `openssl rand -base64 32`
  - `NEXTAUTH_URL` - Your Vercel staging URL

5. **Run database migration**
```bash
# After deployment, run migrations
npx prisma migrate deploy
```

6. **Test the deployment:**
- Visit your Vercel staging URL
- Sign up as new user
- Check account dropdown for "For Providers" button

---

## Option 2: Railway (Includes Database)

### Steps

1. **Install Railway CLI**
```bash
npm i -g @railway/cli
```

2. **Login**
```bash
railway login
```

3. **Create new project**
```bash
railway init
```

4. **Add PostgreSQL**
```bash
railway add postgresql
```

5. **Deploy**
```bash
git checkout claude/build-olera-platform-UL93n
railway up
```

6. **Run migrations**
```bash
railway run npx prisma migrate deploy
```

---

## Option 3: Manual Server Deployment

### Prerequisites
- Linux server with Node.js 18+
- PostgreSQL installed

### Steps

1. **Clone repository on server**
```bash
git clone <your-repo-url>
cd test-web-app
git checkout claude/build-olera-platform-UL93n
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your production values
```

4. **Run migrations**
```bash
npx prisma migrate deploy
```

5. **Build application**
```bash
npm run build
```

6. **Start with PM2**
```bash
npm install -g pm2
pm2 start npm --name "olera-staging" -- start
```

---

## Testing Checklist

Once deployed, test this flow:

- [ ] Visit staging URL
- [ ] Sign up as new user (use unique email)
- [ ] Verify account is created in database
- [ ] Log in successfully
- [ ] Click account dropdown (avatar/name in top right)
- [ ] **Verify "For Providers" button appears**
- [ ] Click "For Providers" → Should redirect to `/provider/onboarding`
- [ ] Select provider type (Organization or Individual)
- [ ] Click "Create Provider Profile"
- [ ] Should redirect to `/provider/requests`
- [ ] Open dropdown again → Should now show "Switch to Family"
- [ ] Click "Switch to Family" → Returns to family view
- [ ] Verify database shows mode changes

### Database Verification

Connect to staging database and run:

```sql
-- Check user mode
SELECT email, name, "activeMode" FROM "User" WHERE email = 'your-test-email';

-- Check provider identity
SELECT u.email, pi.type, pi."onboardingComplete"
FROM "User" u
LEFT JOIN "ProviderIdentity" pi ON u.id = pi."userId"
WHERE u.email = 'your-test-email';
```

---

## Troubleshooting

### Button still not showing
1. Clear browser cache completely
2. Try in incognito/private mode
3. Check browser console for errors
4. Verify database has `activeMode` field:
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'User' AND column_name = 'activeMode';
   ```

### Login fails
1. Check `NEXTAUTH_SECRET` is set
2. Check `NEXTAUTH_URL` matches your domain
3. Verify database connection string is correct
4. Check server logs for authentication errors

### Migrations fail
1. Ensure database user has CREATE permissions
2. Check if migration already ran: `SELECT * FROM "_prisma_migrations";`
3. Try: `npx prisma migrate resolve --applied <migration-name>`

---

## Quick Test with Vercel (No Account Needed)

If you just want to test quickly without setting up staging:

```bash
# Deploy as preview
vercel

# This gives you a temporary URL to test
# Note: You'll need to set up a database first
```

