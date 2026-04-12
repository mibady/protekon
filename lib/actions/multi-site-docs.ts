"use server"

import { createClient } from "@/lib/supabase/server"
import { inngest } from "@/inngest/client"
import type { ActionResult } from "@/lib/types"

export interface LocationSummary {
  id: string
  store_name: string
  address: string
  city: string
  state: string
  compliance_score: number
  last_audit: string | null
  document_count: number
}

export async function getLocationsWithDocCounts(): Promise<LocationSummary[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: locations } = await supabase
    .from("retail_locations")
    .select("id, store_name, address, city, state, compliance_score, last_audit")
    .eq("client_id", user.id)
    .order("store_name")

  if (!locations?.length) return []

  // Get doc counts per location
  const { data: docs } = await supabase
    .from("documents")
    .select("notes")
    .eq("client_id", user.id)

  const locDocs = new Map<string, number>()
  for (const doc of docs || []) {
    const locId = (doc.notes as string)?.match(/location_id:(\S+)/)?.[1]
    if (locId) locDocs.set(locId, (locDocs.get(locId) || 0) + 1)
  }

  return locations.map((loc) => ({
    ...loc,
    compliance_score: loc.compliance_score || 0,
    document_count: locDocs.get(loc.id) || 0,
  }))
}

export async function generateLocationDocs(locationId: string, docTypes: string[]): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { data: client } = await supabase
    .from("clients")
    .select("email, business_name, vertical")
    .eq("id", user.id)
    .single()

  const { data: location } = await supabase
    .from("retail_locations")
    .select("store_name, address, city, state")
    .eq("id", locationId)
    .eq("client_id", user.id)
    .single()

  if (!client || !location) return { error: "Location not found" }

  // Trigger doc generation for each type with location context
  for (const docType of docTypes) {
    const locationLabel = `${location.store_name} — ${location.address}, ${location.city}, ${location.state}`

    await supabase.from("documents").insert({
      client_id: user.id,
      document_id: `DOC-${Date.now()}-${docType.slice(0, 4)}`,
      type: docType,
      filename: `${docType}-${location.store_name.replace(/\s+/g, "-").toLowerCase()}.pdf`,
      status: "requested",
      notes: `location_id:${locationId} location:${locationLabel}`,
    })

    await inngest.send({
      name: "compliance/document.requested",
      data: {
        clientId: user.id,
        email: client.email,
        businessName: `${client.business_name} — ${location.store_name}`,
        documentType: docType,
        vertical: client.vertical,
      },
    })
  }

  return { success: true }
}
