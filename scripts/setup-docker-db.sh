#!/bin/bash

# Olera - PostgreSQL Docker Setup Script

echo "🚀 Setting up PostgreSQL with Docker for Olera..."
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first:"
    echo "   https://www.docker.com/get-started"
    exit 1
fi

echo "✅ Docker is installed"
echo ""

# Check if container already exists
if docker ps -a | grep -q olera-postgres; then
    echo "📦 Container 'olera-postgres' already exists"

    # Check if it's running
    if docker ps | grep -q olera-postgres; then
        echo "✅ PostgreSQL is already running"
    else
        echo "🔄 Starting existing PostgreSQL container..."
        docker start olera-postgres
        echo "✅ PostgreSQL started"
    fi
else
    echo "📦 Creating new PostgreSQL container..."
    docker run --name olera-postgres \
      -e POSTGRES_USER=olera_user \
      -e POSTGRES_PASSWORD=olera_pass \
      -e POSTGRES_DB=olera \
      -p 5432:5432 \
      -d postgres:15

    echo "⏳ Waiting for PostgreSQL to be ready..."
    sleep 5
    echo "✅ PostgreSQL container created and running"
fi

echo ""
echo "🎉 PostgreSQL is ready!"
echo ""
echo "Connection details:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: olera"
echo "  User: olera_user"
echo "  Password: olera_pass"
echo ""
echo "Next steps:"
echo "  1. Run: npm install"
echo "  2. Run: npx prisma migrate dev --name init"
echo "  3. Run: npm run dev"
echo ""
