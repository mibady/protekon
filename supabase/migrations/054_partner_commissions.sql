-- partner_commissions: monthly commission records per partner
-- Source: meticulous walkthrough scenario #14 (view commission statement)

create table if not exists public.partner_commissions (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partner_profiles(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  period_start date not null,
  period_end date not null,
  amount_cents integer not null default 0 check (amount_cents >= 0),
  currency text not null default 'usd',
  status text not null default 'pending' check (status in ('pending','paid','reversed')),
  paid_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_partner_commissions_partner on public.partner_commissions(partner_id);
create index if not exists idx_partner_commissions_period on public.partner_commissions(period_start, period_end);
create index if not exists idx_partner_commissions_status on public.partner_commissions(status);

alter table public.partner_commissions enable row level security;

create policy "commissions_select_own" on public.partner_commissions
  for select to authenticated using (
    partner_id in (select id from public.partner_profiles where user_id = auth.uid())
  );
