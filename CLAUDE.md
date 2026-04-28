# CLAUDE.md — Protekon

Compliance-as-a-Service platform for multi-vertical workplace compliance. Rebuild/redesign of Shield CaaS with a live Next.js app, Supabase-backed client portal, Inngest workflows, Stripe billing, Resend email, Vercel Blob document storage, and AI-assisted compliance workflows.

---

## Project Overview

**Name:** Protekon  
**Type:** Compliance SaaS (multi-vertical)  
**Workflow:** Backend-first, production-readiness focused  
**Status:** Full-stack app in soft-launch state. Core FACE and DNA layers are implemented; remaining work is verification, migration backfill, launch smoke testing, and post-ship hardening.  
**Reference:** Previous version at `/home/info/business/ngeniuspro/shield_caas`

---

## Definition of Done — non-negotiable

A feature is NOT "done" until ALL of the following are true. The agent must
not declare done, summarize as complete, or push to main otherwise.

1. `tsc` / `npm run lint` / `npm run test` / `npm run build` pass locally and in CI.
2. `/api/health/integrations` returns `ok: true` on the deployed preview or production URL — proves Stripe key, Resend FROM domain, Supabase, Inngest, Vercel Blob, Sanity all reachable.
3. **If the change touches Stripe, Resend, Inngest, Supabase Auth, or Vercel Blob:** the customer-journey nightly test (`e2e/customer-journey.spec.ts`) has run green at least once against the deployed URL since the change. A passing unit test that mocks these services is not sufficient.
4. **If the change touches a UI flow a paying customer can reach:** a Playwright spec exercises that flow end-to-end without UI mocks. Cite the path:line in the status report.
5. **If a third-party integration is added or changed** (new Stripe webhook event, new Resend template, new Inngest workflow, new Blob upload path, etc.): `/api/health/integrations` has a corresponding check, and the user-facing path of that integration is asserted in a test that hits the real service.

When any of these is unmet, the agent's status report must explicitly name which gates are open and what remains. "Code is shipped" is not a status report — the customer flow either works or it doesn't.

