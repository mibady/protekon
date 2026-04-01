# Supabase Schema + Auth Wiring — Implementation Spec

## Overview

Stage 1 of the backend-first workflow: migrate the full database schema from Shield CaaS and wire Supabase Auth into the existing Protekon FACE layer. After this stage, users can sign up, log in, reset passwords, and access the protected dashboard — all backed by real Supabase Auth with RLS-protected data.

## Layers

- [x] Database: Supabase migrations (16 tables + RLS)
- [x] Backend: Supabase client helpers + middleware + server actions
- [x] Frontend: Wire existing auth pages to real Supabase Auth
- [ ] AI: Not applicable

## Contract

### Supabase Client Exports

```ts
// lib/supabase/server.ts
export function createClient(): SupabaseClient  // Server Components + Server Actions

// lib/supabase/client.ts
export function createClient(): SupabaseClient  // Client Components (browser)

// lib/supabase/admin.ts
export function createAdminClient(): SupabaseClient  // Service role (Inngest only)

// lib/supabase/middleware.ts
export function updateSession(request: NextRequest): Promise<NextResponse>
```

### Auth Server Actions

```ts
// lib/actions/auth.ts
export async function signIn(formData: FormData): Promise<ActionResult>
export async function signUp(formData: FormData): Promise<ActionResult>
export async function forgotPassword(formData: FormData): Promise<ActionResult>
export async function signOut(): Promise<void>
```

### Type: ActionResult

```ts
type ActionResult = { error?: string; success?: boolean }
```

### Environment Variables (Already Provisioned)

```
NEXT_PUBLIC_SUPABASE_URL      ✅ in .env.local
NEXT_PUBLIC_SUPABASE_ANON_KEY ✅ in .env.local
SUPABASE_SERVICE_ROLE_KEY     ✅ in .env.local
```

## Database Schema (16 Tables)

Migrated from Shield CaaS with adaptations for Protekon.

### Migration 001 — Core Tables (5 tables)

| Table | Purpose | RLS |
|-------|---------|-----|
| `clients` | Business profiles (id = auth.uid()) | SELECT own, UPDATE own |
| `incidents` | PII-stripped incident logs (SB 553) | SELECT own, INSERT own |
| `documents` | Generated compliance documents | SELECT own |
| `audits` | Monthly compliance audit results | SELECT own |
| `training_records` | Employee training tracking | SELECT own |

### Migration 002 — Expansion Tables (11 tables)

| Table | Purpose | RLS |
|-------|---------|-----|
| `intake_submissions` | Raw intake form data | Service-role only |
| `sample_report_leads` | Email gate for sample downloads | Service-role only |
| `scheduled_deliveries` | Recurring report pipeline | SELECT own |
| `regulatory_updates` | Monitored regulatory changes | Public read |
| `construction_subs` | Subcontractor roster (Construction) | SELECT own |
| `property_portfolio` | Property portfolio (Property Mgmt) | SELECT own |
| `municipal_ordinances` | City council ordinances | Public read |
| `audit_log` | Append-only audit trail | SELECT own, INSERT own |
| `baa_agreements` | BAA tracking (HIPAA) | SELECT own, INSERT own |
| `phi_assets` | PHI system inventory (HIPAA) | SELECT own, INSERT own |
| `poster_compliance` | Labor law poster compliance | SELECT own |

### Key Schema Patterns

