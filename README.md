# PolicyLens — AI Policy Decoder

> Upload any insurance or legal policy. AI turns the legalese into plain English in seconds.

---

## What it does

Insurance policies are written by lawyers, not humans. Most people don't know what they're covered for until they file a claim — and get denied. PolicyLens fixes that.

Upload a PDF → AI reads every clause → you get a clear, structured breakdown of exactly what you're paying for.

---

## Features

| Feature | Description |
|---|---|
| ✨ **AI Summary** | Plain English summary with coverage score, reading level, and bottom-line verdict |
| 📊 **Key Numbers** | Deductible, copay, limits, out-of-pocket max — all in one view |
| 🗺️ **Coverage Map** | Interactive grid of everything covered and excluded, tap for details |
| 🚫 **Exclusion Finder** | All exclusions ranked by risk level (high / medium / low) |
| 🤖 **Scenario Simulator** | Ask "am I covered if...?" — AI checks your policy and answers directly |
| 🩺 **Policy Health Check** | AI grades your policy across 5 categories, finds critical gaps, gives prioritised recommendations |
| ⚖️ **Policy Comparison** | Compare 2–4 policies side by side — AI picks a winner and explains why |
| 📅 **Timeline** | Key dates, waiting periods, renewal deadlines |
| 📖 **Glossary** | Every jargon term in your policy explained in plain English |
| 💾 **Saved Policies** | All your analysed policies saved per account, accessible anytime |

---

## Tech Stack

- **Framework** — Next.js 14 (App Router)
- **AI** — Groq API with LLaMA 3.1 8B (fast) + LLaMA 3.3 70B (comparison)
- **PDF Extraction** — pdf-parse (Node.js) + optional pdfplumber (Python)
- **Auth** — NextAuth.js with credentials (email + password)
- **Database** — SQLite via better-sqlite3 (file-based, zero config)
- **Styling** — Tailwind CSS + Framer Motion
- **Language** — TypeScript

---

## Getting Started

### Quick Setup (Recommended)

**On Mac/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

**On Windows:**
```bash
setup.bat
```

This will install dependencies and create your `.env.local` file. Then follow the prompts to add your API keys.

### Manual Setup

### Prerequisites

