# protekon-dashboard-v3-wave-2 Plan — DashboardSurface port

## Objective
Port the Remix `DashboardSurface` (`protekon dashboard(Remix)/components/dashboard.jsx:1582`, ~1,645 lines of JSX) into TSX, replace the shipped briefing layout at `/dashboard/page.tsx` as the new root, and archive the now-unused briefing primitives. Single-surface wave.

## Scope
- **Replaces:** `app/dashboard/page.tsx` (186 lines — briefing column with `PostureHeader` + `ChatInput` + etc.)
- **Archives:** `components/v2/primitives/{PostureHeader,ChatInput,IntelligenceCard,ActionItemCard,UpNextRow,HandledListItem}.tsx` and `lib/v2/actions/briefing.ts` — moved to `_archive/2026-04-19/briefing/`
- **Keeps:** `ScoreRing.tsx`, `SectionLabel.tsx` — reused across the design
- **Adds:** ~18 new TSX components under `components/v2/dashboard/` + 1 helper action

## Discovery findings
- **Shipped backend to reuse:**
  - `lib/actions/dashboard.ts` — `getDashboardData()` returns `{ client, recentDocuments, recentIncidents, complianceScore, documentCount, incidentCount, auditCount }`
  - `lib/actions/rollup.ts` — `getSiteRollup()` → per-site rows + totals (incidents, documents, training, alerts) via `get_site_rollup` RPC
  - `lib/v2/coverage-resources/*` — 10 files (assets, credentials, findings, inspections, materials, permits, sites, team, third_parties, index) — shipped last session, DO NOT MODIFY; feed `GapAnalysisBlock` and `TemplateCard` counts
  - `lib/actions/alerts.ts` — `getUnreadCount` for bell
  - `lib/actions/incidents.ts` — `getOpenReportableIncident` for banner (already wired)
- **Remix mock data to port as static constants** (no backend wired yet — leave TODO comments to source later):
  - `CANONICAL_NINE`, `INDUSTRY_HAZARDS`, `SPECIALIZED` (templates per category)
  - `SUBCONTRACTORS` (sub list — once sub onboarding surface ships, switch to live)
  - `RETENTION_ALERTS`, `RADAR_CITATIONS`, `SEASONAL_WINDOWS`
  - `DASHBOARD_SITES` — replace with live `getSiteRollup().rows`
- **OWNER/MANAGER toggle:** visually present, inert until RBAC ships. Default OWNER view. Toggle click shows toast "Manager view requires Team & Permissions" (deferred wave).

## Team Members
| Role | Agent | Responsibility |
|------|-------|----------------|
| Lead | lead | Orchestrate, enforce ownership |
| Backend Builder | builder-api | 1 new helper `lib/v2/actions/dashboard-surface.ts` aggregating rollup + coverage-resources counts + compliance score + active risks |
| Frontend Builder | builder-ui | Port 18 JSX components → TSX; rewrite `/dashboard/page.tsx`; archive legacy briefing primitives |
| Validator | validator | tsc, lint, build, ownership audit |
| Fixer | fixer | Contingent |
| Auditor | auditor | Static audit (no live session needed) |

## Contract

### New helper: `lib/v2/actions/dashboard-surface.ts`
```ts
export type DashboardSurfaceData = {
  client: ClientProfile | null;
  complianceScore: number;
  postureLabel: "STRONG" | "NEEDS WORK" | "AT RISK" | null;
  sites: SiteRollupRow[];                 // from getSiteRollup
  siteTotals: RollupPayload["totals"];
  activeRisks: Array<{ title: string; severity: "critical" | "warning"; detail: string; href?: string }>;
  coverageCounts: {
    resolved: number;
    reviewDue: number;
    missing: number;
    total: number;
  };
  recentIncidents: Incident[];
  unreadAlerts: number;
};

export async function getDashboardSurfaceData(): Promise<DashboardSurfaceData>;
```
Composes existing shipped actions. No new tables, no new API routes.

