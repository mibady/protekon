# protekon-dashboard-v3 Plan

## Objective
Port the Remix design language from `protekon dashboard(Remix)/` into the shipped Next.js 16 dashboard — full 26-surface sidebar, jurisdiction/role-aware reporting banner, editorial PageHeader voice — without touching Supabase data contracts, Inngest workflows, or RLS policies.

## Context
- **Source:** 18 Babel-in-browser JSX files (~7,500 lines) at `protekon dashboard(Remix)/components/` + 11 verify screenshots at `protekon dashboard(Remix)/verify/`.
- **Partial shipped state (from discovery):**
  - `app/globals.css` already defines crimson/midnight/parchment/void tokens (32 matches).
  - `tailwind.config.ts` already wires 4 token references.
  - `components/v2/primitives/` already has `ScoreRing.tsx`, `SectionLabel.tsx`, `PostureHeader.tsx`, `ActionItemCard.tsx`, `IntelligenceCard.tsx`, `HandledListItem.tsx`, `UpNextRow.tsx`, `ChatInput.tsx`.
  - `components/v2/UnderConstruction.tsx` already exists with voice-correct copy ("I'm building this right now").
  - `components/v2/Sidebar.tsx` exists but was built for v2 rewrite era — needs to match new 5-group × 26-surface structure.
- **Implication:** phases 1/3/6 are **gap-fill**, not greenfield. Phase 2 (sidebar rewrite), phase 4 (banner), phase 5 (8-surface refresh) are the real lift.

## Team Members
| Role | Agent | System Prompt | Responsibility |
|------|-------|---------------|----------------|
| Lead | lead | `.claude/agents/team/lead.md` | Orchestrate phases, enforce file ownership, flag font sign-off blocker |
| Frontend Builder | builder-ui | `.claude/agents/team/builder.md` | All TSX/CSS work — single builder (no DB/API/AI layers) |
| Validator | validator | `.claude/agents/team/validator.md` | `pnpm tsc --noEmit`, `pnpm lint`, `pnpm build`, route discovery |
| Fixer | fixer | `.claude/agents/team/fixer.md` | Iterative fix loop on Validator reports |
| Auditor | auditor | `.claude/agents/team/auditor.md` | Navigate all 26 surfaces, verify no 404s, compare against `verify/*.png` |

Single-builder team. No DB, no API, no AI layers touched.

## Contract

### Design tokens — official brand palette (6 authoritative + neutrals)

**Authoritative brand tokens (6) — must exist verbatim in `app/globals.css`:**
```
--void:         #070F1E   /* Primary dark — backgrounds, display type */
--parchment:    #F4EFE6   /* Primary light — surfaces, inverted type */
--enforcement:  #C8102E   /* Accent — consequence, alerts, logo crossbar */
--sand:         #C9B27A   /* Secondary accent — cautionary, labels */
--steel:        #3C506B   /* Tertiary — regulatory, info (NOTE: much darker than Remix JSX) */
--ink:          #0A1323   /* Body text */
```

**Neutrals carried over from Remix JSX (not brand-authoritative, utility only):**
```
--midnight: #0B1D3A   /* Dark surface variant */
--ash:      #E8E2D8   /* Warm neutral */
--fog:      #B8C5D1   /* Cool neutral — muted body text / disabled */
--white:    #FAFAF8   /* Off-white — inverted surface */
```

**Back-compat aliases (keep to avoid churn on shipped code):**
```
--crimson: var(--enforcement)
--gold:    var(--sand)
```

**Notable hex drift from Remix JSX — builder must apply these updates, not preserve Remix values:**
- `--enforcement #C8102E` (not `#C41230` from Remix) — slightly darker red
- `--sand #C9B27A` (not `#C9A84C` from Remix) — muted tan, not gold
- `--steel #3C506B` (not `#7A8FA5` from Remix) — deep slate-blue feature color; Remix steel was a muted gray used for body text. Anywhere the Remix JSX uses `var(--steel)` for muted text, builder must migrate those references to `var(--fog)` or `var(--ink)` (opacity 0.7) to preserve legibility.

### Fonts — APPROVED
- **Heading:** Barlow Condensed — Bold (700)
- **Subheading:** Barlow Condensed — SemiBold (600)
- **Body:** DM Sans — Regular (400)
- Loaded via `next/font/google`, exposed as `--font-display` (Barlow Condensed) + `--font-sans` (DM Sans) CSS vars. `.font-display { font-family: var(--font-display); }` utility registered in `globals.css`.
- Decision logged: user approved 2026-04-18.

