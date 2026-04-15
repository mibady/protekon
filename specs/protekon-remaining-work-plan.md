# protekon-remaining-work Plan

## Objective
Close the 8 remaining items from the April 15 verified audit — wire vertical dashboards into conditional sidebar nav, build 9 missing vertical main pages, backfill Sanity blog/resource metadata, ship employee-shareable + partner enablement content, set prod env vars, and verify sample PDF generation end-to-end.

## Team Members
| Role | Agent | System Prompt | Responsibility |
|------|-------|---------------|----------------|
| Lead | lead | .claude/agents/team/lead.md | Orchestrate, resolve blockers, own `docs/` cross-cutting |
| Frontend Builder | builder-ui | .claude/agents/team/builder.md | `app/dashboard/<vertical>/page.tsx` files + sidebar conditional nav |
| Backend Builder | builder-api | .claude/agents/team/builder.md | `getVertical*Summary` server actions + sample PDF verification harness |
| Content Builder | builder-content | .claude/agents/team/builder.md | Sanity batch scripts + employee/partner content authoring |
| Validator | validator | .claude/agents/team/validator.md | tsc, lint, vitest, build gates |
| Fixer | fixer | .claude/agents/team/fixer.md | Iterative error resolution |
| Auditor | auditor | .claude/agents/team/auditor.md | UI verification ≥95%, PDF end-to-end smoke |

## Contract

### Sidebar conditional vertical group (app/dashboard/layout.tsx)
```ts
type VerticalKey =
  | "agriculture" | "auto-services" | "construction" | "healthcare"
  | "hospitality" | "manufacturing" | "real-estate" | "retail"
  | "transportation" | "wholesale";

type VerticalNavEntry = {
  label: string;
  href: `/dashboard/${VerticalKey}` | `/dashboard/${VerticalKey}/${string}`;
  icon: LucideIcon | PhosphorIcon;
};

// Conditional rendering rule:
// - Single-vertical client: render only navGroup for client.vertical
// - Multi-Site client: render navGroups for every entry in client.verticals[]
// - No vertical set: skip vertical group entirely
```

### Vertical main page shape (9 new files)
Each new `app/dashboard/<vertical>/page.tsx` is a server component rendering:
- Hero strip: vertical title, description, compliance posture summary
- KPI cards (3–4): counts from vertical's primary table (e.g. `baa_agreements.count`, `property_portfolio.units_total`)
- Recent activity list (last 5 rows from primary table)
- Quick links to existing sub-pages (e.g. healthcare links to `/baa-tracker` + `/phi-inventory`)
- Reuses shadcn Card, existing KPI components; no new UI primitives

Server action per vertical:
```ts
// lib/actions/<vertical>-summary.ts
export async function get<Vertical>Summary(): Promise<{
  kpis: { label: string; value: number | string; hint?: string }[];
  recent: Array<{ id: string; title: string; subtitle?: string; href: string; at: string }>;
  links: { label: string; href: string; description: string }[];
}>
```

### Sanity batch patches
```ts
// scripts/sanity/stagger-blog-dates.ts
// scripts/sanity/generate-blog-seo.ts
// scripts/sanity/backfill-resource-meta.ts
```
All use `@sanity/client` with write token. Output log `reports/sanity-<task>-<date>.json` with diff of changed docs. Dry-run flag `--dry` required before apply.

### SEO generator (Claude Sonnet 4.6)
```ts
type SeoOutput = { metaTitle: string; metaDescription: string };
// Input: { title, excerpt, regulatoryDomain, keywordCluster }
// Constraints: metaTitle ≤60 chars; metaDescription 150–160 chars
// Retry on length violation (max 2 retries)
```

### Employee-shareable materials
- `content/employee-materials/sb-553-summary.mdx` (1–2 page handout)
- `content/employee-materials/signoff-sheet-template.mdx` (merge fields: `{{client.business_name}}`, `{{plan.wvpp_rev}}`, `{{employee.name}}`, `{{employee.date}}`)
- `content/employee-materials/manager-wvp-communication-guide.mdx`
- Hook into `generateSamplePDF()` via new `sampleKey: "sb-553-employee" | "signoff-sheet" | "manager-wvp-guide"` union
- Surface on `/dashboard/samples` (auth-bypass) + `/samples` (email-gated)

