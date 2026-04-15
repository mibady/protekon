-- ============================================================
-- Migration 021: Verticals Reference Table
-- Canonical list of verticals. Enforces clients.vertical FK.
-- Mirrors the marketing industries list and the TS TEMPLATE_REGISTRY keys.
-- ============================================================

create table if not exists public.verticals (
  slug              text primary key,
  label             text not null,
  risk_tier         text not null check (risk_tier in ('Very High','High','Moderate','Low')),
  is_advertised     boolean not null default false,
  has_detail_page   boolean not null default false,
  alias_of          text references public.verticals(slug) on delete restrict,
  created_at        timestamptz not null default now()
);

create index if not exists idx_verticals_advertised on public.verticals (is_advertised) where is_advertised = true;
create index if not exists idx_verticals_alias_of   on public.verticals (alias_of) where alias_of is not null;

-- Seed: canonical verticals (must be inserted before aliases reference them).
insert into public.verticals (slug, label, risk_tier, is_advertised, has_detail_page) values
  ('construction',          'Construction',             'Very High', true,  true),
  ('manufacturing',          'Manufacturing',            'Very High', true,  true),
  ('healthcare',             'Healthcare',               'Very High', true,  true),
  ('hospitality',            'Hospitality',              'High',      true,  true),
  ('agriculture',            'Agriculture',              'High',      true,  true),
  ('retail',                 'Retail',                   'Moderate',  true,  true),
  ('transportation',         'Transportation',           'High',      true,  true),
  ('real-estate',            'Real Estate',              'Moderate',  true,  true),
  ('auto-services',          'Automotive Services',      'High',      true,  true),
  ('wholesale',              'Wholesale Trade',          'High',      true,  true),
  ('utilities',              'Utilities',                'High',      true,  false),
  ('education',              'Education',                'Moderate',  true,  false),
  ('waste_environmental',    'Waste & Environmental',    'Very High', true,  false),
  ('arts_entertainment',     'Arts & Entertainment',     'Moderate',  true,  false),
  ('public_admin',           'Public Administration',    'Moderate',  true,  false),
  ('building_services',      'Building Services',        'Moderate',  true,  false),
  ('equipment_repair',       'Equipment Repair',         'High',      true,  false),
  ('facilities_mgmt',        'Facilities Management',    'Moderate',  true,  false),
  ('information',            'Information & Telecom',    'Moderate',  true,  false),
  ('laundry',                'Laundry & Drycleaning',    'High',      true,  false),
  ('mining',                 'Mining',                   'Very High', true,  false),
  ('professional_services',  'Professional Services',    'Moderate',  true,  false),
  ('staffing',               'Staffing & Employment',    'High',      true,  false),
  ('business_support',       'Business Support Services','Moderate',  true,  false),
  ('personal_services',      'Personal Services',        'Moderate',  true,  false),
  ('security',               'Security Services',        'Moderate',  true,  false)
on conflict (slug) do nothing;

-- Aliases (marketing slugs that resolve to a canonical slug in the TS registry).
insert into public.verticals (slug, label, risk_tier, is_advertised, has_detail_page, alias_of) values
  ('logistics', 'Warehouse & Logistics', 'High', true, true, 'wholesale')
on conflict (slug) do nothing;

-- Backfill any existing non-canonical client verticals into the table so the
-- FK can be applied without breaking historical rows.
insert into public.verticals (slug, label, risk_tier, is_advertised)
select distinct c.vertical,
       initcap(replace(c.vertical, '_', ' ')),
       'Moderate',
       false
from clients c
left join public.verticals v on v.slug = c.vertical
where v.slug is null
on conflict (slug) do nothing;

-- FK: every client.vertical must reference a known slug.
alter table public.clients
  drop constraint if exists clients_vertical_fkey;

alter table public.clients
  add constraint clients_vertical_fkey
  foreign key (vertical) references public.verticals(slug) on update cascade;

-- RLS: reference data is world-readable; writes restricted to service role.
alter table public.verticals enable row level security;

drop policy if exists "verticals_select_public" on public.verticals;
create policy "verticals_select_public" on public.verticals
  for select using (true);

comment on table public.verticals is
  'Canonical vertical/industry reference. Mirrors marketing industries list and TS TEMPLATE_REGISTRY keys. alias_of resolves marketing slugs to registry keys.';
