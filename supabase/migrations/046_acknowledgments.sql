-- ============================================================
-- Migration 046: Acknowledgments
-- Tables: acknowledgment_requests, acknowledgments, acknowledgment_tokens
-- Policy acknowledgment campaigns + signed acks + token-gated signer flow.
-- Immutable: no UPDATE, no DELETE policies on acknowledgments (retention by absence).
-- Single-user-per-client model: client_id === auth.uid() throughout the app.
-- ============================================================

-- Campaign: a request to acknowledge a specific policy document version
create table if not exists acknowledgment_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  -- documents.id is uuid PK (see migration 001_core_schema.sql) — hard FK is safe.
  policy_document_id uuid not null references documents(id) on delete restrict,
  policy_version text not null,
  cohort_note text,                   -- free-text description of who should sign; becomes user_roles filter once RBAC ships
  due_date timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists acknowledgment_requests_client_idx
  on acknowledgment_requests (client_id, created_at desc);

-- Signed acknowledgment record (immutable)
create table if not exists acknowledgments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references acknowledgment_requests(id) on delete cascade,
  signer_name text not null,
  signer_email text,
  signed_at timestamptz not null default now(),
  signature_image_url text not null,
  signed_pdf_url text not null,
  sha256_hash text not null,
  ip inet not null,
  user_agent text not null
);

create index if not exists acknowledgments_request_idx
  on acknowledgments (request_id, signed_at desc);

-- Single-use token for public /ack/[token] signer flow
create table if not exists acknowledgment_tokens (
  token text primary key,             -- 32-byte URL-safe random; generated server-side
  request_id uuid not null references acknowledgment_requests(id) on delete cascade,
  assigned_to text,                   -- free-text name/email until RBAC ships
  expires_at timestamptz not null,
  used_at timestamptz
);

-- Partial index for fast lookup of unused tokens in the public signer flow
create index if not exists acknowledgment_tokens_request_idx
  on acknowledgment_tokens (request_id)
  where used_at is null;

-- ============================================================
-- Row Level Security
-- ============================================================

alter table acknowledgment_requests enable row level security;
alter table acknowledgments          enable row level security;
alter table acknowledgment_tokens    enable row level security;

-- acknowledgment_requests: client owner can read + create campaigns.
-- No UPDATE / DELETE policies — campaigns are append-only at the app level.
create policy "ack_req_select_own" on acknowledgment_requests
  for select to authenticated
  using (client_id = auth.uid());

create policy "ack_req_insert_own" on acknowledgment_requests
  for insert to authenticated
  with check (client_id = auth.uid());

-- acknowledgments: SELECT allowed for client owner (via parent request).
-- NO INSERT policy here — signed rows are written by the public signer endpoint
-- using the service-role key after validating a single-use token.
-- NO UPDATE / DELETE policies — immutable signed records.
create policy "ack_select_own" on acknowledgments
  for select to authenticated
  using (
    request_id in (
      select id from acknowledgment_requests where client_id = auth.uid()
    )
  );

-- acknowledgment_tokens: deny all authenticated access.
-- The public /ack/[token] signer endpoint uses createAdminClient / service_role
-- to validate tokens; no end-user should ever see or query this table.
create policy "ack_tokens_no_public" on acknowledgment_tokens
  for all to authenticated
  using (false)
  with check (false);
