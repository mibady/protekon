# Protekon

Protekon is a multi-vertical Compliance-as-a-Service platform. It combines a public marketing/lead-gen site, authenticated client dashboard, onboarding wizard, partner portal, Supabase-backed data layer, Inngest workflows, Stripe billing, Resend email, Vercel Blob document storage, and AI-assisted compliance workflows.

The app was originally bootstrapped from v0 and is still linked to the v0 project, but the repo is now a full-stack Next.js product rather than a starter app.

## Current Stack

- Next.js 16.2 App Router + React 19
- Tailwind CSS 4, shadcn/ui, Radix primitives
- Supabase Auth, Postgres, RLS, and service-role server actions
- Inngest background workflows at `/api/inngest`
- Stripe checkout, customer portal, and webhooks
- Resend transactional email
- Vercel Blob document/file storage
- Sanity CMS
- AI SDK with OpenAI/Anthropic providers
- Vitest and Playwright test suites

## Repo Shape

As of 2026-04-27:

| Surface | Count |
|---------|-------|
| App pages | 83 |
| API routes | 28 |
| Inngest function files | 26 |
| Server action files | 65 |
| Supabase migration files | 49 |

Important paths:

- `app/` — App Router pages and API routes
- `components/` — shared UI and feature components
- `lib/actions/` — server actions
- `lib/supabase/` — Supabase clients and database factories
- `inngest/functions/` — durable workflow handlers
- `supabase/migrations/` — forward database migrations
- `reports/` — audit and ship-readiness artifacts
- `specs/` — feature plans and implementation specs

## Database Topology

Protekon uses three Supabase projects:

| Database | Purpose |
|----------|---------|
| App DB `yfkledwhwsembikpjynu` | Product data: clients, documents, incidents, onboarding, partner channel, billing mirrors, dashboard data |
| Scraper DB `vizmtkfpxxjzlpzibate` | OSHA/enforcement intelligence and nightly mirror source |
| Intel DB | CSLB/intelligence notification pipeline |

Always confirm the target database before running migrations or direct SQL. The latest production RLS recursion fix is captured in `supabase/migrations/055_fix_user_roles_recursion.sql`.

## Getting Started

Copy `.env.example` to `.env.local` and fill in real values.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Useful scripts:

```bash
npm run build
npm run lint
npm run test
npm run test:e2e
npm run audit:live
npm run audit:scenarios
```

## Environment Variables

`.env.example` is the source list. Major groups:

- Supabase app DB keys and Postgres URLs
- Stripe keys and webhook secret
- Inngest event/signing keys
- Resend API key
- AI provider keys
- Sanity project/dataset/tokens
- Vercel Blob token
- Upstash Vector keys
- Scraper/OSHA Supabase keys
- Intel DB keys for CSLB notification workflows

### Scraper Project

The nightly intelligence mirror (`inngest/functions/mirror-intelligence-nightly.ts`) pulls from the external scraper Supabase project (`vizmtkfpxxjzlpzibate`) into the app DB table `client_intelligence_items`.

| Var | Purpose |
|---|---|
| `SCRAPER_SUPABASE_URL` | Scraper project URL, e.g. `https://vizmtkfpxxjzlpzibate.supabase.co`. |
| `SCRAPER_SUPABASE_SERVICE_ROLE_KEY` | Service-role key for the scraper project. Never expose to the browser. |

Rotate scraper keys in the Supabase dashboard for project `vizmtkfpxxjzlpzibate`, then update all Vercel environments.

## Inngest Cron Catalog

| Function | Cron (UTC) | Local | Purpose |
|---|---|---|---|
| `mirror-intelligence-nightly` | `0 10 * * *` | 2 AM PST / 3 AM PDT | Mirror scraper intelligence (`protekon_v_notable_stories`, `protekon_regulatory_updates`, `protekon_anomaly_events`) into the app DB for Briefing's intelligence block. 24h staleness acceptable. |

Manual trigger via Inngest dashboard "Invoke" or:

```bash
curl -X POST "$INNGEST_URL/e/$INNGEST_EVENT_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"name":"inngest/function.invoked","data":{"function_id":"mirror-intelligence-nightly"}}'
```

First-run catchup: the 14/30/14-day windows backfill automatically.

## v0 Link

This repository remains linked to v0 for design iteration:

[Continue working on v0](https://v0.app/chat/projects/prj_jhOXEp1epOGR3dU1yGhzenUis18y)
