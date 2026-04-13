-- ============================================================
-- Migration 017: RLS policies for intake_submissions and sample_report_leads
-- Both tables use service-role for reads (admin only).
-- Public inserts allowed (unauthenticated form submissions).
-- ============================================================

-- intake_submissions: anyone can submit, only service-role reads
create policy "intake_submissions_insert_public" on intake_submissions
  for insert with check (true);

-- sample_report_leads: anyone can submit email gate, only service-role reads
create policy "sample_report_leads_insert_public" on sample_report_leads
  for insert with check (true);
