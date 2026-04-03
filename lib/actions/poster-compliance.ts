"use server"

import { getAuth } from "@/lib/actions/shared"

export async function getPosterLocations() {
  const { supabase, clientId } = await getAuth()
  if (!clientId) return []
  const { data } = await supabase
    .from("poster_compliance")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
  return data ?? []
}

export async function addPosterLocation(formData: FormData) {
  const { supabase, clientId } = await getAuth()
  if (!clientId) return { error: "Unauthorized" }

  const { error } = await supabase.from("poster_compliance").insert({
    client_id: clientId,
    location_name: formData.get("location_name") as string,
    poster_type: formData.get("poster_type") as string,
    jurisdiction: formData.get("jurisdiction") as string,
    status: "current",
    last_verified_at: new Date().toISOString(),
    next_update_due: formData.get("next_update_due") as string || null,
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function verifyPoster(id: string) {
  const { supabase, clientId } = await getAuth()
  if (!clientId) return { error: "Unauthorized" }
  await supabase
    .from("poster_compliance")
    .update({ last_verified_at: new Date().toISOString(), status: "current" })
    .eq("id", id)
    .eq("client_id", clientId)
  return { success: true }
}
