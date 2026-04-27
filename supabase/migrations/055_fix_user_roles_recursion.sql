-- ============================================================
-- Migration 055: Fix recursive user_roles RLS policies
--
-- Production triggered Postgres 42P17 infinite recursion on the
-- self-referential user_roles policies from 047_user_roles.sql.
-- Route membership checks through SECURITY DEFINER helpers so the
-- lookup bypasses RLS and does not recurse.
-- ============================================================

create or replace function public.user_has_client_access(_client_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_catalog
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.client_id = _client_id
      and ur.activated_at is not null
      and ur.deactivated_at is null
  );
$$;

create or replace function public.user_is_client_owner(_client_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_catalog
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.client_id = _client_id
      and ur.role = 'owner'
      and ur.activated_at is not null
      and ur.deactivated_at is null
  );
$$;

revoke all on function public.user_has_client_access(uuid) from public;
revoke all on function public.user_is_client_owner(uuid) from public;
grant execute on function public.user_has_client_access(uuid) to authenticated;
grant execute on function public.user_is_client_owner(uuid) to authenticated;

drop policy if exists "user_roles_select" on public.user_roles;
drop policy if exists "user_roles_owner_write" on public.user_roles;
drop policy if exists "action_items_select_own" on public.action_items;
drop policy if exists "action_items_insert_own" on public.action_items;
drop policy if exists "action_items_update_own" on public.action_items;

create policy "user_roles_select" on public.user_roles
  for select to authenticated
  using (public.user_has_client_access(client_id));

create policy "user_roles_owner_write" on public.user_roles
  for all to authenticated
  using (public.user_is_client_owner(client_id))
  with check (public.user_is_client_owner(client_id));

create policy "action_items_select_own" on public.action_items
  for select to authenticated using (
    client_id = auth.uid()
    or public.user_has_client_access(client_id)
  );

create policy "action_items_insert_own" on public.action_items
  for insert to authenticated with check (
    client_id = auth.uid()
    or public.user_has_client_access(client_id)
  );

create policy "action_items_update_own" on public.action_items
  for update to authenticated using (
    client_id = auth.uid()
    or public.user_has_client_access(client_id)
  )
  with check (
    client_id = auth.uid()
    or public.user_has_client_access(client_id)
  );
