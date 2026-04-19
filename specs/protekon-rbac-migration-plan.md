# protekon-rbac-migration Plan

## Objective
Introduce **minimum-viable multi-user RBAC** so the Team & Permissions surface can ship and the DashboardSurface OWNER/MANAGER toggle becomes functional — without rewriting every RLS policy in the app.

## Scope strategy
Current model: `clients.id === auth.uid()` — one user per client, RLS everywhere is `client_id = auth.uid()`.

**Minimum-viable multi-user:**
1. Add `user_roles` junction table. Seed one `owner` row per existing client (so every current user keeps working).
2. Preserve the existing RLS pattern: `client_id = auth.uid()` continues to work because the owner's user_id IS the client_id. New users (compliance managers, field leads, auditors) will have a DIFFERENT user_id but share the client's access via `user_roles` — and their access is enforced at the **action layer** via `getUserRole` checks, not at the RLS layer.
3. Action-layer role guards: critical writes check `requireRole(['owner','compliance_manager'])`. Reads remain open to anyone with a `user_roles` row for that client_id.

**Why action-layer vs RLS rewrites:** rewriting 40+ RLS policies in one shot is high risk and large blast radius. The action layer is the single place every mutation goes through. This keeps the migration small and reversible.

**Path to full RLS in a future plan:** update RLS policies incrementally per surface as we add new user types. Not blocking today.

## Deliverables

### DB — migration 047
```sql
CREATE TABLE user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner','compliance_manager','field_lead','auditor')),
  invited_at timestamptz NOT NULL DEFAULT now(),
  invited_by uuid REFERENCES auth.users(id),
  activated_at timestamptz,
  deactivated_at timestamptz,
  UNIQUE (user_id, client_id)
);

-- Seed: every existing client gets an owner row for its own user_id
INSERT INTO user_roles (user_id, client_id, role, activated_at)
SELECT id, id, 'owner', now() FROM clients
ON CONFLICT (user_id, client_id) DO NOTHING;

-- RLS: users see only rows for clients they're in
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_roles_select ON user_roles
  FOR SELECT TO authenticated
  USING (
    client_id IN (
      SELECT client_id FROM user_roles WHERE user_id = auth.uid() AND activated_at IS NOT NULL
    )
  );
-- Owner-only INSERT/UPDATE/DELETE
CREATE POLICY user_roles_owner_write ON user_roles
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.client_id = user_roles.client_id AND ur.role = 'owner' AND ur.activated_at IS NOT NULL
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.client_id = user_roles.client_id AND ur.role = 'owner' AND ur.activated_at IS NOT NULL
    )
  );

-- Invite tokens (service-role only)
CREATE TABLE team_invite_tokens (
  token text PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('owner','compliance_manager','field_lead','auditor')),
  invited_by uuid NOT NULL REFERENCES auth.users(id),
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE team_invite_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY tokens_deny_all ON team_invite_tokens
  FOR ALL TO authenticated
  USING (false) WITH CHECK (false);
```

### Backend — `lib/auth/roles.ts`
```ts
export type UserRole = 'owner' | 'compliance_manager' | 'field_lead' | 'auditor'
export async function getUserRole(clientId?: string): Promise<UserRole | null>
export async function requireRole(allowed: UserRole[]): Promise<{ userId: string; clientId: string; role: UserRole }>
export async function listMyClients(): Promise<Array<{ client_id: string; role: UserRole }>>
export async function isOwner(clientId?: string): Promise<boolean>
```

Resolution rule: if `clientId` omitted, use `auth.uid()` as the client_id (matches current single-user-per-client default). Returns null if no activated `user_roles` row.

### Backend — `lib/actions/team.ts`
```ts
export async function listTeamMembers(): Promise<TeamMember[]>
export async function inviteTeammate(formData: FormData): Promise<ActionResult & { tokenUrl?: string }>
export async function assignRole(userId: string, role: UserRole): Promise<ActionResult>
export async function deactivateTeammate(userId: string): Promise<ActionResult>
export async function acceptTeamInvite(token: string): Promise<ActionResult & { clientId?: string }>
```
Guards: all writes `requireRole(['owner'])`.

### Frontend — 3 deliverables

1. **`app/dashboard/team/page.tsx`** — replace UnderConstruction. Port Remix `phase5.jsx:164` (TeamPermissionsSurface). Table of teammates (name / email / role pill / status / actions). "Invite teammate" CTA opens modal with email + role select. Shows pending invites separately.

2. **`app/team/invite/[token]/page.tsx`** — public landing page. Validates token → if user not logged in, redirect to signup with email pre-filled + `redirectTo=/team/invite/[token]`. If logged in as matching email, show "Accept invite" CTA → calls `acceptTeamInvite(token)` → redirect to `/dashboard`.

3. **Layout wiring — `app/dashboard/layout.tsx`** — surgical edit. Replace hardcoded `userRole = "owner"` with `const userRole = await getUserRole() ?? "field_lead"` (default least-privilege). Pass to ReportingBanner as-is.

4. **DashboardSurface toggle** — edit `components/v2/dashboard/atoms/ViewToggle.tsx` to accept an `allowManagerView: boolean` prop. When true, the toggle flips normally; when false, preserves current toast-on-click behavior. Edit `components/v2/dashboard/DashboardSurface.tsx` to compute `allowManagerView = userRole === 'compliance_manager' || userRole === 'owner'`.

