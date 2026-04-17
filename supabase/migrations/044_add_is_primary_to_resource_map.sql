BEGIN;

ALTER TABLE public.resource_type_vertical_map
  ADD COLUMN is_primary boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.resource_type_vertical_map.is_primary IS
  'When true, this resource type is pinned in the Coverage sidebar for this vertical. False = accessible only via the "All coverage" expander on the overview page.';

-- Backfill is_primary from taxonomy matrix (docs/RESOURCE-TAXONOMY.md).
-- Every vertical: team + credentials always primary.
UPDATE public.resource_type_vertical_map SET is_primary = true
WHERE (vertical_slug, resource_type) IN (
  ('agriculture','team'),('agriculture','credentials'),('agriculture','sites'),('agriculture','assets'),('agriculture','materials'),
  ('arts_entertainment','team'),('arts_entertainment','credentials'),('arts_entertainment','sites'),('arts_entertainment','permits'),
  ('automotive','team'),('automotive','credentials'),('automotive','sites'),('automotive','assets'),('automotive','inspections'),('automotive','materials'),
  ('building_services','team'),('building_services','credentials'),('building_services','sites'),('building_services','third_parties'),
  ('business_support','team'),('business_support','credentials'),
  ('construction','team'),('construction','credentials'),('construction','sites'),('construction','assets'),('construction','third_parties'),('construction','inspections'),('construction','permits'),('construction','findings'),
  ('education','team'),('education','credentials'),('education','sites'),
  ('equipment_repair','team'),('equipment_repair','credentials'),('equipment_repair','sites'),('equipment_repair','assets'),('equipment_repair','materials'),
  ('facilities_mgmt','team'),('facilities_mgmt','credentials'),('facilities_mgmt','sites'),('facilities_mgmt','assets'),('facilities_mgmt','third_parties'),('facilities_mgmt','inspections'),
  ('healthcare','team'),('healthcare','credentials'),('healthcare','sites'),('healthcare','assets'),('healthcare','third_parties'),('healthcare','inspections'),('healthcare','materials'),('healthcare','permits'),('healthcare','findings'),
  ('hospitality','team'),('hospitality','credentials'),('hospitality','sites'),('hospitality','assets'),('hospitality','inspections'),('hospitality','materials'),('hospitality','permits'),
  ('information','team'),('information','credentials'),('information','sites'),('information','third_parties'),
  ('laundry','team'),('laundry','credentials'),('laundry','sites'),('laundry','materials'),
  ('manufacturing','team'),('manufacturing','credentials'),('manufacturing','sites'),('manufacturing','assets'),('manufacturing','inspections'),('manufacturing','materials'),('manufacturing','permits'),('manufacturing','findings'),
  ('mining','team'),('mining','credentials'),('mining','sites'),('mining','assets'),('mining','inspections'),('mining','materials'),('mining','permits'),('mining','findings'),
  ('personal_services','team'),('personal_services','credentials'),('personal_services','sites'),
  ('professional_services','team'),('professional_services','credentials'),('professional_services','third_parties'),
  ('public_admin','team'),('public_admin','credentials'),
  ('real_estate','team'),('real_estate','credentials'),('real_estate','sites'),('real_estate','third_parties'),('real_estate','permits'),
  ('retail','team'),('retail','credentials'),('retail','sites'),('retail','inspections'),('retail','permits'),
  ('security','team'),('security','credentials'),('security','sites'),('security','assets'),('security','permits'),
  ('staffing','team'),('staffing','credentials'),('staffing','third_parties'),
  ('transportation','team'),('transportation','credentials'),('transportation','sites'),('transportation','assets'),('transportation','inspections'),('transportation','permits'),('transportation','findings'),
  ('utilities','team'),('utilities','credentials'),('utilities','sites'),('utilities','assets'),('utilities','inspections'),('utilities','materials'),('utilities','permits'),('utilities','findings'),
  ('warehouse','team'),('warehouse','credentials'),('warehouse','sites'),('warehouse','assets'),('warehouse','materials'),
  ('waste_environmental','team'),('waste_environmental','credentials'),('waste_environmental','sites'),('waste_environmental','assets'),('waste_environmental','inspections'),('waste_environmental','materials'),('waste_environmental','permits'),('waste_environmental','findings'),
  ('wholesale','team'),('wholesale','credentials'),('wholesale','sites'),('wholesale','assets'),('wholesale','third_parties'),('wholesale','materials')
);

-- Backfill label_override / singular_override from the vocabulary map.
-- COALESCE preserves any values already seeded by prior work.
UPDATE public.resource_type_vertical_map SET
  label_override = COALESCE(label_override, v.label),
  singular_override = COALESCE(singular_override, v.singular)
FROM (VALUES
  ('construction','sites','Job sites','Job site'),
  ('construction','team','Crews','Crew member'),
  ('construction','permits','Permits','Permit'),
  ('agriculture','sites','Fields','Field'),
  ('agriculture','team','Crews','Crew member'),
  ('agriculture','inspections','Field inspections','Field inspection'),
  ('healthcare','sites','Practices','Practice'),
  ('healthcare','team','Staff','Staff member'),
  ('transportation','team','Drivers','Driver'),
  ('transportation','assets','Fleet','Vehicle'),
  ('transportation','inspections','DOT inspections','DOT inspection'),
  ('manufacturing','assets','Equipment','Machine'),
  ('manufacturing','materials','Hazardous materials','Material'),
  ('warehouse','team','Forklift operators','Operator'),
  ('warehouse','assets','Forklifts','Forklift'),
  ('hospitality','sites','Properties','Property'),
  ('hospitality','team','Staff','Staff member'),
  ('hospitality','inspections','Health inspections','Health inspection'),
  ('retail','sites','Stores','Store'),
  ('real_estate','sites','Properties','Property'),
  ('real_estate','third_parties','Tenants/vendors','Counterparty'),
  ('utilities','assets','Field equipment','Asset'),
  ('utilities','inspections','Field inspections','Field inspection'),
  ('automotive','sites','Shops','Shop'),
  ('automotive','assets','Shop equipment','Machine'),
  ('waste_environmental','materials','Regulated waste','Waste stream'),
  ('mining','sites','Operations','Operation'),
  ('mining','assets','Heavy equipment','Machine'),
  ('staffing','team','Placed workers','Worker'),
  ('staffing','third_parties','Client worksites','Worksite')
) AS v(vertical_slug, resource_type, label, singular)
WHERE resource_type_vertical_map.vertical_slug = v.vertical_slug
  AND resource_type_vertical_map.resource_type = v.resource_type;

COMMIT;
