"use server"

import { createClient } from "@/lib/supabase/server"

async function getAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { supabase, clientId: user?.id ?? null }
}

export async function getLocations() {
  const { supabase, clientId } = await getAuth()
  if (!clientId) return []
  const { data } = await supabase
    .from("retail_locations")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
  return data ?? []
}

export async function addLocation(formData: FormData) {
  const { supabase, clientId } = await getAuth()
  if (!clientId) return { error: "Unauthorized" }

  const { error } = await supabase.from("retail_locations").insert({
    client_id: clientId,
    store_name: formData.get("store_name") as string,
    address: formData.get("address") as string || null,
    city: formData.get("city") as string || null,
    state: formData.get("state") as string || "CA",
    location_type: formData.get("location_type") as string || "retail",
    fire_inspection_status: formData.get("fire_inspection_status") as string || "current",
    ada_status: formData.get("ada_status") as string || "compliant",
    compliance_score: formData.get("compliance_score") ? parseInt(formData.get("compliance_score") as string) : 100,
    last_audit: formData.get("last_audit") as string || null,
  })

  if (error) return { error: error.message }
  return { success: true }
}
