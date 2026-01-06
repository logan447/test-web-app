# Quick Start Guide - Olera

Get Olera running in 5 minutes! 🚀

---

## Super Quick Setup (Docker)

If you have Docker installed, run these commands:

```bash
# 1. Set up PostgreSQL with Docker
./scripts/setup-docker-db.sh

# 2. Install dependencies
npm install

# 3. Set up database tables
npx prisma migrate dev --name init

# 4. Start the app
npm run dev
```

**Windows users:** Use `scripts\setup-docker-db.bat` instead

Open http://localhost:3000 and you're done! 🎉

---

## Step-by-Step (First Time)

### 1. Set Up PostgreSQL

**Option A - Docker (Recommended):**
```bash
docker run --name olera-postgres \
  -e POSTGRES_USER=olera_user \
  -e POSTGRES_PASSWORD=olera_pass \
  -e POSTGRES_DB=olera \
  -p 5432:5432 \
  -d postgres:15
```

**Option B - Already have PostgreSQL?**
- Create a database named `olera`
- Update the `DATABASE_URL` in `.env` file with your credentials

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Database
```bash
npx prisma migrate dev --name init
```

This creates all your tables (Users, Providers, FamilyProfiles, etc.)

### 4. Start the App
```bash
npm run dev
```

### 5. Open Your Browser
Go to http://localhost:3000

---

## Test It Out

1. Click "Get Started"
2. Choose "Family Member" or "Care Provider"
3. Fill in your details and create an account
4. You'll be redirected to your dashboard

**It works!** 🎉

---

## Troubleshooting

### Can't connect to database?

**Docker users:**
```bash
docker ps  # Check if running
docker start olera-postgres  # Start if stopped
```

**Local PostgreSQL users:**
- Check if PostgreSQL service is running
- Verify your DATABASE_URL in `.env` is correct

### Port 3000 already in use?
```bash
PORT=3001 npm run dev
```

### Still having issues?
Run the setup checker:
```bash
./scripts/check-setup.sh
```

---

## Daily Use

**Start PostgreSQL (Docker):**
```bash
docker start olera-postgres
```

**Start the app:**
```bash
npm run dev
```

**View database:**
```bash
npx prisma studio
```

---

## Need More Help?

See **SETUP.md** for detailed instructions and all setup options.

---

## What's Next?

Once you have the app running:

✅ Homepage works
✅ Can sign up and sign in
✅ Dashboard loads

**Ready to build Phase 2-5 features!**

- Phase 2: Provider Directory & Search
- Phase 3: Family Care Profiles
- Phase 4: Matching & Requests
- Phase 5: Communication System
