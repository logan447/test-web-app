# Olera Setup Guide

Follow these steps to get Olera running on your machine.

---

## Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **PostgreSQL** - Choose one option below

---

## Step 1: Choose Your PostgreSQL Setup

### Option A: Docker (Easiest - Recommended)

**Requirements:** Docker installed ([Get Docker](https://www.docker.com/get-started))

**Start PostgreSQL:**
```bash
docker run --name olera-postgres \
  -e POSTGRES_USER=olera_user \
  -e POSTGRES_PASSWORD=olera_pass \
  -e POSTGRES_DB=olera \
  -p 5432:5432 \
  -d postgres:15
```

**Check it's running:**
```bash
docker ps
```

You should see `olera-postgres` in the list.

**Stop PostgreSQL (when needed):**
```bash
docker stop olera-postgres
```

**Start PostgreSQL again (after stopping):**
```bash
docker start olera-postgres
```

**Remove PostgreSQL (to start fresh):**
```bash
docker stop olera-postgres
docker rm olera-postgres
```

---

### Option B: Local PostgreSQL Installation

#### On macOS:
```bash
brew install postgresql@15
brew services start postgresql@15
createdb olera
```

**Update your .env file:**
```
DATABASE_URL="postgresql://YOUR_USERNAME@localhost:5432/olera?schema=public"
```
(Replace YOUR_USERNAME with your macOS username)

#### On Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres createdb olera
sudo -u postgres createuser olera_user -P
# Enter password: olera_pass
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE olera TO olera_user;"
```

#### On Windows:
1. Download PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run the installer (use default port 5432)
3. Remember the password you set for the `postgres` user
4. Open pgAdmin or psql and create a database named `olera`

**Update your .env file:**
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/olera?schema=public"
```

---

### Option C: Cloud PostgreSQL (Supabase/Heroku/Railway)

#### Supabase (Free tier available):
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the "Connection string" (URI format)
5. Paste it into your `.env` as `DATABASE_URL`

#### Railway (Free tier available):
1. Go to [railway.app](https://railway.app)
2. Create a new project → Add PostgreSQL
3. Click on PostgreSQL → Connect → Copy the connection string
4. Paste it into your `.env` as `DATABASE_URL`

---

## Step 2: Verify Database Connection

The `.env` file has already been configured for Docker setup. If you used a different option, make sure your `DATABASE_URL` is correct:

```bash
cat .env
```

You should see:
```
DATABASE_URL="postgresql://olera_user:olera_pass@localhost:5432/olera?schema=public"
```

---

## Step 3: Install Dependencies

```bash
npm install
```

This will:
- Install all required packages
- Generate the Prisma Client

---

## Step 4: Set Up the Database

Run the database migrations to create all tables:

```bash
npx prisma migrate dev --name init
```

This creates all the tables (Users, Providers, FamilyProfiles, etc.) in your database.

**Verify it worked:**
```bash
npx prisma studio
```

This opens a visual database browser at http://localhost:5555. You should see all your tables (empty for now).

---

## Step 5: Start the Development Server

```bash
npm run dev
```

You should see:
```
▲ Next.js 15.x.x
- Local:        http://localhost:3000
- Ready in X.Xs
```

---

## Step 6: Test the Application

1. **Open your browser:** http://localhost:3000
   - You should see the Olera homepage

2. **Create an account:**
   - Click "Get Started" or "Sign Up"
   - Choose "Family Member" or "Care Provider"
   - Fill in your details
   - Create an account

3. **You'll be redirected to the dashboard**
   - This confirms authentication is working!

4. **Test sign out and sign in:**
   - Sign out from the dashboard
   - Sign back in with your credentials

---

## Common Issues & Fixes

### Issue: "Can't reach database server"

**Fix:** Make sure PostgreSQL is running:

**Docker:**
```bash
docker ps
# If not running:
docker start olera-postgres
```

**Local PostgreSQL:**
```bash
# macOS
brew services list

# Linux
sudo systemctl status postgresql

# Windows
# Check Services app for "postgresql" service
```

### Issue: "P1001: Can't reach database"

**Fix:** Check your DATABASE_URL in `.env`:
- Username and password are correct
- Port is 5432 (default)
- Database name matches what you created

### Issue: Port 3000 already in use

**Fix:** Kill the process using port 3000:
```bash
# Find the process
lsof -i :3000

# Kill it (replace PID with the number from above)
kill -9 PID
```

Or use a different port:
```bash
PORT=3001 npm run dev
```

### Issue: "Module not found" errors

**Fix:** Reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Quick Reference Commands

```bash
# Start PostgreSQL (Docker)
docker start olera-postgres

# Stop PostgreSQL (Docker)
docker stop olera-postgres

# View database (GUI)
npx prisma studio

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Generate Prisma Client (after schema changes)
npx prisma generate

# Run migrations
npx prisma migrate dev

# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## Next Steps

Once your app is running successfully:

1. ✅ Homepage loads at http://localhost:3000
2. ✅ You can sign up and create an account
3. ✅ You can sign in and see the dashboard
4. ✅ Database tables are created (check with `npx prisma studio`)

**You're ready to start building Phase 2-5 features!**

---

## Need Help?

If you run into issues:
1. Check the console for error messages
2. Verify PostgreSQL is running
3. Check that `.env` variables are correct
4. Try running `npx prisma studio` to verify database connection
