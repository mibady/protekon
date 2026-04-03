"use server"

import { createClient } from "@/lib/supabase/server"

async function getAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { supabase, clientId: user?.id ?? null }
}

export async function getFleet() {
  const { supabase, clientId } = await getAuth()
  if (!clientId) return []
  const { data } = await supabase
    .from("transportation_fleet")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
  return data ?? []
}

export async function addVehicle(formData: FormData) {
  const { supabase, clientId } = await getAuth()
  if (!clientId) return { error: "Unauthorized" }

  const { error } = await supabase.from("transportation_fleet").insert({
    client_id: clientId,
    vehicle_id: formData.get("vehicle_id") as string,
    vehicle_type: formData.get("vehicle_type") as string || "truck",
    driver_name: formData.get("driver_name") as string || null,
    cdl_status: formData.get("cdl_status") as string || "active",
    cdl_expiry: formData.get("cdl_expiry") as string || null,
    last_dot_inspection: formData.get("last_dot_inspection") as string || null,
    next_inspection: formData.get("next_inspection") as string || null,
    status: formData.get("status") as string || "active",
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteVehicle(id: string) {
  const { supabase, clientId } = await getAuth()
  if (!clientId) return { error: "Unauthorized" }
  await supabase.from("transportation_fleet").delete().eq("id", id).eq("client_id", clientId)
  return { success: true }
}
