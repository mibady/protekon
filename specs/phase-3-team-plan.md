# phase-3-team-plan Plan

## Objective
Reconcile the parallel-agent's untracked deliverables, then ship Phase 3 (channel + multi-state) for Protekon: white-label partner portal, jurisdiction-aware document generation, and validated commits of in-flight work.

## Team Members
| Role | Agent | System Prompt | Responsibility |
|------|-------|---------------|----------------|
| Lead | lead | .claude/agents/team/lead.md | Orchestrate, triage parallel work, never writes code |
| Reconciliation Builder | builder-recon | .claude/agents/team/builder.md | Triage + commit ~30 untracked files in domain-scoped commits |
| DB Builder | builder-db | .claude/agents/team/builder.md | Migrations for partner branding + jurisdiction tables |
| Backend Builder | builder-api | .claude/agents/team/builder.md | Server actions, jurisdiction-aware template resolver, partner branding API |
| Frontend Builder | builder-ui | .claude/agents/team/builder.md | White-label partner portal UI, branded sample pages, multi-state UI hints |
| Content Builder | builder-content | .claude/agents/team/builder.md | Federal OSHA template variants, partner-branded content tokens |
| Validator | validator | .claude/agents/team/validator.md | tsc, lint, vitest, build — including paywall mock fix from runbooks |
| Fixer | fixer | .claude/agents/team/fixer.md | Iterative error resolution (paywall mock + jurisdiction-resolver edges) |
| Auditor | auditor | .claude/agents/team/auditor.md | UI verification ≥95%, partner-branded preview e2e |

## Contract

```ts
// Partner branding (per-partner overrides applied at request time)
interface PartnerBrandingConfig {
  partnerId: string
  displayName: string                  // "Smith Insurance Group"
  logoBlobUrl: string | null
  primaryColor: string                 // hex, default brand crimson
  accentColor: string                  // hex
  emailFromName: string | null         // "Smith Insurance via Protekon"
  customDomainHost: string | null      // "compliance.smithgroup.com"
  contactEmail: string                 // for client correspondence
  hideProtekonAttribution: boolean     // true = white-label mode
}

// Jurisdiction (drives template variants)
type Jurisdiction = "ca" | "federal" | "ct" | "md" | "mn" | "nj" | "wa" | "tx" | "va" | "mi" | "or"

interface JurisdictionTemplateOverride {
  templateId: string                   // e.g. "wvpp"
  jurisdiction: Jurisdiction
  sectionsOverride: TemplateSection[]  // replaces base sections when present
  legalRefSwap: Record<string, string> // "Cal/OSHA" -> "OSHA Federal"
}

// Server actions
async function getPartnerBranding(partnerId: string): Promise<PartnerBrandingConfig | null>
async function applyBrandingToHtml(html: string, branding: PartnerBrandingConfig): Promise<string>
function resolveTemplate(templateId: string, jurisdiction: Jurisdiction): TemplateSection[]
```

## File Ownership
| Agent | Owns | Does NOT Touch |
|-------|------|----------------|
| builder-recon | git index only — stages, splits commits across the ~30 untracked files | source modifications beyond `git mv` for renaming |
| builder-db | `supabase/migrations/033_*.sql`, `supabase/migrations/034_*.sql` | `lib/`, `app/`, `components/` |
| builder-api | `lib/actions/partner-branding.ts`, `lib/jurisdiction.ts`, `lib/document-templates.ts` (jurisdiction-resolver only), `lib/email-templates.ts` (branding interpolation) | `app/`, `components/`, `supabase/` |
| builder-ui | `app/partner/branding/page.tsx`, `app/partner/enablement/**` (polish), `components/partner/**`, `app/(marketing)/[partner]/**` if needed | `lib/actions/`, `supabase/` |
| builder-content | `lib/document-templates.ts` (federal-variant entries), `content/partner-enablement/**` (additions), `content/federal-templates/**` | `app/`, `components/`, `supabase/` |
| validator | reads-only; writes `reports/validation-phase3-*.md` and `__tests__/setup/billing-guard-mock.ts` | implementation files |
| auditor | reads-only; writes `reports/audit-phase3-*.md` | everything |

