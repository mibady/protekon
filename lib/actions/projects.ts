"use server"

import { createClient } from "@/lib/supabase/server"
import { requireRole } from "@/lib/auth/roles"

export type Project = {
  id: string
  client_id: string
  name: string
  site_id: string | null
  address: string | null
  start_date: string | null
  end_date: string | null
  status: 'planned' | 'active' | 'paused' | 'completed' | 'archived'
  notes: string | null
  created_at: string
}

export type ProjectSub = {
  id: string
  project_id: string
  sub_id: string
  scope: string | null
  assigned_at: string
  removed_at: string | null
  // Joined fields for convenience
  sub_company_name?: string
  sub_license_number?: string
}

export type ProjectDetail = Project & {
  subs: ProjectSub[]
}

export type ActionResult = { success?: boolean; error?: string; id?: string }

/** List projects for the current client, active + paused first, archived last. */
export async function listProjects(): Promise<Project[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("client_id", user.id)
    .order("status", { ascending: true })
    .order("start_date", { ascending: false, nullsFirst: false })
  return (data ?? []) as Project[]
}

/** Project detail with assigned subs. */
export async function getProjectDetail(id: string): Promise<ProjectDetail | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("client_id", user.id)
    .maybeSingle()
  if (!project) return null
  const { data: subs } = await supabase
    .from("project_subs")
    .select("id, project_id, sub_id, scope, assigned_at, removed_at, construction_subs!inner(company_name, license_number)")
    .eq("project_id", id)
    .is("removed_at", null)
  const subsList: ProjectSub[] = (subs ?? []).map((r: any) => ({
    id: r.id,
    project_id: r.project_id,
    sub_id: r.sub_id,
    scope: r.scope,
    assigned_at: r.assigned_at,
    removed_at: r.removed_at,
    sub_company_name: r.construction_subs?.company_name,
    sub_license_number: r.construction_subs?.license_number,
  }))
  return { ...project, subs: subsList } as ProjectDetail
}

/** Create a new project. */
export async function createProject(formData: FormData): Promise<ActionResult> {
  let resolved
  try {
    resolved = await requireRole(['owner', 'compliance_manager'])
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Forbidden.' }
  }
  const name = (formData.get("name") as string | null)?.trim()
  if (!name) return { error: "Project name is required." }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("projects")
    .insert({
      client_id: resolved.clientId,
      name,
      site_id: (formData.get("site_id") as string) || null,
      address: (formData.get("address") as string) || null,
      start_date: (formData.get("start_date") as string) || null,
      end_date: (formData.get("end_date") as string) || null,
      status: (formData.get("status") as string) || 'active',
      notes: (formData.get("notes") as string) || null,
    })
    .select("id")
    .single()
  if (error || !data) return { error: error?.message ?? "Could not create project." }
  return { success: true, id: data.id }
}

/** Update a project. */
export async function updateProject(id: string, formData: FormData): Promise<ActionResult> {
  try {
    await requireRole(['owner', 'compliance_manager'])
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Forbidden.' }
  }
  const supabase = await createClient()
  const payload: Record<string, unknown> = {}
  for (const k of ["name", "site_id", "address", "start_date", "end_date", "status", "notes"] as const) {
    const v = formData.get(k)
    if (v !== null) payload[k] = (v as string) || null
  }
  const { error } = await supabase.from("projects").update(payload).eq("id", id)
  if (error) return { error: error.message }
  return { success: true }
}

/** Soft-archive (sets status='archived'). */
export async function archiveProject(id: string): Promise<ActionResult> {
  try {
    await requireRole(['owner', 'compliance_manager'])
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Forbidden.' }
  }
  const supabase = await createClient()
  const { error } = await supabase.from("projects").update({ status: 'archived' }).eq("id", id)
  if (error) return { error: error.message }
  return { success: true }
}

/** Assign a sub to a project. */
export async function assignSubToProject(
  projectId: string,
  subId: string,
  scope?: string
): Promise<ActionResult> {
  try {
    await requireRole(['owner', 'compliance_manager'])
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Forbidden.' }
  }
  const supabase = await createClient()
  const { error } = await supabase
    .from("project_subs")
    .upsert(
      { project_id: projectId, sub_id: subId, scope: scope ?? null, removed_at: null },
      { onConflict: 'project_id,sub_id' }
    )
  if (error) return { error: error.message }
  return { success: true }
}

/** Soft-remove a sub from a project (sets removed_at). */
export async function removeSubFromProject(projectId: string, subId: string): Promise<ActionResult> {
  try {
    await requireRole(['owner', 'compliance_manager'])
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Forbidden.' }
  }
  const supabase = await createClient()
  const { error } = await supabase
    .from("project_subs")
    .update({ removed_at: new Date().toISOString() })
    .eq("project_id", projectId)
    .eq("sub_id", subId)
  if (error) return { error: error.message }
  return { success: true }
}
