"use server"

import { getAuth } from "@/lib/actions/shared"
import { requirePaidAuth } from "@/lib/billing-guard"

export async function getReportsSummary() {
  const { supabase, clientId } = await getAuth()
  if (!clientId) return { documentCount: 0, incidentCount: 0, auditCount: 0, trainingCount: 0 }

  const [docRes, incRes, audRes, trainRes] = await Promise.all([
    supabase.from("documents").select("*", { count: "exact", head: true }).eq("client_id", clientId),
    supabase.from("incidents").select("*", { count: "exact", head: true }).eq("client_id", clientId),
    supabase.from("audits").select("*", { count: "exact", head: true }).eq("client_id", clientId),
    supabase.from("training_records").select("*", { count: "exact", head: true }).eq("client_id", clientId),
  ])

  return {
    documentCount: docRes.count ?? 0,
    incidentCount: incRes.count ?? 0,
    auditCount: audRes.count ?? 0,
    trainingCount: trainRes.count ?? 0,
  }
}

export async function getComplianceScoreReport() {
  const { supabase, clientId } = await getAuth()
  if (!clientId) return { score: 0, monthlyScores: [], documents: [], categories: [] }

  const [clientRes, auditsRes, docsRes, incCountRes, trainCountRes] = await Promise.all([
    supabase.from("clients").select("compliance_score, risk_level").eq("id", clientId).single(),
    supabase.from("audits").select("month, score").eq("client_id", clientId).order("month", { ascending: true }).limit(6),
    supabase.from("documents").select("type, filename, status, created_at").eq("client_id", clientId).order("created_at", { ascending: false }),
    supabase.from("incidents").select("*", { count: "exact", head: true }).eq("client_id", clientId),
    supabase.from("training_records").select("*", { count: "exact", head: true }).eq("client_id", clientId).eq("status", "pending"),
  ])

  const score = clientRes.data?.compliance_score ?? 0
  const docCount = docsRes.data?.length ?? 0
  const currentDocs = docsRes.data?.filter(d => d.status === "current").length ?? 0
  const incidentCount = incCountRes.count ?? 0
  const pendingTraining = trainCountRes.count ?? 0

  // Category breakdown (same scoring as monthly-audit)
  const docScore = Math.min(docCount * 10, 40)
  const incScore = Math.max(30 - incidentCount * 5, 0)
  const trainScore = pendingTraining === 0 ? 30 : Math.max(30 - pendingTraining * 10, 0)

  const categories = [
    { name: "Documentation", score: Math.min(docScore, 30), max: 30, weight: "30%" },
    { name: "Incidents", score: Math.min(incScore, 25), max: 25, weight: "25%" },
    { name: "Regulatory", score: Math.min(Math.round(score * 0.2), 20), max: 20, weight: "20%" },
    { name: "Training", score: Math.min(30 - trainScore, 15) || 15, max: 15, weight: "15%" },
    { name: "Account", score: Math.min(10, Math.round(score * 0.1)), max: 10, weight: "10%" },
  ]

  const monthlyScores = (auditsRes.data ?? []).map(a => {
    const date = new Date(a.month + "-01")
    return { month: date.toLocaleDateString("en-US", { month: "short" }), score: a.score }
  })

  const documents = (docsRes.data ?? []).map(d => ({
    name: d.filename.replace(".pdf", ""),
    status: d.status,
    updated: new Date(d.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    regulation: d.type,
    points: d.status === "current" ? "5/5" : "4/5",
  }))

  return { score, monthlyScores, documents, categories }
}

export async function getIncidentAnalysis() {
  const { supabase, clientId } = await getAuth()
  if (!clientId) return { kpis: [], incidentsByType: [], incidentsBySeverity: [], correctiveActions: [] }

  const { data: incidents } = await supabase
    .from("incidents")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })

  const all = incidents ?? []
  const now = new Date()
  const thisMonth = all.filter(i => new Date(i.created_at).getMonth() === now.getMonth() && new Date(i.created_at).getFullYear() === now.getFullYear())
  const open = all.filter(i => !i.follow_up_id)
  const severe = all.filter(i => i.severity === "severe" || i.severity === "serious")

  const kpis = [
    { label: "This Month", value: thisMonth.length, delta: null, positive: null },
    { label: "YTD", value: all.filter(i => new Date(i.created_at).getFullYear() === now.getFullYear()).length, delta: null, positive: null },
    { label: "Open", value: open.length, delta: null, positive: null },
    { label: "Severe/Serious", value: severe.length, delta: null, positive: null },
    { label: "Total", value: all.length, delta: null, positive: null },
  ]

  // Group by type from metadata
  const typeMap: Record<string, number> = {}
  const severityMap: Record<string, number> = {}
  const typeColors: Record<string, string> = { injury: "#C41230", "near-miss": "#C9A84C", property: "#7A8FA5", illness: "#B8C4CE" }
  const sevColors: Record<string, string> = { severe: "#C41230", serious: "#C9A84C", moderate: "#7A8FA5", minor: "#B8C4CE" }

  for (const inc of all) {
    const type = (inc.metadata as Record<string, string>)?.type || "other"
    typeMap[type] = (typeMap[type] || 0) + 1
    const sev = inc.severity || "minor"
    severityMap[sev] = (severityMap[sev] || 0) + 1
  }

  const incidentsByType = Object.entries(typeMap).map(([type, count]) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1).replace("-", " "),
    count,
    color: typeColors[type] || "#B8C4CE",
  }))

  const incidentsBySeverity = Object.entries(severityMap).map(([sev, count]) => ({
    type: sev.charAt(0).toUpperCase() + sev.slice(1),
    count,
    color: sevColors[sev] || "#B8C4CE",
  }))

  // Recent incidents as corrective actions
  const correctiveActions = all.slice(0, 5).map(inc => ({
    incident: inc.incident_id,
    action: inc.description?.slice(0, 60) + (inc.description?.length > 60 ? "..." : ""),
    assigned: "Safety Officer",
    due: new Date(inc.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    status: inc.follow_up_id ? "Completed" : "In Progress",
  }))

  return { kpis, incidentsByType, incidentsBySeverity, correctiveActions }
}

