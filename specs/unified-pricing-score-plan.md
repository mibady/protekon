# unified-pricing-score Plan

## Objective
Rewrite the /pricing page with unified tiers (comparison table, add-a-vertical, setup fee explainer, expanded FAQ) and build the /score compliance lead magnet (10-question multi-step form, email gate, dynamic results with gap analysis and fine exposure).

## Phasing Note
This is **Phase 1** of the COPY_UNIFIED_PRICING epic. Phase 2 = Partner Portal + Assessment Tool. Phase 3 = Intake flow update + vertical page pricing blocks + drip sequences.

## Team Members
| Role | Agent | System Prompt | Responsibility |
|------|-------|---------------|----------------|
| DB Builder | builder-db | .claude/agents/team/builder.md | compliance_score_leads table + RLS |
| Backend Builder | builder-api | .claude/agents/team/builder.md | Score submission action, score calculation, score PDF API |
| Frontend Builder (Pricing) | builder-pricing | .claude/agents/team/builder.md | /pricing page rewrite |
| Frontend Builder (Score) | builder-score | .claude/agents/team/builder.md | /score page (form + results) |
| Validator | validator | .claude/agents/team/validator.md | Quality gates |
| Auditor | auditor | .claude/agents/team/auditor.md | UI verification |

## Contract

```typescript
// lib/types/score.ts

export interface ScoreAnswers {
  // Step 1 — Business Context
  industry: string
  employee_count: string // "10-25" | "26-50" | "51-100" | "101-250" | "251+"
  location_count: string // "1" | "2-3" | "4-10" | "10+"
  city: string
  state: string // default "CA"

  // Step 2 — Compliance Posture (6 yes/no)
  has_iipp: boolean
  iipp_site_specific: boolean
  has_incident_log: boolean
  training_current: boolean
  has_industry_programs: boolean
  audit_ready: boolean
}

export interface ScoreResult {
  score: number // 0-6
  tier: "green" | "yellow" | "red" // 6=green, 4-5=yellow, 0-3=red
  gaps: ScoreGap[]
  fine_low: number
  fine_high: number
}

export interface ScoreGap {
  key: string // e.g. "has_iipp"
  label: string
  description: string
  citation_amount: number
}

export interface ScoreLead {
  email: string
  name: string
  phone?: string
  answers: ScoreAnswers
  result: ScoreResult
  partner_ref?: string // from ?ref= URL param
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
}

// POST /api/score/submit
// Request: ScoreLead
// Response: { success: true, id: string } | { error: string }

// GET /api/score/report?id={lead_id}
// Response: PDF binary (Content-Type: application/pdf)
```

## File Ownership
| Agent | Owns | Does NOT Touch |
|-------|------|----------------|
| builder-db | supabase/migrations/005_score_leads.sql | Everything else |
| builder-api | lib/types/score.ts, lib/actions/score.ts, app/api/score/submit/route.ts, app/api/score/report/route.ts, lib/score-calculator.ts | app/pricing/, app/score/ |
| builder-pricing | app/pricing/page.tsx | app/score/, supabase/, app/api/ |
| builder-score | app/score/page.tsx, components/score/ | app/pricing/, supabase/, app/api/ |

## Tasks

### Task 1: Database — compliance_score_leads table
- **Owner:** builder-db
- **Input:** SQL schema from COPY_UNIFIED_PRICING Section 3
- **Output:** supabase/migrations/005_score_leads.sql
- **Dependencies:** none
- **Instructions:**
  Create the compliance_score_leads table with all columns from the spec (contact, business context, score booleans, calculated fields, attribution, drip tracking, conversion). Add RLS: service_role full access, anon insert-only (for public /score form), authenticated select own rows. Add indexes on email, partner_ref, score_tier, industry.

### Task 2: Backend — Score types + calculation + API routes
- **Owner:** builder-api
- **Input:** Contract types above, scoring logic from spec
- **Output:** lib/types/score.ts, lib/score-calculator.ts, lib/actions/score.ts, app/api/score/submit/route.ts, app/api/score/report/route.ts
- **Dependencies:** Task 1
- **Instructions:**
  1. Create lib/types/score.ts with the contract interfaces.
  2. Create lib/score-calculator.ts: calculateScore(answers) returns ScoreResult. Fine calculation: $16,131 per gap, adjusted by employee_count multiplier (10-25: 0.8, 26-50: 1.0, 51-100: 1.2, 101-250: 1.5, 251+: 2.0). Low = base * 0.7, high = base * 1.3.
  3. Create lib/actions/score.ts: submitScore(lead: ScoreLead) inserts into compliance_score_leads using supabase service role client (public form, no auth). Returns { success: true, id }.
  4. Create app/api/score/submit/route.ts: POST handler validates with Zod, calls submitScore.
  5. Create app/api/score/report/route.ts: GET handler generates score report PDF using pdf-lib (PROTEKON branded header, score ring placeholder, gap list, fine exposure, CTA). Read existing lib/pdf.ts for brand patterns.

