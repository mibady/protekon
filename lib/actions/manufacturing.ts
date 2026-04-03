"use server"

import { createClient } from "@/lib/supabase/server"

async function getAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { supabase, clientId: user?.id ?? null }
}

export async function getEquipment() {
  const { supabase, clientId } = await getAuth()
  if (!clientId) return []
  const { data } = await supabase
    .from("manufacturing_equipment")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
  return data ?? []
}

export async function addEquipment(formData: FormData) {
  const { supabase, clientId } = await getAuth()
  if (!clientId) return { error: "Unauthorized" }

  const { error } = await supabase.from("manufacturing_equipment").insert({
    client_id: clientId,
    equipment_name: formData.get("equipment_name") as string,
    equipment_type: formData.get("equipment_type") as string || "machinery",
    serial_number: formData.get("serial_number") as string || null,
    loto_status: formData.get("loto_status") as string || "current",
    last_inspection: formData.get("last_inspection") as string || null,
    next_inspection: formData.get("next_inspection") as string || null,
    risk_level: formData.get("risk_level") as string || "medium",
    notes: formData.get("notes") as string || null,
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteEquipment(id: string) {
  const { supabase, clientId } = await getAuth()
  if (!clientId) return { error: "Unauthorized" }
  await supabase.from("manufacturing_equipment").delete().eq("id", id).eq("client_id", clientId)
  return { success: true }
}
