#!/bin/bash

# PolicyLens Setup Script
# This script helps you set up PolicyLens for local development

echo "🚀 PolicyLens Setup Script"
echo "=========================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. You have $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo ""

# Check for .env.local
if [ ! -f .env.local ]; then
    echo "⚙️  Creating .env.local file..."
    cat > .env.local << 'EOF'
# Groq AI API Key (required)
# Get from: https://console.groq.com
GROQ_API_KEY=your_groq_api_key_here

# NextAuth Configuration (required)
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=http://localhost:3000

# Neon Postgres Database (required)
# Get from: https://neon.tech
DATABASE_URL=your_neon_postgres_connection_string

# Optional: Python PDF service
PDF_SERVICE_URL=http://localhost:8000
EOF
    echo "✅ Created .env.local file"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env.local and add your API keys:"
    echo "   1. GROQ_API_KEY from https://console.groq.com"
    echo "   2. DATABASE_URL from https://neon.tech"
    echo "   3. NEXTAUTH_SECRET (any random 32+ character string)"
    echo ""
else
    echo "✅ .env.local already exists"
    echo ""
fi

# Check if DATABASE_URL is set
if grep -q "your_neon_postgres_connection_string" .env.local 2>/dev/null; then
    echo "⚠️  DATABASE_URL not configured yet"
    echo "   Run: npx neonctl@latest init"
    echo "   Or manually add your Neon connection string to .env.local"
    echo ""
else
    echo "✅ DATABASE_URL configured"
    echo ""
fi

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your API keys (if not done)"
echo "2. Initialize database: npm run init-db (or use the command in SETUP.md)"
echo "3. Start dev server: npm run dev"
echo "4. Open http://localhost:3000"
echo ""
echo "For detailed instructions, see SETUP.md"
