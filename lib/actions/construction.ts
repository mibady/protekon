"use server"

import { createClient } from "@/lib/supabase/server"

async function getAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { supabase, clientId: user?.id ?? null }
}

export async function getSubcontractors() {
  const { supabase, clientId } = await getAuth()
  if (!clientId) return []
  const { data } = await supabase
    .from("construction_subs")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
  return data ?? []
}

export async function addSubcontractor(formData: FormData) {
  const { supabase, clientId } = await getAuth()
  if (!clientId) return { error: "Unauthorized" }

  const { error } = await supabase.from("construction_subs").insert({
    client_id: clientId,
    company_name: formData.get("company_name") as string,
    license_number: formData.get("license_number") as string,
    license_status: formData.get("license_status") as string,
    license_expiry: formData.get("license_expiry") as string || null,
    insurance_status: formData.get("insurance_status") as string,
    insurance_expiry: formData.get("insurance_expiry") as string || null,
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function verifySubcontractor(id: string) {
  const { supabase, clientId } = await getAuth()
  if (!clientId) return { error: "Unauthorized" }
  await supabase.from("construction_subs").update({ verified_at: new Date().toISOString() }).eq("id", id).eq("client_id", clientId)
  return { success: true }
}

export async function deleteSubcontractor(id: string) {
  const { supabase, clientId } = await getAuth()
  if (!clientId) return { error: "Unauthorized" }
  await supabase.from("construction_subs").delete().eq("id", id).eq("client_id", clientId)
  return { success: true }
}
