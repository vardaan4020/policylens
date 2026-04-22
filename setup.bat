@echo off
REM PolicyLens Setup Script for Windows
REM This script helps you set up PolicyLens for local development

echo.
echo 🚀 PolicyLens Setup Script
echo ==========================
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/
    exit /b 1
)

echo ✅ Node.js detected
node -v
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install
echo.

REM Check for .env.local
if not exist .env.local (
    echo ⚙️  Creating .env.local file...
    (
        echo # Groq AI API Key ^(required^)
        echo # Get from: https://console.groq.com
        echo GROQ_API_KEY=your_groq_api_key_here
        echo.
        echo # NextAuth Configuration ^(required^)
        echo NEXTAUTH_SECRET=your_random_secret_here
        echo NEXTAUTH_URL=http://localhost:3000
        echo.
        echo # Neon Postgres Database ^(required^)
        echo # Get from: https://neon.tech
        echo DATABASE_URL=your_neon_postgres_connection_string
        echo.
        echo # Optional: Python PDF service
        echo PDF_SERVICE_URL=http://localhost:8000
    ) > .env.local
    echo ✅ Created .env.local file
    echo.
    echo ⚠️  IMPORTANT: Edit .env.local and add your API keys:
    echo    1. GROQ_API_KEY from https://console.groq.com
    echo    2. DATABASE_URL from https://neon.tech
    echo    3. NEXTAUTH_SECRET ^(any random 32+ character string^)
    echo.
) else (
    echo ✅ .env.local already exists
    echo.
)

echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Edit .env.local with your API keys ^(if not done^)
echo 2. Initialize database ^(see SETUP.md for command^)
echo 3. Start dev server: npm run dev
echo 4. Open http://localhost:3000
echo.
echo For detailed instructions, see SETUP.md
echo.
pause
