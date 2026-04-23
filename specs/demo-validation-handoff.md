# Demo Account Matrix + Production Readiness Validation — Handoff

> Self-contained execution brief. Pick up cold. No prior conversation context required.

## Goal

Get Protekon to **100% production-ready** by building:

1. A curated set of demo accounts that covers every vertical, role, plan tier, and lifecycle state in the product.
2. A QA scratch org + toggle script that lets us cycle through states (plan tier, lifecycle, integrations-connected, intake steps, partner tier) on a single mule without maintaining 25+ demo accounts.
3. A Playwright spec that logs in as every demo account + cycles the scratch org through every state, asserting every one of the 26 dashboard surfaces renders correctly.

Together these prove that every code path in the product actually works before shipping.

## Current state (2026-04-20)

- `scripts/seed-demo-v2.ts` is written to ~600 lines covering **Phase A only** (auth users, clients, partner profiles, user_roles, sites, partner_clients, partner_assessments). Phase B (vertical-specific tables) is TODO.
- A Supabase preview branch was created (`demo-seed-validation`, project_ref `kjdhhaxeqpnohuxlolpn`) but migrations failed. Branch has been **deleted** — no billing.
- Existing `scripts/seed-demo.ts` (v1, 543 lines, seeds one org — Coastal Health Group) is still in place. It runs successfully against production. Do not delete until v2 is validated.
- Existing Playwright infra (`playwright.config.ts` + 16 e2e specs in `e2e/`) is wired. `auth.setup.ts` handles login.

## Architecture decisions already made

| Question | Decision |
|----------|----------|
| Preview branch or production? | Preview branch first — production only after validation. |
| Destructive cleanup? | Yes — v2 seed wipes demo emails on every run. |
| Password convention? | `demo-password-2026` for all accounts. Rotate before public launch. |

## The 7 demo orgs + 11 logins

### Orgs (one owner login each)

| # | Email | Org | Vertical | State | Plan | Compliance | Purpose |
|---|-------|-----|----------|-------|------|-----------|---------|
| 1 | `admin@sierraridgebuilders.com` | Sierra Ridge Builders | construction | CA | multi-site | 87% | CA construction GC, 4 sites — richest demo, exercises subs cluster + SB 553 + multi-site rollup |
| 2 | `admin@pacificcoastproperty.com` | Pacific Coast Property Group | property | CA | professional | 92% | Property vertical, Prop 65, AB 1482 |
| 3 | `admin@coastalhealthgroup.com` | Coastal Health Group | hipaa | National (CA/WA/AZ) | managed | 78% | HIPAA, multi-state, BAAs, PHI assets |
| 4 | `admin@summitmunicipal.com` | Summit Municipal Services | municipal | CA | professional | 95% | Public works, municipal ordinances, DIR |
| 5 | `admin@goldenstatehospitality.com` | Golden State Hospitality | hospitality | CA | core | 68% | Low-tier customer, low compliance, **partner-referred** (by ComplianceFirst) |
| 6 | `admin@lonestarbuilders.com` | Lone Star Builders | construction | TX | trial | 42% | New signup (day 1 of trial), intake flow |
| 7 | `billing@riverdeltalogistics.com` | River Delta Logistics | construction | CA | professional | 81% | Past-due, day 7 of 10 — tests payment-failed workflow |

All passwords: `demo-password-2026`

### Team users (3 additional logins on Sierra Ridge — tests RBAC)

| Email | Role |
|-------|------|
| `manager@sierraridgebuilders.com` | compliance_manager |
| `field@sierraridgebuilders.com` | field_lead |
| `auditor@sierraridgebuilders.com` | auditor |

Sierra Ridge's owner login covers the `owner` role. Four RBAC roles total per migration 047.

### Partners (4 logins — covers all 4 partner tiers)