## Team Members
| Role | Agent | Responsibility |
|------|-------|----------------|
| Lead | lead | Orchestrate |
| DB Builder | builder-db | Migration 047 |
| Backend Builder | builder-api | roles.ts + team.ts |
| Frontend Builder | builder-ui | Team surface + invite page + layout wiring + toggle update |
| Validator | validator | Gates |
| Fixer | fixer | Contingent |
| Auditor | auditor | Static + role matrix verify |

## File Ownership
| Agent | Owns | Does NOT Touch |
|-------|------|----------------|
| builder-db | `supabase/migrations/047_user_roles.sql` | Everything else |
| builder-api | `lib/auth/roles.ts`, `lib/actions/team.ts` | Everything else |
| builder-ui | `app/dashboard/team/page.tsx`, `app/team/invite/[token]/page.tsx`, `app/dashboard/layout.tsx` (surgical edit), `components/v2/dashboard/atoms/ViewToggle.tsx` (surgical edit), `components/v2/dashboard/DashboardSurface.tsx` (surgical edit), `components/v2/team/**` (new) | Anything else |

**Hard exclusions:** all other lib/actions/*, supabase/migrations/001–046, inngest/, app/api/, every other W1/W2/W3/W4/W5 file, Sidebar, ReportingBanner, primitives, coverage-resources.

## Tasks

### R-T1: DB — migration 047 + seed
- **Owner:** builder-db
- **Input:** Contract above
- **Output:** `supabase/migrations/047_user_roles.sql`
- **Deps:** none
- **Instructions:** Confirm no existing `user_roles` table before writing (grep migrations 001–046). Seed MUST be idempotent (ON CONFLICT DO NOTHING) so re-running the migration is safe. Both tables enable RLS.

### R-T2: Backend — roles helper + team actions
- **Owner:** builder-api
- **Input:** Migration 047 shipped
- **Output:** `lib/auth/roles.ts` + `lib/actions/team.ts`
- **Deps:** R-T1
- **Instructions:** `getUserRole` uses `createClient()` (RLS-gated — caller only sees their own rows). Team writes use `createAdminClient()` since tokens table is deny-all. Invite flow: generate 32-byte base64url token, send Supabase Auth `inviteUserByEmail` with `redirectTo: '${NEXT_PUBLIC_SITE_URL}/team/invite/<token>'`, store token row. `acceptTeamInvite` validates token not-expired + not-used, gets current session user, upserts user_roles row with activated_at=now(), marks token used.

### R-T3: Frontend — Team surface + invite + wiring
- **Owner:** builder-ui
- **Deps:** R-T2
- **Output:** 4 files listed above + `components/v2/team/` subtree (TeamTable, InviteMemberModal, RoleBadge)
- **Instructions:** Port Remix phase5.jsx:164 TeamPermissionsSurface. PriorityPill tones: owner=enforcement, compliance_manager=sand, field_lead=steel, auditor=steel. Pending invites shown separately with "Resend" + "Revoke" buttons (Revoke just calls a delete on the token row). Layout wiring is a 1-line change (`userRole` source). ViewToggle prop addition is additive — default behavior unchanged.

### R-T4: Validate
- **Owner:** validator
- **Deps:** R-T3
- **Instructions:** tsc, lint, build. Migration 047 applies cleanly (dry-run). Seed inserts 1 `user_roles` row per existing `clients` row. RLS smoke: as authenticated user, SELECT from user_roles returns only own rows.

### R-T5: Fix (contingent)
- **Owner:** fixer
- **Deps:** R-T4 (on failure)

### R-T6: Audit
- **Owner:** auditor
- **Deps:** R-T4 (+R-T5)
- **Instructions:** Static: Team surface no longer UnderConstruction; `getUserRole` wired into layout; ViewToggle accepts `allowManagerView`; no existing `client_id = auth.uid()` RLS was modified; Wave 1-5 files untouched; 4 tables exist (user_roles, team_invite_tokens, plus existing acknowledgment_requests/acknowledgments/acknowledgment_tokens).

## Execution Order
```
R-T1 (DB: migration 047)
  │
  ▼
R-T2 (Backend: roles + team actions)
  │
  ▼
R-T3 (Frontend: surface + invite + wiring)
  │
  ▼
R-T4 (Validate)
  │
  ├─▶ R-T5 (Fix, contingent)
  ▼
R-T6 (Audit)
```

## Validation Criteria
- [ ] Migration 047 applies cleanly + seeds owner rows for all existing clients
- [ ] RLS on user_roles blocks cross-client reads
- [ ] `getUserRole()` returns 'owner' for existing single-user clients (no behavior regression)
- [ ] Team surface renders teammates + pending invites
- [ ] Invite flow produces a working token URL
- [ ] DashboardSurface ViewToggle flips normally when user is owner/compliance_manager
- [ ] pnpm tsc, lint, build all pass
- [ ] Wave 1–5 files untouched

## Out of scope (future RBAC follow-ups)
- Rewriting existing RLS policies to use user_roles joins (currently relies on client_id = auth.uid())
- Role-scoped writes across every lib/actions/* file (currently only team.ts has requireRole — others default to owner behavior via the existing RLS)
- Per-surface role content (e.g. field_lead sees different incidents view)
- MFA / SSO — those are Settings surface features
- User deactivation cascading (today: soft-set deactivated_at; hard-cascade later)

## Handoff
Ready for: `/build "specs/protekon-rbac-migration-plan.md"`
