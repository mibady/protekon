-- ============================================================
-- Migration 004: Vertical Tables (6 new verticals)
-- Tables: manufacturing_equipment, hospitality_inspections,
--         agriculture_crews, retail_locations,
--         wholesale_zones, transportation_fleet
-- ============================================================

-- manufacturing_equipment: Equipment & LOTO Tracker (Manufacturing vertical)
create table if not exists manufacturing_equipment (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references auth.users(id) on delete cascade,
  equipment_name text not null,
  equipment_type text not null default 'machinery',
  serial_number text,
  loto_status text not null default 'current',
  last_inspection date,
  next_inspection date,
  risk_level text not null default 'medium',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table manufacturing_equipment enable row level security;

create policy "manufacturing_equipment_select_own" on manufacturing_equipment
  for select using (client_id = auth.uid());

create policy "manufacturing_equipment_insert_own" on manufacturing_equipment
  for insert with check (client_id = auth.uid());

create policy "manufacturing_equipment_update_own" on manufacturing_equipment
  for update using (client_id = auth.uid());

create policy "manufacturing_equipment_delete_own" on manufacturing_equipment
  for delete using (client_id = auth.uid());

-- hospitality_inspections: Health Inspection Log (Hospitality vertical)
create table if not exists hospitality_inspections (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references auth.users(id) on delete cascade,
  inspection_type text not null default 'health',
  inspector text,
  inspection_date date not null,
  score numeric,
  violations integer default 0,
  findings text,
  next_inspection date,
  status text not null default 'passed',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table hospitality_inspections enable row level security;

create policy "hospitality_inspections_select_own" on hospitality_inspections
  for select using (client_id = auth.uid());

create policy "hospitality_inspections_insert_own" on hospitality_inspections
  for insert with check (client_id = auth.uid());

create policy "hospitality_inspections_update_own" on hospitality_inspections
  for update using (client_id = auth.uid());

create policy "hospitality_inspections_delete_own" on hospitality_inspections
  for delete using (client_id = auth.uid());

-- agriculture_crews: Field Crew & Heat Illness Tracker (Agriculture vertical)
create table if not exists agriculture_crews (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references auth.users(id) on delete cascade,
  crew_name text not null,
  field_location text,
  crew_size integer default 1,
  heat_plan_status text not null default 'active',
  water_station boolean default true,
  shade_available boolean default true,
  last_safety_check date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table agriculture_crews enable row level security;

create policy "agriculture_crews_select_own" on agriculture_crews
  for select using (client_id = auth.uid());

create policy "agriculture_crews_insert_own" on agriculture_crews
  for insert with check (client_id = auth.uid());

create policy "agriculture_crews_update_own" on agriculture_crews
  for update using (client_id = auth.uid());

create policy "agriculture_crews_delete_own" on agriculture_crews
  for delete using (client_id = auth.uid());

-- retail_locations: Store Location Compliance (Retail vertical)
create table if not exists retail_locations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references auth.users(id) on delete cascade,
  store_name text not null,
  address text,
  city text,
  state text default 'CA',
  location_type text not null default 'retail',
  fire_inspection_status text not null default 'current',
  ada_status text not null default 'compliant',
  compliance_score integer default 100,
  last_audit date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table retail_locations enable row level security;

create policy "retail_locations_select_own" on retail_locations
  for select using (client_id = auth.uid());

create policy "retail_locations_insert_own" on retail_locations
  for insert with check (client_id = auth.uid());

create policy "retail_locations_update_own" on retail_locations
  for update using (client_id = auth.uid());

create policy "retail_locations_delete_own" on retail_locations
  for delete using (client_id = auth.uid());

-- wholesale_zones: Warehouse Safety Zones (Wholesale vertical)
create table if not exists wholesale_zones (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references auth.users(id) on delete cascade,
  zone_name text not null,
  zone_type text not null default 'warehouse',
  forklift_certified_operators integer default 0,
  last_safety_audit date,
  hazmat_present boolean default false,
  status text not null default 'compliant',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table wholesale_zones enable row level security;

create policy "wholesale_zones_select_own" on wholesale_zones
  for select using (client_id = auth.uid());

create policy "wholesale_zones_insert_own" on wholesale_zones
  for insert with check (client_id = auth.uid());

create policy "wholesale_zones_update_own" on wholesale_zones
  for update using (client_id = auth.uid());

create policy "wholesale_zones_delete_own" on wholesale_zones
  for delete using (client_id = auth.uid());

-- transportation_fleet: Fleet & Driver Certifications (Transportation vertical)
create table if not exists transportation_fleet (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id text not null,
  vehicle_type text not null default 'truck',
  driver_name text,
  cdl_status text not null default 'active',
  cdl_expiry date,
  last_dot_inspection date,
  next_inspection date,
  status text not null default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table transportation_fleet enable row level security;

create policy "transportation_fleet_select_own" on transportation_fleet
  for select using (client_id = auth.uid());

create policy "transportation_fleet_insert_own" on transportation_fleet
  for insert with check (client_id = auth.uid());

create policy "transportation_fleet_update_own" on transportation_fleet
  for update using (client_id = auth.uid());

create policy "transportation_fleet_delete_own" on transportation_fleet
  for delete using (client_id = auth.uid());
