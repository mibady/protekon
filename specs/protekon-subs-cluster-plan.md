# protekon-subs-cluster Plan — 6 surfaces in 2 phases

## Objective
Ship all 6 subcontractor-related surfaces. Phase A (this wave) covers the 3 surfaces whose backend is mostly shipped. Phase B (deferred, own plan) covers the 3 surfaces that need substantial new backend (public sub portal, safety programs table, 1099 payment ingest).

## Scope reality check — what's already shipped

Discovery (2026-04-19) found substantial subs infrastructure already in place:

| Shipped | Evidence |
|---|---|
| `construction_subs` table | migration 002 — roster per client |
| `construction_coi` table | migration 031 — carrier / policy / coverage / expiration / extraction metadata |
| `v_construction_subs_dashboard` view | migration 031 — CSLB status + risk score + expiry tracking |
| `fn_process_coi_upload` Postgres function | migration 031 — handles COI insert + sub update |
| `/api/construction/coi-upload` route | file upload → Vercel Blob → calls fn_process_coi_upload |
| `lib/actions/construction.ts` | getSubcontractors, addSubcontractor, verifySubcontractor, deleteSubcontractor |
| `lib/actions/construction-summary.ts` | aggregate summaries |
| `components/dashboard/CoiUploadDialog.tsx` | shipped session 27 |

**Implication:** COI Verification + Vendor Risk Score + a Sub Onboarding *admin* view are UI-only ports. Real net-new work is Projects (data model), Sub Onboarding *public* portal, Safety Programs, and 1099-NEC payment ingest.

## Phase A — UI-only + Projects data model (this wave)

### Surfaces in Phase A
| Surface | Remix JSX | Backend | Effort |
|---|---|---|---|
| Projects | `phase3.jsx:365` (ProjectAssignmentSurface) | **New tables: projects + project_subs** + `lib/actions/projects.ts` | New |
| COI Verification | `phase3.jsx:177` (CoiVerificationSurface) | Shipped: construction_coi + /api/construction/coi-upload + `lib/actions/construction.ts` | UI-only |
| Vendor Risk Score | `phase3c.jsx:359` (VendorRiskSurface) | Shipped: v_construction_subs_dashboard + construction_coi aggregates | UI-only |

### Phase A deliverables

**Migration 048** — `projects` + `project_subs`:
```sql
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  site_id uuid REFERENCES sites(id),            -- optional: ties project to a site
  address text,
  start_date date,
  end_date date,
  status text DEFAULT 'active' CHECK (status IN ('planned','active','paused','completed','archived')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX projects_client_status_idx ON projects(client_id, status) WHERE status != 'archived';

CREATE TABLE project_subs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  sub_id uuid NOT NULL REFERENCES construction_subs(id) ON DELETE CASCADE,
  scope text,                                   -- "electrical", "concrete", ...
  assigned_at timestamptz NOT NULL DEFAULT now(),
  removed_at timestamptz,
  UNIQUE (project_id, sub_id)
);

-- RLS (matches existing single-user-per-client pattern)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY projects_select_own ON projects FOR SELECT TO authenticated USING (client_id = auth.uid());
CREATE POLICY projects_insert_own ON projects FOR INSERT TO authenticated WITH CHECK (client_id = auth.uid());
CREATE POLICY projects_update_own ON projects FOR UPDATE TO authenticated USING (client_id = auth.uid());
CREATE POLICY projects_delete_own ON projects FOR DELETE TO authenticated USING (client_id = auth.uid());

ALTER TABLE project_subs ENABLE ROW LEVEL SECURITY;
CREATE POLICY project_subs_select_own ON project_subs FOR SELECT TO authenticated
  USING (project_id IN (SELECT id FROM projects WHERE client_id = auth.uid()));
CREATE POLICY project_subs_write_own ON project_subs FOR ALL TO authenticated
  USING (project_id IN (SELECT id FROM projects WHERE client_id = auth.uid()))
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE client_id = auth.uid()));
```

**`lib/actions/projects.ts`**:
```ts
export async function listProjects(): Promise<Project[]>
export async function getProjectDetail(id: string): Promise<ProjectDetail | null>   // includes project_subs
export async function createProject(formData: FormData): Promise<ActionResult>
export async function updateProject(id: string, formData: FormData): Promise<ActionResult>
export async function archiveProject(id: string): Promise<ActionResult>
export async function assignSubToProject(projectId: string, subId: string, scope?: string): Promise<ActionResult>
export async function removeSubFromProject(projectId: string, subId: string): Promise<ActionResult>
```

