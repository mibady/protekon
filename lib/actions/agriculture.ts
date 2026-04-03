"use server"

import { createClient } from "@/lib/supabase/server"

async function getAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { supabase, clientId: user?.id ?? null }
}

export async function getCrews() {
  const { supabase, clientId } = await getAuth()
  if (!clientId) return []
  const { data } = await supabase
    .from("agriculture_crews")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
  return data ?? []
}

export async function addCrew(formData: FormData) {
  const { supabase, clientId } = await getAuth()
  if (!clientId) return { error: "Unauthorized" }

  const { error } = await supabase.from("agriculture_crews").insert({
    client_id: clientId,
    crew_name: formData.get("crew_name") as string,
    field_location: formData.get("field_location") as string || null,
    crew_size: formData.get("crew_size") ? parseInt(formData.get("crew_size") as string) : 1,
    heat_plan_status: formData.get("heat_plan_status") as string || "active",
    water_station: formData.get("water_station") === "on",
    shade_available: formData.get("shade_available") === "on",
    last_safety_check: formData.get("last_safety_check") as string || null,
    notes: formData.get("notes") as string || null,
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function updateCrew(id: string, data: Record<string, string | number | boolean | null>) {
  const { supabase, clientId } = await getAuth()
  if (!clientId) return { error: "Unauthorized" }

  const { error } = await supabase
    .from("agriculture_crews")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("client_id", clientId)

  if (error) return { error: error.message }
  return { success: true }
}