### Sidebar surface map (26 keys, 5 groups)
```ts
type SurfaceKey =
  | "briefing"
  | "dashboard" | "coverage" | "documents" | "training" | "incidents"
  | "acknowledgments" | "calendar" | "activity"
  | "projects" | "vendor_risk" | "coi_verification"
  | "sub_onboarding" | "safety_programs" | "form_1099"
  | "whats_happening" | "reg_changes" | "benchmarks"
  | "pipeline" | "knowledge" | "marketplace"
  | "audit_trail" | "team" | "scheduled_reports"
  | "integrations" | "my_business";
```
Groups: Today / My Business / My Subs / Intelligence / Account — order matches `protekon dashboard(Remix)/components/atoms.jsx` `groups` array.

### Reporting rules (`lib/v2/reporting-rules.ts`)
```ts
export type Jurisdiction = {
  stateCode: string;          // "CA", "WA", "TX", ...
  authority: string;          // "Cal/OSHA", "DOSH", "Federal OSHA"
  citation: string;           // "Cal. Code Regs. §342", "29 CFR 1904.39"
  fatalityClockHours: number; // 8 in all current jurisdictions
  hospitalizationClockHours: number | null; // 24 federal / null CA
  reportingForm: string;      // "DIR Form 36", "OSHA 301"
  phone: string;              // "1-800-963-9424"
  onlinePortal?: string;
};
export function jurisdictionFor(stateCode: string): Jurisdiction;
```
22 state-plan states (AK, AZ, CA, HI, IN, IA, KY, MD, MI, MN, NV, NM, NC, OR, SC, TN, UT, VT, VA, WA, WY + PR, VI) + federal fallback.

### ReportingBanner props
```ts
type ReportingBannerProps = {
  incident: {
    id: string;
    occurred_at: string;   // ISO
    severity: "fatality" | "hospitalization" | "amputation" | "eye_loss" | "other";
    reported_at: string | null;
    site: { state: string };
  } | null;
  userRole: "owner" | "compliance_manager" | "field_lead" | "auditor";
  serverNow: string;       // ISO — passed from server component, never Date.now()
};
```
Returns `null` when `incident === null`, `incident.reported_at !== null`, or `severity === "other"`.

## File Ownership
| Agent | Owns | Does NOT Touch |
|-------|------|----------------|
| builder-ui | `app/globals.css`, `tailwind.config.ts`, `app/layout.tsx` (fonts only), `app/dashboard/**`, `components/v2/**`, `lib/v2/reporting-rules.ts` | `supabase/**`, `lib/actions/**` existing, `inngest/**`, `lib/v2/coverage-resources/**` (shipped last session), any API route, any Stripe/Resend wiring |
| validator | read-only | everything |
| fixer | same as builder-ui | same exclusions as builder-ui |
| auditor | read-only + screenshots | everything |

**Hard exclusion:** `lib/v2/coverage-resources/*.ts` — 9 drill-down data files shipped previous session, must not be touched.

## Tasks

### Task 0: Font sign-off (blocker resolution)
- **Owner:** lead
- **Input:** User directive "Barlow Condensed + DM Sans"
- **Output:** Written go/no-go decision logged in this spec
- **Dependencies:** none
- **Instructions:**
  Ask the user explicitly: confirm Barlow Condensed + DM Sans are approved, or substitute. Inter is banned per global CLAUDE.md; Barlow and DM Sans are not on the pre-approved list. Do not start Task 1 until resolved. Record decision as an appendix to this spec.

### Task 1: Tokens + fonts gap-fill
- **Owner:** builder-ui
- **Input:** Contract tokens list, font decision from Task 0
- **Output:** `app/globals.css` updated with any missing vars; `app/layout.tsx` imports fonts via `next/font/google`; `tailwind.config.ts` extends `theme.extend.colors` with the 9 tokens and `fontFamily.display` / `fontFamily.sans`
- **Dependencies:** Task 0
- **Instructions:**
  Diff existing `globals.css` against Contract token list — Edit only missing vars. Do not rename existing ones (breaking change risk). Add `next/font` wiring in `app/layout.tsx` with `--font-display` and `--font-sans` CSS vars. Register utility classes `.font-display` and `.font-sans` if not already present.

### Task 2: Primitives gap-fill
- **Owner:** builder-ui
- **Input:** Inventory of shipped primitives (ScoreRing, SectionLabel, PostureHeader, etc.) vs. Remix requirements (PageHeader, Card, PriorityPill, CTAButton)
- **Output:** New TSX files only for missing primitives under `components/v2/primitives/`:
  - `PageHeader.tsx` (eyebrow + display title + subtitle — matches `atoms.jsx` PageHeader; heading uses Barlow Condensed 700)
  - `Card.tsx` (optional `accent` prop for left border in `enforcement | sand | steel`)
  - `PriorityPill.tsx` (tone: `enforcement | sand | steel`, Barlow Condensed 600 uppercase)
  - `CTAButton.tsx` (variant: primary | secondary | ghost; primary bg = `var(--enforcement)`, ghost border = `rgba(10,19,35,0.15)` using ink)
