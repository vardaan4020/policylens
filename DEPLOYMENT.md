# Deploying PolicyLens to Vercel

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- A Groq API key from [console.groq.com](https://console.groq.com)

## Quick Deploy

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy from project root:
```bash
vercel
```

4. Follow the prompts and add environment variables when asked.

### Option 2: Deploy via Vercel Dashboard

1. Push your code to GitHub/GitLab/Bitbucket

2. Go to [vercel.com/new](https://vercel.com/new)

3. Import your repository

4. Configure environment variables (see below)

5. Click "Deploy"

## Environment Variables

Add these in your Vercel project settings (Settings → Environment Variables):

| Variable | Value | Notes |
|----------|-------|-------|
| `GROQ_API_KEY` | Your Groq API key | Get from console.groq.com |
| `NEXTAUTH_SECRET` | Random string (32+ chars) | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your production URL | e.g., `https://your-app.vercel.app` |

## Important Notes

### Database Considerations

The app currently uses SQLite (`better-sqlite3`), which **won't work on Vercel** because:
- Vercel functions are serverless and stateless
- No persistent filesystem between requests
- SQLite requires file system access

**You need to migrate to a hosted database:**

#### Option A: Vercel Postgres (Recommended)
```bash
npm install @vercel/postgres
```

Update `lib/db.ts` to use Vercel Postgres instead of SQLite.

#### Option B: PlanetScale (MySQL)
```bash
npm install @planetscale/database
```

#### Option C: Supabase (PostgreSQL)
```bash
npm install @supabase/supabase-js
```

### Python Service

The optional Python PDF extraction service (`python-service/`) cannot run on Vercel's Node.js runtime.

**Options:**
1. Deploy Python service separately to:
   - Railway.app
   - Render.com
   - Fly.io
   - AWS Lambda with Docker

2. Remove Python service and rely only on `pdf-parse` (Node.js)

3. Use a third-party PDF API service

### Build Configuration

The `vercel.json` is already configured with:
- Next.js framework detection
- Build and install commands
- Environment variable references

### Post-Deployment

1. Test all features after deployment
2. Update `NEXTAUTH_URL` to your production domain
3. Configure custom domain (optional) in Vercel dashboard
4. Set up monitoring and error tracking

## Troubleshooting

### Build Fails

Check that:
- All dependencies are in `package.json`
- TypeScript compiles locally (`npm run build`)
- No SQLite references remain if you migrated databases

### Database Errors

- Ensure you've migrated from SQLite to a hosted database
- Check connection strings in environment variables
- Verify database is accessible from Vercel's region

### Authentication Issues

- Verify `NEXTAUTH_URL` matches your production URL
- Check `NEXTAUTH_SECRET` is set
- Ensure callbacks are configured correctly

## Performance Tips

- Enable Vercel Analytics for monitoring
- Use Edge Runtime for faster API routes where possible
- Implement caching for AI responses
- Consider rate limiting for API routes

## Cost Considerations

- Vercel Free tier: 100GB bandwidth, 100 serverless function executions/day
- Groq API: Free tier available
- Database: Check pricing for your chosen provider
