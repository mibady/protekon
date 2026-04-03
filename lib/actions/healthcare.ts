"use server"

import { getAuth } from "@/lib/actions/shared"

export async function getPhiAssets() {
  const { supabase, clientId } = await getAuth()
  if (!clientId) return []
  const { data } = await supabase
    .from("phi_assets")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
  return data ?? []
}

export async function addPhiAsset(formData: FormData) {
  const { supabase, clientId } = await getAuth()
  if (!clientId) return { error: "Unauthorized" }

  const phiTypes = (formData.get("phi_content_types") as string || "").split(",").map(s => s.trim()).filter(Boolean)

  const { error } = await supabase.from("phi_assets").insert({
    client_id: clientId,
    system_name: formData.get("system_name") as string,
    system_type: formData.get("system_type") as string,
    phi_content_types: phiTypes,
    encrypted_at_rest: formData.get("encrypted_at_rest") === "on",
    encrypted_in_transit: formData.get("encrypted_in_transit") === "on",
    risk_level: formData.get("risk_level") as string,
    access_description: formData.get("access_description") as string || null,
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function getBaaAgreements() {
  const { supabase, clientId } = await getAuth()
  if (!clientId) return []
  const { data } = await supabase
    .from("baa_agreements")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
  return data ?? []
}

export async function addBaaAgreement(formData: FormData) {
  const { supabase, clientId } = await getAuth()
  if (!clientId) return { error: "Unauthorized" }

  const phiTypes = (formData.get("phi_types") as string || "").split(",").map(s => s.trim()).filter(Boolean)

  const { error } = await supabase.from("baa_agreements").insert({
    client_id: clientId,
    vendor_name: formData.get("vendor_name") as string,
    service_type: formData.get("service_type") as string,
    phi_types: phiTypes,
    baa_status: formData.get("baa_status") as string,
    signed_date: formData.get("signed_date") as string || null,
    expiration_date: formData.get("expiration_date") as string || null,
  })

  if (error) return { error: error.message }
  return { success: true }
}
