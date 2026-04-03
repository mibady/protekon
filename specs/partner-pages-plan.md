# partner-pages Plan

## Objective
Build 4 partner acquisition pages: /partners (marketing), /partners/pricing (tiers + margin calculator), /partners/apply (application form), /partners/boot-camp (landing page). Plus partner_applications DB table and submit action.

## Team Members
| Role | Agent | System Prompt | Responsibility |
|------|-------|---------------|----------------|
| DB Builder | builder-db | .claude/agents/team/builder.md | partner_applications table + RLS |
| Backend Builder | builder-api | .claude/agents/team/builder.md | Submit action + API route |
| Frontend Builder A | builder-partners | .claude/agents/team/builder.md | /partners + /partners/pricing |
| Frontend Builder B | builder-apply | .claude/agents/team/builder.md | /partners/apply + /partners/boot-camp |
| Validator | validator | .claude/agents/team/validator.md | Quality gates |

## Contract
```typescript
// lib/types/partner.ts
export interface PartnerApplication {
  name: string
  email: string
  phone?: string
  business_name: string
  business_type: string
  website?: string
  city: string
  state: string
  client_count: string
  client_industries: string[]
  verticals_interested: string[]
  previous_compliance_experience: string
  tier_interest: string
  referral_source?: string
  notes?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
}

// POST /api/partners/apply
// Request: PartnerApplication
// Response: { success: true, id: string } | { error: string }
```

## File Ownership
| Agent | Owns | Does NOT Touch |
|-------|------|----------------|
| builder-db | supabase/migrations/006_partner_applications.sql | Everything else |
| builder-api | lib/types/partner.ts, lib/actions/partner.ts, app/api/partners/apply/route.ts | app/partners/ pages |
| builder-partners | app/partners/page.tsx, app/partners/pricing/page.tsx, app/partners/layout.tsx | app/partners/apply/, app/partners/boot-camp/ |
| builder-apply | app/partners/apply/page.tsx, app/partners/boot-camp/page.tsx | app/partners/page.tsx, app/partners/pricing/ |

## Tasks

### Task 1: DB — partner_applications table
- **Owner:** builder-db
- **Input:** SQL schema from spec
- **Output:** supabase/migrations/006_partner_applications.sql
- **Dependencies:** none
- **Instructions:**
  Create partner_applications table per spec. RLS: service_role full access, anon insert-only (public form). Indexes on email, status.

### Task 2: Backend — Partner types + submit action + API route
- **Owner:** builder-api
- **Input:** Contract types, existing patterns in lib/actions/score.ts
- **Output:** lib/types/partner.ts, lib/actions/partner.ts, app/api/partners/apply/route.ts
- **Dependencies:** Task 1
- **Instructions:**
  1. Create lib/types/partner.ts with PartnerApplication interface.
  2. Create lib/actions/partner.ts: submitPartnerApplication inserts into partner_applications via supabase (no auth, public form).
  3. Create app/api/partners/apply/route.ts: POST with Zod validation, calls submitPartnerApplication, returns { success, id }.

### Task 3: Frontend — /partners + /partners/pricing
- **Owner:** builder-partners
- **Input:** COPY_PARTNER_PAGES spec (Pages 16+17), site theme from app/pricing/page.tsx
- **Output:** app/partners/layout.tsx, app/partners/page.tsx, app/partners/pricing/page.tsx
- **Dependencies:** none (parallel with Tasks 1+2)
- **Instructions:**
  Build two marketing pages matching site dark theme. See full spec in prompt.

### Task 4: Frontend — /partners/apply + /partners/boot-camp
- **Owner:** builder-apply
- **Input:** COPY_PARTNER_PAGES spec (Pages 18+19), site theme
- **Output:** app/partners/apply/page.tsx, app/partners/boot-camp/page.tsx
- **Dependencies:** Task 2 (apply page needs API route)
- **Instructions:**
  Build application form (4 sections, multi-select, confirmation state) and boot camp landing page. See full spec in prompt.

### Task 5: Validate
- **Owner:** validator
- **Input:** All builder outputs
- **Output:** Quality gate results
- **Dependencies:** Task 1, 2, 3, 4
- **Instructions:**
  Run tsc --noEmit, eslint on new files, npm run build. Fix any errors in new files only.

## Execution Order
1. Task 1 (DB) + Task 3 (Partners marketing) — parallel
2. Task 2 (Backend) — depends on Task 1
3. Task 4 (Apply + Boot Camp) — depends on Task 2
4. Task 5 (Validate) — depends on all

## Validation Criteria
- [ ] /partners page renders with hero, opportunity, 6 partner profiles, 3-step model, margin math, FAQ
- [ ] /partners/pricing renders 4 tiers with interactive margin calculator
- [ ] /partners/apply form submits to API, shows confirmation
- [ ] /partners/boot-camp renders 6 modules with CTAs
- [ ] All quality gates pass
