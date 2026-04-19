-- ============================================================
-- Migration 047: User Roles (RBAC Wave, T1)
-- Tables: user_roles, team_invite_tokens
-- Minimum-viable multi-user RBAC.
-- Owners preserve existing single-user-per-client semantics (user_id = client_id).
-- The owner-check uses the user_roles table itself — NOT client_id = auth.uid().
-- ============================================================

-- user_roles: maps auth users to clients with a role + activation lifecycle
create table if not exists user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  role text not null check (role in ('owner','compliance_manager','field_lead','auditor')),
  invited_at timestamptz not null default now(),
  invited_by uuid references auth.users(id),
  activated_at timestamptz,
  deactivated_at timestamptz,
  unique (user_id, client_id)
);

-- Partial index: fast lookups for currently-active memberships
create index if not exists user_roles_user_idx
  on user_roles (user_id)
  where activated_at is not null and deactivated_at is null;

create index if not exists user_roles_client_idx
  on user_roles (client_id);

-- Seed: every existing client becomes the owner of its own workspace.
-- Preserves single-user-per-client semantics (user_id = clients.id = auth.uid()).
-- ON CONFLICT DO NOTHING makes this migration safely re-runnable.
insert into user_roles (user_id, client_id, role, activated_at)
select id, id, 'owner', now() from clients
on conflict (user_id, client_id) do nothing;

-- ============================================================
-- team_invite_tokens: single-use signed-URL tokens for team invites.
-- Service-role-only: the /api/team/invite + /api/team/accept endpoints use
-- createAdminClient to read/write this table. No authenticated user should
-- ever see or query it directly.
-- ============================================================
create table if not exists team_invite_tokens (
  token text primary key,                     -- 32-byte URL-safe random; server-generated
  client_id uuid not null references clients(id) on delete cascade,
  email text not null,
  role text not null check (role in ('owner','compliance_manager','field_lead','auditor')),
  invited_by uuid not null references auth.users(id),
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists team_invite_tokens_client_idx
  on team_invite_tokens (client_id);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table user_roles         enable row level security;
alter table team_invite_tokens enable row level security;

-- user_roles SELECT: users see all role rows for clients they're activated in.
-- The inner subquery re-queries user_roles; Postgres handles the self-reference
-- by not re-applying RLS to the inner SELECT when it originates from a policy
-- USING clause on the same table. If recursion is triggered on this platform,
-- swap to a SECURITY DEFINER helper (see notes in spec).
create policy "user_roles_select" on user_roles
  for select to authenticated
  using (
    client_id in (
      select ur.client_id from user_roles ur
      where ur.user_id = auth.uid()
        and ur.activated_at is not null
        and ur.deactivated_at is null
    )
  );

-- user_roles INSERT/UPDATE/DELETE: owner-only per client.
-- Owner status is checked via the user_roles table itself — no client_id = auth.uid() shortcut.
create policy "user_roles_owner_write" on user_roles
  for all to authenticated
  using (
    exists (
      select 1 from user_roles ur
      where ur.user_id = auth.uid()
        and ur.client_id = user_roles.client_id
        and ur.role = 'owner'
        and ur.activated_at is not null
        and ur.deactivated_at is null
    )
  )
  with check (
    exists (
      select 1 from user_roles ur
      where ur.user_id = auth.uid()
        and ur.client_id = user_roles.client_id
        and ur.role = 'owner'
        and ur.activated_at is not null
        and ur.deactivated_at is null
    )
  );

-- team_invite_tokens: deny all authenticated access.
-- Service-role endpoints bypass RLS and are the only writers/readers.
create policy "tokens_deny_all" on team_invite_tokens
  for all to authenticated
  using (false)
  with check (false);