The historical reason for this rule: 2026-04-27, the Resend FROM was hardcoded to an unverified domain and every welcome email had been silently failing in production. Vitest mocked Resend (test passed). CI ran `continue-on-error: true` (tests didn't gate). The first observer of the failure was the customer who paid $597. This rule, plus the health probe and the journey test, are designed so that class of bug can never ship again.

---

## Tech Stack

### FACE (Frontend)
- **Framework:** Next.js 16.2 (App Router, Server Components)
- **UI:** shadcn/ui + Radix primitives
- **Styling:** Tailwind CSS 4
- **Animation:** Framer Motion
- **Icons:** Lucide + Phosphor
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod
- **Analytics:** Vercel Analytics

### DNA (Backend)
- **Database:** Supabase (Postgres + RLS)
- **Auth:** Supabase Auth (magic links + password, `@supabase/ssr`)
- **Workflows:** Inngest (durable task orchestration)
- **Payments:** Stripe checkout, portal, and webhooks
- **Email:** Resend transactional email
- **Storage:** Vercel Blob
- **PDF:** `pdf-lib`
- **AI:** AI SDK with OpenAI/Anthropic providers
- **CMS:** Sanity

---

## Current Repo Shape

As of 2026-04-27:

| Surface | Count / Status |
|---------|----------------|
| App pages | 83 `app/**/page.tsx` routes |
| API routes | 28 `app/api/**/route.ts` routes |
| Inngest functions | 26 files under `inngest/functions/` |
| Server actions | 65 files under `lib/actions/` |
| Supabase migrations | 55 numbered migrations on disk; 49 SQL files present because some migration numbers were intentionally skipped |
| Latest migration | `055_fix_user_roles_recursion.sql` captures the production RLS recursion fix |

---

## Architecture

### Route Groups

```
app/
├── marketing/public routes  → landing, pricing, about, solutions, score, resources, blog
├── auth routes              → login, signup, forgot-password, callback
├── onboarding/              → multi-step onboarding wizard
├── dashboard/               → protected client portal
├── partner/                 → protected partner portal
└── api/                     → REST/webhook/integration routes
```

### Database Topology

Protekon uses three Supabase projects. Always confirm the target before any database mutation.

| Database | Role | Primary env vars / factory |
|----------|------|----------------------------|
| App DB `yfkledwhwsembikpjynu` | Product database: clients, auth-linked portal data, documents, incidents, onboarding, partner channel, billing mirrors | `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `lib/supabase/{client,server,admin,middleware}.ts` |
| Scraper DB `vizmtkfpxxjzlpzibate` | OSHA/enforcement intelligence and nightly mirror source | `SCRAPER_SUPABASE_URL`, `SCRAPER_SUPABASE_SERVICE_ROLE_KEY`, `OSHA_SCRAPER_SUPABASE_*`, `lib/supabase/scraper.ts` |
| Intel DB | CSLB/intelligence notification pipeline | `INTEL_SUPABASE_URL`, `INTEL_SUPABASE_SERVICE_KEY`, `getIntelDb()` in `inngest/functions/cslb-notification-pipeline.ts` |

### RLS Notes

- **RLS-first:** Client-scoped tables should use RLS. Service-role-only tables must be explicit.
- **RBAC:** `user_roles` is the membership source for multi-user clients.
- **Important fix:** `user_roles` and `action_items` policies must use `public.user_has_client_access(uuid)` / `public.user_is_client_owner(uuid)` from migration `055_fix_user_roles_recursion.sql`. Do not reintroduce inline self-joins against `user_roles`; they triggered Postgres `42P17` recursion in production.

### Inngest Workflows

The app registers workflows for signup, intake, document generation, incident reporting, monthly audit, regulatory scan/sync, payment failure handling, scheduled delivery, score/sample nurture, onboarding steps, RAG indexing, CSLB notifications, employee log SLA, retention scanning, COI expiration scanning, and reminder processing.

### API Route Groups

```
/api/inngest
/api/chat
/api/compliance/score
/api/documents/download
/api/export/*
/api/onboarding/*
/api/partner/*
/api/partners/apply
/api/samples/gate
/api/score/*
/api/stripe/*
/api/training/*
/api/upload
```

---

## Key Patterns

- **Server Components default:** only use `'use client'` when interactivity requires it.
- **Supabase Auth only:** do not introduce Clerk.
- **Event-driven workflows:** user actions send Inngest events when work should be durable/retriable.
- **Vertical multiplexing:** one portal, routes and queries filtered by client vertical.
- **Stripe lookup keys:** checkout resolves active prices via Stripe lookup keys, not env price IDs.
- **Prod soft-launch billing:** production currently uses Stripe test keys intentionally; `4242 4242 4242 4242` is the expected test-card flow until launch keys are swapped.
- **Schema drift discipline:** live DB contains tables/views not fully represented in migrations. Add forward migrations for every discovered production fix or schema backfill.

---

## Current Ship State

Latest audit signal from `reports/ship-audit-2026-04-27/`:

- TypeScript and ESLint were clean.
- Mock-pattern audit found no production mock leakage.
- Marketing and auth middleware HTTP probes passed.
- Stripe API configuration passed in test mode.
- Cross-tenant RLS probes passed.
- Critical C1 RLS recursion blocker was fixed in production and captured in migration `055_fix_user_roles_recursion.sql`.
- Remaining launch gap: browser smoke authenticated dashboard rendering and Stripe checkout end-to-end journey.

---

## File Conventions

| Type | Location | Naming |
|------|----------|--------|
| Pages | `app/**/page.tsx` | Next.js convention |
| Layouts | `app/**/layout.tsx` | Next.js convention |
| Components | `components/` | PascalCase.tsx |
| UI primitives | `components/ui/` | lowercase.tsx (shadcn) |
| Server actions | `lib/actions/` | kebab-case.ts |
| Supabase clients | `lib/supabase/` | `client.ts`, `server.ts`, `admin.ts`, `middleware.ts`, factory-specific clients |
| Inngest functions | `inngest/functions/` | kebab-case.ts |
| API routes | `app/api/**/route.ts` | Next.js convention |
| Migrations | `supabase/migrations/` | `NNN_description.sql` |
| Specs | `specs/` | `feature-name.md` |

---

## Environment Variables

Use `.env.example` as the source list. Major groups:

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
