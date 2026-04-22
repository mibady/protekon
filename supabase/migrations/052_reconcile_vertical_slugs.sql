-- ============================================================
-- Migration 052: Reconcile verticals.slug with TS VerticalSlug
-- Aligns 3 drifted prod slugs to the canonical code union in
-- lib/onboarding/verticals/types.ts. Prod has 6 tables referencing
-- verticals.slug via FK; none of them CASCADE on UPDATE, so we
-- insert new canonical rows, repoint every dependent, then delete
-- the drifted rows. warehouse is deactivated (not deleted) because
-- it still has 3 industry_enforcement_stats rows with no TS target.
-- ============================================================

begin;

-- 1. Clone drifted rows with canonical slugs.
-- ON CONFLICT DO NOTHING keeps this idempotent on re-run.
insert into public.verticals (
    slug, display_name, tier, naics_prefixes, status,
    national_violations, national_penalties_usd, national_employers, ca_employers,
    enforcement_stories, hazcat_count, top_hazcats, serious_pct,
    primary_regulations, requires_vertical_table, vertical_table_name,
    description, compliance_stack, created_at, updated_at
  )
select
    'auto-services', display_name, tier, naics_prefixes, 'active',
    national_violations, national_penalties_usd, national_employers, ca_employers,
    enforcement_stories, hazcat_count, top_hazcats, serious_pct,
    primary_regulations, requires_vertical_table, vertical_table_name,
    description, compliance_stack, now(), now()
  from public.verticals
  where slug = 'automotive'
on conflict (slug) do nothing;

insert into public.verticals (
    slug, display_name, tier, naics_prefixes, status,
    national_violations, national_penalties_usd, national_employers, ca_employers,
    enforcement_stories, hazcat_count, top_hazcats, serious_pct,
    primary_regulations, requires_vertical_table, vertical_table_name,
    description, compliance_stack, created_at, updated_at
  )
select
    'real-estate', display_name, tier, naics_prefixes, 'active',
    national_violations, national_penalties_usd, national_employers, ca_employers,
    enforcement_stories, hazcat_count, top_hazcats, serious_pct,
    primary_regulations, requires_vertical_table, vertical_table_name,
    description, compliance_stack, now(), now()
  from public.verticals
  where slug = 'real_estate'
on conflict (slug) do nothing;

-- 2. Repoint every table that references the drifted slugs.
-- clients.vertical has no FK in prod, but we still update it so the
-- wizard's getConfig(slug) returns the right config.
update public.clients                       set vertical      = 'auto-services' where vertical      = 'automotive';
update public.clients                       set vertical      = 'real-estate'   where vertical      = 'real_estate';
update public.compliance_calendar           set vertical_slug = 'auto-services' where vertical_slug = 'automotive';
update public.compliance_calendar           set vertical_slug = 'real-estate'   where vertical_slug = 'real_estate';
update public.enforcement_alerts            set vertical_slug = 'auto-services' where vertical_slug = 'automotive';
update public.enforcement_alerts            set vertical_slug = 'real-estate'   where vertical_slug = 'real_estate';
update public.industry_enforcement_stats    set vertical_slug = 'auto-services' where vertical_slug = 'automotive';
update public.industry_enforcement_stats    set vertical_slug = 'real-estate'   where vertical_slug = 'real_estate';
update public.nearby_enforcement_actions    set vertical_slug = 'auto-services' where vertical_slug = 'automotive';
update public.nearby_enforcement_actions    set vertical_slug = 'real-estate'   where vertical_slug = 'real_estate';
update public.resource_type_vertical_map    set vertical_slug = 'auto-services' where vertical_slug = 'automotive';
update public.resource_type_vertical_map    set vertical_slug = 'real-estate'   where vertical_slug = 'real_estate';

-- 3. Remove the drifted rows now that no dependents remain.
delete from public.verticals where slug = 'automotive';
delete from public.verticals where slug = 'real_estate';

-- 4. Retire 'warehouse': 3 industry_enforcement_stats rows still reference it,
-- so we deactivate rather than delete to preserve FK integrity.
update public.verticals
  set status = 'inactive'
  where slug = 'warehouse';

-- 5. Fail-closed verification: no client should hold a slug outside the TS union.
do $$
declare
  bad_count int;
  bad_slugs text;
begin
  select count(*), string_agg(distinct vertical, ',')
    into bad_count, bad_slugs
  from public.clients
  where vertical is not null
    and vertical not in (
      'construction','manufacturing','healthcare','hospitality','agriculture',
      'retail','transportation','real-estate','auto-services','wholesale',
      'utilities','education','waste_environmental','arts_entertainment',
      'public_admin','building_services','equipment_repair','facilities_mgmt',
      'information','laundry','mining','professional_services','staffing',
      'business_support','personal_services','security'
    );
  if bad_count > 0 then
    raise exception 'reconciliation failed: % clients still have off-union slugs: %',
      bad_count, bad_slugs;
  end if;
end $$;

commit;
