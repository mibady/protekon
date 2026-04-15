# osha-bridge-and-phase0 Plan

## Objective
Build the OSHA data API bridge (Supabase Edge Function) and complete Phase 0 remaining issues to unblock 7 downstream issues across Phase 1-3.

## Status Update
- NGE-358 (middleware): DONE — `middleware.ts` committed
- NGE-359 (alerts table): DONE — migration 010 applied
- NGE-361 (SB 553 classifier): DONE — `lib/ai/incident-classifier.ts` already has Type 1-4 with `violenceType` and `perpetratorRelationship`
- NGE-360 (OSHA API): NOT BUILT — edge function needed on OSHA Supabase project
- NGE-362 (reg sync): NOT BUILT — `regulatory-sync-bridge.ts` exists but blocked by NGE-360

## Team Members
| Role | Agent | System Prompt | Responsibility |
|------|-------|---------------|----------------|
| Edge Function Builder | builder-edge | .claude/agents/team/builder.md | Supabase Edge Function on OSHA project |
| Backend Builder | builder-api | .claude/agents/team/builder.md | App-side wiring, env vars, sync trigger |
| Frontend Builder | builder-ui | .claude/agents/team/builder.md | OSHA dashboard widgets (NGE-364 sub-issues) |
| Validator | validator | .claude/agents/team/validator.md | Quality gates |
| Auditor | auditor | .claude/agents/team/auditor.md | UI verification |

## Contract

### Edge Function API Shape (OSHA project: vizmtkfpxxjzlpzibate)

```typescript
// GET /industry/:naicsCode
interface IndustryProfileResponse {
  naicsCode: string
  industryName: string
  totalViolations: number
  avgPenalty: number
  violationRate: number // per inspection
  topStandards: { code: string; description: string; count: number }[]
  yearOverYear: { year: number; violations: number; avgPenalty: number }[]
}

// GET /enforcement/nearby?lat=X&lng=Y&radius=25
interface NearbyEnforcementResponse {
  establishment: string
  city: string
  state: string
  violationType: string
  penaltyAmount: number
  inspectionDate: string
  distance: number
}[]

// GET /benchmarks/:vertical
interface BenchmarksResponse {
  vertical: string
  nationalAvg: { score: number; penalty: number; violationRate: number }
  californiaAvg: { score: number; penalty: number; violationRate: number }
  percentiles: { p25: number; p50: number; p75: number; p90: number }
  topCitedStandards: { code: string; count: number; avgPenalty: number }[]
}

// GET /regulatory-updates?since=ISO_DATE
interface RegulatoryUpdateResponse {
  id: string
  title: string
  summary: string
  severity: string
  jurisdiction: string
  category: string
  effectiveDate: string | null
  sourceUrl: string | null
  publishedAt: string
}[]
```

### OSHA DB Tables Available (source data)
- `protekon_osha_violations` (435K rows) — violations with hazcat, risk_score
- `protekon_employer_profiles` (115K rows) — risk scoring, risk_tier
- `protekon_industry_benchmarks` (3,216 rows) — severity breakdowns, YoY trends
- `protekon_regulatory_updates` (191 rows) — regulatory changes
- `protekon_enforcement_stories` (3,522 rows) — high-penalty cases
- `protekon_naics_master` (16 rows) — NAICS mapping
- `protekon_state_plans` (51 rows) — state plan details

### App-Side Types (already in lib/types.ts)
- `OshaIndustryProfile`, `OshaNearbyEnforcement`, `OshaBenchmarks`

### App-Side Client (already built)
- `lib/osha-api.ts` — `getIndustryProfile()`, `getNearbyEnforcement()`, `getBenchmarks()` with caching

## File Ownership
| Agent | Owns | Does NOT Touch |
|-------|------|----------------|
| builder-edge | supabase/functions/ (on OSHA project) | Protekon app code |
| builder-api | lib/osha-api.ts, inngest/functions/regulatory-sync-bridge.ts, lib/score-calculator.ts, .env.example | components/, app/(routes)/ |
| builder-ui | components/dashboard/osha-*.tsx, app/dashboard/page.tsx (widget integration) | supabase/, app/api/, lib/actions/ |

## Tasks