| Email | Company | Tier | Status | Manages |
|-------|---------|------|--------|---------|
| `sarah@compliancefirst.io` | ComplianceFirst Consulting | enterprise | approved | Golden State Hospitality + 3 assessments |
| `hello@safeguardadvisors.com` | Safeguard Advisors | professional | approved | 1 pending assessment |
| `contact@complianceessentials.co` | Compliance Essentials Co | essentials | approved | — |
| `intro@partnerprospect.io` | PartnerProspect Advisory | free | pending | — |

**Total: 11 logins across 7 orgs + 4 partners.**

## The QA scratch org (single mule + toggle script)

Create one additional org: `qa-scratch@protekon-internal.com` / `demo-password-2026`.

`scripts/qa-toggle.ts` should expose CLI flags that mutate this org's state:

```bash
pnpm qa:toggle --plan=core|professional|multi-site
pnpm qa:toggle --lifecycle=trial|active|past-due|canceled
pnpm qa:toggle --integrations=connected|disconnected
pnpm qa:toggle --intake-step=1|2|3
pnpm qa:toggle --partner-tier=free|essentials|professional|enterprise
pnpm qa:seed --subs=40-with-expired-COIs
pnpm qa:seed --pending-1099s=15
pnpm qa:reset     # restore baseline
```

Each flag is a single targeted UPDATE via service role. The scratch org replaces ~14 redundant demo accounts.

## Schema landmines (found during reconnaissance)

### 1. Incident retention trigger (migration 045)

Migration 045 installs a DELETE trigger on `incidents` that **rejects deletes** while `retained_until > now()` (5-year retention per 29 CFR 1904.33). The existing v1 seed's cleanup (`.delete().eq("client_id", userId)` on incidents) **will fail** against current schema.

**Workarounds (pick one):**

- **Best (no dep):** Backdate `retained_until` before deleting. Two-step cleanup:
  ```ts
  await admin.from("incidents").update({ retained_until: "1900-01-01" }).in("client_id", clientIds)
  await admin.from("incidents").delete().in("client_id", clientIds)
  ```
  Trigger compares `retained_until > now()` → false → delete allowed.
