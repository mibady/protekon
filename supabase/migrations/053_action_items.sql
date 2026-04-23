-- action_items: tracked follow-up tasks scoped to a client
-- Source: meticulous walkthrough scenario #3 (property review request)

create table if not exists public.action_items (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  action_type text not null check (action_type in (
    'property_review','doc_review','incident_followup','training_signoff','vendor_risk','general'
  )),
  title text not null,
  description text,
  assignee_user_id uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  status text not null default 'open' check (status in ('open','in_progress','completed','cancelled')),
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_action_items_client on public.action_items(client_id);
create index if not exists idx_action_items_assignee on public.action_items(assignee_user_id);
create index if not exists idx_action_items_status on public.action_items(status);

alter table public.action_items enable row level security;

create policy "action_items_select_own" on public.action_items
  for select to authenticated using (
    client_id = auth.uid()
    or client_id in (select client_id from public.user_roles where user_id = auth.uid())
  );

create policy "action_items_insert_own" on public.action_items
  for insert to authenticated with check (
    client_id = auth.uid()
    or client_id in (select client_id from public.user_roles where user_id = auth.uid())
  );

create policy "action_items_update_own" on public.action_items
  for update to authenticated using (
    client_id = auth.uid()
    or client_id in (select client_id from public.user_roles where user_id = auth.uid())
  );

create or replace function public.set_action_items_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_action_items_updated_at on public.action_items;
create trigger trg_action_items_updated_at
  before update on public.action_items
  for each row
  execute function public.set_action_items_updated_at();
