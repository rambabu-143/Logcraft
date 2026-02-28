# Changelogfy — Setup Guide

## Prerequisites
- Node.js 18+
- A Supabase project (for PostgreSQL)
- GitHub OAuth App
- Anthropic API key
- Stripe account
- Resend account

---

## 1. Install dependencies

```bash
npm install
```

---

## 2. Environment variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

### GitHub OAuth App
1. Go to https://github.com/settings/applications/new
2. Application name: `Changelogfy`
3. Homepage URL: `http://localhost:3000`
4. Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
5. Copy `Client ID` → `GITHUB_CLIENT_ID`
6. Generate a secret → `GITHUB_CLIENT_SECRET`

### GitHub Webhook Secret
```bash
openssl rand -hex 20
```
Use that value for `GITHUB_WEBHOOK_SECRET`.

### NextAuth Secret
```bash
openssl rand -base64 32
```
Use that for `NEXTAUTH_SECRET`.

### Stripe
1. Create a product "Changelogfy Starter" at $9/mo, copy the Price ID → `STRIPE_STARTER_PRICE_ID`
2. Create a product "Changelogfy Pro" at $19/mo, copy the Price ID → `STRIPE_PRO_PRICE_ID`
3. Enable webhooks at `https://your-domain.com/api/stripe/webhook` with events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

---

## 3. Database setup (Supabase)

1. Create a new Supabase project
2. Copy the connection string (Database → Connection String → URI mode) → `DATABASE_URL`
3. Run the migration:

```bash
npm run db:push
```

Or to create a proper migration:
```bash
npm run db:migrate
```

---

## 4. Run development server

```bash
npm run dev
```

Visit http://localhost:3000

---

## 5. Test the webhook locally

Use [ngrok](https://ngrok.com) or similar to expose localhost:

```bash
ngrok http 3000
```

Then when connecting a repo, the webhook URL will be `https://xxxx.ngrok.io/api/webhooks/github`.

---

## 6. Deploy to Vercel

```bash
vercel deploy
```

Set all environment variables in the Vercel dashboard.
Update `NEXTAUTH_URL` to your production domain.
Update your GitHub OAuth App callback URL to the production URL.

---

## Architecture Notes

- **Webhook flow**: GitHub → `/api/webhooks/github` → fetch commits → Claude → save → notify
- **Plan enforcement**: checked in `/api/projects` (repo limits) and in the webhook handler (monthly changelog limits)
- **Public pages**: `/p/[slug]` is fully public, no auth needed — SEO-friendly server components
- **Auth**: NextAuth with Prisma adapter + GitHub OAuth. GitHub access token stored in `User.githubAccessToken`
