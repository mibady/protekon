# CLAUDE.md — Protekon

Compliance-as-a-Service platform. Rebuild/redesign of Shield CaaS.

---

## Project Overview

**Name:** Protekon
**Type:** Compliance SaaS (multi-vertical)
**Workflow:** Backend-First
**Status:** FACE layer complete, DNA layer not started
**Reference:** Previous version at `/home/info/business/ngeniuspro/shield_caas`

---

## Tech Stack

### FACE (Frontend) — Complete
- **Framework:** Next.js 16.2 (App Router, Server Components)
- **UI:** shadcn/ui + Radix primitives
- **Styling:** Tailwind CSS 4
- **Animation:** Framer Motion
- **Icons:** Lucide + Phosphor
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod
- **Analytics:** Vercel Analytics

### DNA (Backend) — To Build
- **Database:** Supabase (Postgres + RLS)
- **Auth:** Supabase Auth (magic links + password, @supabase/ssr)
- **Workflows:** Inngest (durable task orchestration)
- **Payments:** Stripe (checkout, portal, webhooks)
- **Email:** Resend
- **Storage:** Vercel Blob
- **PDF:** pdf-lib

---

## Architecture

### Route Groups
```
app/
├── (marketing)     → Public pages (landing, pricing, about, solutions)
├── (auth)          → Login, signup, forgot-password
├── dashboard/      → Protected portal (requires auth)
│   ├── page.tsx          → Overview
│   ├── documents/        → Document hub + request
│   ├── incidents/        → Incident log + new
│   ├── reports/          → 6 report types
│   ├── regulations/      → Regulatory feed
│   ├── alerts/           → Alert center
│   └── settings/         → Account settings
└── api/            → API routes (to build)
```

### Database Schema Target (from Shield CaaS)
**Core tables:** clients, incidents, documents, audits, training_records
**Expansion:** intake_submissions, sample_report_leads, scheduled_deliveries, regulatory_updates
**Vertical:** construction_subs, property_portfolio, municipal_ordinances, phi_assets, baa_agreements, poster_compliance
**System:** audit_log

All tables require RLS policies. Clients see only their own data via `auth.uid()`.

### Inngest Workflows Target
1. `compliance/intake.submitted` → intake-pipeline (score gaps, upsert client, generate docs, send welcome)
2. `auth/user.signed-up` → post-signup-workflow (create client, send onboarding)
3. Cron `0 9 1 * *` → monthly-audit (compliance checks, generate reports)
4. `compliance/document.requested` → document-generation (gather data, generate PDF, upload, notify)
5. `compliance/incident.reported` → incident-report (strip PII per SB 553, log, schedule follow-up)
6. `billing/payment.failed` → payment-failed (3 escalating notices over 10 days, suspend if unpaid)
7. Training reminders + regulatory scan (stubs)

### API Routes Target
```
/api/inngest              → Inngest handler
/api/compliance/score     → Calculate compliance %
/api/documents/download   → Stream generated documents
/api/stripe/checkout      → Create checkout session
/api/stripe/portal        → Customer portal redirect
/api/stripe/webhook       → Payment event handler
/api/upload               → File upload to Vercel Blob
/api/samples/gate         → Email gate for sample downloads
```

---

## Key Patterns

- **RLS-first:** Every table has row-level security. No admin bypasses.
- **Event-driven:** User actions → Inngest events → durable step chains
- **Vertical multiplexing:** Single portal, routes/queries filtered by client vertical
- **Server Components default:** Only use `'use client'` when interactivity required
- **Middleware auth:** Protect `/dashboard/*` routes, redirect to `/login` if unauthenticated

---

## Build Order (Backend-First)

1. **Supabase schema** — Migrate/adapt tables + RLS from Shield CaaS
2. **Auth wiring** — Supabase Auth + middleware + session management
3. **Server actions** — Form submissions (documents, incidents, settings)
4. **API routes** — Compliance score, document download, file upload
5. **Inngest workflows** — Intake, monthly-audit, doc-gen, incident-report
6. **Stripe integration** — Checkout, portal, webhooks
7. **Email** — Resend transactional emails
8. **Document generation** — PDF via pdf-lib + Vercel Blob
9. **Dashboard wiring** — Replace static data with real Supabase queries
10. **Vertical features** — Construction, HIPAA, poster compliance specifics

---

## File Conventions

| Type | Location | Naming |
|------|----------|--------|
| Pages | `app/**/page.tsx` | Next.js convention |
| Layouts | `app/**/layout.tsx` | Next.js convention |
| Components | `components/` | PascalCase.tsx |
| UI primitives | `components/ui/` | lowercase.tsx (shadcn) |
| Server actions | `lib/actions/` | kebab-case.ts |
| Supabase clients | `lib/supabase/` | client.ts, server.ts, admin.ts, middleware.ts |
| Inngest functions | `inngest/functions/` | kebab-case.ts |
| API routes | `app/api/**/route.ts` | Next.js convention |
| Migrations | `supabase/migrations/` | NNN_description.sql |
| Specs | `specs/` | feature-name.md |

---

## Environment Variables (Target)

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Inngest
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Resend
RESEND_API_KEY=

# Vercel Blob
BLOB_READ_WRITE_TOKEN=
```
