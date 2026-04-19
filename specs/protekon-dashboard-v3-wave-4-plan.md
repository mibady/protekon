# protekon-dashboard-v3-wave-4 Plan — Intelligence cluster (4 surfaces)

## Objective
Port 4 Intelligence-group Remix surfaces whose backend is already shipped: Enforcement Feed, Regulatory Changes, Peer Benchmarks, Rulemaking & History. Keep Marketplace as the explicit stub per approved roadmap.

## Surfaces in scope
| Surface | Remix JSX | Shipped backend | Route |
|---|---|---|---|
| Enforcement Feed (Whats Happening) | `intel.jsx:82` | `lib/actions/osha.ts` — getOshaNearbyData, getOshaIndustryData | `app/dashboard/whats-happening/page.tsx` |
| Regulatory Changes | `phase4.jsx:29` | `lib/actions/reports.ts` — getRegulations, acknowledgeRegulation | `app/dashboard/reg-changes/page.tsx` |
| Peer Benchmarks | `phase4.jsx:114` | `lib/actions/osha.ts` — getOshaBenchmarkData + `rollup.ts` for own-client stats | `app/dashboard/benchmarks/page.tsx` |
| Rulemaking & History | `phase4.jsx:182` | `lib/actions/reports.ts` — getRegulations (filtered) | `app/dashboard/pipeline/page.tsx` |

## Out of scope
- Marketplace — explicit deferred stub per approved plan (keep UnderConstruction)
- Subs cluster (6) — needs new backend (Wave 5)
- Training — needs backend (Wave 5)
- Team — needs RBAC refactor
- Integrations — OAuth cards (Wave 6)

## Team Members
| Role | Agent | Responsibility |
|------|-------|----------------|
| Lead | lead | Orchestrate |
| Frontend Builder | builder-ui | 4 UI ports |
| Validator | validator | tsc + lint + build |
| Fixer | fixer | Contingent |
| Auditor | auditor | Static check |

## File Ownership
| Agent | Owns | Does NOT Touch |
|-------|------|----------------|
| builder-ui | 4 dashboard pages listed above + new component subfolders (`components/v2/enforcement/**`, `components/v2/regs/**`, `components/v2/benchmarks/**`, `components/v2/pipeline/**`) | everything else |

**Hard exclusions:** `lib/actions/*` (read-only), `supabase/`, `inngest/`, `app/api/`, v3 primitives, Wave 1/2/3 component subtrees, `lib/v2/coverage-resources/*`, `components/dashboard/Osha*.tsx` (existing shipped components — may be read as reference but not modified).

## Contract

### Action signatures (from shipped code)
```ts
// lib/actions/osha.ts
export async function getOshaIndustryData(): Promise<OshaIndustryProfile | null>
export async function getOshaNearbyData(): Promise<OshaNearbyEnforcement[]>
export async function getOshaBenchmarkData(): Promise<OshaBenchmarks | null>

// lib/actions/reports.ts
export async function getRegulations()
export async function acknowledgeRegulation(regulationId: string)
```

## Tasks

### W4-T1: Frontend — 4 Intelligence surface ports
- **Owner:** builder-ui
- **Input:** Remix JSX + shipped osha/reports actions + existing components/dashboard/Osha*.tsx as reference
- **Output:** 4 rewritten page.tsx + new component subfolders
- **Dependencies:** none

**Per-surface scope:**

**1. Enforcement Feed (`whats-happening/page.tsx`, Remix `intel.jsx:82`)**
- Server component. Fetch `getOshaNearbyData()` + `getOshaIndustryData()` in parallel.
- Render `PageHeader` eyebrow="INTELLIGENCE · ENFORCEMENT FEED" title="Citations, violations, and penalties in your trade and region." subtitle="Updated nightly from federal and state enforcement feeds."
- Card layouts showing: Nearby enforcement list (company / city / violation / penalty / date), Industry-level patterns (top citation categories + mean penalty).
- Optional: reuse existing `components/dashboard/OshaNearbyEnforcement.tsx` + `OshaIndustryBenchmark.tsx` as-is if their visual fits; otherwise port Remix JSX to new components under `components/v2/enforcement/`.