- Node.js 18+ and npm
- A Groq API key (free at [console.groq.com](https://console.groq.com))
- A Neon Postgres database (free at [neon.tech](https://neon.tech))

### 1. Clone the repository

```bash
git clone https://github.com/vardaan4020/policylens.git
cd policylens
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
GROQ_API_KEY=your_groq_api_key_here
NEXTAUTH_SECRET=your_random_secret_string_here
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=your_neon_postgres_connection_string
```

**Get your API keys:**

- **GROQ_API_KEY**: Sign up at [console.groq.com](https://console.groq.com) (free, no credit card)
- **NEXTAUTH_SECRET**: Generate with `openssl rand -base64 32` or use any random 32+ character string
- **DATABASE_URL**: Create a free database at [neon.tech](https://neon.tech) and copy the connection string

### 4. Initialize the database

Run the Neon CLI to set up your database:

```bash
npx neonctl@latest init
```

Or manually create tables by running this script:

```bash
node -e "const{neon}=require('@neondatabase/serverless');const sql=neon(process.env.DATABASE_URL);(async()=>{await sql\`CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT UNIQUE NOT NULL,password TEXT NOT NULL,avatar TEXT,created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()))\`;await sql\`CREATE TABLE IF NOT EXISTS policies(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id)ON DELETE CASCADE,name TEXT NOT NULL,type TEXT NOT NULL,summary TEXT,data TEXT NOT NULL,created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()))\`;await sql\`CREATE TABLE IF NOT EXISTS comparisons(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id)ON DELETE CASCADE,title TEXT NOT NULL,policy_ids TEXT NOT NULL,result TEXT NOT NULL,created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()))\`;console.log('✅ Database initialized')})()"
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. (Optional) Python PDF extraction service

For better PDF extraction with complex layouts and tables:

```bash
cd python-service
pip install -r requirements.txt
python -m uvicorn main:app --port 8000
```

Add to `.env.local`:
```env
PDF_SERVICE_URL=http://localhost:8000
```

---

## Build for Production

```bash
npm run build
npm start
```

For detailed setup instructions, see [SETUP.md](./SETUP.md)

---

## Project Structure

```
policylens/
├── app/
│   ├── api/
│   │   ├── analyze/        # PDF text → structured policy JSON
│   │   ├── compare/        # Side-by-side policy comparison
│   │   ├── extract/        # PDF text extraction
│   │   ├── healthcheck/    # Policy health grade + recommendations
│   │   ├── simulate/       # Scenario coverage check
│   │   ├── policies/       # CRUD for saved policies
│   │   └── auth/           # NextAuth + registration
│   ├── login/              # Login / register page
│   └── page.tsx            # Main app shell
├── components/
│   ├── WelcomeScreen.tsx   # Landing page
│   ├── Dashboard.tsx       # User's saved policies
│   ├── PolicyUploader.tsx  # PDF upload + processing
│   ├── SummaryView.tsx     # Full policy summary
│   ├── CoverageGraph.tsx   # Interactive coverage map
│   ├── ExclusionsView.tsx  # Exclusions by risk level
│   ├── ScenarioSimulator.tsx # Ask AI about coverage
│   ├── HealthCheckView.tsx # Policy health grade
│   ├── CompareUploader.tsx # Upload policies to compare
│   ├── CompareView.tsx     # Comparison results
│   ├── TimelineView.tsx    # Key dates & periods
│   └── GlossaryView.tsx    # Jargon definitions
├── lib/
│   ├── ai.ts               # Groq AI client
│   ├── authOptions.ts      # NextAuth config
│   ├── db.ts               # SQLite database
│   ├── textProcessor.ts    # Smart PDF text extraction
│   └── types.ts            # TypeScript types
└── python-service/
    └── main.py             # pdfplumber PDF extractor
```

---

## How the AI works

**Small PDFs (< 6,000 chars)** — sent directly to LLaMA 3.1 8B in a single pass.

**Medium PDFs (6k–40k chars)** — `textProcessor.ts` scores every paragraph by policy relevance (coverage keywords, dollar amounts, exclusion terms) and selects the most important sections.

**Large PDFs (> 40k chars)** — split into chunks, each chunk analysed in parallel, results merged and synthesised into a final structured output.

All AI responses are parsed with a 4-fallback JSON extractor that handles markdown fences, leading text, and partial responses.

---

## API Routes

| Route | Method | Description |
|---|---|---|
| `/api/analyze` | POST | Extract structured data from policy text |
| `/api/simulate` | POST | Check if a scenario is covered |
| `/api/compare` | POST | Compare multiple policies |
| `/api/healthcheck` | POST | Grade a policy and give recommendations |
| `/api/extract` | POST | Extract text from PDF file |
| `/api/policies` | GET/POST | List / save user policies |
| `/api/policies/[id]` | GET/DELETE | Get / delete a specific policy |
| `/api/auth/register` | POST | Create a new account |
| `/api/auth/[...nextauth]` | GET/POST | NextAuth session handling |

---

## Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/policylens)

**Quick steps:**

1. Push your code to GitHub
2. Import to Vercel at [vercel.com/new](https://vercel.com/new)
3. Add environment variables:
   - `GROQ_API_KEY` — your Groq API key
   - `NEXTAUTH_SECRET` — random 32+ character string
   - `NEXTAUTH_URL` — your production URL (e.g., `https://your-app.vercel.app`)
4. Deploy

**Important:** The app uses SQLite which won't work on Vercel. You'll need to migrate to a hosted database like Vercel Postgres, PlanetScale, or Supabase.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

---

