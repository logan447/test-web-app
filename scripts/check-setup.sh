#!/bin/bash

# Olera - Setup Verification Script

echo "🔍 Checking Olera setup..."
echo ""

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "✅ Node.js installed: $NODE_VERSION"
else
    echo "❌ Node.js not installed"
    echo "   Install from: https://nodejs.org/"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "✅ npm installed: $NPM_VERSION"
else
    echo "❌ npm not installed"
    exit 1
fi

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo "✅ Dependencies installed"
else
    echo "⚠️  Dependencies not installed"
    echo "   Run: npm install"
fi

# Check .env file
if [ -f ".env" ]; then
    echo "✅ .env file exists"

    # Check if DATABASE_URL is set
    if grep -q "DATABASE_URL=" .env; then
        echo "✅ DATABASE_URL configured"
    else
        echo "❌ DATABASE_URL not found in .env"
    fi
else
    echo "❌ .env file not found"
    echo "   Copy .env.example to .env"
fi

# Check PostgreSQL connection (if node_modules exists)
if [ -d "node_modules" ]; then
    echo ""
    echo "🔌 Testing database connection..."

    if npx prisma db pull --force 2>/dev/null; then
        echo "✅ Database connection successful"
    else
        echo "⚠️  Cannot connect to database"
        echo "   Make sure PostgreSQL is running"
        echo "   Run: docker ps (for Docker setup)"
        echo "   Or: docker start olera-postgres"
    fi
fi

# Check if Prisma client is generated
if [ -d "node_modules/@prisma/client" ]; then
    echo "✅ Prisma client generated"
else
    echo "⚠️  Prisma client not generated"
    echo "   Run: npx prisma generate"
fi

echo ""
echo "📊 Setup Summary:"
echo ""

# Count checks
CHECKS_PASSED=0
TOTAL_CHECKS=6

[ -x "$(command -v node)" ] && ((CHECKS_PASSED++))
[ -x "$(command -v npm)" ] && ((CHECKS_PASSED++))
[ -d "node_modules" ] && ((CHECKS_PASSED++))
[ -f ".env" ] && ((CHECKS_PASSED++))
[ -d "node_modules/@prisma/client" ] && ((CHECKS_PASSED++))

echo "Status: $CHECKS_PASSED/$TOTAL_CHECKS checks passed"
echo ""

if [ $CHECKS_PASSED -eq $TOTAL_CHECKS ]; then
    echo "🎉 Everything looks good! You're ready to run:"
    echo "   npm run dev"
else
    echo "⚠️  Some setup steps are missing. See messages above."
    echo "   Refer to SETUP.md for detailed instructions"
fi

echo ""