- **Dependencies:** Task 1
- **Instructions:**
  Do NOT re-implement ScoreRing or SectionLabel — they exist. Match the Remix JSX atoms file-for-file in props and visual output. Each primitive ships with a named export. Keep zero dependencies outside React + Tailwind.

### Task 3: Reporting rules table
- **Owner:** builder-ui
- **Input:** Contract type `Jurisdiction` + 22-state-plan list
- **Output:** `lib/v2/reporting-rules.ts` with full lookup map + `jurisdictionFor(stateCode)` selector + federal fallback
- **Dependencies:** none
- **Instructions:**
  Source: OSHA State Plans list (22 states) + 29 CFR 1904.39. Cite each rule's legal citation in the object. Export a `JURISDICTIONS: Record<string, Jurisdiction>` const plus the selector. Zero I/O — pure data + pure function.

### Task 4: ReportingBanner component
- **Owner:** builder-ui
- **Input:** Contract ReportingBannerProps + Task 3 output
- **Output:** `components/v2/ReportingBanner.tsx` — server component that takes `serverNow` as a prop (never reads client clock), computes `clockRemaining = deadline - serverNow`, renders role-specific content
- **Dependencies:** Task 3
- **Instructions:**
  Returns `null` when incident is null, already reported, or severity is "other". Four role content blocks: owner ("report now" primary CTA), compliance_manager ("assign / escalate"), field_lead ("call your compliance manager first"), auditor (read-only badge). Banner bg: crimson with parchment text when clock < 2h; gold when 2–8h; steel when > 8h. Include phone + form name + jurisdiction citation. Do NOT auto-tick client-side — re-render on navigation via server component.

### Task 5: Dashboard layout + sidebar rewrite
- **Owner:** builder-ui
- **Input:** Contract SurfaceKey map, existing `components/v2/Sidebar.tsx`, primitives from Task 2
- **Output:**
  - `components/v2/Sidebar.tsx` rewritten to 260px dark rail with 5 groups × 26 items (see Contract)
  - `app/dashboard/layout.tsx` Edited (not rewritten) to wrap children with new Sidebar + ReportingBanner
  - Client header block with ScoreRing + business_name + vertical_display + STRONG/AT-RISK pill (read from existing `lib/auth` or `lib/clients` helper — do not query DB directly in Sidebar, accept as props)
- **Dependencies:** Task 1, Task 2, Task 4
- **Instructions:**
  Edit `app/dashboard/layout.tsx` surgically — preserve auth guard + session loading. Sidebar is a client component; layout resolves user + client server-side and passes props down. Active-item styling: `borderLeft: 3px solid var(--crimson)` + `background: rgba(196,18,48,0.07)`. Bell button reads critical notification count from existing notifications helper (already shipped per memory) — prop name `criticalCount: number`.

### Task 6: Stub 18 missing surfaces
- **Owner:** builder-ui
- **Input:** `components/v2/UnderConstruction.tsx` (shipped)
- **Output:** 18 new `app/dashboard/<surface>/page.tsx` files
- **Dependencies:** Task 5
- **Instructions:**
  One `page.tsx` per missing surface. Each is a 6-line file: export default function that renders `<UnderConstruction surface="<Display Name>" description="<voice-correct one-liner>" />`. Surfaces: `briefing`, `training`, `incidents`, `acknowledgments`, `calendar`, `projects`, `vendor-risk`, `coi-verification`, `sub-onboarding`, `safety-programs`, `form-1099`, `reg-changes`, `benchmarks`, `pipeline`, `knowledge`, `audit-trail`, `team`, `scheduled-reports`, `integrations`. Use hyphens in route slugs (Next.js convention); keep underscores in SurfaceKey TypeScript union.

### Task 7: Refresh 8 shipped surfaces
- **Owner:** builder-ui
- **Input:** Primitives from Task 2, verify screenshots at `protekon dashboard(Remix)/verify/`
- **Output:** Edit-only changes to:
  - `app/dashboard/page.tsx` → Dashboard (match `verify/01-dashboard.png` + `verify/07-after.png`)
  - `app/dashboard/coverage/page.tsx` + `coverage/[type]/page.tsx`
  - `app/dashboard/documents/page.tsx`
  - `app/dashboard/activity/page.tsx`
  - `app/dashboard/my-business/page.tsx`
  - `app/dashboard/marketplace/page.tsx`
  - `app/dashboard/whats-happening/page.tsx`
- **Dependencies:** Task 2, Task 5
- **Instructions:**
  Use Edit tool exclusively — no Write rewrites. Scope is visual only: swap headers to `<PageHeader>`, wrap sections in `<Card>`, replace inline eyebrow divs with `<SectionLabel>`, swap status pills to `<PriorityPill>`. Keep every Supabase query, server action import, and data prop untouched. Do not touch `lib/v2/coverage-resources/*` — those drive the drill-down content, stay as strings. Verify each page renders at least the first screen of its corresponding verify/ screenshot before moving on.