### Component tree at `components/v2/dashboard/`
- `atoms/StatusBadge.tsx`, `atoms/MetaLabel.tsx`, `atoms/JurisdictionBadge.tsx`, `atoms/ViewToggle.tsx`, `atoms/TabToggle.tsx`, `atoms/BigGauge.tsx`, `atoms/SubRiskBadge.tsx`
- `cards/TemplateCard.tsx`, `cards/TemplateGroup.tsx`, `cards/OwnerRiskCard.tsx`
- `blocks/ActiveRiskBanner.tsx`, `blocks/SiteFilterBanner.tsx`, `blocks/SiteSwitcher.tsx`, `blocks/SeasonalTimeline.tsx`, `blocks/EnforcementRadar.tsx`, `blocks/RetentionAlerts.tsx`, `blocks/GapAnalysisBlock.tsx`
- `views/OwnerSummary.tsx`, `views/OwnerHeroGauge.tsx`, `views/OwnerInternal.tsx`, `views/OwnerSubcontractorRisk.tsx`, `views/ManagerInternal.tsx`, `views/ManagerSubcontractorRisk.tsx`
- `DashboardSurface.tsx` — composite root consumed by the page

### Static mock constants at `components/v2/dashboard/mocks.ts`
Keeps CANONICAL_NINE, INDUSTRY_HAZARDS, SPECIALIZED, SUBCONTRACTORS, RETENTION_ALERTS, RADAR_CITATIONS, SEASONAL_WINDOWS as exported `as const` arrays. Each has a comment `// TODO(wave-N): wire to <source>`.

## File Ownership
| Agent | Owns | Does NOT Touch |
|-------|------|----------------|
| builder-api | `lib/v2/actions/dashboard-surface.ts` (new) | Everything else |
| builder-ui | `app/dashboard/page.tsx` (rewrite), `components/v2/dashboard/**` (new), `_archive/2026-04-19/briefing/**` (moved) | Anything in `components/v2/primitives/` (just moves the 6 briefing files), `lib/`, `supabase/`, `app/api/`, `inngest/` |
| validator | read-only | — |
| auditor | read-only | — |

**Hard exclusions:** `lib/v2/coverage-resources/*` (shipped previous session), `lib/actions/*` (except new dashboard-surface.ts), `lib/pdf-training.ts`, `lib/actions/alerts.ts`, `components/v2/Sidebar.tsx`, `components/v2/ReportingBanner.tsx`, `components/v2/primitives/{PageHeader,Card,PriorityPill,CTAButton,ScoreRing,SectionLabel}.tsx`, everything under `components/v2/incidents/`, `components/v2/acks/`, any Wave 1 file.

## Tasks

### W2-T1: Backend — dashboard-surface helper
- **Owner:** builder-api
- **Input:** shipped `lib/actions/dashboard.ts`, `lib/actions/rollup.ts`, `lib/v2/coverage-resources/index.ts`, `lib/actions/alerts.ts`
- **Output:** `lib/v2/actions/dashboard-surface.ts` (new, ~100 lines)
- **Dependencies:** none
- **Instructions:**
  "use server". Compose shipped helpers in parallel via Promise.allSettled. Derive `postureLabel` from complianceScore (>=80 STRONG, >=60 NEEDS WORK, else AT RISK). Derive `activeRisks` from: (a) open reportable incident (1 critical if present), (b) training_overdue > 0 (1 warning), (c) pending_log_requests > 0 (1 warning). Leave `coverageCounts` with TODO if coverage-resources index doesn't expose counts directly — fall back to recentDocuments + documentCount from getDashboardData. Gracefully fail open (null/0 values, no throws).

### W2-T2: Frontend — archive legacy briefing + port DashboardSurface
- **Owner:** builder-ui
- **Input:** Remix source `protekon dashboard(Remix)/components/dashboard.jsx` (lines 1–1645), T1 helper output, existing v3 primitives
- **Output:**
  - `_archive/2026-04-19/briefing/` holds: `PostureHeader.tsx`, `ChatInput.tsx`, `IntelligenceCard.tsx`, `ActionItemCard.tsx`, `UpNextRow.tsx`, `HandledListItem.tsx`, `briefing.ts` (from `lib/v2/actions/`), and the old `app/dashboard/page.tsx`
  - `components/v2/dashboard/` with all 24 component files (atoms/cards/blocks/views/mocks)
  - New `app/dashboard/page.tsx` that imports `DashboardSurface` + calls `getDashboardSurfaceData()` and renders the surface
