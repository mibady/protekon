# Protekon Ship Decision — 2026-04-27

## Verdict: **C1 FIXED — MANUAL SMOKE REMAINS**

The original audit found one critical blocker: recursive RLS policies on `user_roles` and `action_items` caused Postgres `42P17 infinite recursion` for authenticated users. That blocker has now been fixed in production and captured in `supabase/migrations/055_fix_user_roles_recursion.sql`.

Current ship status: infrastructure signals are strong, the C1 database blocker is resolved, and the remaining pre-ship gap is browser-level smoke testing of authenticated dashboard rendering plus the Stripe checkout journey.

After that fix, the audit signal is **strongly positive**: 0 TypeScript errors, 0 lint issues, 0 mock pattern violations, 100% cross-tenant RLS enforcement on the tables that work, all 3 Stripe plan lookup keys live and active, marketing site clean, auth middleware enforcing protection on all dashboard routes.

---

## Summary

| Audit area | Result |
|------------|--------|
| Pre-flight env | PASS with 2 medium notes (`STRIPE_PUBLISHABLE_KEY` duplicate, missing local Stripe price vars) |
| Stage 0 — schema conformance | PASS (no code-vs-DB bugs); 9 tables drifted from migrations |
| Stage 1 — static gates (tsc/lint/mock) | PASS (0/0/0, score 85/100) |
| Stage 2 — unit tests | NOT A BLOCKER (54 failures = test debt + env, not product bugs) |
| Stage 6a — RLS cross-tenant probe | PASS (12/12 probes denied, 5/5 verticals authenticated) |
| Stage 6c — Stripe API integrity | PASS (production `sk_test_*` confirmed; 3/3 plan lookup keys active) |
| Marketing routes (9 sampled) | PASS (9/9 → 200) |
| Auth-protected routes (7 sampled) | PASS (7/7 → 307 to /login, middleware enforcing) |
| Codex adversarial review | NO FINDINGS (no recent code changes to review against working tree) |
| Stage 5 — full UI journey | DEFERRED (8 GB local RAM constraint; needs E2B sandbox or cloud Playwright; partial empirical coverage achieved via HTTP probes) |

**Routes audited (HTTP layer):** 30+ across marketing + auth-protected + dashboard
**Verticals exercised:** 5 (construction, property, hipaa, municipal, hospitality) — all authenticated successfully via Supabase Auth
**Cross-tenant probes:** 12 (all denied)
**Stripe lookup keys verified:** 3 active

---

## Critical Blockers

No open critical blockers after the C1 fix.

### Resolved Criticals

| # | File:Line | Issue | Suggested fix | Est. fix time |
|---|-----------|-------|---------------|---------------|
| **C1** | `supabase/migrations/047_user_roles.sql:user_roles_select`, `supabase/migrations/053_action_items.sql:action_items_*` | RLS policy recursion caused Postgres `42P17 infinite recursion` for authenticated queries against `user_roles` and `action_items`. | **Resolved.** Production policies now call `public.user_has_client_access(client_id)` / `public.user_is_client_owner(client_id)`. Fix is captured in `supabase/migrations/055_fix_user_roles_recursion.sql`. Verified all 5 demo accounts can query `user_roles` and `action_items`; cross-tenant helper probe returned `false`. | Done |

**Previously affected user-facing surfaces:**
- `/dashboard/action-items` page — `listActionItems()` → 500
- Action items creation form (`requestPropertyReview` server action) → likely 500 on insert
- `lib/auth/roles.ts` queries — possibly affected
- `lib/actions/team.ts` (4 user_roles queries) — team management likely broken
- `app/onboarding/people/page.tsx:35` — onboarding step may fail
- `inngest/functions/onboarding/send-team-invites.ts:36` — team invite flow may fail
- `lib/actions/onboarding/workers.ts` — worker onboarding may fail

---

## High Issues (consider fixing, but not ship-blocking)

| # | Severity | Issue | Source |
|---|----------|-------|--------|
| H1 | High (test debt) | 30 unit tests assert outdated auth error string `"Unauthorized"` but code returns `"Please log in to continue."`. Bulk-update tests. ~30 min. | `02-unit-analysis.md` S2-1 |
| H2 | High (governance) | Migration drift: 9 tables + 2 views exist in live app DB but no migration creates them (`workers`, `team_members`, `credentials`, `v_client_resources`, `construction_coi`, `resource_types`, `client_action_items`, `system_activity`, `v_client_activity`, plus 2 views). `supabase db reset` would break the app. Backfill migrations or document outside-migration changes. | `00-schema-conformance.md` S0-1 |

---

## Medium Issues (defer to post-ship backlog)

