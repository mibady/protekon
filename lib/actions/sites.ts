"use server"

import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { SITE_COOKIE } from "@/lib/site-context"
import { revalidatePath } from "next/cache"

export type Site = {
  id: string
  client_id: string
  name: string
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  employee_count: number | null
  is_primary: boolean
  created_at: string
  updated_at: string
}

type ActionResult = { success: true; id?: string } | { error: string }

const LOCATION_CAPS: Record<string, number> = {
  core: 1,
  professional: 2,
  "multi-site": 3,
}

async function getClientPlan(userId: string): Promise<string> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("clients")
    .select("plan")
    .eq("id", userId)
    .maybeSingle()
  return (data?.plan as string) || "core"
}

export async function listSites(): Promise<Site[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("sites")
    .select("*")
    .eq("client_id", user.id)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: true })

  return (data as Site[]) ?? []
}

export async function createSite(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "You must be logged in." }

  const plan = await getClientPlan(user.id)
  if (plan !== "multi-site") {
    return { error: "Managing multiple sites is available on the Multi-Site plan." }
  }

  const { count } = await supabase
    .from("sites")
    .select("id", { count: "exact", head: true })
    .eq("client_id", user.id)
  const cap = LOCATION_CAPS[plan] ?? 1
  if ((count ?? 0) >= cap) {
    return { error: `Your plan allows up to ${cap} sites. Upgrade or remove a site to add another.` }
  }

  const name = (formData.get("name") as string | null)?.trim()
  if (!name) return { error: "Site name is required." }

  const payload = {
    client_id: user.id,
    name,
    address: (formData.get("address") as string | null)?.trim() || null,
    city: (formData.get("city") as string | null)?.trim() || null,
    state: (formData.get("state") as string | null)?.trim() || null,
    zip: (formData.get("zip") as string | null)?.trim() || null,
    employee_count: formData.get("employee_count")
      ? Number(formData.get("employee_count"))
      : null,
    is_primary: (count ?? 0) === 0,
  }

  const { data, error } = await supabase
    .from("sites")
    .insert(payload)
    .select("id")
    .single()

  if (error) return { error: error.message }

  revalidatePath("/dashboard/sites")
  revalidatePath("/dashboard/rollup")
  return { success: true, id: data.id }
}

export async function updateSite(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "You must be logged in." }

  const name = (formData.get("name") as string | null)?.trim()
  if (!name) return { error: "Site name is required." }

  const patch = {
    name,
    address: (formData.get("address") as string | null)?.trim() || null,
    city: (formData.get("city") as string | null)?.trim() || null,
    state: (formData.get("state") as string | null)?.trim() || null,
    zip: (formData.get("zip") as string | null)?.trim() || null,
    employee_count: formData.get("employee_count")
      ? Number(formData.get("employee_count"))
      : null,
  }

  const { error } = await supabase
    .from("sites")
    .update(patch)
    .eq("id", id)
    .eq("client_id", user.id)

  if (error) return { error: error.message }

  revalidatePath("/dashboard/sites")
  revalidatePath("/dashboard/rollup")
  return { success: true, id }
}

export async function deleteSite(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "You must be logged in." }

  const { data: site } = await supabase
    .from("sites")
    .select("is_primary")
    .eq("id", id)
    .eq("client_id", user.id)
    .maybeSingle()

  if (!site) return { error: "Site not found." }
  if (site.is_primary) {
    return { error: "Set another site as primary before deleting this one." }
  }

  // Detach records from this site before delete. The RPC nulls site_id
  // across every child table so the data isn't lost.
  const { error: detachErr } = await supabase.rpc("assign_records_to_site", {
    p_client_id: user.id,
    p_site_id: null,
    p_from_site_id: id,
  })

  if (detachErr) {
    // fallback: call without from_site if RPC signature is 2-arg in some envs
    await supabase.rpc("assign_records_to_site", {
      p_client_id: user.id,
      p_site_id: null,
    })
  }

  const { error } = await supabase
    .from("sites")
    .delete()
    .eq("id", id)
    .eq("client_id", user.id)

  if (error) return { error: error.message }

  // If the deleted site was the current cookie value, clear it.
  const store = await cookies()
  if (store.get(SITE_COOKIE)?.value === id) {
    store.set(SITE_COOKIE, "all", { path: "/", sameSite: "lax" })
  }

  revalidatePath("/dashboard/sites")
  revalidatePath("/dashboard/rollup")
  return { success: true }
}

export async function setPrimarySite(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "You must be logged in." }

  const { error: unsetErr } = await supabase
    .from("sites")
    .update({ is_primary: false })
    .eq("client_id", user.id)
    .eq("is_primary", true)
  if (unsetErr) return { error: unsetErr.message }

  const { error: setErr } = await supabase
    .from("sites")
    .update({ is_primary: true })
    .eq("id", id)
    .eq("client_id", user.id)
  if (setErr) return { error: setErr.message }

  revalidatePath("/dashboard/sites")
  return { success: true, id }
}

export async function selectSite(siteId: string): Promise<void> {
  const store = await cookies()
  const value = siteId === "all" ? "all" : siteId
  store.set(SITE_COOKIE, value, {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 365,
  })
  revalidatePath("/dashboard", "layout")
}

export async function assignUnassignedToSite(siteId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "You must be logged in." }

  const { error } = await supabase.rpc("assign_records_to_site", {
    p_client_id: user.id,
    p_site_id: siteId,
  })
  if (error) return { error: error.message }

  revalidatePath("/dashboard/sites")
  revalidatePath("/dashboard/rollup")
  return { success: true, id: siteId }
}
