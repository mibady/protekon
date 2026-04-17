# protekon-fy

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_jhOXEp1epOGR3dU1yGhzenUis18y)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.

<a href="https://v0.app/chat/api/kiro/clone/mibady/protekon-fy" alt="Open in Kiro"><img src="https://pdgvvgmkdvyeydso.public.blob.vercel-storage.com/open%20in%20kiro.svg?sanitize=true" /></a>

## Environment Variables

Copy `.env.example` to `.env.local` and fill in real values for local development. On Vercel, set every variable for Production, Preview, and Development environments.

### Scraper Project (NGE-481)

The nightly intelligence mirror (`inngest/functions/mirror-intelligence-nightly.ts`) pulls from the external scraper Supabase project (`vizmtkfpxxjzlpzibate`) into the app DB table `client_intelligence_items`.

| Var | Purpose |
|---|---|
| `SCRAPER_SUPABASE_URL` | Scraper project URL (e.g. `https://vizmtkfpxxjzlpzibate.supabase.co`). |
| `SCRAPER_SUPABASE_SERVICE_ROLE_KEY` | Service-role key for the scraper project. Never exposed to the browser. Only consumed by the nightly mirror function via `lib/supabase/scraper.ts#createScraperServiceClient`. |

Rotate these keys at the Supabase dashboard for project `vizmtkfpxxjzlpzibate`, then update all Vercel environments.

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
