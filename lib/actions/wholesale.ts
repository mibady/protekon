"use server"

import { getAuth } from "@/lib/actions/shared"
import { requirePaidAuth } from "@/lib/billing-guard"

export async function getZones() {
  const { supabase, clientId } = await getAuth()
  if (!clientId) return []
  const { data } = await supabase
    .from("wholesale_zones")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
  return data ?? []
}

export async function addZone(formData: FormData) {
  const auth = await requirePaidAuth()
  if (auth.error) return { error: auth.message }
  const { supabase, clientId } = auth

  const { error } = await supabase.from("wholesale_zones").insert({
    client_id: clientId,
    zone_name: formData.get("zone_name") as string,
    zone_type: formData.get("zone_type") as string || "warehouse",
    forklift_certified_operators: formData.get("forklift_certified_operators") ? parseInt(formData.get("forklift_certified_operators") as string) : 0,
    last_safety_audit: formData.get("last_safety_audit") as string || null,
    hazmat_present: formData.get("hazmat_present") === "on",
    status: formData.get("status") as string || "compliant",
    notes: formData.get("notes") as string || null,
  })

  if (error) return { error: error.message }
  return { success: true }
}
