# Changelogfy

AI-powered changelog generator. Connect a GitHub repo → push to main → get a polished, user-friendly changelog published automatically.

**Stack:** Next.js 14 · TypeScript · Prisma · PostgreSQL (Supabase) · NextAuth.js · Stripe · Claude AI · Resend · Tailwind CSS

---

## How it works

1. **Connect your repo** — Sign in with GitHub, select a repository. Changelogfy creates a webhook automatically.
2. **Push to main** — Every push triggers the webhook. Claude reads your commits and transforms them into readable release notes.
3. **Published instantly** — Changelog appears at your public URL (`/p/your-slug`), emailed to subscribers, and posted to Slack.

---

## Features

- **AI-generated changelogs** — Claude groups and rewrites commits into user-friendly prose
- **Public changelog page** — Shareable hosted page at `/p/[slug]`
- **Email subscribers** — Users subscribe and get notified on every release
- **Slack notifications** — Post summaries to any Slack channel
- **Plan enforcement** — FREE / STARTER / PRO tiers with repo and changelog limits
- **Stripe billing** — Subscription management with checkout and billing portal

---

## Plans

| Feature | Free | Starter ($9/mo) | Pro ($19/mo) |
|---|---|---|---|
| Repositories | 1 | 3 | 10 |
| Changelogs/month | 10 | 50 | 200 |
| Email subscribers | — | 100 | 1,000 |
| Slack notifications | — | ✓ | ✓ |
| Custom domain | — | — | ✓ |
| Remove branding | — | — | ✓ |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase project (PostgreSQL)
- GitHub OAuth App
- Anthropic API key
- Stripe account
- Resend account (email)

### 1. Clone and install

```bash
git clone https://github.com/rambabu-143/Chanlogify.git
cd Chanlogify
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local`:

```env
# Database (Supabase)
DATABASE_URL="postgresql://..."        # pooler URL  port 6543
DIRECT_URL="postgresql://..."          # pooler URL  port 5432

# NextAuth
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# GitHub OAuth App (github.com/settings/developers)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GITHUB_WEBHOOK_SECRET="run: openssl rand -hex 20"

# Anthropic (console.anthropic.com)
ANTHROPIC_API_KEY=""

# Stripe (dashboard.stripe.com)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
STRIPE_STARTER_PRICE_ID=""
STRIPE_PRO_PRICE_ID=""

# Resend (resend.com)
RESEND_API_KEY=""
RESEND_FROM_EMAIL="changelogs@yourdomain.com"

# Set to 'true' to skip Claude API during testing
MOCK_CLAUDE=false
```

### 3. GitHub OAuth App

1. Go to [github.com/settings/developers](https://github.com/settings/developers) → **OAuth Apps** → **New OAuth App**
2. Homepage URL: `http://localhost:3000`
3. Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy **Client ID** and **Client Secret** into `.env.local`

### 4. Stripe setup

1. Create two products in [Stripe dashboard](https://dashboard.stripe.com/products):
   - **Starter** — $9/month recurring
   - **Pro** — $19/month recurring
2. Copy both **Price IDs** into `.env.local`
3. For local webhooks, use the Stripe CLI:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the `whsec_...` secret printed → `STRIPE_WEBHOOK_SECRET`

### 5. Database setup

```bash
npm run db:push
```

### 6. Run locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 7. Test webhooks locally

GitHub webhooks can't reach `localhost`. Use [ngrok](https://ngrok.com):

```bash
ngrok http 3000
```

Update `NEXTAUTH_URL` in `.env.local` with your ngrok URL, then restart the dev server. Also update the GitHub OAuth App callback URL to match.

---

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/     # NextAuth handler
│   │   ├── changelogs/[id]/        # Delete changelog
│   │   ├── github/repos/           # List user repos
│   │   ├── projects/               # CRUD projects
│   │   ├── stripe/                 # Checkout + billing portal + webhook
│   │   ├── subscribers/            # Subscribe to changelog
│   │   └── webhooks/github/        # GitHub push webhook → Claude
│   ├── auth/signin/                # Sign in page
│   ├── billing/                    # Success + cancel pages
│   ├── dashboard/                  # Protected dashboard
│   │   └── projects/[id]/          # Project detail + settings
│   └── p/[slug]/                   # Public changelog page
│       └── [changelogId]/          # Single changelog entry
├── components/
│   ├── ChangelogCard.tsx           # Dashboard changelog card
│   ├── DashboardNav.tsx            # Nav with user menu
│   ├── ProjectSettings.tsx         # Settings + webhook info
│   ├── ProjectSetup.tsx            # Connect repo wizard
│   ├── PublicChangelogPage.tsx     # Public timeline UI
│   └── SubscribeForm.tsx           # Email subscribe form
├── lib/
│   ├── auth.ts                     # NextAuth config
│   ├── claude.ts                   # Changelog generation
│   ├── email.ts                    # Resend email
│   ├── github.ts                   # GitHub API (Octokit)
│   ├── prisma.ts                   # Prisma client
│   ├── slack.ts                    # Slack webhook
│   └── stripe.ts                   # Stripe + plan limits
└── prisma/
    └── schema.prisma               # DB schema
```

---

## Webhook Flow

```
GitHub push
  → POST /api/webhooks/github
  → Verify HMAC signature
  → Fetch commits since last SHA
  → Generate changelog with Claude
  → Save to database
  → Send email to subscribers (Resend)
  → Post to Slack (if configured)
  → Update lastCommitSha
```

---

## Deploying to Vercel

```bash
vercel deploy
```

Set all environment variables in the Vercel dashboard. Then:

1. Update `NEXTAUTH_URL` to your production domain
2. Update your **GitHub OAuth App** callback URL to production
3. Update your **Stripe webhook** endpoint to production URL with event: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Run `npm run db:push` against your production database

---

## Development Notes

- `MOCK_CLAUDE=true` in `.env.local` skips the Anthropic API call — useful for testing the full webhook flow without credits
- `debug: true` in `lib/auth.ts` enables NextAuth debug logging
- The Prisma adapter handles user/account creation; sessions use JWT strategy

---

## License

MIT