### Partner enablement
- `content/partner-enablement/the-protekon-practice.mdx` (positioning)
- `content/partner-enablement/playbook-intake-to-close.mdx`
- `content/partner-enablement/pricing-objection-handling.mdx`
- Rendered under `/partner/enablement` (new route) and linked from `/partners`

## File Ownership
| Agent | Owns | Does NOT Touch |
|-------|------|----------------|
| builder-ui | `app/dashboard/layout.tsx`, `app/dashboard/{agriculture,construction,healthcare,hospitality,manufacturing,real-estate,retail,transportation,wholesale}/page.tsx`, `app/partner/enablement/**` | `lib/actions/`, `scripts/`, `content/` |
| builder-api | `lib/actions/{agriculture,construction,healthcare,hospitality,manufacturing,real-estate,retail,transportation,wholesale}-summary.ts`, `__tests__/api/samples-gate-e2e.test.ts`, any test harness for PDF | `app/**`, `components/**`, `content/**` |
| builder-content | `scripts/sanity/*.ts`, `content/employee-materials/**`, `content/partner-enablement/**`, `reports/sanity-*.json` | `app/**`, `lib/actions/**`, `components/**` |
| validator | reads-only across all | writes only `reports/validation-*.md` |
| auditor | reads-only across all | writes only `reports/audit-*.md` |

## Tasks

### Task 1: Vertical Summary Server Actions
- **Owner:** builder-api
- **Input:** Existing vertical tables (baa_agreements, phi_assets, hospitality_inspections, manufacturing_equipment, property_portfolio, retail_locations, transportation_fleet, forklift_operators, wholesale_zones, construction_subs, agriculture_crews).
- **Output:** 9 new files `lib/actions/<vertical>-summary.ts` implementing `get<Vertical>Summary()`. Each returns KPIs + recent + links per Contract.
- **Dependencies:** none
- **Instructions:**
  Mirror the auth + RLS pattern used in `lib/actions/auto-services.ts`. Use `createServerClient()` from `@supabase/ssr`. KPIs must come from real counts (no static). Include unit tests in `__tests__/lib/actions/<vertical>-summary.test.ts` using existing mock-supabase helper.

### Task 2: Vertical Main Pages (9) + Conditional Sidebar Nav
- **Owner:** builder-ui
- **Input:** Task 1 server actions; existing auto-services/page.tsx pattern; `app/dashboard/layout.tsx` navGroups array.
- **Output:**
  - 9 new `app/dashboard/<vertical>/page.tsx` server components calling the Task 1 actions and rendering KPI + recent + links.
  - Edit to `app/dashboard/layout.tsx`: new `navGroups` entry `VERTICAL` (dynamic) that renders based on `client.vertical` (single) or `client.verticals[]` (Multi-Site).
- **Dependencies:** Task 1
- **Instructions:**
  Auto-services already has a main page — leave it untouched but add sidebar entry. For each of the other 9 verticals, main page links to existing sub-pages (e.g. healthcare → /baa-tracker, /phi-inventory). Icons: Phosphor (match auto-services). Respect tier gates if vertical is Multi-Site-only. Add `__tests__/VerticalPage.test.ts` assertions for new pages.

### Task 3: Blog Date Staggering Script
- **Owner:** builder-content
- **Input:** 116 blogPost docs in Sanity sharing 2026-04-13T06:37 timestamp; their keywordCluster + contentTier for pacing.
- **Output:** `scripts/sanity/stagger-blog-dates.ts` with `--dry` default. Distributes posts 1/weekday starting 2025-11-01 through 2026-04-13 (end = current). Emits `reports/sanity-blog-dates-<date>.json`.
- **Dependencies:** none
- **Instructions:**
  Use `@sanity/client`. Order posts by contentTier (pillar first) then alphabetical title. Skip weekends. Preserve `_updatedAt` semantics — only mutate `publishedAt`. Run `--dry` first, commit the JSON report, then run apply.

