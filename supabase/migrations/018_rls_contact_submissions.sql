-- ============================================================
-- Migration 018: RLS policy for contact_submissions
-- Public inserts allowed (unauthenticated contact form).
-- Reads restricted to service-role (admin only).
-- ============================================================

CREATE POLICY "contact_submissions_insert_public" ON contact_submissions
  FOR INSERT WITH CHECK (true);