### Task 3: Frontend — Pricing page rewrite
- **Owner:** builder-pricing
- **Input:** Current app/pricing/page.tsx, copy from COPY_UNIFIED_PRICING Section 1
- **Output:** app/pricing/page.tsx (rewritten)
- **Dependencies:** none (parallel with Task 1+2)
- **Instructions:**
  Rewrite app/pricing/page.tsx preserving the dark theme (bg-void, midnight cards, crimson accents, gold prices) and existing checkout logic. Add these new sections:
  1. **Hero**: Update H1 to "Managed compliance. Not managed software." with subhead from spec. Add eyebrow.
  2. **Instruction text**: "Every plan covers any single compliance vertical..." above cards.
  3. **Tier cards**: Update features per spec (Core: 8 items with setup fee $297, Professional: 4 additions with $397 setup, Multi-Site: 6 items with $597 setup). Show setup fee on each card.
  4. **Comparison table**: 6-row table (hire officer, CalChamber, Enterprise GRC, training, consultant, PROTEKON).
  5. **Add a Vertical section**: Explain +$397/month add-on with example bundles.
  6. **Setup fee explainer**: What it covers, one-time only.
  7. **FAQ section**: Replace existing 5 FAQs with the 8 from spec.
  8. **Bottom CTA**: "Start today. Be compliant by Thursday." with primary + secondary (links to /score).

### Task 4: Frontend — /score compliance assessment page
- **Owner:** builder-score
- **Input:** Score API contract, copy from COPY_UNIFIED_PRICING Section 3
- **Output:** app/score/page.tsx, components/score/ScoreRing.tsx, components/score/GapList.tsx
- **Dependencies:** Task 2
- **Instructions:**
  Build the /score page as a client component with 4 steps: (1) Business Context (4 fields), (2) Compliance Posture (6 yes/no questions with live ScoreRing), (3) Email Gate (email required, name required, phone optional), (4) Results (score tier display, dynamic gap list, fine exposure, CTAs). Use existing Nav + Footer. Dark theme matching site. ScoreRing component: SVG circle with 6 segments, green fill for "yes", red empty for "no", animated. GapList component: renders gap descriptions with citation amounts. On email gate submit, POST to /api/score/submit, then show results. Include ?ref= and ?pid= URL param capture for partner attribution.

### Task 5: Validate
- **Owner:** validator
- **Input:** All builder outputs
- **Output:** Quality gate results
- **Dependencies:** Task 1, Task 2, Task 3, Task 4
- **Instructions:**
  Run quality gates: tsc --noEmit, eslint, npm run build. Report all failures for Fixer.

### Task 6: Audit
- **Owner:** auditor
- **Input:** Validated codebase
- **Output:** Functional rate report
- **Dependencies:** Task 5
- **Instructions:**
  Verify: (1) /pricing page renders all 3 tier cards with correct prices, comparison table, add-vertical section, FAQ, CTAs. (2) /score page multi-step form advances through all 4 steps, score ring animates, email gate validates required fields, results display gap list and fine exposure. Target: >=95% functional.

## Execution Order
1. Task 1 (DB) + Task 3 (Pricing frontend) — parallel, no dependencies
2. Task 2 (Backend) — depends on Task 1
3. Task 4 (Score frontend) — depends on Task 2
4. Task 5 (Validate) — depends on all builders
5. Task 6 (Audit) — depends on Task 5

## References Consulted
- COPY_UNIFIED_PRICING.md (user-provided spec)
- Existing app/pricing/page.tsx, lib/stripe.ts, lib/types.ts, lib/pdf.ts
- supabase/migrations/001-004

## Validation Criteria
- [ ] /pricing page shows Core $597, Professional $897, Multi-Site $1,297 with setup fees
- [ ] /pricing has comparison table, add-a-vertical section, setup fee explainer, 8 FAQs
- [ ] /score page has 4-step form (business context, posture, email gate, results)
- [ ] Score ring animates live as user answers yes/no questions
- [ ] Score submission writes to compliance_score_leads table
- [ ] Score report PDF downloads with PROTEKON branding
- [ ] All quality gates pass
- [ ] Feature audit >= 95% functional