**2. Regulatory Changes (`reg-changes/page.tsx`, Remix `phase4.jsx:29`)**
- Server component. Fetch `getRegulations()`.
- `PageHeader` eyebrow="INTELLIGENCE · REGULATORY CHANGES" title="New and amended rules that touch your trade." subtitle="Curated by compliance officers, not RSS noise."
- Card list of regulation items with: Authority badge / Title / Effective date / Summary / "Acknowledge" button (client → `acknowledgeRegulation(id)`).
- PriorityPill for acknowledged status.
- New `components/v2/regs/RegulationsFeed.tsx` + `AcknowledgeButton.tsx` (client).

**3. Peer Benchmarks (`benchmarks/page.tsx`, Remix `phase4.jsx:114`)**
- Server component. Fetch `getOshaBenchmarkData()` + `getSiteRollup()` for own-client stats.
- `PageHeader` eyebrow="INTELLIGENCE · PEER BENCHMARKS" title="Where you stand against your trade." subtitle="Cohort minimum of 5. Individual businesses are never identified."
- `BenchmarkBar` component (port Remix `phase4.jsx:97`) — renders `You` vs `Peer median` with a visual bar, colored by `better?` direction.
- Display DART rate, document expiration rate, training overdue %, posture score — each as a BenchmarkBar.
- New `components/v2/benchmarks/BenchmarkBar.tsx` + `BenchmarksGrid.tsx`.

**4. Rulemaking & History (`pipeline/page.tsx`, Remix `phase4.jsx:182` — `InspectionImportSurface` in Remix naming)**
- Server component. Fetch `getRegulations()` with timeline sort (oldest first, grouped by effective year).
- `PageHeader` eyebrow="INTELLIGENCE · RULEMAKING & HISTORY" title="The timeline that landed you here." subtitle="Effective dates, supersession, and version diffs for every rule that matters to your work."
- Timeline card list with year dividers.
- New `components/v2/pipeline/RulemakingTimeline.tsx`.

### Shared requirements
- Every page uses v3 primitives (`PageHeader`, `Card`, `PriorityPill`, `CTAButton`)
- Brand tokens: --enforcement (was crimson) / --sand (was gold) / --steel / --ink
- Server components by default; client only for AcknowledgeButton + any filter inputs
- Phosphor icons from `@phosphor-icons/react/dist/ssr`

### Adaptations allowed
- If a shipped action returns sparse data, render what exists + inline TODO comment
- If `getOshaBenchmarkData` return shape doesn't include every benchmark, show the ones available and stub the rest with TODO
- If `getRegulations` return type lacks an `effective_date` or authority field, adapt columns

### W4-T2: Validate
- **Owner:** validator
- **Input:** W4-T1 output
- **Dependencies:** W4-T1
- **Instructions:** tsc, lint, build. Verify: no UnderConstruction on the 4 W4 pages; Wave 1/2/3 files untouched; action/supabase/inngest/api zero diff.

### W4-T3: Fix (contingent)
- **Owner:** fixer
- **Dependencies:** W4-T2 (on failure)

### W4-T4: Audit
- **Owner:** auditor
- **Input:** validated codebase
- **Dependencies:** W4-T2 (+T3)
- **Instructions:** Confirm 4/4 surfaces no longer render UnderConstruction; all import shipped actions; sidebar unchanged.

## Execution Order
```
W4-T1 (Frontend: 4 surface ports)
  │
  ▼
W4-T2 (Validate)
  │
  ├─▶ W4-T3 (Fix, contingent)
  ▼
W4-T4 (Audit)
```

## Validation Criteria
- [ ] 4 UnderConstruction stubs replaced (whats-happening, reg-changes, benchmarks, pipeline)
- [ ] All pages import from shipped `lib/actions/osha.ts` + `lib/actions/reports.ts` + `lib/actions/rollup.ts`
- [ ] pnpm tsc --noEmit passes, pnpm lint passes, pnpm build passes
- [ ] Wave 1/2/3 files untouched
- [ ] No new migrations, no new API routes, no new action files

## Handoff
Ready for: `/build "specs/protekon-dashboard-v3-wave-4-plan.md"`
