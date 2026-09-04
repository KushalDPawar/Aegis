# Aegis — Adaptive Protection for Digital Banking

AI decision-security prototype for digital banking. Aegis evaluates **transaction risk** and **decision integrity** as two separate questions, so a scam is caught even when the transaction itself looks technically valid.

This is a self-contained simulation. No real bank accounts, telecom, SMS, or fraud-provider APIs are used.

## Run it locally

```bash
npm install
cp .env.example .env      # already has a working local default; edit AUTH_SECRET if you want
npm run db:push           # create the local SQLite database
npm run db:seed           # seed demo accounts and scam-pattern library
npm run dev                # http://localhost:3000
```

Demo accounts (password for all: `Passw0rd!Demo`):

| Email | Role |
|---|---|
| `rajesh@aegisdemo.in` | Vulnerable customer (age 67) |
| `ops@aegisdemo.in` | Bank operations console |

To reset all demo data: `npm run db:reset`.

## Demo flow

1. Sign in as **Rajesh Kumar** → land on the Ascend `/platform` hub.
2. Open **Fraud Intelligence**, run a scenario from the bar, walk the risk interview + friction decision.
3. Explore **Financial Health** and **AI Governance** tabs for the full story.

## Deploy on Vercel

This repo is Vercel-ready. The build:

1. Runs `prisma generate`
2. Builds + seeds `prisma/deploy.db`
3. Bundles that DB into serverless functions
4. Copies it to `/tmp` on cold start (SQLite-writable path on Vercel)

### One-time Vercel project settings

In **Project → Settings → Environment Variables**, set for Production (and Preview if you want):

| Name | Value |
|---|---|
| `AUTH_SECRET` | output of `openssl rand -base64 32` |
| `ANTHROPIC_API_KEY` | optional — real AI path; app works without it |

`DATABASE_URL` is **not required** on Vercel — the build script creates the seeded SQLite file automatically.

Then push to `master` (or redeploy). Framework preset: **Next.js**.

> Note: the SQLite file in `/tmp` is ephemeral per serverless instance. Perfect for hackathon demos; for durable multi-instance production, swap the Prisma datasource to Postgres/Neon later.

## Verification

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Optional: real AI path

Set `ANTHROPIC_API_KEY` in `.env` (or Vercel env) to route the Intent Check through Claude instead of the deterministic fallback classifier.
