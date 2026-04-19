-- 048_projects.sql
-- Project roster + subcontractor assignments per project.
-- Powers app/dashboard/projects/ and feeds vendor-risk drill-downs.

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  site_id uuid REFERENCES sites(id) ON DELETE SET NULL,
  address text,
  start_date date,
  end_date date,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('planned','active','paused','completed','archived')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS projects_client_status_idx
  ON projects(client_id, status)
  WHERE status != 'archived';

CREATE INDEX IF NOT EXISTS projects_site_idx ON projects(site_id) WHERE site_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS project_subs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  sub_id uuid NOT NULL REFERENCES construction_subs(id) ON DELETE CASCADE,
  scope text,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  removed_at timestamptz,
  UNIQUE (project_id, sub_id)
);

CREATE INDEX IF NOT EXISTS project_subs_project_idx
  ON project_subs(project_id)
  WHERE removed_at IS NULL;
CREATE INDEX IF NOT EXISTS project_subs_sub_idx
  ON project_subs(sub_id)
  WHERE removed_at IS NULL;

-- RLS: client-scoped via single-user-per-client pattern (client_id = auth.uid())
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY projects_select_own ON projects
  FOR SELECT TO authenticated
  USING (client_id = auth.uid());
CREATE POLICY projects_insert_own ON projects
  FOR INSERT TO authenticated
  WITH CHECK (client_id = auth.uid());
CREATE POLICY projects_update_own ON projects
  FOR UPDATE TO authenticated
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());
CREATE POLICY projects_delete_own ON projects
  FOR DELETE TO authenticated
  USING (client_id = auth.uid());

ALTER TABLE project_subs ENABLE ROW LEVEL SECURITY;
CREATE POLICY project_subs_select_own ON project_subs
  FOR SELECT TO authenticated
  USING (project_id IN (SELECT id FROM projects WHERE client_id = auth.uid()));
CREATE POLICY project_subs_write_own ON project_subs
  FOR ALL TO authenticated
  USING (project_id IN (SELECT id FROM projects WHERE client_id = auth.uid()))
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE client_id = auth.uid()));