- **Alternative:** Disable trigger via SQL (`ALTER TABLE incidents DISABLE TRIGGER incidents_guard_delete`). Requires a way to exec raw SQL. No `exec_sql` RPC exists in this project. Options:
  - Add `pg` dep (`pnpm add pg @types/pg`) and use `DATABASE_URL` from `.env.local` (it's in `POSTGRES_URL`).
  - Create a service-role-only `exec_sql` RPC in a new migration.
  - Use Supabase MCP `execute_sql` tool (only if running seed from a Claude session, not CI).

### 2. `user_roles` self-referential RLS (migration 047)

Migration 047 seeds `user_roles` with one `owner` row per existing client (`INSERT INTO user_roles SELECT id, id, 'owner', now() FROM clients ON CONFLICT DO NOTHING`). This runs during migration. When seed v2 creates new clients, those clients' owner rows do NOT get auto-created — the seed script must insert them explicitly.

The v2 scaffold already does this in `seedUserRoles()` via upsert on `(user_id, client_id)`.

### 3. `integrations` table is service-role-only (migration 050)

`integrations` has `deny-all` RLS for authenticated users. Reads/writes go through `/api/integrations/[provider]/authorize` + `/callback` which use `createAdminClient()`. Seeder uses the admin client so it bypasses RLS — fine. Store encrypted tokens as `null` for demos (real encryption requires `INTEGRATIONS_ENCRYPTION_KEY` env var).

### 4. Cascade cleanup

Most client-scoped tables have `ON DELETE CASCADE` from `clients(id)`. Deleting the clients row takes child rows with it. **Exceptions that need explicit cleanup:**

- `user_roles` — CASCADE from `clients` is defined but the seed should nuke explicitly first to avoid constraint timing issues.
- `partner_clients` — CASCADE from both `partner_profiles` AND `clients`.
- `partner_assessments` — only CASCADEs from `partner_profiles`. Clean by prospect email.
- `integrations` — CASCADE from `clients`. OK.
- `intake_submissions` — no FK, clean by email.

## Migration blocker (must fix before preview branches work)

The branch build failed with `relation "shield_osha_violations" does not exist`. Root cause is **not** migration 009 (it uses `drop table if exists`, which is safe). The error likely originates from a migration that tries to SELECT from the table before dropping it, or from Supabase's own migration runner reconciling an out-of-order apply.

**Other suspicious patterns in the migration directory:**

- Duplicate migration `023`: both `023_expand_document_template_meta_37_templates.sql` and `023_knowledge_base_unique_title.sql` — Supabase CLI ordering is undefined for collisions.
- Gaps at 035, 036, 037, 040, 041, 042, 043. Fine if intentional, but worth confirming no migration in 044+ references tables created by a missing one.

**Diagnosis approach:**

1. Create a new branch with empty `with_data: false` — same as before.
2. As soon as branch shows `CREATING_PROJECT`, poll `list_branches` every 30s.
3. When branch flips to `MIGRATIONS_FAILED`, use `get_logs` with `service=postgres` to find the exact migration that errored.
4. Rename duplicate `023_knowledge_base_unique_title.sql` → `023a_knowledge_base_unique_title.sql`.
5. If `shield_osha_violations` errors persist: add a `000_bootstrap_legacy.sql` that creates a stub `shield_osha_violations` table so `drop table if exists` has something to drop — or patch migration 009 to remove any implicit dependency.

Allocate 30-60 min for this. Hard to estimate exactly without the full error trace.

## Stage 1 — seed-demo-v2.ts

**File:** `scripts/seed-demo-v2.ts` (already scaffolded, ~600 lines, Phase A complete)

### Phase A (done)
- Env loading, admin client, types
- Full config: 7 orgs, 3 team users, 4 partners (see tables above — data lives in the file)
- `cleanAll()` — cascades via `clients` + explicit cleanup for non-cascade tables
- `createAuthUsers()` — resolves Map<email, userId> for all logins
- `seedClients()`, `seedPartnerProfiles()`, `seedUserRoles()`, `seedSites()`, `seedPartnerClients()`, `seedPartnerAssessments()`

### Phase B (TODO — this is the bulk of the work)

Add these seeders to the file, call them from `main()` after Phase A:

1. **`seedIncidents(ctx)`** — 2-5 incidents per org. Include at least one "severe" + one "near-miss" + one "property damage". For HIPAA orgs, include realistic types. Remember retention trigger — **set `retained_until` to sensible values** (incident_date + 5y is the migration 045 default, so just omit and let the trigger set it).
2. **`seedDocuments(ctx)`** — 6-10 docs per org. Mix statuses: `current`, `requested`, `pending`. Types include: wvpp, gap-analysis, incident-response-protocol, training-curriculum, audit-package, salary-range, eeo-policy, leave-policy. For trial orgs: minimal (2-3 requested docs).
3. **`seedAudits(ctx)`** — 3 monthly audits per active org (Jan/Feb/Mar 2026). Each has a `checks` JSONB array of 10 check items. Score improves over time.
4. **`seedTraining(ctx)`** — 10-18 training records per org. Mix statuses: completed, overdue, pending. Training types vary by vertical (SB 553 for CA orgs, HIPAA Privacy for healthcare, EEO Awareness for all, forklift cert for warehouse).
5. **`seedSubs(ctx)`** — `construction_subs` rows for construction orgs. Sierra Ridge: 12 subs. Lone Star: 3 subs (trial). River Delta: 8 subs. Mix `license_status` (valid/expiring/suspended) and `insurance_status`. Scratch org later needs 40+ subs for stress test.
6. **`seedProjects(ctx, siteIdByOrgSite)`** — `projects` rows tied to sites. Then `project_subs` links. Sierra Ridge: 6 active projects across 4 sites. Status mix: planned, active, completed.
7. **`seedSubSafetyPrograms(ctx)`** — IIPP/HazCom/WVPP/Heat/Respirator/Fall/Confined/LOTO per sub. At least one `expired` status on Sierra Ridge for alert testing.
8. **`seedVendorPayments(ctx)`** — Past-year payments for construction subs. Mix totals so some subs cross $600/year threshold (1099-NEC required) and some don't.
9. **`seedBaa(ctx)`** — 4-6 BAA agreements for Coastal Health. Mix `baa_status`: active, pending, missing.
10. **`seedPhiAssets(ctx)`** — 3-4 PHI systems for Coastal Health. Mix `risk_level` + encrypted states.
11. **`seedProperties(ctx)`** — `property_portfolio` rows for Pacific Coast (8-12 properties, multi-use types, various `compliance_status`).
12. **`seedPosters(ctx)`** — 4-6 poster locations per org with sites. Mix `status`: verified, needs-update, unknown.
13. **`seedAcknowledgmentRequests(ctx)`** — 2 campaigns per active org. Pair with signed `acknowledgments` rows (3-8 each).
14. **`seedIntegrations(ctx)`** — 2 OAuth-connected integrations for Sierra Ridge + Coastal Health. Use `status: 'connected'`, null encrypted tokens.
15. **`seedScheduledDeliveries(ctx)`** — 3 per active org (monthly WVPP, quarterly audit, annual training).
16. **`seedAuditLog(ctx)`** — 8-15 audit log entries per org (document.generated, incident.reported, audit.completed, training.assigned, baa.signed, score.recalculated).
17. **`seedIntakeSubmissions()`** — 3 rows: one for Lone Star (step 1 submitted, day 0), one scoring mid-flow, one for a never-converted prospect.
18. **`seedRegulatoryUpdates()`** — 6 regulatory updates spanning CA, Federal, NY. Mix severity/category. NO `client_id` — shared across all clients.
19. **`seedMunicipalOrdinances()`** — 3 CA ordinances (SF, LA, state). Shared.

Reference the existing `scripts/seed-demo.ts` lines 132-512 for exact column names and realistic sample data. Do **not** copy-paste data blindly — `seed-demo-v2.ts` supports 7 orgs, so most rows need `client_id = ctx.orgUserIds.get(email)!` interpolation.

### Running

```bash
# Against production (after migration fix + preview branch validation)
npx tsx scripts/seed-demo-v2.ts

# Against preview branch (once migrations are fixed)
NEXT_PUBLIC_SUPABASE_URL=<branch-url> \
SUPABASE_SERVICE_ROLE_KEY=<branch-service-key> \
npx tsx scripts/seed-demo-v2.ts
```

Get branch URL + service key via Supabase MCP (`get_project_url`, `get_publishable_keys` on the branch's `project_ref`) or via the Supabase dashboard.

### Validation checklist for Stage 1

- [ ] All 11 logins work at `/login` (redirect to `/dashboard` or `/partner`)
- [ ] Each org's dashboard shows correct compliance %, incident count, training count matching seed data
- [ ] RLS: logging in as Sierra Ridge owner does NOT show Coastal Health's data
- [ ] RBAC: `field@sierraridgebuilders.com` sees dashboard but cannot access `/dashboard/team` or billing
- [ ] Partner portal: `sarah@compliancefirst.io` sees Golden State Hospitality in their managed clients + 3 assessments
- [ ] Partner-referred: Golden State's `clients.partner_id` resolves to ComplianceFirst's `partner_profiles.id`
- [ ] Trial: Lone Star's dashboard shows onboarding banner, not full feature set
- [ ] Past-due: River Delta shows payment-failed banner, can still view data
- [ ] No seed script errors on re-run (idempotent)

## Stage 2 — qa-scratch-seed.ts + qa-toggle.ts

**Files to create:**

- `scripts/qa-scratch-seed.ts` — seeds a single scratch org with baseline data
- `scripts/qa-toggle.ts` — CLI that mutates scratch org state

### Scratch org baseline

```ts
const SCRATCH = {
  email: "qa-scratch@protekon-internal.com",
  password: "demo-password-2026",
  businessName: "QA Scratch Org",
  vertical: "construction", // easy to flip via toggle
  plan: "professional",     // starting tier
  status: "active",
  complianceScore: 80,
  // Full data: 3 incidents, 8 docs, 3 audits, 12 training, 15 subs, 3 projects,
  // 2 safety programs per sub, 4 BAAs (unused since construction), no PHI,
  // 3 properties (unused), 6 posters, 2 ack requests, 0 integrations,
  // 8 audit log entries.
}
```

### Toggle commands

Each toggle is one UPDATE + optional INSERT/DELETE to add/remove child rows. All go through the service role (bypass RLS).

```ts
// --plan=X
await admin.from("clients").update({ plan: arg }).eq("email", SCRATCH.email)

// --lifecycle=X
const state = { trial: "trial", active: "active", "past-due": "past-due", canceled: "canceled" }[arg]
await admin.from("clients").update({ status: state }).eq("email", SCRATCH.email)
// Also adjust stripe_customer_id for trial/canceled

// --integrations=connected
await admin.from("integrations").upsert([
  { client_id, provider: "quickbooks", status: "connected", account_label: "QuickBooks Online (QA)", connected_at: now },
  { client_id, provider: "stripe", status: "connected", account_label: "Stripe Live (QA)", connected_at: now },
], { onConflict: "client_id,provider" })

// --intake-step=X
await admin.from("intake_submissions").upsert({
  email: SCRATCH.email,
  step: arg,
  // ... data for step 1/2/3
})

// --partner-tier=X — applies to the PARTNER scratch, not client scratch
// Requires a paired qa-scratch-partner@protekon-internal.com

// --subs=40-with-expired-COIs
// Wipe scratch's construction_subs, insert 40 with mix of expiring/expired COIs
await admin.from("construction_subs").delete().eq("client_id", scratchId)
await admin.from("construction_subs").insert(/* 40 rows */)

// --pending-1099s=15
// Insert 15 vendor_payments rows that push 15 different subs over $600/year
```

### Validation checklist for Stage 2

- [ ] Each toggle runs without error
- [ ] Each toggle produces the expected UI state change (verify manually once before wiring Stage 3)
- [ ] `qa:reset` restores the baseline — round-trips cleanly

## Stage 3 — e2e/demo-validation.spec.ts

**File:** `e2e/demo-validation.spec.ts`

### Scope

- Log in as each of the 11 demo users
- Navigate to each of the 26 dashboard surfaces (listed below)
- Assert: no console errors, no 404s, key data renders (heading, not-empty state, at least one row where applicable)
- For the scratch org: invoke each toggle, re-navigate, re-assert
- Output a summary: `✅ 11 users × 26 surfaces = 286 checks` + any failures with screenshots

### The 26 surfaces (from migration 047 sidebar spec)

| Group | Surfaces |
|-------|----------|
| Today | briefing |
| My Business | dashboard, coverage, documents, training, incidents, acknowledgments, calendar, activity |
| My Subs | projects, vendor_risk, coi_verification, sub_onboarding, safety_programs, form_1099 |
| Intelligence | whats_happening, reg_changes, benchmarks, pipeline, knowledge, marketplace |
| Account | audit_trail, team, scheduled_reports, integrations, my_business |

Plus partner portal surfaces (`/partner`, `/partner/assessments`, `/partner/clients`).

### Tier-gating expectations

- Core plan (`golden-state-hospitality`): subset of sidebar items hidden (multi-site surfaces, advanced intelligence)
- Professional plan: most items visible, a few multi-site hidden
- Multi-site plan (Sierra Ridge): all surfaces visible
- Trial (Lone Star): limited to briefing, documents, training, onboarding flow
- Past-due (River Delta): all surfaces visible but with banner

Spec should assert that the expected nav items are/aren't present based on plan.

### Skeleton

```ts
import { test, expect, Page } from "@playwright/test"

const DEMO_LOGINS = [
  { email: "admin@sierraridgebuilders.com", password: "demo-password-2026", plan: "multi-site", role: "owner", expectedSurfaces: [/* all 26 */] },
  // ... 10 more
]

const SURFACES = [
  { key: "briefing", href: "/dashboard/briefing", heading: /today/i },
  // ... 25 more
]

for (const login of DEMO_LOGINS) {
  test.describe(`demo: ${login.email}`, () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, login)
    })
    for (const surface of login.expectedSurfaces) {
      test(`${surface.key} renders`, async ({ page }) => {
        await page.goto(surface.href)
        await expect(page.locator("h1")).toBeVisible()
        // Assert no console errors
        // Assert non-empty content
      })
    }
  })
}

// Scratch org — cycle through states
test.describe("scratch org state cycles", () => {
  const STATE_CYCLES = [
    { name: "plan=core", toggle: ["--plan=core"], assertions: /* fewer sidebar items */ },
    { name: "plan=multi-site", toggle: ["--plan=multi-site"], assertions: /* all sidebar items */ },
    // ... 6 more cycles
  ]
  for (const cycle of STATE_CYCLES) {
    test(cycle.name, async ({ page }) => {
      execSync(`npx tsx scripts/qa-toggle.ts ${cycle.toggle.join(" ")}`)
      await loginAs(page, SCRATCH_LOGIN)
      // run assertions
    })
  }
})
```

### Validation checklist for Stage 3

- [ ] All 11 logins × their expected surfaces = green
- [ ] Scratch org state cycles = green
- [ ] Spec runs headlessly in CI (no manual intervention)
- [ ] Failures produce screenshots + console error logs
- [ ] Total runtime < 10 minutes

## Final success criteria

Protekon is demo-ready + production-ready when:

1. ✅ `npx tsx scripts/seed-demo-v2.ts` completes without error against both preview branch and production
2. ✅ `npx tsx scripts/qa-toggle.ts --plan=multi-site --lifecycle=active --integrations=connected` round-trips cleanly
3. ✅ `pnpm playwright test e2e/demo-validation.spec.ts` passes 100%
4. ✅ All 11 demo logins work interactively (manual smoke — 5 min)
5. ✅ Preview branch can be created from scratch and migrations succeed (regression guard)

## File inventory when complete

| File | Status | Size |
|------|--------|------|
| `scripts/seed-demo-v2.ts` | Scaffold done (Phase A), Phase B TODO | ~1,800-2,400 lines |
| `scripts/qa-scratch-seed.ts` | TODO | ~300 lines |
| `scripts/qa-toggle.ts` | TODO | ~400 lines |
| `e2e/demo-validation.spec.ts` | TODO | ~600 lines |
| `scripts/seed-demo.ts` (v1) | Keep as fallback until v2 validated | 543 lines (unchanged) |
| `supabase/migrations/NNN_*.sql` | Fix whatever's breaking preview branches | 1-2 new migrations likely |

## Open questions / judgment calls

1. **Password rotation:** Current spec says keep `demo-password-2026`. Rotate to per-account strong passwords before any public demo.
2. **Stripe customer IDs:** Demo clients have fake `cus_demo_*` IDs. If Stripe webhook testing is in scope, replace with real Stripe test-mode customer IDs.
3. **Integration encryption:** Demo seed skips encrypted token generation. If testing OAuth flows, populate `encrypted_access_token` via the real auth handler, not the seed.
4. **Retention trigger:** Seed uses backdate-then-delete pattern (no SQL exec needed). If future tests need to insert incidents with custom retention, revisit.
5. **Partner-referred attribution:** Golden State is partner-referred. Confirm the `/score?pid=X` → client creation flow actually sets `partner_id` (currently a gap flagged in `specs/ship-ready-plan.md`).