## Tasks

### Task 1: Reconcile parallel-agent work
- **Owner:** builder-recon
- **Input:** Current `git status` (~30 untracked files), `specs/protekon-remaining-work-plan.md` for context on what each file belongs to
- **Output:** 4-6 domain-scoped commits covering: (a) 9 vertical summary actions + tests, (b) 9 vertical dashboard pages + VerticalOverview + sidebar wiring, (c) partner enablement content + route, (d) Sanity backfill scripts + reports, (e) docs/runbooks. No new code; commit existing files only.
- **Dependencies:** none
- **Instructions:**
  Read `specs/protekon-remaining-work-plan.md` to map files → tasks. Group commits by Task ID from that spec. Skip `.claude/settings.local.json` and any clearly local-only files. Each commit ≤15 files (pre-commit gate). Do NOT modify files; only `git add` + commit.

### Task 2: Paywall test mock (unblocks Validator)
- **Owner:** validator
- **Input:** `docs/runbooks/test-failure-assessment-2026-04-15.md` (root cause analysis)
- **Output:** `__tests__/setup/billing-guard-mock.ts` + `vitest.config.ts` setupFiles entry that auto-mocks `requirePaidAuth()` to return a synthetic paid-auth result
- **Dependencies:** Task 1
- **Instructions:**
  Add a vitest setup file mocking `@/lib/billing-guard` so unit tests don't hit `cookies()` outside request scope. Verify failure count drops from 76 to ~19. Commit separately.

### Task 3: Jurisdiction data model
- **Owner:** builder-db
- **Input:** Contract — `Jurisdiction` type and `JurisdictionTemplateOverride` shape
- **Output:** Migration `033_jurisdiction_overrides.sql` — `template_jurisdiction_overrides` table with RLS (admin-only writes, public reads), seed federal-OSHA naming swaps for the 8 platform-wide templates
- **Dependencies:** Task 2
- **Instructions:**
  Mirror the `document_template_meta` pattern. Apply via Supabase MCP, then write the migration file to repo. Coordinate with builder-api on column names before applying.

### Task 4: Partner branding data model
- **Owner:** builder-db
- **Input:** Contract — `PartnerBrandingConfig` interface
- **Output:** Migration `034_partner_branding.sql` — `partner_branding` table FK'd to `partner_applications`, RLS so partners read only their own branding, admins write
- **Dependencies:** Task 2
- **Instructions:**
  Add `logoBlob` storage path column. Default rows for existing partners with Protekon defaults. Coordinate with builder-api on the API contract.

### Task 5: Jurisdiction-aware template resolver
- **Owner:** builder-api
- **Input:** Output of Task 3 + existing `lib/document-templates.ts`
- **Output:** `lib/jurisdiction.ts` (resolver module) + thin extension to `lib/document-templates.ts` exposing `resolveTemplate(id, jurisdiction)`. Document gen pulls jurisdiction from `clients.state` → maps to base + overrides
- **Dependencies:** Task 3
- **Instructions:**
  Pure function, no I/O — accepts base sections + DB-fetched overrides. Read `clients.state` in the gen path, default to `"ca"` for backwards compat. Add unit tests under `__tests__/lib/jurisdiction.test.ts`.

### Task 6: Partner branding server actions + email interpolation
- **Owner:** builder-api
- **Input:** Output of Task 4 + Resend email path
- **Output:** `lib/actions/partner-branding.ts` (CRUD + logo upload via Vercel Blob), branding interpolation in `lib/email-templates.ts` (replace logo, primary color, from-name when partnerId on client)
- **Dependencies:** Task 4
- **Instructions:**
  Use existing partner-portal RLS patterns. When `hideProtekonAttribution=true`, swap email signature + footer. Add unit tests for the interpolation function.