### Task 1: Build OSHA Edge Function
- **Owner:** builder-edge
- **Input:** Contract API shape above, OSHA DB table schemas
- **Output:** Supabase Edge Function with 4 endpoints deployed to `vizmtkfpxxjzlpzibate`
- **Dependencies:** none
- **Instructions:**
  Create a Deno edge function on the OSHA Supabase project exposing `/industry/:naicsCode`, `/enforcement/nearby`, `/benchmarks/:vertical`, and `/regulatory-updates`. Query `protekon_industry_benchmarks`, `protekon_osha_violations`, `protekon_regulatory_updates`. Add Bearer token auth via a shared secret. Deploy with `supabase functions deploy`.

### Task 2: Set Env Vars + Wire Sync
- **Owner:** builder-api
- **Input:** Deployed edge function URL from Task 1
- **Output:** `OSHA_API_URL` and `OSHA_API_KEY` set on Vercel, `.env.example` updated, regulatory sync tested
- **Dependencies:** Task 1
- **Instructions:**
  Set `OSHA_API_URL` and `OSHA_API_KEY` on Vercel via CLI. Update `.env.example`. Trigger `regulatory-sync-bridge.ts` Inngest function manually to sync 191 regulatory rows from OSHA DB to app DB. Replace hardcoded `$16,131` in `lib/score-calculator.ts` with dynamic lookup via `getBenchmarks()`. This completes NGE-360 and NGE-362 and NGE-368.

### Task 3: OSHA Dashboard Widgets
- **Owner:** builder-ui
- **Input:** Working OSHA API (from Task 2), `lib/osha-api.ts` client functions
- **Output:** 3 dashboard widget components + integration into main dashboard
- **Dependencies:** Task 2
- **Instructions:**
  Build 3 widgets for `/dashboard`: (1) Industry Benchmark — bar chart of top cited standards using `getIndustryProfile()`, stat cards for avg penalty/violation rate. (2) Nearby Enforcement — list of recent Cal/OSHA actions near client location using `getNearbyEnforcement()`. (3) Score Comparison — gauge/percentile chart using `getBenchmarks()`. Use Recharts (already installed). Follow existing dashboard card patterns (Phosphor icons, midnight/crimson/gold brand colors, Barlow Condensed/DM Sans typography). Completes NGE-369, NGE-370, NGE-371 (sub-issues of NGE-364).

### Task 4: Validate
- **Owner:** validator
- **Input:** All builder outputs
- **Output:** Quality gate results
- **Dependencies:** Task 1, Task 2, Task 3
- **Instructions:**
  Run quality gates: tsc, lint, tests, build. Verify edge function responds to all 4 endpoints. Verify regulatory_updates table has >6 rows after sync. Report failures for Fixer.

### Task 5: Audit
- **Owner:** auditor
- **Input:** Validated codebase
- **Output:** Functional rate report
- **Dependencies:** Task 4
- **Instructions:**
  Verify OSHA widgets render on dashboard with real data. Check loading states, error states, empty states. Verify score page uses dynamic penalty data. Target: >=95% functional rate.

## Execution Order
1. Task 1: Build OSHA Edge Function (sequential — blocker)
2. Task 2: Set Env Vars + Wire Sync (depends on Task 1)
3. Task 3: OSHA Dashboard Widgets (depends on Task 2)
4. Task 4: Validate (depends on all builders)
5. Task 5: Audit (depends on Validate)

## Linear Issues Resolved
- NGE-360: OSHA data API — Edge function (Task 1)
- NGE-362: Regulatory sync — Backfill 191 rows (Task 2)
- NGE-368: Dynamic penalty data (Task 2)
- NGE-364: OSHA dashboard widgets — parent (Task 3)
- NGE-369: OSHA industry benchmark widget (Task 3)
- NGE-370: OSHA nearby enforcement widget (Task 3)
- NGE-371: OSHA score comparison widget (Task 3)

## Issues Already Done (discovered during audit)
- NGE-358: Middleware — committed `e721539`
- NGE-359: Alerts table — migration 010 applied
- NGE-361: SB 553 classifier — `lib/ai/incident-classifier.ts` already has Type 1-4
- NGE-378: AI classification metadata — migration 011 added `metadata` JSONB column

## Validation Criteria
- [ ] Edge function deployed and responds to all 4 endpoints with real data
- [ ] `OSHA_API_URL` and `OSHA_API_KEY` set on Vercel (all environments)
- [ ] `regulatory_updates` table has 50+ rows after sync (up from 6)
- [ ] Score calculator uses dynamic industry-specific penalty averages
- [ ] 3 OSHA widgets visible on dashboard with real data
- [ ] All quality gates pass (tsc, lint, tests, build)
- [ ] Feature audit >= 95% functional
