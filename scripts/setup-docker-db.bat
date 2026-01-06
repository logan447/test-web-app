@echo off
REM Olera - PostgreSQL Docker Setup Script for Windows

echo Setting up PostgreSQL with Docker for Olera...
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker is not installed. Please install Docker Desktop first:
    echo https://www.docker.com/products/docker-desktop
    exit /b 1
)

echo Docker is installed
echo.

REM Check if container already exists
docker ps -a | findstr olera-postgres >nul 2>&1
if %errorlevel% equ 0 (
    echo Container 'olera-postgres' already exists

    REM Check if it's running
    docker ps | findstr olera-postgres >nul 2>&1
    if %errorlevel% equ 0 (
        echo PostgreSQL is already running
    ) else (
        echo Starting existing PostgreSQL container...
        docker start olera-postgres
        echo PostgreSQL started
    )
) else (
    echo Creating new PostgreSQL container...
    docker run --name olera-postgres -e POSTGRES_USER=olera_user -e POSTGRES_PASSWORD=olera_pass -e POSTGRES_DB=olera -p 5432:5432 -d postgres:15

    echo Waiting for PostgreSQL to be ready...
    timeout /t 5 /nobreak >nul
    echo PostgreSQL container created and running
)

echo.
echo PostgreSQL is ready!
echo.
echo Connection details:
echo   Host: localhost
echo   Port: 5432
echo   Database: olera
echo   User: olera_user
echo   Password: olera_pass
echo.
echo Next steps:
echo   1. Run: npm install
echo   2. Run: npx prisma migrate dev --name init
echo   3. Run: npm run dev
echo.
pause