- **Dependencies:** W2-T1
- **Instructions:**
  Port JSX file-for-file preserving visual structure. Apply brand tokens (replace Remix's `--crimson` → `var(--enforcement)` or `text-enforcement`; `--gold` → `var(--sand)`). Replace Remix's `Card` / `SectionLabel` / `PriorityPill` / `CTAButton` / `ScoreRing` imports with our shipped v2 primitives. `ViewToggle` uses `useState` + a client component; clicking "Manager" shows a toast `"Manager view requires Team & Permissions — coming in a later wave"` and stays on Owner. `SiteSwitcher` consumes the live `sites` prop (not the mock `DASHBOARD_SITES`). For any mock data not wired to backend yet, import from `components/v2/dashboard/mocks.ts` with `// TODO(wave-N)` comments inline. Archive the 6 briefing primitives + briefing action file + old page BEFORE rewriting — `git mv` semantics: use `mv` via Bash. Update `_archive/` is already excluded in `tsconfig.json`.

### W2-T3: Validate
- **Owner:** validator
- **Input:** All builder outputs
- **Output:** Quality gate report
- **Dependencies:** W2-T2
- **Instructions:**
  `pnpm tsc --noEmit` (filter .next/dev/types), `pnpm lint`, `pnpm build`. Verify: (a) no references to archived briefing primitives remain outside `_archive/`; (b) new `/dashboard/page.tsx` has ViewToggle + TabToggle + SiteSwitcher rendered; (c) `lib/v2/coverage-resources/*` untouched; (d) Sidebar still shows 25 surfaces; (e) Wave 1 files untouched (git diff empty for `components/v2/incidents/`, `acks/`, `lib/actions/acknowledgments.ts`, migrations 045+046, etc.).

### W2-T4: Fix (contingent)
- **Owner:** fixer
- **Input:** Validator failures
- **Dependencies:** W2-T3 (only on failure)
- **Instructions:** One fix at a time. Never touch archived files — if a ref still points to a briefing primitive, fix the caller, not the archive.

### W2-T5: Audit — static sweep
- **Owner:** auditor
- **Input:** Validated codebase
- **Dependencies:** W2-T3 (+T4 if run)
- **Instructions:**
  Static audit (no live browser needed):
  1. `app/dashboard/page.tsx` imports `DashboardSurface` from `components/v2/dashboard/DashboardSurface` and calls `getDashboardSurfaceData()`.
  2. 24+ component files present under `components/v2/dashboard/`.
  3. `components/v2/primitives/` no longer contains 6 briefing files (moved to _archive).
  4. `lib/v2/actions/briefing.ts` no longer exists at that path (moved).
  5. No source file outside `_archive/` imports from `@/lib/v2/actions/briefing` or the 6 archived primitives.
  6. Sidebar surface map in `components/v2/Sidebar.tsx` unchanged (25 surfaces, 4 groups).
  7. All Wave 1 deliverables present and unchanged.
  Target: all 7 checks pass.

## Execution Order
```
W2-T1 (Backend: dashboard-surface helper)
  │
  ▼
W2-T2 (Frontend: archive + port — the big one)
  │
  ▼
W2-T3 (Validate)
  │
  ├─▶ W2-T4 (Fix, contingent)
  ▼
W2-T5 (Audit)
```

Sequential — T2 is too big to subdivide without file-ownership conflicts.

## Validation Criteria
- [ ] 6 briefing primitives + `briefing.ts` action + old page.tsx moved to `_archive/2026-04-19/briefing/`
- [ ] No imports of archived files from any live source path
- [ ] `components/v2/dashboard/` contains all component files per Contract
- [ ] New `app/dashboard/page.tsx` renders `DashboardSurface` via `getDashboardSurfaceData()`
- [ ] `pnpm tsc --noEmit` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm build` passes
- [ ] Wave 1 files untouched (incidents surface, acks surface, audit-trail surface, migrations 045+046, `lib/actions/acknowledgments.ts`, `components/v2/incidents/*`, `components/v2/acks/*`)
- [ ] `lib/v2/coverage-resources/*` untouched
- [ ] OWNER/MANAGER toggle renders, Manager click shows toast, remains on Owner view

## Handoff
Ready for: `/build "specs/protekon-dashboard-v3-wave-2-plan.md"`
