-- ============================================================
-- Migration 006: Partner Applications
-- Table: partner_applications
-- Channel partner application funnel — captures applications
-- from /partners apply form
-- ============================================================

create table if not exists partner_applications (
  id                               uuid primary key default gen_random_uuid(),
  created_at                       timestamptz not null default now(),

  -- Contact
  name                             text not null,
  email                            text not null unique,
  phone                            text,

  -- Business
  business_name                    text not null,
  business_type                    text not null,
  website                          text,
  city                             text,
  state                            text,
  client_count                     text not null,

  -- Compliance interest
  client_industries                text[] not null default '{}',
  verticals_interested             text[] not null default '{}',
  previous_compliance_experience   text not null,

  -- Tier interest
  tier_interest                    text not null,

  -- Attribution
  referral_source                  text,
  notes                            text,
  utm_source                       text,
  utm_medium                       text,
  utm_campaign                     text,

  -- Processing
  status                           text not null default 'pending'
                                   check (status in ('pending','approved','rejected','waitlisted')),
  reviewed_at                      timestamptz,
  reviewed_by                      text,
  rejection_reason                 text,

  -- Conversion
  converted_to_partner_id          uuid,
  converted_at                     timestamptz,

  -- Margin projection
  projected_clients_year1          integer,
  projected_revenue_monthly        numeric(10,2),
  projected_margin_monthly         numeric(10,2)
);

-- RLS --------------------------------------------------------
alter table partner_applications enable row level security;

-- service_role: full access (backend API inserts, queries, updates status)
create policy "partner_apps_service_all" on partner_applications
  for all using (auth.role() = 'service_role');

-- anon: insert only (public partner application form)
create policy "partner_apps_anon_insert" on partner_applications
  for insert to anon with check (true);

-- Indexes ----------------------------------------------------
create index idx_partner_apps_email    on partner_applications (email);
create index idx_partner_apps_status   on partner_applications (status);
