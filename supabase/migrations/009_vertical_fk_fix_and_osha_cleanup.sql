-- ============================================================
-- Migration 009: Vertical FK fix + OSHA data cleanup
--
-- 1. Re-point 6 vertical table FKs from auth.users → clients
--    (preserves cascade delete, adds referential integrity
--     through the clients table instead of bypassing it)
--
-- 2. Drop shield_osha_violations — 73k rows of market research
--    data that belongs in the scraper project (vizmtkfpxxjzlpzibate),
--    not co-located with client PII/PHI in the app DB.
-- ============================================================


-- ---- manufacturing_equipment ----
alter table manufacturing_equipment
  drop constraint if exists manufacturing_equipment_client_id_fkey;

alter table manufacturing_equipment
  add constraint manufacturing_equipment_client_id_fkey
  foreign key (client_id) references clients(id) on delete cascade;

create index if not exists idx_manufacturing_equipment_client_id
  on manufacturing_equipment (client_id);


-- ---- hospitality_inspections ----
alter table hospitality_inspections
  drop constraint if exists hospitality_inspections_client_id_fkey;

alter table hospitality_inspections
  add constraint hospitality_inspections_client_id_fkey
  foreign key (client_id) references clients(id) on delete cascade;

create index if not exists idx_hospitality_inspections_client_id
  on hospitality_inspections (client_id);


-- ---- agriculture_crews ----
alter table agriculture_crews
  drop constraint if exists agriculture_crews_client_id_fkey;

alter table agriculture_crews
  add constraint agriculture_crews_client_id_fkey
  foreign key (client_id) references clients(id) on delete cascade;

create index if not exists idx_agriculture_crews_client_id
  on agriculture_crews (client_id);


-- ---- retail_locations ----
alter table retail_locations
  drop constraint if exists retail_locations_client_id_fkey;

alter table retail_locations
  add constraint retail_locations_client_id_fkey
  foreign key (client_id) references clients(id) on delete cascade;

create index if not exists idx_retail_locations_client_id
  on retail_locations (client_id);


-- ---- wholesale_zones ----
alter table wholesale_zones
  drop constraint if exists wholesale_zones_client_id_fkey;

alter table wholesale_zones
  add constraint wholesale_zones_client_id_fkey
  foreign key (client_id) references clients(id) on delete cascade;

create index if not exists idx_wholesale_zones_client_id
  on wholesale_zones (client_id);


-- ---- transportation_fleet ----
alter table transportation_fleet
  drop constraint if exists transportation_fleet_client_id_fkey;

alter table transportation_fleet
  add constraint transportation_fleet_client_id_fkey
  foreign key (client_id) references clients(id) on delete cascade;

create index if not exists idx_transportation_fleet_client_id
  on transportation_fleet (client_id);


-- ---- Drop OSHA violations from app DB ----
-- This data is a lead-gen/market-research asset belonging to
-- cli-ai-scraper (project vizmtkfpxxjzlpzibate).
-- It should not be co-located with client compliance data.
drop table if exists shield_osha_violations;
