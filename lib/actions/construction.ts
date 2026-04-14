"use server"

import { getAuth } from "@/lib/actions/shared"
import {
  registerLicenseForMonitoring,
  stopMonitoringLicense,
} from "@/inngest/functions/cslb-notification-pipeline"

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

  const licenseNumber = formData.get("license_number") as string

  const { data: sub, error } = await supabase
    .from("construction_subs")
    .insert({
      client_id: clientId,
      company_name: formData.get("company_name") as string,
      license_number: licenseNumber,
      license_status: formData.get("license_status") as string,
      license_expiry: (formData.get("license_expiry") as string) || null,
      insurance_status: formData.get("insurance_status") as string,
      insurance_expiry: (formData.get("insurance_expiry") as string) || null,
    })
    .select("id")
    .single()

  if (error) return { error: error.message }

  // Register with CSLB monitoring pipeline (intel DB cross-reference)
  if (licenseNumber && sub?.id) {
    try {
      const result = await registerLicenseForMonitoring({
        licenseNo: licenseNumber,
        appClientId: clientId,
        appSubId: sub.id,
        relationshipType: "subcontractor",
      })
      return { success: true, monitoring: result }
    } catch (err) {
      // Non-fatal — the sub is added even if CSLB registration fails
      console.error("[CSLB registration failed]", err)
      return { success: true, monitoring: { success: false, reason: "registration_error" } }
    }
  }

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

  // Fetch the license number before deleting so we can deregister monitoring
  const { data: sub } = await supabase
    .from("construction_subs")
    .select("license_number")
    .eq("id", id)
    .eq("client_id", clientId)
    .single()

  await supabase.from("construction_subs").delete().eq("id", id).eq("client_id", clientId)

  // Soft-delete the intel DB monitoring row
  if (sub?.license_number) {
    try {
      await stopMonitoringLicense({
        licenseNo: sub.license_number,
        appClientId: clientId,
      })
    } catch (err) {
      // Non-fatal
      console.error("[CSLB deregistration failed]", err)
    }
  }

  return { success: true }
}