### Task 4: Blog SEO Metadata Generation
- **Owner:** builder-content
- **Input:** 116 blogPost docs (title, excerpt, regulatoryDomain, keywordCluster, slug).
- **Output:** `scripts/sanity/generate-blog-seo.ts` that calls Claude Sonnet 4.6 per post to generate `seo.metaTitle` (≤60) + `seo.metaDescription` (150–160). Batch-patches Sanity. Emits `reports/sanity-blog-seo-<date>.json`.
- **Dependencies:** none
- **Instructions:**
  Prompt template lives in `scripts/sanity/prompts/blog-seo.ts`. Retry on length violation (max 2). Concurrency cap: 5. Cache responses to disk so reruns are cheap. `--dry` required before apply.

### Task 5: Resource Metadata Backfill
- **Owner:** builder-content
- **Input:** 44 resource docs; 11 existing resourceCategory docs; 122-asset imageAsset pool; regulatoryDomain enum.
- **Output:** `scripts/sanity/backfill-resource-meta.ts`. Attaches categories (rule-based from resource.industries + resource.resourceType), assigns cover images (closest-match by title keywords against imageAsset filename/metadata), fills regulatoryDomain. Emits `reports/sanity-resource-backfill-<date>.json`.
- **Dependencies:** none
- **Instructions:**
  For ambiguous category matches, use Claude to disambiguate (structured output). If no image match ≥ 70% confidence, leave coverImage null and flag in report for manual review. Must hit 100% category + regulatoryDomain coverage; images target ≥ 80%.

### Task 6: Wire OSHA scraper-DB read fallback to Protekon production
- **Owner:** builder-ops
- **Input:** Scraper anon key from cli-ai-scraper Supabase project (`vizmtkfpxxjzlpzibate`). Verified that `protekon_osha_violations`, `protekon_employer_profiles`, `protekon_industry_benchmarks` all have `anon_read`/`protekon_anon_read` SELECT policies (no scraper migration needed).
- **Output:**
  - `.env.example` entries for `OSHA_SCRAPER_SUPABASE_URL` + `OSHA_SCRAPER_SUPABASE_KEY` ✅ (this session)
  - `lib/supabase/scraper.ts` doc comment corrected from service-role → anon ✅ (this session)
  - Two env vars set in Vercel **preview** first, verified, then promoted to production
- **Dependencies:** none
- **Instructions:**
  Retrieve the scraper project anon key via Supabase MCP or from the scraper repo's Vercel env. Set both keys on preview via Vercel MCP; deploy preview; confirm OSHA widgets populate real national data and runtime logs show scraper code path hit (not null fallback). Promote env to production. Scope is read-only — the app does not scrape; it only consumes pre-built `protekon_*` tables.

### Task 7: Employee-Shareable Materials
- **Owner:** builder-content
- **Input:** SB 553 regulatory text (from osha_knowledge_base); existing `generateSamplePDF()` signature.
- **Output:**
  - `content/employee-materials/{sb-553-summary,signoff-sheet-template,manager-wvp-communication-guide}.mdx`.
  - Extension to `lib/samples/generate-sample-pdf.ts` (new sample keys).
  - Updates to `/dashboard/samples` + `/samples` listings to surface the three materials.
- **Dependencies:** none
- **Instructions:**
  Content must cite Cal/OSHA SB 553 sections and be written at 8th-grade reading level. Sign-off sheet uses merge-field tokens per Contract. PDFs must render cleanly (2-col layout for handouts). Add rendering snapshot tests.

### Task 8: Partner Enablement Content
- **Owner:** builder-content
- **Input:** Existing `/partners` marketing pages; GTM positioning doc in project memory; "AI Compliance Officer" language standard.
- **Output:**
  - `content/partner-enablement/{the-protekon-practice,playbook-intake-to-close,pricing-objection-handling}.mdx`.
  - New route `app/partner/enablement/page.tsx` (grid of materials) + individual MDX routes.
  - Link from `/partners` and `/partner` portal sidebar.
