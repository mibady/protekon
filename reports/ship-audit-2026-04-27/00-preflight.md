# Pre-flight Report — Protekon Ship Audit

**Run:** 2026-04-27T10:55-07:00
**Source:** `/home/info/business/ngeniuspro/protekon/.env.local` + `vercel env ls production`

---

## Verdict: **PASS** (proceed with audit) with 2 medium-severity notes

No critical-blocker-zero. Stripe is in test mode locally and production env has all required Stripe lookup keys. Audit can target www.protekon.org safely.

---

## P1. Stripe test mode

| Check | Source | Result |
|-------|--------|--------|
| `STRIPE_SECRET_KEY` starts with `sk_test_` | `.env.local` | PASS |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` starts with `pk_test_` | `.env.local` | PASS |
| `STRIPE_WEBHOOK_SECRET` set | `.env.local` | PASS |
| `STRIPE_SECRET_KEY` set in Production/Preview/Development | Vercel env (26d old) | PASS (value encrypted; mode unverifiable from CLI alone) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` set in Production/Preview/Development | Vercel env (26d old) | PASS |

**NOTE (Medium):** Both `STRIPE_PUBLISHABLE_KEY` (no prefix) and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` exist in Vercel production env. The non-prefixed one is unusable from client code in Next.js. Investigate whether it's a server-side legacy var or unused dead config.

**EMPIRICAL CHECK COMPLETE:** Production is intentionally configured with Stripe test keys for soft launch. Use Stripe test card `4242 4242 4242 4242` for end-to-end checkout validation until launch keys are swapped.

---

## P1b. Stripe lookup-key env vars

| Var | Local (`.env.local`) | Vercel Production |
|-----|---------------------|-------------------|
| `STRIPE_PRICE_CORE` | absent | PASS (present, 23d old) |
| `STRIPE_PRICE_PROFESSIONAL` | absent | PASS (present, 23d old) |
| `STRIPE_PRICE_MULTI_SITE` | absent | PASS (present, 23d old) |
| `STRIPE_SETUP_CORE` | absent | PASS (present, 23d old) |
| `STRIPE_SETUP_PROFESSIONAL` | absent | PASS (present, 23d old) |
| `STRIPE_SETUP_MULTI_SITE` | absent | PASS (present, 23d old) |

**NOTE (Medium):** All 6 Stripe price/setup env vars are missing from `.env.local`. Production is fine, so the audit (which targets the deployed app) is unaffected. But local dev `npm run dev` against `/pricing` would fail with "Stripe is not configured for this plan yet" because Path A of `app/api/stripe/checkout/route.ts` reads these from process.env. Add to `.env.local` if local dev of the checkout flow is desired post-ship.

---

## P2. Supabase env

| Check | Result |
|-------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` set | PASS — host: `yfkledwhwsembikpjynu.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` set | PASS (208 chars, JWT-shaped) |
| `SUPABASE_SERVICE_ROLE_KEY` set | PASS (219 chars, JWT-shaped) |
| `NEXT_PUBLIC_SUPABASE_URL` in Vercel Production | PASS (28d old) |
| `SUPABASE_URL` (server) in Vercel Production | PASS (28d old) |

---

## P3. Inngest env

| Check | Result |
|-------|--------|
| `INNGEST_EVENT_KEY` set in `.env.local` | PASS |
| `INNGEST_SIGNING_KEY` set in `.env.local` | PASS |

---

## P4. Resend env

| Check | Result |
|-------|--------|
| `RESEND_API_KEY` set | PASS (length 36, matches `re_*` pattern) |
| Set in Vercel Production/Preview/Development | PASS (28d old) |

---

## P5. Vercel Blob env

| Check | Result |
|-------|--------|
| `BLOB_READ_WRITE_TOKEN` set in `.env.local` | PASS |
| Set in Vercel Production/Preview/Development | PASS (24d old) |

---

## P6. Confirm dev DB ≠ prod DB

| Check | Result |
|-------|--------|
| Supabase host has obvious "prod" marker | NO ("yfkledwhwsembikpjynu") — ambiguous, single shared DB across environments per `SUPABASE_URL` being in all 3 envs |

**NOTE:** `SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_URL` are configured for Production, Preview, AND Development in Vercel — meaning all 3 environments share the same database. This is the actual production DB. Audit RLS probes (Stage 6a) will run against real data. Cross-tenant probes are read-only; new test signups (J10a-h) will create real rows in `auth.users` and `clients`. This is acceptable for a pre-launch ship audit (no real customers to disturb), but every test signup must be cleaned up afterward.

---

## Vercel project link

| Field | Value |
|-------|-------|
| orgId | `team_bczpOLbWEvTIUEFiQEjPtegg` |
| projectId | `prj_Fvg5Jz4J1Lkn2lB53rHeKzKtPx8R` |
| Vercel CLI | 50.41.0 |

Project is linked. `vercel env ls production` works without flags.

---

## Pre-flight Notes (carried into final report)

1. **N1 (Medium):** `STRIPE_PUBLISHABLE_KEY` (no prefix) duplicates `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in Vercel env. Investigate.
2. **N2 (Medium):** Local `.env.local` missing 6 Stripe price/setup env vars. Add for local dev.
3. **N3 (Note):** Single Supabase DB across all 3 Vercel environments. Test signups during audit will produce real rows. Cleanup script needed post-audit.
4. **N4 (Pending validation):** Production `STRIPE_SECRET_KEY` test/live mode is encrypted; will validate empirically in J10a.
