# AI Executive Coach — Deployment Guide

Your API key lives only on the server. The browser never sees it.

---

## Architecture (why this is secure)

```
Browser (React UI)
      |
      | POST /api/chat  ← no API key here
      |
Vercel Serverless Function (api/chat.js)
      |
      | uses ANTHROPIC_API_KEY from environment
      |
Anthropic API
```

---

## Deploy to Vercel in 5 steps

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/ai-executive-coach.git
git push -u origin main
```

### Step 2 — Connect to Vercel

1. Go to https://vercel.com and sign in (free account)
2. Click "Add New Project"
3. Import your GitHub repo
4. Click "Deploy" — Vercel auto-detects Next.js

### Step 3 — Add your API key (THE critical step)

In your Vercel project dashboard:
1. Go to **Settings → Environment Variables**
2. Add:
   - Name: `ANTHROPIC_API_KEY`
   - Value: your key from https://console.anthropic.com
   - Environment: Production + Preview + Development
3. Click **Save**
4. Go to **Deployments** → click the three dots on latest → **Redeploy**

### Step 4 — Get your API key

1. Go to https://console.anthropic.com
2. Sign up / log in
3. Go to **API Keys** → **Create Key**
4. Copy the key (starts with `sk-ant-...`)
5. Paste it into Vercel (Step 3)

### Step 5 — Your app is live

Vercel gives you a URL like: `https://ai-executive-coach.vercel.app`

Connect your custom domain under **Settings → Domains**.

---

## Run locally

```bash
# Install dependencies
npm install

# Create your local env file
cp .env.example .env.local
# Edit .env.local and paste your API key

# Start dev server
npm run dev

# Open http://localhost:3000
```

---

## Cost estimate

| Usage | Monthly cost |
|-------|-------------|
| 100 users × 20 msgs/day | ~$8–15 |
| 500 users × 20 msgs/day | ~$40–75 |
| 1,000 users × 20 msgs/day | ~$80–150 |

Vercel hosting: **free** on Hobby plan (plenty for launch).

---

## Files explained

```
exec-coach/
├── api/
│   └── chat.js          ← Secure API route (server-side, key lives here)
├── public/
│   └── index.jsx        ← React frontend (browser, no key)
├── .env.example         ← Template — copy to .env.local
├── .env.local           ← YOUR KEY (never commit this)
├── .gitignore           ← Protects .env.local from git
├── next.config.js       ← Next.js config
└── package.json         ← Dependencies
```

---

## Security checklist

- [x] API key is server-side only (env variable)
- [x] `.env.local` is in `.gitignore`
- [x] No key in frontend code
- [x] Input validation in API route
- [x] Error messages don't leak internals
- [x] Message history capped at 20 (cost control)

---

## Customise the coach persona

Edit the `SYSTEM_PROMPT` in `api/chat.js` to change the coach's:
- Personality and tone
- Business focus areas
- Response length
- Specific knowledge (add your pricing, services, etc.)
