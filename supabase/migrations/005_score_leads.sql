-- ============================================================
-- Migration 005: Compliance Score Leads
-- Table: compliance_score_leads
-- Public scoring funnel — captures leads from /score form
-- ============================================================

create table if not exists compliance_score_leads (
  id                   uuid primary key default gen_random_uuid(),
  created_at           timestamptz not null default now(),

  -- Contact
  email                text not null,
  name                 text not null,
  phone                text,

  -- Business context
  industry             text not null,
  employee_count       text not null,
  location_count       text not null,
  city                 text,
  state                text default 'CA',

  -- Score
  score                integer not null check (score between 0 and 6),
  has_iipp             boolean not null default false,
  iipp_site_specific   boolean not null default false,
  has_incident_log     boolean not null default false,
  training_current     boolean not null default false,
  has_industry_programs boolean not null default false,
  audit_ready          boolean not null default false,

  -- Calculated
  estimated_fine_low   numeric(10,2),
  estimated_fine_high  numeric(10,2),
  score_tier           text not null check (score_tier in ('green','yellow','red')),

  -- Attribution
  partner_ref          text,
  utm_source           text,
  utm_medium           text,
  utm_campaign         text,

  -- Score report delivery
  report_sent_at       timestamptz,
  report_pdf_path      text,

  -- Drip sequence
  drip_day3_sent_at    timestamptz,
  drip_day7_sent_at    timestamptz,
  drip_day14_sent_at   timestamptz,
  drip_day21_sent_at   timestamptz,

  -- Conversion
  converted_to_intake  boolean default false,
  converted_at         timestamptz,

  unsubscribed_at      timestamptz
);

-- RLS --------------------------------------------------------
alter table compliance_score_leads enable row level security;

-- service_role: full access (backend API inserts, queries, updates drip status)
create policy "score_leads_service_all" on compliance_score_leads
  for all using (auth.role() = 'service_role');

-- anon: insert only (public /score form submission)
create policy "score_leads_anon_insert" on compliance_score_leads
  for insert to anon with check (true);

-- Indexes ----------------------------------------------------
create index idx_score_leads_email      on compliance_score_leads (email);
create index idx_score_leads_partner    on compliance_score_leads (partner_ref);
create index idx_score_leads_tier       on compliance_score_leads (score_tier);
create index idx_score_leads_industry   on compliance_score_leads (industry);