- **Dependencies:** none
- **Instructions:**
  Use the AI Compliance Officer positioning (not "Managed Compliance"). Tone: operator-to-operator, no fluff. Include the $597/$897/$1,297 tiers + Multi-Site +$197/site overage language. Partner-only routes must be gated by `partner_profiles` check.

### Task 9: Sample PDF End-to-End Verification
- **Owner:** builder-api
- **Input:** `/api/samples/gate` GET route; all sample keys including Task 7 additions.
- **Output:** `__tests__/api/samples-gate-e2e.test.ts` — spins each sample template, asserts the returned buffer is a valid PDF (magic bytes + pdf-lib parse), covers (a) authenticated bypass, (b) email-gate happy path, (c) invalid sample key → 404.
- **Dependencies:** Task 7
- **Instructions:**
  Use existing mock-supabase + the real `pdf-lib` to parse generated output. One test per sample key. Fail loudly on any PDF < 2KB or non-parseable.

### Task 10: Validate
- **Owner:** validator
- **Input:** All builder outputs.
- **Output:** Quality gate report at `reports/validation-remaining-work.md`.
- **Dependencies:** Task 2, Task 3, Task 4, Task 5, Task 6, Task 7, Task 8, Task 9
- **Instructions:**
  Run quality-pipeline: `tsc --noEmit`, `next lint`, `vitest run`, `next build`. Prefer E2B sandbox. Report failures to Fixer; do not mark complete until all gates pass.

### Task 11: Audit
- **Owner:** auditor
- **Input:** Validated codebase.
- **Output:** `reports/audit-remaining-work.md` with functional rate.
- **Dependencies:** Task 10
- **Instructions:**
  Use agent-browser to walk: dashboard sidebar (vertical group renders per client.vertical), each of 10 vertical main pages, /dashboard/samples (new employee materials download), /partner/enablement, /api/samples/gate PDF flows. Target ≥95% functional rate. File Linear issues on any CRITICAL.

## Execution Order
1. **Parallel lane A (code):** Task 1 → Task 2
2. **Parallel lane B (CMS):** Task 3, Task 4, Task 5 (all independent, concurrent)
3. **Parallel lane C (ops):** Task 6 — restored; read-only consumer wiring only
4. **Parallel lane D (content):** Task 7 and Task 8 (both independent)
5. **Sequential after D:** Task 9 (depends on Task 7)
6. **Gate:** Task 10 Validate (depends on Tasks 2, 3, 4, 5, 6, 7, 8, 9)
7. **Gate:** Task 11 Audit (depends on Task 10)

Lanes A/B/C/D can start simultaneously — no cross-dependencies.

## References Consulted
- `CLAUDE.md` (project conventions)
- `app/dashboard/auto-services/page.tsx` (VerticalPage pattern)
- `app/dashboard/layout.tsx` (navGroups structure — 679 lines)
- Project memory: `project_platform_evolution.md`, `project_ai_officer_positioning.md`, `project_template_architecture.md`, `project_gtm_doc.md`

## Validation Criteria
- [ ] All 10 verticals appear in sidebar (conditionally) when client has matching vertical
- [ ] 9 new `/dashboard/<vertical>/page.tsx` render without error and show real KPI counts
- [ ] 116 blogPost.publishedAt timestamps are unique and distributed across weekdays
- [ ] 116 blogPost.seo.metaTitle ≤60 chars and seo.metaDescription 150–160 chars
- [ ] ≥95% of resources have categories + regulatoryDomain; ≥80% have cover images
- [ ] OSHA_SCRAPER_SUPABASE_URL/KEY (anon) set in Vercel prod; runtime logs show scraper fallback path active
- [ ] 3 employee-shareable PDFs render via generateSamplePDF and appear on /dashboard/samples
- [ ] 3 partner enablement docs render at /partner/enablement and link from /partners
- [ ] `samples-gate-e2e.test.ts` green for every sample key
- [ ] tsc, lint, vitest, build all pass
- [ ] Auditor functional rate ≥95%
