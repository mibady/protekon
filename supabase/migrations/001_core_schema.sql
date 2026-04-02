-- ============================================================
-- Migration 001: Core Schema
-- Tables: clients, incidents, documents, audits, training_records
-- ============================================================

-- clients: business profiles (id = auth.uid())
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  business_name text not null,
  phone text,
  vertical text not null,
  plan text default 'core',
  compliance_score int default 0,
  risk_level text default 'high',
  status text default 'active',
  stripe_customer_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table clients enable row level security;

create policy "clients_select_own" on clients
  for select using (auth.uid() = id);

create policy "clients_update_own" on clients
  for update using (auth.uid() = id);

create policy "clients_insert_own" on clients
  for insert with check (auth.uid() = id);

-- incidents: PII-stripped incident logs (SB 553 compliant)
create table if not exists incidents (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  incident_id text unique not null,
  description text not null,
  location text,
  incident_date date,
  severity text not null,
  follow_up_id text,
  created_at timestamptz default now()
);

alter table incidents enable row level security;

create policy "incidents_select_own" on incidents
  for select using (client_id = auth.uid());

create policy "incidents_insert_own" on incidents
  for insert with check (client_id = auth.uid());

-- documents: generated compliance documents
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  document_id text unique not null,
  type text not null,
  filename text not null,
  storage_url text,
  pages int,
  created_at timestamptz default now()
);

alter table documents enable row level security;

create policy "documents_select_own" on documents
  for select using (client_id = auth.uid());

-- audits: monthly compliance audit results
create table if not exists audits (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  audit_id text unique not null,
  month text not null,
  score int not null,
  status text not null,
  checks jsonb,
  created_at timestamptz default now()
);

alter table audits enable row level security;

create policy "audits_select_own" on audits
  for select using (client_id = auth.uid());

-- training_records: employee training tracking
create table if not exists training_records (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  employee_name text not null,
  training_type text not null,
  due_date date not null,
  completed_at timestamptz,
  status text default 'pending',
  created_at timestamptz default now()
);

alter table training_records enable row level security;

create policy "training_select_own" on training_records
  for select using (client_id = auth.uid());

create policy "training_insert_own" on training_records
  for insert with check (client_id = auth.uid());
