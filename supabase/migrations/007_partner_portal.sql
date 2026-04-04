-- ============================================================
-- Migration 007: Partner Portal
-- Tables: contact_submissions, partner_profiles,
--         partner_clients, partner_assessments
-- Alter:  compliance_score_leads (add prospect_id)
-- ============================================================


-- ------------------------------------------------------------
-- contact_submissions
-- Captures /contact form submissions from public visitors
-- ------------------------------------------------------------

create table if not exists contact_submissions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  company     text,
  phone       text,
  subject     text not null,
  message     text not null,
  created_at  timestamptz not null default now()
);

alter table contact_submissions enable row level security;

-- service_role: full access (read, update, CRM integration)
create policy "contact_submissions_service_all" on contact_submissions
  for all using (auth.role() = 'service_role');

-- anon: insert only (public /contact form)
create policy "contact_submissions_anon_insert" on contact_submissions
  for insert to anon with check (true);


-- ------------------------------------------------------------
-- partner_profiles
-- Approved partner accounts linked to an auth user
-- ------------------------------------------------------------

create table if not exists partner_profiles (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null unique references auth.users (id) on delete cascade,
  company_name  text not null,
  contact_name  text not null,
  email         text not null,
  phone         text,
  tier          text not null default 'free'
                check (tier in ('free', 'essentials', 'professional', 'enterprise')),
  branding      jsonb not null default '{}',
  status        text not null default 'pending'
                check (status in ('pending', 'approved', 'suspended')),
  created_at    timestamptz not null default now()
);

alter table partner_profiles enable row level security;

-- service_role: full access (admin approval, status changes)
create policy "partner_profiles_service_all" on partner_profiles
  for all using (auth.role() = 'service_role');

-- authenticated: select own row only
create policy "partner_profiles_select_own" on partner_profiles
  for select to authenticated using (user_id = auth.uid());

-- authenticated: update own row only
create policy "partner_profiles_update_own" on partner_profiles
  for update to authenticated using (user_id = auth.uid());

-- Indexes
create index idx_partner_profiles_user_id on partner_profiles (user_id);


-- ------------------------------------------------------------
-- partner_clients
-- Join table linking partners to the clients they referred
-- ------------------------------------------------------------

create table if not exists partner_clients (
  id               uuid primary key default gen_random_uuid(),
  partner_id       uuid not null references partner_profiles (id) on delete cascade,
  client_id        uuid not null references clients (id) on delete cascade,
  monthly_revenue  numeric(10,2) not null default 0,
  status           text not null default 'active'
                   check (status in ('active', 'suspended', 'churned')),
  created_at       timestamptz not null default now(),
  unique (partner_id, client_id)
);

alter table partner_clients enable row level security;

-- service_role: full access
create policy "partner_clients_service_all" on partner_clients
  for all using (auth.role() = 'service_role');

-- authenticated partners: select rows where their profile owns the record
create policy "partner_clients_select_own" on partner_clients
  for select to authenticated using (
    partner_id in (
      select id from partner_profiles where user_id = auth.uid()
    )
  );

-- Indexes
create index idx_partner_clients_partner_id on partner_clients (partner_id);
create index idx_partner_clients_client_id  on partner_clients (client_id);


-- ------------------------------------------------------------
-- partner_assessments
-- Compliance assessments sent by partners to prospects
-- ------------------------------------------------------------

create table if not exists partner_assessments (
  id               uuid primary key default gen_random_uuid(),
  partner_id       uuid not null references partner_profiles (id) on delete cascade,
  prospect_name    text not null,
  prospect_email   text not null,
  score            integer,
  score_tier       text,
  gaps             text[],
  fine_low         numeric(12,2),
  fine_high        numeric(12,2),
  status           text not null default 'pending'
                   check (status in ('pending', 'sent', 'completed', 'converted')),
  sent_at          timestamptz,
  completed_at     timestamptz,
  created_at       timestamptz not null default now()
);

alter table partner_assessments enable row level security;

-- service_role: full access
create policy "partner_assessments_service_all" on partner_assessments
  for all using (auth.role() = 'service_role');

-- authenticated partners: select/insert/update own assessments
create policy "partner_assessments_select_own" on partner_assessments
  for select to authenticated using (
    partner_id in (
      select id from partner_profiles where user_id = auth.uid()
    )
  );

create policy "partner_assessments_insert_own" on partner_assessments
  for insert to authenticated with check (
    partner_id in (
      select id from partner_profiles where user_id = auth.uid()
    )
  );

create policy "partner_assessments_update_own" on partner_assessments
  for update to authenticated using (
    partner_id in (
      select id from partner_profiles where user_id = auth.uid()
    )
  );

-- Indexes
create index idx_partner_assessments_partner_id on partner_assessments (partner_id);
create index idx_partner_assessments_status     on partner_assessments (status);


-- ------------------------------------------------------------
-- compliance_score_leads: add prospect_id
-- Persists the ?pid= parameter captured on /score
-- ------------------------------------------------------------

alter table compliance_score_leads
  add column if not exists prospect_id text;

-- Index for partner prospect lookup
create index idx_score_leads_prospect_id on compliance_score_leads (prospect_id);