| # | Issue | Source |
|---|-------|--------|
| M1 | `STRIPE_PUBLISHABLE_KEY` (no `NEXT_PUBLIC_` prefix) duplicates `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in Vercel env. Investigate. | Pre-flight N1 |
| M2 | `.env.local` missing `STRIPE_PRICE_*` and `STRIPE_SETUP_*` vars. Local dev of checkout flow would fail. | Pre-flight N2 |
| M3 | Single Supabase DB across all 3 Vercel environments (Production/Preview/Development). Test signups during audit will produce real rows. Cleanup script needed post-audit. | Pre-flight N3 |
| M4 | Stripe-checkout, webhook, score-submit, chat unit tests have broken mock setup (return 500 vs expected 200/400). | `02-unit-analysis.md` S2-3 |
| M5 | Three-DB architecture (app + scraper + intel) was undocumented in governance docs. | **Resolved in docs:** `CLAUDE.md`, `README.md`, and `docs/db-architecture.md` now describe all three DB contexts. |
| M6 | 2 views in migrations (`site_rollup`, `site_unassigned`) violate `v_` prefix convention. | `00-schema-conformance.md` S0-3 |
| M7 | `client_reminders` table has no RLS policy in migrations despite holding client-scoped data. Verify live DB state — may have been added outside migrations. | `00-schema-conformance.md` S0-4 |
| M8 | Empirical tests for the action_items RLS fix should also verify: `lib/auth/roles.ts`, `lib/actions/team.ts`, onboarding/people flow all work. | C1 follow-up |

---

## Low Issues

| # | Issue | Source |
|---|-------|--------|
| L1 | 3 tables defined but never used (`document_template_meta`, `intake_submissions`, `template_jurisdiction_overrides`). Possible dead schema. | S0-5 |
| L2 | 8 tables have RLS enabled but no policies in migrations — service-role-only. Confirm intentional. | S0-6 |

---

## What was NOT verified (audit gaps to fill before declaring SHIP-READY)

The 8 GB local RAM constraint forced deferral of browser-based UI verification. The following are NOT empirically confirmed by this audit:

| Gap | Impact | How to fill |
|-----|--------|-------------|
| Authenticated dashboard pages render with real data (we confirmed routing + middleware work, not actual page content) | Medium — code paths verified to exist by Stage 0 grep, but rendering behavior not validated | Run Stage 5 in E2B sandbox (per plan), OR a single Playwright headless smoke from a beefier machine |
| Real button clicks on each of 30 dashboard pages | High — "everything must work" was the user's bar | Same: E2B-based agent-browser sweep, 5 verticals × 30 pages |
| Stripe checkout end-to-end (J10a happy path) — visit /pricing, fill form, complete checkout, verify clients.status flip + Inngest event fired + welcome email sent | High — Stripe API config verified, but end-to-end customer journey not tested | Run J10a manually in browser OR via E2B Playwright. Estimated 15 min manual. |
| Inngest queue health (last 24 h failed runs, stuck functions) | Medium | Query Inngest cloud dashboard or API. Estimated 10 min. |
| Resend email delivery | Medium — RESEND_API_KEY validated, but emails not actually sent during audit | J10a tests this end-to-end. |
| Visual regression / Meticulous baseline | Low | Skip pre-launch. |

**Recommendation for closing gaps:** run a 30-minute manual smoke from a browser hitting www.protekon.org as the construction account (`admin@sierraridgebuilders.com` / `demo-password-2026`). Click through dashboard, coverage, incidents, action-items, settings, and briefing. If those render data correctly, run the Stripe checkout journey and then ship.

---

## Placeholder Page Disposition

This audit did not have the bandwidth to classify each of the 30 dashboard pages as Wired / Static / Coming Soon. Stage 5 was deferred. Recommend a follow-up audit pass with E2B + agent-browser to produce the full 150-cell page-vertical matrix per the plan.

For the user's stated bar of "everything must work," **the audit cannot certify it without that pass.** The fastest path now is a 30-minute manual click-through plus the Stripe checkout journey to validate the most-trafficked routes for ship.

---

## Audit Evidence (file references)

| Stage | Artifact |
|-------|----------|
| Pre-flight | `reports/ship-audit-2026-04-27/00-preflight.md` |
| Stage 0 — schema | `reports/ship-audit-2026-04-27/00-canonical-schema.json`, `00-schema-conformance.md` |
| Stage 1 — static gates | `reports/ship-audit-2026-04-27/01-static.txt` |
| Stage 2 — unit tests | `reports/ship-audit-2026-04-27/02-unit.txt`, `02-unit-analysis.md` |
| Stage 6a — RLS probe | `reports/ship-audit-2026-04-27/06a-rls.json` |
| Stage 5 — page render smoke (limited) | `reports/ship-audit-2026-04-27/05-page-render-smoke.json` |
| Codex review | session ID `019dd01f-fefb-7661-8166-f3ebfb8cece6` (resume: `codex resume <id>`) |

---

## Recommended next steps (ranked by ROI)

1. **[15 min] Manual browser smoke** — log in as construction admin, click through 8-10 dashboard pages, verify they render with data and `/dashboard/action-items` no longer 500s.
2. **[15 min] Stripe checkout journey** — visit `/pricing`, use a fresh email and test card, verify Stripe payment, app DB client status, Inngest, and email/Sentry signals.
3. **[30 min] Fix H1 test debt** — bulk-update 30 unit test assertions, get suite back to green.
4. **[ship]** — once manual smoke and Stripe checkout pass, ship.
5. **[post-ship, 1 day backlog]** — H2 migration backfill, M1-M8 governance cleanup, gap-fill audit (E2B-based full page matrix).

---

**Audit duration:** ~75 min wall-clock (vs ~50 min planned target with full cloud parallelism, which we couldn't run due to local RAM constraints).
**Audit cost:** $0 (no E2B sandboxes spawned; all checks ran locally or via HTTP).
**Audit quality:** Strong on infrastructure/code/data layer; partial on UI render verification (gap acknowledged).
