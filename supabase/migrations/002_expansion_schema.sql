-- ============================================================
-- Migration 002: Expansion Schema
-- Tables: intake_submissions, sample_report_leads, scheduled_deliveries,
--         regulatory_updates, construction_subs, property_portfolio,
--         municipal_ordinances, audit_log, baa_agreements, phi_assets,
--         poster_compliance
-- ============================================================

-- intake_submissions: raw intake form data (service-role only)
create table if not exists intake_submissions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  business_name text not null,
  vertical text not null,
  answers jsonb default '{}',
  compliance_score int,
  risk_level text,
  status text default 'pending',
  created_at timestamptz default now()
);

alter table intake_submissions enable row level security;

-- sample_report_leads: /samples page email gate (service-role only)
create table if not exists sample_report_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  company_name text,
  vertical text,
  downloaded_at timestamptz default now()
);

alter table sample_report_leads enable row level security;

-- scheduled_deliveries: recurring report delivery pipeline
create table if not exists scheduled_deliveries (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  delivery_type text not null,
  frequency text default 'monthly',
  next_delivery_date date not null,
  last_delivered_at timestamptz,
  status text default 'scheduled',
  created_at timestamptz default now()
);

alter table scheduled_deliveries enable row level security;

create policy "scheduled_deliveries_select_own" on scheduled_deliveries
  for select using (client_id = auth.uid());

-- regulatory_updates: monitored regulatory changes (public read)
create table if not exists regulatory_updates (
  id uuid primary key default gen_random_uuid(),
  jurisdiction text not null,
  category text not null,
  title text not null,
  summary text,
  effective_date date,
  source_url text,
  severity text default 'info',
  created_at timestamptz default now()
);

alter table regulatory_updates enable row level security;

create policy "regulatory_updates_public_read" on regulatory_updates
  for select using (true);

-- construction_subs: subcontractor roster (Construction vertical)
create table if not exists construction_subs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  company_name text not null,
  license_number text,
  license_status text default 'unknown',
  license_expiry date,
  insurance_status text default 'unknown',
  insurance_expiry date,
  verified_at timestamptz,
  created_at timestamptz default now()
);

alter table construction_subs enable row level security;

create policy "construction_subs_select_own" on construction_subs
  for select using (client_id = auth.uid());

-- property_portfolio: properties (Property Management vertical)
create table if not exists property_portfolio (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  property_name text not null,
  address text not null,
  city text not null,
  state text not null,
  units int default 1,
  property_type text default 'residential',
  compliance_status text default 'unknown',
  created_at timestamptz default now()
);

alter table property_portfolio enable row level security;

create policy "property_portfolio_select_own" on property_portfolio
  for select using (client_id = auth.uid());

-- municipal_ordinances: scraped city council ordinances (public read)
create table if not exists municipal_ordinances (
  id uuid primary key default gen_random_uuid(),
  jurisdiction text not null,
  title text not null,
  summary text,
  ordinance_number text,
  effective_date date,
  category text,
  source_url text,
  created_at timestamptz default now()
);

alter table municipal_ordinances enable row level security;

create policy "municipal_ordinances_public_read" on municipal_ordinances
  for select using (true);

-- audit_log: append-only compliance/security audit trail
create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  event_type text not null,
  description text not null,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

alter table audit_log enable row level security;

create policy "audit_log_select_own" on audit_log
  for select using (client_id = auth.uid());

create policy "audit_log_insert_own" on audit_log
  for insert with check (client_id = auth.uid());

-- baa_agreements: Business Associate Agreements (HIPAA tracking)
create table if not exists baa_agreements (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  vendor_name text not null,
  service_type text not null,
  phi_types text[] default '{}',
  baa_status text default 'missing',
  signed_date date,
  expiration_date date,
  document_url text,
  created_at timestamptz default now()
);

alter table baa_agreements enable row level security;

create policy "baa_agreements_select_own" on baa_agreements
  for select using (client_id = auth.uid());

create policy "baa_agreements_insert_own" on baa_agreements
  for insert with check (client_id = auth.uid());

-- phi_assets: PHI system inventory (HIPAA portal)
create table if not exists phi_assets (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  system_name text not null,
  system_type text not null,
  access_description text,
  phi_content_types text[] default '{}',
  encrypted_at_rest boolean default false,
  encrypted_in_transit boolean default false,
  risk_level text default 'medium',
  last_assessed_at timestamptz,
  created_at timestamptz default now()
);

alter table phi_assets enable row level security;

create policy "phi_assets_select_own" on phi_assets
  for select using (client_id = auth.uid());

create policy "phi_assets_insert_own" on phi_assets
  for insert with check (client_id = auth.uid());

-- poster_compliance: labor law poster compliance by location
create table if not exists poster_compliance (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  location_name text not null,
  poster_type text not null,
  jurisdiction text not null,
  status text default 'unknown',
  last_verified_at timestamptz,
  next_update_due date,
  created_at timestamptz default now()
);

alter table poster_compliance enable row level security;

create policy "poster_compliance_select_own" on poster_compliance
  for select using (client_id = auth.uid());