### Task 8: Validate
- **Owner:** validator
- **Input:** All builder outputs
- **Output:** Quality gate report
- **Dependencies:** Task 1, 2, 3, 4, 5, 6, 7
- **Instructions:**
  Run `pnpm tsc --noEmit`, `pnpm lint`, `pnpm build`. Verify no route 404s by hitting `/dashboard`, all 5 nav groups' first surfaces, and at least 3 stub surfaces. Report failures in structured form for Fixer.

### Task 9: Fix (contingent)
- **Owner:** fixer
- **Input:** Validator failure report
- **Output:** Iterative commits — one fix per attempt, re-validate between
- **Dependencies:** Task 8 (only runs if Task 8 reports failures)
- **Instructions:**
  Address one issue at a time. Never skip tsc errors. If a fix requires touching excluded files (RLS, coverage-resources, API routes), escalate to Lead instead of proceeding.

### Task 10: Audit
- **Owner:** auditor
- **Input:** Validated codebase
- **Output:** Functional + visual rate report
- **Dependencies:** Task 8 (and Task 9 if run)
- **Instructions:**
  Navigate all 26 surfaces via the new sidebar. Verify:
  1. No 404s on any sidebar nav item
  2. Active-item crimson border renders on current surface
  3. ScoreRing renders a value 0–100
  4. ReportingBanner: render an incident with `reported_at: null` and verify banner shows; set `reported_at` and verify banner hides
  5. 8 shipped surfaces visually align with `verify/*.png` screenshots (spot-check eyebrow + title + first card)
  Target: ≥95% functional + 0 route 404s.

## Execution Order
```
Task 0 (blocker: font sign-off)
   │
   ▼
Task 1 (tokens + fonts) ─────┐
Task 3 (reporting rules) ────┼──► runs in parallel — no shared files
   │                         │
   ▼                         │
Task 2 (primitives)          │
   │                         │
   └──────┬──────────────────┘
          ▼
       Task 4 (banner)
          │
          ▼
       Task 5 (layout + sidebar)
          │
          ├──► Task 6 (stub 18 surfaces)
          └──► Task 7 (refresh 8 surfaces)
                    │
                    ▼
                 Task 8 (validate)
                    │
                    ├──► Task 9 (fix, contingent)
                    ▼
                 Task 10 (audit)
```
Parallelizable: Task 1 + Task 3. Task 6 + Task 7 (after Task 5).

## References Consulted
- `protekon dashboard(Remix)/components/atoms.jsx` (sidebar groups, primitives, ScoreRing)
- `protekon dashboard(Remix)/components/app.jsx` (SURFACES map, persist-surface state)
- `protekon dashboard(Remix)/verify/01-dashboard.png` (Dashboard target)
- `protekon dashboard(Remix)/verify/07-after.png` (refresh target)
- `CLAUDE.md` (Stitch wiring discipline, Supabase-only rule, font ban)
- Prior session memory: `project_session_29_v2_redesign.md`, `project_session_30_drilldowns_complete.md`, `feedback_drilldown_template.md`

## Validation Criteria
- [ ] Task 0 font decision logged before any code changes
- [ ] All 9 CSS vars present in `app/globals.css`
- [ ] `next/font` wired in `app/layout.tsx` — no `<link rel="stylesheet">` Google fonts in HTML head
- [ ] 4 new primitives exist: PageHeader, Card, PriorityPill, CTAButton
- [ ] Existing primitives (ScoreRing, SectionLabel, PostureHeader) untouched
- [ ] `lib/v2/reporting-rules.ts` covers 22 state plans + federal fallback, with citation strings
- [ ] `ReportingBanner` accepts `serverNow` prop — no `new Date()` in component
- [ ] Sidebar renders 5 groups × 26 items, active-item crimson border present
- [ ] 18 stub routes exist and render `UnderConstruction`
- [ ] 8 shipped routes edited only (not rewritten) and visually match `verify/` screenshots
- [ ] `pnpm tsc --noEmit` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm build` passes
- [ ] Auditor: 0 route 404s, ≥95% functional rate
- [ ] `lib/v2/coverage-resources/*` unchanged (git diff empty for this path)
- [ ] No Supabase schema, RLS, or Inngest function changes (git diff empty for `supabase/`, `inngest/`, `app/api/`)

## Blocker log
- **B-1 (Task 0): RESOLVED 2026-04-18** — User approved Barlow Condensed (Bold 700 + SemiBold 600) + DM Sans (Regular 400) + full 6-token brand palette (Void/Parchment/Enforcement/Sand/Steel/Ink). Builder proceeds to Task 1.

## Handoff
Ready for: `/build "specs/protekon-dashboard-v3-plan.md"`
