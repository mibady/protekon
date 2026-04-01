# API Routes + Settings + Dashboard Wiring — Implementation Spec

## Overview

Stage 3 of the backend-first workflow: create settings server actions, a compliance score API, and wire the dashboard overview page to real data. After this stage, users can update their profile/company settings, see their real compliance score, and the dashboard shows live data from Supabase.

## Layers

- [ ] Database: No schema changes needed
- [x] Backend: Server actions + 1 API route
- [x] Frontend: Wire settings page + dashboard overview
- [ ] AI: Not applicable

## Contract

### Settings Server Actions

```ts
// lib/actions/settings.ts
export async function updateProfile(formData: FormData): Promise<ActionResult>
export async function updateCompany(formData: FormData): Promise<ActionResult>
export async function changePassword(formData: FormData): Promise<ActionResult>
export async function getClientProfile(): Promise<ClientProfile | null>
```

### Dashboard Data Query

```ts
// lib/actions/dashboard.ts
export async function getDashboardData(): Promise<DashboardData>
```

### Compliance Score API

```ts
// app/api/compliance/score/route.ts
// GET — returns { score, categories, riskLevel } for authenticated user
```

### Types

```ts
// Additions to lib/types.ts

export type ClientProfile = {
  id: string
  email: string
  business_name: string
  phone: string | null
  vertical: string
  plan: string
  compliance_score: number
  risk_level: string
  status: string
}

export type DashboardData = {
  client: ClientProfile | null
  recentDocuments: Document[]
  recentIncidents: Incident[]
  complianceScore: number
  documentCount: number
  incidentCount: number
  auditCount: number
}
```

## Files to Create

| # | File | Purpose |
|---|------|---------|
| 1 | `lib/actions/settings.ts` | updateProfile, updateCompany, changePassword, getClientProfile |
| 2 | `lib/actions/dashboard.ts` | getDashboardData — aggregate query for overview |
| 3 | `app/api/compliance/score/route.ts` | GET endpoint for compliance score (used by widgets) |

## Files to Modify

| # | File | Change |
|---|------|--------|
| 4 | `lib/types.ts` | Add ClientProfile, DashboardData types |
| 5 | `app/dashboard/settings/page.tsx` | Wire profile/company/password forms to real actions |
| 6 | `app/dashboard/page.tsx` | Replace static data with getDashboardData() |
| 7 | `app/dashboard/layout.tsx` | Show real client name + compliance score in sidebar |

## Implementation Order

### Phase 1: Types + Settings Actions (files 1, 4)

1. Add ClientProfile and DashboardData to `lib/types.ts`
2. Create `lib/actions/settings.ts`:
   - `getClientProfile()`: fetch from clients table where id = auth.uid()
   - `updateProfile(formData)`: update clients row (business_name, phone)
   - `updateCompany(formData)`: update clients row (vertical, plan)
   - `changePassword(formData)`: call supabase.auth.updateUser({ password })

### Phase 2: Dashboard Data + API Route (files 2, 3)

3. Create `lib/actions/dashboard.ts`:
   - `getDashboardData()`: parallel queries for client, documents (limit 4), incidents (limit 5), counts
   - Compliance score from clients.compliance_score
4. Create `app/api/compliance/score/route.ts`:
   - Authenticated GET endpoint
   - Returns score + risk_level from clients table

### Phase 3: Wire Settings Page (file 5)

5. Wire settings page:
   - Load real client data on mount via getClientProfile()
   - Profile tab: updateProfile action
   - Company tab: updateCompany action
   - Security tab: changePassword action
   - Notifications + Billing tabs: keep as-is (future Stripe stage)

### Phase 4: Wire Dashboard Overview (files 6, 7)

6. Dashboard overview page:
   - Fetch real data via getDashboardData() on mount
   - Replace hardcoded compliance score, documents, incidents
   - Keep visual structure (animations, charts) intact
7. Dashboard layout sidebar:
   - Show real client name + compliance score (currently "Demo Construction Co")

## Acceptance Criteria

- [ ] `npm run build` passes
- [ ] Settings profile form saves to clients table
- [ ] Settings company form saves to clients table
- [ ] Password change works via Supabase Auth
- [ ] Dashboard shows real compliance score from clients table
- [ ] Dashboard shows real recent documents and incidents
- [ ] Sidebar shows real client name and compliance score
- [ ] GET /api/compliance/score returns authenticated user's score
- [ ] No hardcoded "Demo Construction Co" or fake data remains on dashboard
