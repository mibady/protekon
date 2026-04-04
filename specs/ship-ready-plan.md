# ship-ready Plan

## Objective
Wire remaining decorative elements (contact form, OAuth buttons, sidebar tier gating) and complete all P0-P2 backlog items to make Protekon production-ready and shippable.

## Audit Summary
**55 pages audited. 52 fully functional. 3 gaps found:**
1. Contact form — fakes submit with setTimeout, never sends data
2. Login OAuth — Google/Apple buttons have no onClick handlers
3. Sidebar tier gating — shows all nav items regardless of user plan

**Backlog items (P0-P2):**
- Stripe products need creation + env vars
- Migrations 005+006 need production push
- Partner portal dashboard (/partner) not built
- Partner assessment tool (/partner/assessments) not built
- Intake flow Step 3 (plan selection) missing
- pid parameter not persisted to DB

## Team Members
| Role | Agent | System Prompt | Responsibility |
|------|-------|---------------|----------------|
| Backend Builder | builder-api | .claude/agents/team/builder.md | API routes, server actions, Inngest, Stripe |
| Frontend Builder A | builder-ui-a | .claude/agents/team/builder.md | Wiring fixes (contact, login, sidebar) + intake Step 3 |
| Frontend Builder B | builder-ui-b | .claude/agents/team/builder.md | Partner portal + assessment pages |
| DB Builder | builder-db | .claude/agents/team/builder.md | Migration for pid column + partner portal schema |
| Validator | validator | .claude/agents/team/validator.md | Quality gates |
| Auditor | auditor | .claude/agents/team/auditor.md | UI verification |

## Contract

```typescript
// Contact form submission
interface ContactSubmission {
  name: string
  email: string
  company?: string
  phone?: string
  subject: string
  message: string
}

// Server action: lib/actions/contact.ts
export async function submitContact(data: ContactSubmission): Promise<{ success: boolean; error?: string }>

// API route (optional): POST /api/contact → Resend email to hello@protekon.com

// Partner portal types (extend lib/types/partner.ts)
interface PartnerProfile {
  id: string
  user_id: string
  company_name: string
  contact_name: string
  email: string
  phone?: string
  tier: 'free' | 'essentials' | 'professional' | 'enterprise'
  branding?: { logo_url?: string; primary_color?: string }
  created_at: string
}

interface PartnerClient {
  id: string
  partner_id: string
  client_id: string
  client_name: string
  vertical: string
  compliance_score: number
  plan: string
  status: 'active' | 'suspended' | 'churned'
  monthly_revenue: number
  created_at: string
}

interface PartnerAssessment {
  id: string
  partner_id: string
  prospect_name: string
  prospect_email: string
  score?: number
  score_tier?: string
  gaps?: string[]
  fine_low?: number
  fine_high?: number
  status: 'pending' | 'sent' | 'completed' | 'converted'
  sent_at?: string
  completed_at?: string
  created_at: string
}

// Sidebar tier gating
interface NavItem {
  name: string
  href: string
  icon: ComponentType
  minTier?: 'core' | 'professional' | 'multi-site'
}
// Filter: only show items where client.plan >= item.minTier
```

## File Ownership
| Agent | Owns | Does NOT Touch |
|-------|------|----------------|
| builder-db | supabase/migrations/ | app/, components/, lib/actions/ |
| builder-api | lib/actions/contact.ts, lib/actions/partner-portal.ts, app/api/partner/ | components/, app/(pages)/ |
| builder-ui-a | app/contact/, app/login/, app/dashboard/layout.tsx, app/dashboard/intake/ | supabase/, app/api/, app/partner/ |
| builder-ui-b | app/partner/, components/partner/ | supabase/, app/api/, app/dashboard/layout.tsx |

## Tasks

### Task 1: Database — Partner portal schema + pid column
- **Owner:** builder-db
- **Input:** Contract types above
- **Output:** supabase/migrations/007_partner_portal.sql
- **Dependencies:** none
- **Instructions:**
  Create migration with: partner_profiles table (links to auth.users), partner_clients junction table, partner_assessments table. Add prospect_id column to compliance_score_leads table. RLS: partners see only their own data via auth.uid(). Anon: no access to partner tables.

