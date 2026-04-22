# Local Development Setup Guide

Complete step-by-step guide to run PolicyLens on your local machine.

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download here](https://git-scm.com/)

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/vardaan4020/policylens.git
cd policylens
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 14
- React 18
- Groq SDK for AI
- Neon Postgres client
- NextAuth for authentication
- And more...

### 3. Get Your API Keys

#### A. Groq API Key (Required)

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up with GitHub or email (free, no credit card)
3. Click "Create API Key"
4. Copy the key (starts with `gsk_`)

#### B. Neon Database (Required)

1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub (free tier: 10 projects, 3GB storage)
3. Click "Create a project"
4. Name it "policylens"
5. Choose a region close to you
6. Click "Create project"
7. Copy the **Pooled connection** string from the dashboard

It looks like:
```
postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
```

#### C. NextAuth Secret (Required)

Generate a random secret string:

**On Mac/Linux:**
```bash
openssl rand -base64 32
```

**On Windows (PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Or just use any random 32+ character string like:
```
my_super_secret_key_for_policylens_2026
```

### 4. Create Environment File

Create a file named `.env.local` in the project root:

```bash
# On Mac/Linux
touch .env.local

# On Windows
type nul > .env.local
```

Open `.env.local` and add:

```env
# Groq AI API Key (required)
GROQ_API_KEY=gsk_your_actual_key_here

# NextAuth Configuration (required)
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=http://localhost:3000

# Neon Postgres Database (required)
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# Optional: Python PDF service
PDF_SERVICE_URL=http://localhost:8000

# Optional: Google Vision API (not currently used)
GOOGLE_VISION_API_KEY=your_key_here
```

**Replace the placeholder values with your actual keys!**

### 5. Initialize Database Tables

Run this command to create the database schema:

```bash
node -e "const{neon}=require('@neondatabase/serverless');const sql=neon(process.env.DATABASE_URL);(async()=>{await sql\`CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT UNIQUE NOT NULL,password TEXT NOT NULL,avatar TEXT,created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()))\`;await sql\`CREATE TABLE IF NOT EXISTS policies(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id)ON DELETE CASCADE,name TEXT NOT NULL,type TEXT NOT NULL,summary TEXT,data TEXT NOT NULL,created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()))\`;await sql\`CREATE TABLE IF NOT EXISTS comparisons(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id)ON DELETE CASCADE,title TEXT NOT NULL,policy_ids TEXT NOT NULL,result TEXT NOT NULL,created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()))\`;console.log('✅ Database initialized')})()"
```

You should see: `✅ Database initialized`

### 6. Start the Development Server

```bash
npm run dev
```

You should see:

```
▲ Next.js 14.2.0
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 2.5s
```

### 7. Open the App

Open your browser and go to:

```
http://localhost:3000
```

You should see the PolicyLens welcome screen!

### 8. Create an Account

1. Click "Get Started" or "Sign Up"
2. Enter your name, email, and password
3. Click "Create Account"
4. You'll be logged in automatically

### 9. Test the App

1. Click "Upload Policy" or drag a PDF file
2. Wait for AI analysis (takes 10-30 seconds)
3. Explore the summary, coverage map, exclusions, etc.

## Optional: Python PDF Service

For better PDF extraction (handles tables and complex layouts):

### Install Python Dependencies

```bash
cd python-service
pip install -r requirements.txt
```

### Run the Service

```bash
python -m uvicorn main:app --port 8000
```

Or on Windows:
```bash
py -m uvicorn main:app --port 8000
```

### Update .env.local

Make sure this line is in your `.env.local`:
```env
PDF_SERVICE_URL=http://localhost:8000
```

## Troubleshooting

### "Module not found" errors

```bash
rm -rf node_modules package-lock.json
npm install
```

### Database connection errors

- Check your `DATABASE_URL` is correct
- Ensure your Neon database is active (free tier pauses after inactivity)
- Test connection: `npx neonctl@latest connection-string`

### "GROQ_API_KEY not found"

- Make sure `.env.local` exists in the project root
- Check the file has `GROQ_API_KEY=gsk_...`
- Restart the dev server after adding env variables

### Port 3000 already in use

```bash
# Kill the process using port 3000
# On Mac/Linux:
lsof -ti:3000 | xargs kill -9

# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

Or use a different port:
```bash
PORT=3001 npm run dev
```

### Build errors

```bash
npm run build
```

This will show any TypeScript or compilation errors.

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Run production build |
| `npm run lint` | Run ESLint |

## Project Structure

```
policylens/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── login/             # Login page
│   └── page.tsx           # Home page
├── components/            # React components
├── lib/                   # Utilities and configs
│   ├── ai.ts             # Groq AI client
│   ├── db.ts             # Database wrapper
│   ├── db-postgres.ts    # Postgres implementation
│   └── types.ts          # TypeScript types
├── python-service/        # Optional PDF extractor
├── .env.local            # Environment variables (create this)
├── package.json          # Dependencies
└── README.md             # Documentation
```

## Next Steps

- Read [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
- Check [README.md](./README.md) for feature documentation
- Explore the code and customize as needed

## Need Help?

- Check existing issues on GitHub
- Review the [Next.js docs](https://nextjs.org/docs)
- Check [Groq API docs](https://console.groq.com/docs)
- Review [Neon docs](https://neon.tech/docs)
