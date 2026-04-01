"use server"

import { createClient } from "@/lib/supabase/server"
import type { DashboardData, ClientProfile, Document, Incident } from "@/lib/types"

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      client: null,
      recentDocuments: [],
      recentIncidents: [],
      complianceScore: 0,
      documentCount: 0,
      incidentCount: 0,
      auditCount: 0,
    }
  }

  // Run all queries in parallel
  const [clientRes, docsRes, incidentsRes, docCountRes, incCountRes, auditCountRes] =
    await Promise.all([
      supabase.from("clients").select("*").eq("id", user.id).single(),
      supabase
        .from("documents")
        .select("*")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false })
        .limit(4),
      supabase
        .from("incidents")
        .select("*")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("documents")
        .select("*", { count: "exact", head: true })
        .eq("client_id", user.id),
      supabase
        .from("incidents")
        .select("*", { count: "exact", head: true })
        .eq("client_id", user.id),
      supabase
        .from("audits")
        .select("*", { count: "exact", head: true })
        .eq("client_id", user.id),
    ])

  const client = clientRes.data as ClientProfile | null

  return {
    client,
    recentDocuments: (docsRes.data || []) as Document[],
    recentIncidents: (incidentsRes.data || []) as Incident[],
    complianceScore: client?.compliance_score ?? 0,
    documentCount: docCountRes.count ?? 0,
    incidentCount: incCountRes.count ?? 0,
    auditCount: auditCountRes.count ?? 0,
  }
}