### Task 7: White-label partner portal UI
- **Owner:** builder-ui
- **Input:** Output of Task 6 — `getPartnerBranding`, `applyBrandingToHtml`
- **Output:** `app/partner/branding/page.tsx` (logo upload + color picker + preview), branded sample pages at `app/(marketing)/[partner]/samples/page.tsx`, partner sidebar nav entry
- **Dependencies:** Task 6
- **Instructions:**
  Reuse existing partner sidebar pattern. Color picker uses native input[type=color]. Preview uses iframe of `/api/samples/gate?report=...&partner={id}` with branding applied. Stay within existing tier gate (Professional+ only).

### Task 8: Federal OSHA template variants (content)
- **Owner:** builder-content
- **Input:** Output of Task 3 — jurisdiction override schema
- **Output:** Federal-variant section data for 8 platform-wide templates (WVPP, IIPP, EAP, HazCom, OSHA-300, Heat-Illness, Incident-Investigation, Training-Records). Persisted to `template_jurisdiction_overrides` via seed script `scripts/seed-jurisdiction-overrides.ts`
- **Dependencies:** Task 3
- **Instructions:**
  Swap "Cal/OSHA Title 8" → "29 CFR §...". Drop California-specific sections (e.g., SB 553 reference for federal WVPP variant). Add federal heat illness equivalent (general duty clause). One seed script run per migration apply.

### Task 9: Validate
- **Owner:** validator
- **Input:** All builder outputs (Tasks 1-8)
- **Output:** Quality gate report: tsc, lint, vitest (expect ≥95% pass after Task 2 mock), `next build`. Failures handed to Fixer.
- **Dependencies:** Task 1, Task 2, Task 3, Task 4, Task 5, Task 6, Task 7, Task 8
- **Instructions:**
  Run all gates. Confirm new vertical-summary tests still pass after the paywall mock. Confirm jurisdiction resolver + branding interpolation unit tests pass. Block on any new failure; route to Fixer.

### Task 10: Audit
- **Owner:** auditor
- **Input:** Validated codebase
- **Output:** Functional rate report ≥95%. Specifically: partner branding form save, logo upload, color preview, branded sample download (PDF reflects partner colors + name), federal template variant generation for a non-CA test client.
- **Dependencies:** Task 9
- **Instructions:**
  Use agent-browser. Test paths: `/partner/branding`, `/partner/enablement`, branded sample download via gate, federal-state client (e.g., TX) doc generation. Target: ≥95% functional. File any failure to Fixer with severity.

## Execution Order
1. Task 1 (sequential — must complete before any new work)
2. Task 2 (sequential after Task 1 — unblocks all subsequent test runs)
3. Task 3 + Task 4 (parallel, both depend on Task 2)
4. Task 5 (depends on Task 3) + Task 6 (depends on Task 4) — parallel
5. Task 7 (depends on Task 6) + Task 8 (depends on Task 3) — parallel
6. Task 9: Validate (depends on all builders)
7. Task 10: Audit (depends on Validate)

## References Consulted
- `specs/audit-fix-ship-master.md` (Phase 0-2 close history)
- `specs/protekon-remaining-work-plan.md` (parallel agent's spec — task IDs for reconciliation)
- `docs/runbooks/test-failure-assessment-2026-04-15.md` (root cause for Task 2)
- `lib/document-templates.ts` (37-template registry — resolver extension target)
- `lib/email-templates.ts` (Resend interpolation surface)
- `app/partner/enablement/**` (existing partner content shape)

## Validation Criteria
- [ ] Working tree clean (only `.claude/settings.local.json` allowed)
- [ ] Vitest pass rate ≥95% (mock landed; carryover failures triaged per runbook)
- [ ] Partner can upload logo, set colors, preview branded sample at `/partner/branding`
- [ ] Branded sample PDF download replaces logo + primary color + signature when `hideProtekonAttribution=true`
- [ ] Non-CA client (state='TX') generates federal-variant document with no "Cal/OSHA" references
- [ ] All quality gates pass (tsc, lint, build)
- [ ] Feature audit ≥95% functional rate
- [ ] Two new migrations in repo (033, 034) and applied to live Supabase
