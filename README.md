# Aegis — Adaptive Protection for Digital Banking

AI decision-security prototype for digital banking. Aegis evaluates **transaction risk** and **decision integrity** as two separate questions, so a scam is caught even when the transaction itself looks technically valid.

This is a self-contained simulation. No real bank accounts, telecom, SMS, or fraud-provider APIs are used.

## Run it

```bash
npm install
cp .env.example .env      # already has a working local default; edit if you want your own AUTH_SECRET
npm run db:push           # create the local SQLite database
npm run db:seed           # seed demo accounts and scam-pattern library
npm run dev                # http://localhost:3000
```

Demo accounts (password for all: `Passw0rd!Demo`):

| Email | Role |
|---|---|
| `rajesh@aegisdemo.in` | Vulnerable customer (age 67) |
| `anita@aegisdemo.in` | Standard customer |
| `priya@aegisdemo.in` | Trusted-contact portal |

To reset all demo data back to a clean starting state at any time: `npm run db:reset`.

## Demo flow

1. Sign in as **Rajesh Kumar** → **Scenario Lab** → run **KYC Impersonation**.
2. Walk through Sentinel's risk breakdown → answer MIND's intent-check questions → watch GUARD pause the payment → view the Scam DNA / Incident / Recovery Center it opens.
3. Sign in as **Priya Kumar** (trusted contact) → approve or keep the payment paused.
4. Back as Rajesh, run the **Legitimate High-Value Payment** scenario (same ₹85,000 amount, known contractor) to see it allowed after standard verification — proof the system doesn't just block large payments.

## Verification

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Optional: real AI path

Set `ANTHROPIC_API_KEY` in `.env` to route the MIND Intent Check through Claude instead of the deterministic fallback classifier. The app is fully functional either way.
