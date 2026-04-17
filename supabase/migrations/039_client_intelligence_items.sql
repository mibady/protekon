-- =============================================================================
-- NGE-481: client_intelligence_items
-- Nightly mirror of scraper-project intelligence rows (Cal/OSHA enforcement,
-- regulatory updates, anomaly events) into the app DB. Populated by
-- inngest/functions/mirror-intelligence-nightly.ts on a 24h cadence.
-- =============================================================================

create table if not exists public.client_intelligence_items (
  id                           uuid primary key default gen_random_uuid(),
  created_at                   timestamptz not null default now(),
  mirrored_at                  timestamptz not null default now(),

  headline                     text not null,
  story                        text not null,
  means_for_you                text,
  link_url                     text,
  source_url                   text not null,
  source_name                  text not null,
  severity                     text not null default 'context'
                                 check (severity in ('exposure','context','neutral')),

  vertical_tags                text[] not null default '{}',
  geo_tags                     text[] not null default '{}',
  target_client_industry_codes text[] not null default '{}',

  relevance_score              numeric(5,2) not null default 50.00,

  dismissed_by_client_ids      uuid[] not null default '{}',

  dedupe_key                   text not null,

  source_kind                  text not null
                                 check (source_kind in (
                                   'enforcement_story',
                                   'regulatory_update',
                                   'trigger_event',
                                   'keyword_ranking'
                                 )),
  source_row_id                text
);

create unique index if not exists uq_cii_dedupe_key
  on public.client_intelligence_items (dedupe_key);

create index if not exists idx_cii_vertical_created
  on public.client_intelligence_items using gin (vertical_tags);

create index if not exists idx_cii_created_desc
  on public.client_intelligence_items (created_at desc);

create index if not exists idx_cii_relevance_created
  on public.client_intelligence_items (relevance_score desc, created_at desc);

create index if not exists idx_cii_geo_tags
  on public.client_intelligence_items using gin (geo_tags);

create index if not exists idx_cii_industry_codes
  on public.client_intelligence_items using gin (target_client_industry_codes);

-- RLS: a client may read a row only if its vertical matches one of the row's
-- vertical_tags AND the client has not dismissed it.
alter table public.client_intelligence_items enable row level security;

drop policy if exists "cii_select_for_client_vertical" on public.client_intelligence_items;
create policy "cii_select_for_client_vertical"
  on public.client_intelligence_items
  for select
  using (
    exists (
      select 1
        from public.clients c
       where c.id = auth.uid()
         and c.vertical = any (client_intelligence_items.vertical_tags)
    )
    and not (auth.uid() = any (client_intelligence_items.dismissed_by_client_ids))
  );

comment on table public.client_intelligence_items is
  'Nightly mirror of scraper-project intelligence rows. Populated by inngest/functions/mirror-intelligence-nightly.ts. 24h staleness acceptable.';