export async function getDocumentHistory() {
  const { supabase, clientId } = await getAuth()
  if (!clientId) return { stats: [], documents: [], deliveryLog: [] }

  const { data: docs } = await supabase
    .from("documents")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })

  const all = docs ?? []
  const currentDocs = all.filter(d => d.status === "current").length

  const stats = [
    { label: "Active Docs", value: currentDocs },
    { label: "Total Documents", value: all.length },
    { label: "With Storage", value: all.filter(d => d.storage_url).length },
  ]

  // Group docs by type for version timeline
  const byType: Record<string, typeof all> = {}
  for (const doc of all) {
    if (!byType[doc.type]) byType[doc.type] = []
    byType[doc.type].push(doc)
  }

  const documents = Object.entries(byType).map(([type, versions]) => ({
    name: type.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    versions: versions.map((v, i) => ({
      version: `v${versions.length - i}.0`,
      date: new Date(v.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      reason: v.notes || (v.status === "requested" ? "Requested" : "Generated"),
      regulation: v.type,
      delivered: !!v.storage_url,
      opened: !!v.storage_url,
      current: i === 0,
    })),
  }))

  const deliveryLog = all.filter(d => d.storage_url).slice(0, 10).map(d => ({
    date: new Date(d.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    document: d.type.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
    version: "v1.0",
    recipient: "—",
    status: "Delivered",
    openTime: "—",
  }))

  return { stats, documents, deliveryLog }
}

export async function getDeliveryLog() {
  const { supabase, clientId } = await getAuth()
  if (!clientId) return { stats: [], deliveries: [], deliverySchedule: [] }

  const { data: deliveries } = await supabase
    .from("scheduled_deliveries")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .limit(20)

  const all = deliveries ?? []

  // If no scheduled_deliveries rows, fall back to documents as delivery proxies
  if (all.length === 0) {
    const { data: docs } = await supabase
      .from("documents")
      .select("*")
      .eq("client_id", clientId)
      .not("storage_url", "is", null)
      .order("created_at", { ascending: false })
      .limit(10)

    const docDeliveries = (docs ?? []).map(d => ({
      date: new Date(d.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      type: "Document",
      name: d.filename,
      recipient: "—",
      status: "Delivered",
      openTime: "—",
    }))

    return {
      stats: [
        { label: "Total Deliveries", value: docDeliveries.length },
        { label: "Documents", value: docDeliveries.length },
        { label: "Reports", value: 0 },
        { label: "This Month", value: 0 },
      ],
      deliveries: docDeliveries,
      deliverySchedule: [],
    }
  }

  return {
    stats: [
      { label: "Total Deliveries", value: all.length },
      { label: "Documents", value: all.filter((d: Record<string, unknown>) => (d.delivery_type as string)?.includes("document")).length },
      { label: "Reports", value: all.filter((d: Record<string, unknown>) => (d.delivery_type as string)?.includes("report")).length },
      { label: "This Month", value: all.filter((d: Record<string, unknown>) => {
        const date = new Date(d.created_at as string)
        const now = new Date()
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
      }).length },
    ],
    deliveries: all.map((d: Record<string, unknown>) => ({
      date: new Date(d.created_at as string).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      type: ((d.delivery_type as string) ?? "document").charAt(0).toUpperCase() + ((d.delivery_type as string) ?? "document").slice(1),
      name: (d.delivery_type as string) ?? "Delivery",
      recipient: "—",
      status: (d.status as string) ?? "Delivered",
      openTime: "—",
    })),
    deliverySchedule: [],
  }
}

export async function getAnnualSummary() {
  const { supabase, clientId } = await getAuth()
  if (!clientId) return { businessName: "—", score: 0, stats: [], oshaLog: [] }

  const year = new Date().getFullYear()
  const yearStart = `${year}-01-01`

  const [clientRes, docsRes, incRes, regRes, audRes] = await Promise.all([
    supabase.from("clients").select("business_name, compliance_score").eq("id", clientId).single(),
    supabase.from("documents").select("*", { count: "exact", head: true }).eq("client_id", clientId).eq("status", "current"),
    supabase.from("incidents").select("*").eq("client_id", clientId).gte("created_at", yearStart),
    supabase.from("regulatory_updates").select("*", { count: "exact", head: true }),
    supabase.from("audits").select("score").eq("client_id", clientId).order("created_at", { ascending: false }).limit(1),
  ])

  const incidents = incRes.data ?? []
  const closedIncidents = incidents.filter(i => i.follow_up_id)
  const score = audRes.data?.[0]?.score ?? clientRes.data?.compliance_score ?? 0

  const stats = [
    { label: "Year-End Score", value: `${score}/100` },
    { label: "Documents Current", value: `${docsRes.count ?? 0}` },
    { label: "Incidents Closed", value: `${closedIncidents.length}/${incidents.length}` },
    { label: "Regulations Monitored", value: `${regRes.count ?? 0}` },
  ]

  // OSHA log from severe/serious incidents
  const oshaLog = incidents
    .filter(i => i.severity === "severe" || i.severity === "serious")
    .map((i, idx) => ({
      case: String(idx + 1).padStart(3, "0"),
      jobTitle: "Employee",
      date: new Date(i.incident_date || i.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      location: i.location || "—",
      description: i.description?.slice(0, 50) || "—",
      classification: i.severity === "severe" ? "Injury" : "Other",
      daysAway: i.severity === "severe" ? 3 : 0,
      daysRestricted: i.severity === "severe" ? 14 : 0,
    }))

  return {
    businessName: clientRes.data?.business_name ?? "—",
    score,
    stats,
    oshaLog,
  }
}

export async function getRegulatoryImpact() {
  const { supabase, clientId } = await getAuth()
  if (!clientId) return { stats: [], quarters: [] }

  const { data: updates } = await supabase
    .from("regulatory_updates")
    .select("*")
    .order("published_date", { ascending: false })

  const all = updates ?? []

  // Group by quarter
  const quarterMap: Record<string, typeof all> = {}
  for (const update of all) {
    const date = new Date(update.published_date || update.created_at)
    const q = `Q${Math.ceil((date.getMonth() + 1) / 3)} ${date.getFullYear()}`
    if (!quarterMap[q]) quarterMap[q] = []
    quarterMap[q].push(update)
  }

  const quarters = Object.entries(quarterMap).map(([quarter, updates]) => ({
    quarter,
    updates: updates.map(u => ({
      code: u.code || u.regulation_code || "—",
      type: u.type || "Guidance",
      impact: u.severity || "Low",
      status: "Acknowledged",
      response: u.title?.slice(0, 40) || "Reviewed",
    })),
  }))

  const amendments = all.filter(u => u.type === "amendment").length
  const guidance = all.filter(u => u.type === "guidance").length

  return {
    stats: [
      { label: "Total Updates", value: all.length },
      { label: "Amendments", value: amendments },
      { label: "Guidance", value: guidance },
      { label: "Response Rate", value: "100%" },
    ],
    quarters,
  }
}

export async function getRegulations() {
  const { supabase, clientId } = await getAuth()
  if (!clientId) return []

  const { data } = await supabase
    .from("regulatory_updates")
    .select("*")
    .order("published_date", { ascending: false })

  return (data ?? []).map(u => ({
    id: u.id,
    severity: u.severity || "low",
    code: u.code || u.regulation_code || "—",
    issuingBody: u.issuing_body || "Cal/OSHA",
    publishedDate: new Date(u.published_date || u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    title: u.title || "Regulatory Update",
    type: u.type || "guidance",
    summary: u.summary || u.description || "",
    effectiveDate: u.effective_date ? new Date(u.effective_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Immediate",
    complianceDeadline: u.compliance_deadline ? new Date(u.compliance_deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null,
    actionRequired: u.type === "amendment",
    unread: !(u.acknowledged_by ?? []).includes(clientId),
    impactText: u.type === "amendment" ? (u.impact_text || "Your compliance documents may require updates.") : null,
  }))
}

export async function acknowledgeRegulation(regulationId: string) {
  const auth = await requirePaidAuth()
  if (auth.error) return { error: auth.message }
  const { supabase, clientId } = auth

  // Get current acknowledged_by array
  const { data: reg } = await supabase
    .from("regulatory_updates")
    .select("acknowledged_by")
    .eq("id", regulationId)
    .single()

  const current = (reg?.acknowledged_by as string[]) ?? []
  if (!current.includes(clientId)) {
    await supabase
      .from("regulatory_updates")
      .update({ acknowledged_by: [...current, clientId] })
      .eq("id", regulationId)
  }

  return { success: true }
}

export async function getAlerts() {
  const { supabase, clientId } = await getAuth()
  if (!clientId) return []

  const now = new Date().toISOString().slice(0, 10)

  const [overdueTraining, expiringDocs, atRiskAudits, unackedRegs] = await Promise.all([
    supabase
      .from("training_records")
      .select("employee_name, training_type, due_date")
      .eq("client_id", clientId)
      .eq("status", "pending")
      .lt("due_date", now)
      .limit(5),
    supabase
      .from("documents")
      .select("filename, document_id, status")
      .eq("client_id", clientId)
      .eq("status", "review")
      .limit(5),
    supabase
      .from("audits")
      .select("audit_id, score, status, month")
      .eq("client_id", clientId)
      .in("status", ["at-risk", "non-compliant"])
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("regulatory_updates")
      .select("id, title, severity, type")
      .order("published_date", { ascending: false })
      .limit(10),
  ])

  const alerts: { id: string; type: string; title: string; description: string; date: string; action: string }[] = []

  for (const t of overdueTraining.data ?? []) {
    alerts.push({
      id: `train-${t.employee_name}-${t.training_type}`,
      type: "urgent",
      title: `Training Overdue: ${t.employee_name}`,
      description: `${t.training_type} training was due ${t.due_date}.`,
      date: t.due_date,
      action: "View Training",
    })
  }

  for (const d of expiringDocs.data ?? []) {
    alerts.push({
      id: `doc-${d.document_id}`,
      type: "warning",
      title: `Document Review Due: ${d.filename}`,
      description: `${d.filename} requires review.`,
      date: "Review due",
      action: "Request Update",
    })
  }

  for (const a of atRiskAudits.data ?? []) {
    alerts.push({
      id: `audit-${a.audit_id}`,
      type: a.status === "non-compliant" ? "urgent" : "warning",
      title: `Audit ${a.status}: ${a.audit_id}`,
      description: `Monthly audit scored ${a.score}/100 (${a.status}).`,
      date: a.month,
      action: "View Report",
    })
  }

  // Unacknowledged regulations
  for (const r of unackedRegs.data ?? []) {
    const acked = ((r as Record<string, unknown>).acknowledged_by as string[]) ?? []
    if (!acked.includes(clientId)) {
      alerts.push({
        id: `reg-${r.id}`,
        type: r.severity === "high" ? "warning" : "info",
        title: `Regulatory Update: ${r.title}`,
        description: `New ${r.type} requires your attention.`,
        date: "New",
        action: "View Update",
      })
    }
  }

  // Sort: urgent first, then warning, then info
  const priority: Record<string, number> = { urgent: 0, warning: 1, info: 2, success: 3 }
  alerts.sort((a, b) => (priority[a.type] ?? 9) - (priority[b.type] ?? 9))

  return alerts
}
