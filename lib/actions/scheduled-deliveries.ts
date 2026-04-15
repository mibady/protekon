"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requirePaidAuth } from "@/lib/billing-guard"
import type { ActionResult } from "@/lib/types"

export type DeliveryPreference = {
  id: string
  delivery_type: string
  frequency: string
  next_delivery_date: string
  last_delivered_at: string | null
  status: string
}

export async function getDeliveryPreferences(): Promise<DeliveryPreference[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const admin = createAdminClient()
  const { data } = await admin
    .from("scheduled_deliveries")
    .select("id, delivery_type, frequency, next_delivery_date, last_delivered_at, status")
    .eq("client_id", user.id)
    .order("delivery_type")

  return data ?? []
}

export async function updateDeliveryPreference(
  deliveryId: string,
  updates: { frequency?: string; status?: string }
): Promise<ActionResult> {
  const auth = await requirePaidAuth()
  if (auth.error) return { error: auth.message }
  const { clientId } = auth

  const admin = createAdminClient()

  // Verify ownership
  const { data: existing } = await admin
    .from("scheduled_deliveries")
    .select("id, client_id")
    .eq("id", deliveryId)
    .eq("client_id", clientId)
    .single()

  if (!existing) return { error: "Delivery not found" }

  const updateData: Record<string, string> = {}
  if (updates.frequency) updateData.frequency = updates.frequency
  if (updates.status) updateData.status = updates.status

  const { error } = await admin
    .from("scheduled_deliveries")
    .update(updateData)
    .eq("id", deliveryId)

  if (error) return { error: "Failed to update delivery preference" }
  return { success: true }
}

export async function createDefaultDeliveries(clientId: string, plan?: string): Promise<void> {
  const admin = createAdminClient()
  const now = new Date()

  const allDeliveries = [
    {
      delivery_type: "weekly-summary",
      frequency: "weekly",
      next_delivery_date: getNextWeekday(now, 1).toISOString().slice(0, 10),
      tiers: ["professional", "multi-site"],
    },
    {
      delivery_type: "monthly-report",
      frequency: "monthly",
      next_delivery_date: getFirstOfNextMonth(now).toISOString().slice(0, 10),
      tiers: ["core", "professional", "multi-site"],
    },
    {
      delivery_type: "quarterly-review",
      frequency: "quarterly",
      next_delivery_date: getNextQuarter(now).toISOString().slice(0, 10),
      tiers: ["professional", "multi-site"],
    },
    {
      delivery_type: "annual-audit",
      frequency: "annual",
      next_delivery_date: getNextAnnual(now).toISOString().slice(0, 10),
      tiers: ["multi-site"],
    },
  ]

  // Filter deliveries by plan tier (default to core if unknown)
  const clientPlan = plan || "core"
  const defaults = allDeliveries
    .filter(d => d.tiers.includes(clientPlan))
    .map(({ tiers: _tiers, ...rest }) => rest)

  for (const d of defaults) {
    await admin.from("scheduled_deliveries").upsert(
      {
        client_id: clientId,
        ...d,
        status: "scheduled",
      },
      { onConflict: "client_id,delivery_type", ignoreDuplicates: true }
    )
  }
}

function getNextWeekday(from: Date, dayOfWeek: number): Date {
  const d = new Date(from)
  d.setDate(d.getDate() + ((dayOfWeek + 7 - d.getDay()) % 7 || 7))
  return d
}

function getFirstOfNextMonth(from: Date): Date {
  const d = new Date(from)
  d.setMonth(d.getMonth() + 1, 1)
  return d
}

function getNextQuarter(from: Date): Date {
  const d = new Date(from)
  const currentQ = Math.floor(d.getMonth() / 3)
  d.setMonth((currentQ + 1) * 3, 1)
  if (d <= from) d.setMonth(d.getMonth() + 3)
  return d
}

function getNextAnnual(from: Date): Date {
  const d = new Date(from)
  d.setFullYear(d.getFullYear() + 1, 0, 1)
  return d
}
