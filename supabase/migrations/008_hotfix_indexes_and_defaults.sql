-- ============================================================
-- Migration 008: Hotfix — indexes, plan default, RLS cleanup
-- ============================================================

-- Fix plan default: live DB has 'starter', should be 'core'
alter table clients alter column plan set default 'core';

-- Update any existing 'starter' rows to 'core'
update clients set plan = 'core' where plan = 'starter';


-- Drop audit_log_insert_own: clients should not insert their own
-- audit log entries. Only service_role writes audit logs.
drop policy if exists "audit_log_insert_own" on audit_log;


-- Add indexes on client_id for core tables (missing from 001-004)
create index if not exists idx_incidents_client_id
  on incidents (client_id);

create index if not exists idx_documents_client_id
  on documents (client_id);

create index if not exists idx_audits_client_id
  on audits (client_id);

create index if not exists idx_training_records_client_id
  on training_records (client_id);

create index if not exists idx_scheduled_deliveries_client
  on scheduled_deliveries (client_id);

create index if not exists idx_audit_log_client_id
  on audit_log (client_id);