### Task 2: Backend — Server actions + API routes
- **Owner:** builder-api
- **Input:** Contract types, Task 1 schema
- **Output:** lib/actions/contact.ts, lib/actions/partner-portal.ts, app/api/partner/assessments/route.ts
- **Dependencies:** Task 1
- **Instructions:**
  Create submitContact() server action that inserts into a contact_submissions table (add to migration) OR sends via Resend to hello@protekon.com. Create partner portal actions: getPartnerProfile(), getPartnerClients(), getPartnerAssessments(), sendAssessment(). Create API route POST /api/partner/assessments/send that sends score assessment link via Resend with partner_ref tracking.

### Task 3: Frontend A — Wire decorative elements + intake Step 3
- **Owner:** builder-ui-a
- **Input:** lib/actions/contact.ts, Supabase OAuth docs
- **Output:** Edits to app/contact/page.tsx, app/login/page.tsx, app/dashboard/layout.tsx, app/dashboard/intake/page.tsx
- **Dependencies:** Task 2 (needs contact action)
- **Instructions:**
  1. Wire contact form to call submitContact() server action, replacing setTimeout fake.
  2. Wire Google/Apple OAuth buttons on login page to call supabase.auth.signInWithOAuth({ provider: 'google' }) and 'apple'. Import createClient from lib/supabase/client.
  3. Add tier gating to dashboard sidebar: read client.plan from getClientProfile(), filter navGroups items by minTier. Add minTier to nav items that need gating (Quarterly Reviews → professional, Annual Audit → multi-site).
  4. Add plan selection step to intake flow before Stripe checkout redirect.

### Task 4: Frontend B — Partner portal dashboard + assessment tool
- **Owner:** builder-ui-b
- **Input:** Contract types, Task 2 actions
- **Output:** app/partner/layout.tsx, app/partner/page.tsx, app/partner/assessments/page.tsx, components/partner/ClientRoster.tsx, components/partner/AssessmentTable.tsx, components/partner/SendAssessmentDialog.tsx
- **Dependencies:** Task 2 (needs partner actions)
- **Instructions:**
  1. Create /partner layout with partner-specific sidebar (Dashboard, Clients, Assessments, Settings, Boot Camp link).
  2. Build /partner dashboard: stats row (total clients, MRR, avg compliance score, assessments sent), client roster table with compliance score badges, recent activity feed.
  3. Build /partner/assessments: table of sent assessments with status badges (pending/sent/completed/converted), "Send Assessment" dialog that collects prospect name + email and calls sendAssessment(). Include score results inline when completed.
  4. Style consistent with existing dashboard (midnight/crimson/gold palette, font-display headings, same spacing system).

### Task 5: Validate
- **Owner:** validator
- **Input:** All builder outputs
- **Output:** Quality gate results
- **Dependencies:** Task 1, Task 2, Task 3, Task 4
- **Instructions:**
  Run quality gates: tsc --noEmit, eslint, next build. Report failures with file paths and error messages for Fixer.

### Task 6: Audit
- **Owner:** auditor
- **Input:** Validated codebase
- **Output:** Functional rate report
- **Dependencies:** Task 5
- **Instructions:**
  Verify: (1) contact form submits and shows confirmation, (2) OAuth buttons trigger Supabase auth, (3) sidebar hides tier-gated items for lower plans, (4) /partner dashboard renders with data hooks, (5) /partner/assessments send dialog works. Target: >=95% functional rate across all 55+ pages.

## Execution Order
1. Task 1: DB Builder (sequential — schema must exist first)
2. Task 2: Backend Builder (depends on Task 1)
3. Task 3 + Task 4: Frontend A + Frontend B (parallel, both depend on Task 2)
4. Task 5: Validator (depends on Task 3 + Task 4)
5. Task 6: Auditor (depends on Task 5)

## References Consulted
- specs/page-audit.md — Complete 55-page element audit
- CLAUDE.md — Project architecture, build order, conventions
- SESSION_LOG.md — Session 9 context, known issues

## Validation Criteria
- [ ] Contact form sends data to server (not setTimeout fake)
- [ ] Google/Apple OAuth buttons trigger Supabase auth flow
- [ ] Sidebar hides tier-gated items for lower-tier clients
- [ ] /partner dashboard renders with partner profile + client roster
- [ ] /partner/assessments allows sending score links and tracks status
- [ ] pid column added to compliance_score_leads
- [ ] All quality gates pass (tsc, lint, build)
- [ ] Feature audit >= 95% functional across all pages

## Out of Scope (Future Sessions)
- Stripe product creation (requires manual dashboard config + env vars)
- White-label branding system (P2 — depends on partner portal being live)
- E2E browser tests (P3)
- Vercel deployment verification (P2 — after all features complete)
- Running migrations against production Supabase (ops task, not code)