**`lib/actions/coi.ts`** (NEW — thin helper, the route already exists):
```ts
export async function listCoiRecords(subId?: string): Promise<CoiRecord[]>   // reads construction_coi, filtered
export async function getCoiSummary(): Promise<{ expired: number; expiringSoon: number; current: number; missing: number }>
```

**`lib/actions/vendor-risk.ts`** (NEW — thin helper):
```ts
export async function listSubsWithRisk(): Promise<SubWithRisk[]>   // reads v_construction_subs_dashboard + aggregates construction_coi
export async function getVendorRiskDetail(subId: string): Promise<VendorRiskDetail | null>   // includes CSLB, COI history, incidents, training
```

**Frontend surfaces:**

1. **`app/dashboard/projects/page.tsx`** — list + "New project" modal + project detail with subs list + Assign Sub modal
2. **`app/dashboard/coi-verification/page.tsx`** — COI records grouped by sub; upload button per sub opens dialog (reuse existing `components/dashboard/CoiUploadDialog.tsx` if it fits, else port Remix)
3. **`app/dashboard/vendor-risk/page.tsx`** — sub list with risk score bars + drill-down detail view (port Remix `phase3c.jsx` VendorDetail pattern)

Components to create under `components/v2/subs/`:
- `ProjectsTable.tsx`, `NewProjectModal.tsx`, `ProjectDetailView.tsx`, `AssignSubModal.tsx`
- `CoiRecordsList.tsx`, `CoiUploadButton.tsx` (wraps existing dialog)
- `VendorRiskList.tsx`, `VendorDetail.tsx`, `ScoreBar.tsx`, `Spark.tsx` (port Remix atoms)

## Phase B — deferred to own plan

- Sub Onboarding public portal at `/sub/[token]` — new invite system, W-9 upload, MSA capture
- Safety Programs — new `sub_safety_programs` table, template library, reviewer flow
- 1099-NEC — new `vendor_payments` table, CSV import or QuickBooks integration, e-file via Track1099/Tax1099

These warrant their own `/plan_team` call when Phase A ships.

## Team Members (Phase A)
| Role | Agent | Responsibility |
|------|-------|----------------|
| Lead | lead | Orchestrate |
| DB Builder | builder-db | Migration 048 (projects + project_subs) |
| Backend Builder | builder-api | lib/actions/projects.ts + coi.ts + vendor-risk.ts |
| Frontend Builder | builder-ui | 3 surfaces + components/v2/subs/** |
| Validator | validator | Gates |
| Fixer | fixer | Contingent |
| Auditor | auditor | Static |

## File Ownership
| Agent | Owns | Does NOT Touch |
|-------|------|----------------|
| builder-db | `supabase/migrations/048_projects.sql` | Everything else |
| builder-api | `lib/actions/projects.ts`, `lib/actions/coi.ts`, `lib/actions/vendor-risk.ts` | Everything else |
| builder-ui | 3 dashboard pages + `components/v2/subs/**` | Everything else |

**Hard exclusions:** all other lib/actions/* (read-only), all migrations 001–047, inngest/, app/api/ (the coi-upload route stays intact), all W1–W5 + RBAC component subtrees, lib/v2/coverage-resources/*, existing components/dashboard/CoiUploadDialog.tsx (reuse as-is).

## Tasks (Phase A)

### S-T1: DB — migration 048 (projects + project_subs)
- **Owner:** builder-db
- **Deps:** none
- **Output:** `supabase/migrations/048_projects.sql` (~90L)

### S-T2: Backend — projects + coi + vendor-risk helpers
- **Owner:** builder-api
- **Deps:** S-T1
- **Output:** 3 new files in lib/actions/

### S-T3: Frontend — 3 subs surfaces
- **Owner:** builder-ui
- **Deps:** S-T2
- **Output:** 3 dashboard pages + components/v2/subs/ subtree

### S-T4: Validate
- **Owner:** validator
- **Deps:** S-T3

### S-T5: Fix (contingent)
- **Owner:** fixer
- **Deps:** S-T4

### S-T6: Audit
- **Owner:** auditor
- **Deps:** S-T4

## Validation Criteria
- [ ] Migration 048 applies cleanly
- [ ] projects + project_subs RLS blocks cross-client reads
- [ ] 3 UnderConstruction stubs replaced (projects, coi-verification, vendor-risk)
- [ ] pnpm tsc, lint, build all pass
- [ ] Wave 1–5 + RBAC + existing /api/construction/coi-upload + construction.ts untouched
- [ ] No modifications to migrations 001–047

## Handoff
Ready for: `/build "specs/protekon-subs-cluster-plan.md"`