- All PKs: `uuid DEFAULT gen_random_uuid()`
- All timestamps: `timestamptz DEFAULT now()`
- Client ownership: `client_id uuid REFERENCES clients(id) ON DELETE CASCADE`
- RLS on ALL tables: `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
- "Own" policies: `USING (client_id = auth.uid())` or `USING (id = auth.uid())` for clients
- Service-role bypass: Admin client skips RLS for batch/Inngest operations

## Files to Create

| # | File | Purpose |
|---|------|---------|
| 1 | `supabase/migrations/001_core_schema.sql` | 5 core tables + RLS |
| 2 | `supabase/migrations/002_expansion_schema.sql` | 11 expansion tables + RLS |
| 3 | `lib/supabase/server.ts` | Server Component / Server Action client |
| 4 | `lib/supabase/client.ts` | Browser client |
| 5 | `lib/supabase/admin.ts` | Service-role client (Inngest) |
| 6 | `lib/supabase/middleware.ts` | Session refresh + route protection |
| 7 | `middleware.ts` | Next.js middleware entry point |
| 8 | `lib/actions/auth.ts` | signIn, signUp, forgotPassword, signOut |

## Files to Modify

| # | File | Change |
|---|------|--------|
| 9 | `app/login/page.tsx` | Replace simulated auth with server action |
| 10 | `app/signup/page.tsx` | Replace simulated auth with server action |
| 11 | `app/forgot-password/page.tsx` | Replace simulated auth with server action |
| 12 | `app/dashboard/layout.tsx` | Add auth check, redirect if unauthenticated |
| 13 | `package.json` | Add @supabase/supabase-js, @supabase/ssr |

## Implementation Order

### Phase 1: Dependencies + Supabase Clients (files 13, 3-6)

1. Install `@supabase/supabase-js` and `@supabase/ssr`
2. Create `lib/supabase/server.ts` — `createServerClient` with `next/headers` cookies
3. Create `lib/supabase/client.ts` — `createBrowserClient`
4. Create `lib/supabase/admin.ts` — `createClient` with service role key
5. Create `lib/supabase/middleware.ts` — session refresh via `supabase.auth.getUser()`

Pattern from Shield CaaS:
- Server client uses `cookies()` from `next/headers` (async in Next.js 16)
- Middleware client intercepts request/response to refresh session cookies
- Admin client: `autoRefreshToken: false, persistSession: false`

### Phase 2: Database Migrations (files 1-2)

6. Create `supabase/migrations/001_core_schema.sql` — clients, incidents, documents, audits, training_records
7. Create `supabase/migrations/002_expansion_schema.sql` — all 11 expansion tables
8. Run migrations via Supabase CLI or MCP

Key adaptations from Shield CaaS:
- Same schema structure, same RLS policies
- `clients.id` = `auth.uid()` (user IS the client)
- All foreign keys cascade on delete

### Phase 3: Middleware + Route Protection (files 7)

9. Create `middleware.ts` at project root
10. Match `/dashboard/:path*` and `/api/:path*` (except public API routes)
11. Call `updateSession()` to refresh auth
12. Redirect unauthenticated users to `/login`

### Phase 4: Auth Server Actions (file 8)

13. Create `lib/actions/auth.ts` with:
    - `signIn(formData)` — `supabase.auth.signInWithPassword({ email, password })`
    - `signUp(formData)` — `supabase.auth.signUp({ email, password, options: { data: { business_name, vertical, plan } } })`
    - `forgotPassword(formData)` — `supabase.auth.resetPasswordForEmail(email)`
    - `signOut()` — `supabase.auth.signOut()` + redirect to `/login`

### Phase 5: Wire Auth Pages (files 9-12)

14. **Login page** — Replace simulated submit with `signIn` server action, show error state
15. **Signup page** — Replace simulated submit with `signUp` server action, preserve 2-step form UI
16. **Forgot password page** — Replace simulated submit with `forgotPassword` server action
17. **Dashboard layout** — Add server-side auth check via `supabase.auth.getUser()`, redirect if no user
18. Wire "Sign Out" in sidebar to `signOut` server action

### Phase 6: Auth Callback Route

19. Create `app/auth/callback/route.ts` — handles Supabase auth redirects (magic links, password reset confirmation)
    - Exchange code for session via `supabase.auth.exchangeCodeForSession(code)`
    - Redirect to `/dashboard` on success

## References Consulted

- Shield CaaS: `supabase/migrations/`, `src/lib/supabase/`, `src/middleware.ts`
- Supabase SSR docs: `@supabase/ssr` cookie-based auth for Next.js App Router
- Note: This project uses **Supabase Auth** (not Clerk/Auth0) per CLAUDE.md spec

## Acceptance Criteria

- [ ] `npm run build` passes with no errors
- [ ] All 16 tables exist in Supabase with RLS enabled
- [ ] Unauthenticated users redirected from `/dashboard/*` to `/login`
- [ ] Sign up creates a Supabase Auth user + clients row
- [ ] Sign in with valid credentials → redirects to `/dashboard`
- [ ] Sign in with invalid credentials → shows error message
- [ ] Forgot password sends reset email
- [ ] Sign out clears session and redirects to `/login`
- [ ] Auth callback route handles code exchange
- [ ] Dashboard layout shows user info from session
- [ ] No simulated delays or fake auth remain in auth pages
