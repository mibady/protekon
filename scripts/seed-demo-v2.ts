/**
 * Protekon Demo Seed v2 — hosted Supabase (or preview branch)
 *
 * Seeds 7 demo orgs + 11 logins covering every vertical, role, plan tier,
 * and lifecycle state we need to demo the product.
 *
 * Usage:
 *   # Against parent project (prod Supabase)
 *   npx tsx scripts/seed-demo-v2.ts
 *
 *   # Against preview branch
 *   NEXT_PUBLIC_SUPABASE_URL=<branch-url> \
 *   SUPABASE_SERVICE_ROLE_KEY=<branch-service-key> \
 *   npx tsx scripts/seed-demo-v2.ts
 *
 * Env required:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Destructive: wipes all rows tagged as demo data before re-seeding.
 * Safe to re-run.
 */

import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { resolve } from "path"

// ──────────────────────────────────────────────────────────────────────────────
// Env loading (no dotenv dep)
// ──────────────────────────────────────────────────────────────────────────────
try {
  const envPath = resolve(process.cwd(), ".env.local")
  const envContent = readFileSync(envPath, "utf-8")
  for (const line of envContent.split("\n")) {
    const match = line.match(/^([^#=]+)=["']?(.+?)["']?$/)
    if (match && !process.env[match[1].trim()]) {
      process.env[match[1].trim()] = match[2].trim()
    }
  }
} catch {
  // env vars already set externally
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

console.log(`🎯 Target: ${SUPABASE_URL}`)

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────

type ClientVertical = "hipaa" | "construction" | "property" | "municipal" | "hospitality"
type PlanTier = "core" | "professional" | "multi-site" | "managed" | "trial"
type ClientStatus = "active" | "trial" | "past-due" | "canceled"
type PartnerTier = "free" | "essentials" | "professional" | "enterprise"
type RbacRole = "owner" | "compliance_manager" | "field_lead" | "auditor"

interface DemoOrg {
  email: string
  password: string
  businessName: string
  phone: string
  vertical: ClientVertical
  plan: PlanTier
  complianceScore: number
  riskLevel: "low" | "medium" | "high"
  status: ClientStatus
  stripeCustomerId: string | null
  partnerEmail: string | null // if partner-referred
  createdAt: string
  updatedAt: string
  // Seeding hints
  sites: Array<{ name: string; address: string; city: string; state: string; zip: string; employeeCount: number; isPrimary: boolean }>
  openIncidents: number
  overdueTraining: number
  missingDocs: number
}

interface DemoTeamUser {
  ownerEmail: string // org owner's email (resolves to client_id)
  email: string
  password: string
  fullName: string
  role: Exclude<RbacRole, "owner">
}

interface DemoPartner {
  email: string
  password: string
  companyName: string
  contactName: string
  phone: string
  tier: PartnerTier
  status: "pending" | "approved" | "suspended"
  branding: Record<string, string>
  managedClientEmails: string[]
  assessments: Array<{
    prospectName: string
    prospectEmail: string
    score?: number
    scoreTier?: string
    gaps?: string[]
    fineLow?: number
    fineHigh?: number
    status: "pending" | "sent" | "completed" | "converted"
    sentAt?: string
    completedAt?: string
  }>
}

// ──────────────────────────────────────────────────────────────────────────────
// DEMO CONFIG — 7 orgs, 3 team users, 4 partners
// ──────────────────────────────────────────────────────────────────────────────

const DEMO_ORGS: DemoOrg[] = [
  {
    email: "admin@sierraridgebuilders.com",
    password: "demo-password-2026",
    businessName: "Sierra Ridge Builders",
    phone: "(951) 555-0147",
    vertical: "construction",
    plan: "multi-site",
    complianceScore: 87,
    riskLevel: "low",
    status: "active",
    stripeCustomerId: "cus_demo_sierra_ridge",
    partnerEmail: null,
    createdAt: "2025-10-12T08:00:00Z",
    updatedAt: "2026-04-15T10:00:00Z",
    sites: [
      { name: "Riverside HQ", address: "2340 Market St", city: "Riverside", state: "CA", zip: "92501", employeeCount: 18, isPrimary: true },
      { name: "San Bernardino Project", address: "890 Hospitality Ln", city: "San Bernardino", state: "CA", zip: "92408", employeeCount: 14, isPrimary: false },
      { name: "Fontana Warehouse", address: "12100 Jurupa Ave", city: "Fontana", state: "CA", zip: "92337", employeeCount: 9, isPrimary: false },
      { name: "Moreno Valley Site", address: "14200 Perris Blvd", city: "Moreno Valley", state: "CA", zip: "92553", employeeCount: 6, isPrimary: false },
    ],
    openIncidents: 2,
    overdueTraining: 6,
    missingDocs: 1,
  },
  {
    email: "admin@pacificcoastproperty.com",
    password: "demo-password-2026",
    businessName: "Pacific Coast Property Group",
    phone: "(310) 555-0189",
    vertical: "property",
    plan: "professional",
    complianceScore: 92,
    riskLevel: "low",
    status: "active",
    stripeCustomerId: "cus_demo_pacific_coast",
    partnerEmail: null,
    createdAt: "2025-08-20T08:00:00Z",
    updatedAt: "2026-04-10T09:00:00Z",
    sites: [
      { name: "Santa Monica Office", address: "1200 Wilshire Blvd", city: "Santa Monica", state: "CA", zip: "90401", employeeCount: 12, isPrimary: true },
    ],
    openIncidents: 0,
    overdueTraining: 3,
    missingDocs: 0,
  },
  {
    email: "admin@coastalhealthgroup.com",
    password: "demo-password-2026",
    businessName: "Coastal Health Group",
    phone: "(310) 555-0142",
    vertical: "hipaa",
    plan: "managed",
    complianceScore: 78,
    riskLevel: "medium",
    status: "active",
    stripeCustomerId: "cus_demo_coastal_health",
    partnerEmail: null,
    createdAt: "2025-11-15T09:00:00Z",
    updatedAt: "2026-04-14T14:30:00Z",
    sites: [
      { name: "Los Angeles Main Clinic", address: "4500 Sunset Blvd", city: "Los Angeles", state: "CA", zip: "90027", employeeCount: 24, isPrimary: true },
      { name: "Seattle Clinic", address: "1201 Third Ave", city: "Seattle", state: "WA", zip: "98101", employeeCount: 11, isPrimary: false },
      { name: "Phoenix Clinic", address: "640 N 1st Ave", city: "Phoenix", state: "AZ", zip: "85003", employeeCount: 9, isPrimary: false },
    ],
    openIncidents: 4,
    overdueTraining: 12,
    missingDocs: 2,
  },
  {
    email: "admin@summitmunicipal.com",
    password: "demo-password-2026",
    businessName: "Summit Municipal Services",
    phone: "(909) 555-0215",
    vertical: "municipal",
    plan: "professional",
    complianceScore: 95,
    riskLevel: "low",
    status: "active",
    stripeCustomerId: "cus_demo_summit_muni",
    partnerEmail: null,
    createdAt: "2025-09-05T08:00:00Z",
    updatedAt: "2026-04-17T11:00:00Z",
    sites: [
      { name: "Ontario Operations", address: "303 East B St", city: "Ontario", state: "CA", zip: "91764", employeeCount: 28, isPrimary: true },
    ],
    openIncidents: 0,
    overdueTraining: 1,
    missingDocs: 0,
  },
  {
    email: "admin@goldenstatehospitality.com",
    password: "demo-password-2026",
    businessName: "Golden State Hospitality",
    phone: "(415) 555-0376",
    vertical: "hospitality",
    plan: "core",
    complianceScore: 68,
    riskLevel: "high",
    status: "active",
    stripeCustomerId: "cus_demo_golden_state",
    partnerEmail: "sarah@compliancefirst.io",
    createdAt: "2026-02-01T08:00:00Z",
    updatedAt: "2026-04-12T16:00:00Z",
    sites: [
      { name: "Downtown SF Location", address: "500 Market St", city: "San Francisco", state: "CA", zip: "94105", employeeCount: 16, isPrimary: true },
      { name: "Mission District", address: "2800 Mission St", city: "San Francisco", state: "CA", zip: "94110", employeeCount: 14, isPrimary: false },
    ],
    openIncidents: 5,
    overdueTraining: 18,
    missingDocs: 3,
  },
  {
    email: "admin@lonestarbuilders.com",
    password: "demo-password-2026",
    businessName: "Lone Star Builders",
    phone: "(512) 555-0491",
    vertical: "construction",
    plan: "trial",
    complianceScore: 42,
    riskLevel: "high",
    status: "trial",
    stripeCustomerId: null,
    partnerEmail: null,
    createdAt: "2026-04-19T10:00:00Z", // yesterday
    updatedAt: "2026-04-19T10:00:00Z",
    sites: [
      { name: "Austin HQ", address: "1500 Barton Springs Rd", city: "Austin", state: "TX", zip: "78704", employeeCount: 8, isPrimary: true },
    ],
    openIncidents: 0,
    overdueTraining: 0,
    missingDocs: 8,
  },
  {
    email: "billing@riverdeltalogistics.com",
    password: "demo-password-2026",
    businessName: "River Delta Logistics",
    phone: "(916) 555-0632",
    vertical: "construction",
    plan: "professional",
    complianceScore: 81,
    riskLevel: "medium",
    status: "past-due",
    stripeCustomerId: "cus_demo_river_delta",
    partnerEmail: null,
    createdAt: "2025-12-01T08:00:00Z",
    updatedAt: "2026-04-13T08:00:00Z",
    sites: [
      { name: "Sacramento Depot", address: "2100 Arden Way", city: "Sacramento", state: "CA", zip: "95825", employeeCount: 22, isPrimary: true },
    ],
    openIncidents: 1,
    overdueTraining: 2,
    missingDocs: 0,
  },
]

const DEMO_TEAM_USERS: DemoTeamUser[] = [
  {
    ownerEmail: "admin@sierraridgebuilders.com",
    email: "manager@sierraridgebuilders.com",
    password: "demo-password-2026",
    fullName: "Elena Vasquez",
    role: "compliance_manager",
  },
  {
    ownerEmail: "admin@sierraridgebuilders.com",
    email: "field@sierraridgebuilders.com",
    password: "demo-password-2026",
    fullName: "Marcus Reyes",
    role: "field_lead",
  },
  {
    ownerEmail: "admin@sierraridgebuilders.com",
    email: "auditor@sierraridgebuilders.com",
    password: "demo-password-2026",
    fullName: "Dana Okafor",
    role: "auditor",
  },
]

const DEMO_PARTNERS: DemoPartner[] = [
  {
    email: "sarah@compliancefirst.io",
    password: "demo-password-2026",
    companyName: "ComplianceFirst Consulting",
    contactName: "Sarah Whitfield",
    phone: "(650) 555-0728",
    tier: "enterprise",
    status: "approved",
    branding: { primary_color: "#0F4C5C", logo_url: "https://storage.protekon.com/partners/compliancefirst-logo.png" },
    managedClientEmails: ["admin@goldenstatehospitality.com"],
    assessments: [
      {
        prospectName: "Blue Ridge Manufacturing",
        prospectEmail: "jlee@blueridgemanufacturing.com",
        score: 58,
        scoreTier: "at-risk",
        gaps: ["SB 553 WVPP missing", "Heat illness plan outdated", "Training records incomplete"],
        fineLow: 15000,
        fineHigh: 45000,
        status: "completed",
        sentAt: "2026-03-15T10:00:00Z",
        completedAt: "2026-03-18T14:00:00Z",
      },
      {
        prospectName: "North Shore Medical",
        prospectEmail: "admin@northshoremedical.com",
        score: 72,
        scoreTier: "moderate",
        gaps: ["HIPAA risk assessment overdue", "2 BAA agreements missing"],
        fineLow: 8000,
        fineHigh: 25000,
        status: "converted",
        sentAt: "2026-02-20T10:00:00Z",
        completedAt: "2026-02-28T16:00:00Z",
      },
      {
        prospectName: "Coastline Restaurants LLC",
        prospectEmail: "ops@coastlinerests.com",
        status: "sent",
        sentAt: "2026-04-10T09:00:00Z",
      },
    ],
  },
  {
    email: "hello@safeguardadvisors.com",
    password: "demo-password-2026",
    companyName: "Safeguard Advisors",
    contactName: "James Chen",
    phone: "(213) 555-0954",
    tier: "professional",
    status: "approved",
    branding: { primary_color: "#B91C1C" },
    managedClientEmails: [],
    assessments: [
      {
        prospectName: "Mountain View Construction",
        prospectEmail: "info@mvconstruction.com",
        status: "pending",
      },
    ],
  },
  {
    email: "contact@complianceessentials.co",
    password: "demo-password-2026",
    companyName: "Compliance Essentials Co",
    contactName: "Priya Patel",
    phone: "(408) 555-0412",
    tier: "essentials",
    status: "approved",
    branding: {},
    managedClientEmails: [],
    assessments: [],
  },
  {
    email: "intro@partnerprospect.io",
    password: "demo-password-2026",
    companyName: "PartnerProspect Advisory",
    contactName: "Tomás Delgado",
    phone: "(619) 555-0220",
    tier: "free",
    status: "pending",
    branding: {},
    managedClientEmails: [],
    assessments: [],
  },
]

const ALL_DEMO_EMAILS = [
  ...DEMO_ORGS.map((o) => o.email),
  ...DEMO_TEAM_USERS.map((u) => u.email),
  ...DEMO_PARTNERS.map((p) => p.email),
]

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

async function execSql(sql: string): Promise<void> {
  // Supabase-js doesn't expose raw SQL; we use the admin RPC pattern.
  // This project has no rpc("exec_sql"); we'll fall back to PostgREST
  // by invoking a tiny RPC if available, else throw a hint.
  const { error } = await admin.rpc("exec_sql" as never, { sql } as never)
  if (error) {
    throw new Error(`exec_sql failed: ${error.message}\n\nHINT: add an exec_sql rpc or run this SQL via psql: ${sql}`)
  }
}

async function disableIncidentDeleteGuard(): Promise<void> {
  // Migration 045 installs a DELETE trigger on incidents that blocks deletes
  // during the 5-year retention window. We disable it for seeding.
  try {
    await execSql("ALTER TABLE incidents DISABLE TRIGGER incidents_guard_delete;")
    console.log("   🔓 Disabled incidents retention guard for cleanup")
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn(`   ⚠️  Could not disable incidents retention guard: ${msg}`)
    console.warn("      Cleanup may fail on incidents — run this SQL manually if needed:")
    console.warn("      ALTER TABLE incidents DISABLE TRIGGER incidents_guard_delete;")
  }
}

async function enableIncidentDeleteGuard(): Promise<void> {
  try {
    await execSql("ALTER TABLE incidents ENABLE TRIGGER incidents_guard_delete;")
    console.log("   🔒 Re-enabled incidents retention guard")
  } catch {
    // non-fatal
  }
}

async function ensureAuthUser(
  email: string,
  password: string,
  metadata: Record<string, unknown>
): Promise<string> {
  // List + delete any existing user with this email so re-runs are clean.
  const { data: existing } = await admin.auth.admin.listUsers({ perPage: 1000 })
  const existingUser = existing?.users?.find((u) => u.email === email)
  if (existingUser) {
    await admin.auth.admin.deleteUser(existingUser.id)
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata,
  })

  if (error || !data.user) {
    throw new Error(`Auth user create failed for ${email}: ${error?.message ?? "unknown"}`)
  }
  return data.user.id
}

// ──────────────────────────────────────────────────────────────────────────────
// Cleanup
// ──────────────────────────────────────────────────────────────────────────────

async function cleanAll(): Promise<void> {
  console.log("🧹 Cleaning prior demo data...")

  // 1. Find current demo client IDs (if any) so we can cascade-delete.
  //    Most tables have ON DELETE CASCADE from clients(id), so nuking the
  //    clients row takes the dependent rows with it.
  const { data: existingClients } = await admin
    .from("clients")
    .select("id, email")
    .in("email", DEMO_ORGS.map((o) => o.email))

  const clientIds = (existingClients ?? []).map((c) => c.id as string)

  if (clientIds.length > 0) {
    console.log(`   Found ${clientIds.length} existing demo clients`)

    // Shared / partner tables aren't cascade-linked — delete explicitly.
    await admin.from("user_roles").delete().in("client_id", clientIds)
    await admin.from("team_invite_tokens").delete().in("client_id", clientIds)
    await admin.from("partner_clients").delete().in("client_id", clientIds)
    await admin.from("integrations").delete().in("client_id", clientIds)

    // Cascade via clients delete
    const { error } = await admin.from("clients").delete().in("id", clientIds)
    if (error) {
      console.error(`   ⚠️  Cascade delete from clients failed: ${error.message}`)
    }
  }

  // 2. Delete partner-side records not covered by cascade.
  await admin.from("partner_assessments").delete().in(
    "prospect_email",
    DEMO_PARTNERS.flatMap((p) => p.assessments.map((a) => a.prospectEmail))
  )
  const partnerEmails = DEMO_PARTNERS.map((p) => p.email)
  const { data: partnerProfiles } = await admin
    .from("partner_profiles")
    .select("id")
    .in("email", partnerEmails)
  const partnerProfileIds = (partnerProfiles ?? []).map((p) => p.id as string)
  if (partnerProfileIds.length > 0) {
    await admin.from("partner_clients").delete().in("partner_id", partnerProfileIds)
    await admin.from("partner_assessments").delete().in("partner_id", partnerProfileIds)
    await admin.from("partner_profiles").delete().in("id", partnerProfileIds)
  }

  // 3. Intake submissions + sample leads tagged by email
  await admin
    .from("intake_submissions")
    .delete()
    .in("email", DEMO_ORGS.map((o) => o.email))

  // 4. Auth users — delete by email for a clean reset.
  const { data: existingAuth } = await admin.auth.admin.listUsers({ perPage: 1000 })
  const toDelete = (existingAuth?.users ?? []).filter((u) =>
    u.email ? ALL_DEMO_EMAILS.includes(u.email) : false
  )
  for (const u of toDelete) {
    await admin.auth.admin.deleteUser(u.id)
  }
  if (toDelete.length > 0) {
    console.log(`   Deleted ${toDelete.length} existing auth users`)
  }

  console.log("   ✅ Clean")
}

// ──────────────────────────────────────────────────────────────────────────────
// Phase A — Auth users
// ──────────────────────────────────────────────────────────────────────────────

interface AuthContext {
  orgUserIds: Map<string, string> // email -> user_id (= client_id)
  teamUserIds: Map<string, string> // email -> user_id
  partnerUserIds: Map<string, string> // email -> user_id
}

async function createAuthUsers(): Promise<AuthContext> {
  console.log("🔑 Creating auth users...")
  const orgUserIds = new Map<string, string>()
  const teamUserIds = new Map<string, string>()
  const partnerUserIds = new Map<string, string>()

  for (const org of DEMO_ORGS) {
    const id = await ensureAuthUser(org.email, org.password, {
      business_name: org.businessName,
      vertical: org.vertical,
      plan: org.plan,
    })
    orgUserIds.set(org.email, id)
    console.log(`   ✅ ${org.email} (${id.slice(0, 8)}…)`)
  }

  for (const u of DEMO_TEAM_USERS) {
    const id = await ensureAuthUser(u.email, u.password, {
      full_name: u.fullName,
      role: u.role,
    })
    teamUserIds.set(u.email, id)
    console.log(`   ✅ ${u.email} → ${u.role}`)
  }

  for (const p of DEMO_PARTNERS) {
    const id = await ensureAuthUser(p.email, p.password, {
      company_name: p.companyName,
      contact_name: p.contactName,
      partner_tier: p.tier,
    })
    partnerUserIds.set(p.email, id)
    console.log(`   ✅ ${p.email} → partner/${p.tier}`)
  }

  return { orgUserIds, teamUserIds, partnerUserIds }
}

// ──────────────────────────────────────────────────────────────────────────────
// Phase B — Clients, partners, user_roles, sites
// ──────────────────────────────────────────────────────────────────────────────

async function seedClients(ctx: AuthContext, partnerIdByEmail: Map<string, string>): Promise<void> {
  console.log("👤 Seeding clients...")

  const rows = DEMO_ORGS.map((org) => ({
    id: ctx.orgUserIds.get(org.email)!,
    email: org.email,
    business_name: org.businessName,
    phone: org.phone,
    vertical: org.vertical,
    plan: org.plan,
    compliance_score: org.complianceScore,
    risk_level: org.riskLevel,
    status: org.status,
    stripe_customer_id: org.stripeCustomerId,
    partner_id: org.partnerEmail ? partnerIdByEmail.get(org.partnerEmail) ?? null : null,
    created_at: org.createdAt,
    updated_at: org.updatedAt,
  }))

  const { error } = await admin.from("clients").insert(rows)
  if (error) throw new Error(`Clients insert failed: ${error.message}`)
  console.log(`   ✅ ${rows.length} clients`)
}

async function seedPartnerProfiles(ctx: AuthContext): Promise<Map<string, string>> {
  console.log("🤝 Seeding partner profiles...")

  const rows = DEMO_PARTNERS.map((p) => ({
    user_id: ctx.partnerUserIds.get(p.email)!,
    company_name: p.companyName,
    contact_name: p.contactName,
    email: p.email,
    phone: p.phone,
    tier: p.tier,
    branding: p.branding,
    status: p.status,
  }))

  const { data, error } = await admin.from("partner_profiles").insert(rows).select("id, email")
  if (error) throw new Error(`Partner profiles insert failed: ${error.message}`)

  const idByEmail = new Map<string, string>()
  for (const r of data ?? []) idByEmail.set(r.email as string, r.id as string)
  console.log(`   ✅ ${rows.length} partner profiles`)
  return idByEmail
}

async function seedUserRoles(ctx: AuthContext): Promise<void> {
  console.log("🛡️  Seeding user_roles (RBAC)...")

  // Each org owner is already seeded via migration 047's backfill.
  // We only need to add team users.
  const teamRows = DEMO_TEAM_USERS.map((u) => {
    const clientId = ctx.orgUserIds.get(u.ownerEmail)
    const userId = ctx.teamUserIds.get(u.email)
    if (!clientId || !userId) {
      throw new Error(`Missing auth id for team user ${u.email}`)
    }
    return {
      user_id: userId,
      client_id: clientId,
      role: u.role,
      invited_by: clientId, // the owner
      activated_at: new Date().toISOString(),
    }
  })

  // Upsert so re-runs work (owner backfill from migration 047 may race).
  const { error: teamErr } = await admin
    .from("user_roles")
    .upsert(teamRows, { onConflict: "user_id,client_id" })
  if (teamErr) throw new Error(`Team user_roles insert failed: ${teamErr.message}`)

  // Ensure owner rows exist (belt-and-suspenders; migration 047 seeds them,
  // but running against a fresh branch before migrations ran should still work).
  const ownerRows = DEMO_ORGS.map((org) => {
    const id = ctx.orgUserIds.get(org.email)!
    return {
      user_id: id,
      client_id: id,
      role: "owner" as const,
      activated_at: new Date().toISOString(),
    }
  })
  const { error: ownerErr } = await admin
    .from("user_roles")
    .upsert(ownerRows, { onConflict: "user_id,client_id" })
  if (ownerErr) throw new Error(`Owner user_roles upsert failed: ${ownerErr.message}`)

  console.log(`   ✅ ${ownerRows.length} owners + ${teamRows.length} team members`)
}

async function seedSites(ctx: AuthContext): Promise<Map<string, Map<string, string>>> {
  console.log("🏢 Seeding sites...")

  const siteIdByOrgSite = new Map<string, Map<string, string>>() // orgEmail -> siteName -> siteId
  let total = 0

  for (const org of DEMO_ORGS) {
    const clientId = ctx.orgUserIds.get(org.email)!
    const rows = org.sites.map((s) => ({
      client_id: clientId,
      name: s.name,
      address: s.address,
      city: s.city,
      state: s.state,
      zip: s.zip,
      employee_count: s.employeeCount,
      is_primary: s.isPrimary,
    }))

    const { data, error } = await admin.from("sites").insert(rows).select("id, name")
    if (error) throw new Error(`Sites insert failed for ${org.email}: ${error.message}`)

    const innerMap = new Map<string, string>()
    for (const r of data ?? []) innerMap.set(r.name as string, r.id as string)
    siteIdByOrgSite.set(org.email, innerMap)
    total += rows.length
  }

  console.log(`   ✅ ${total} sites across ${DEMO_ORGS.length} orgs`)
  return siteIdByOrgSite
}

async function seedPartnerClients(
  ctx: AuthContext,
  partnerIdByEmail: Map<string, string>
): Promise<void> {
  console.log("🤝 Seeding partner_clients...")

  const rows: Array<{
    partner_id: string
    client_id: string
    monthly_revenue: number
    status: "active" | "suspended" | "churned"
  }> = []

  for (const p of DEMO_PARTNERS) {
    const partnerId = partnerIdByEmail.get(p.email)
    if (!partnerId) continue
    for (const managedEmail of p.managedClientEmails) {
      const clientId = ctx.orgUserIds.get(managedEmail)
      if (!clientId) continue
      rows.push({
        partner_id: partnerId,
        client_id: clientId,
        monthly_revenue: 297,
        status: "active",
      })
    }
  }

  if (rows.length === 0) {
    console.log("   (no partner_clients rows to insert)")
    return
  }

  const { error } = await admin.from("partner_clients").insert(rows)
  if (error) throw new Error(`partner_clients insert failed: ${error.message}`)
  console.log(`   ✅ ${rows.length} partner-client links`)
}

async function seedPartnerAssessments(partnerIdByEmail: Map<string, string>): Promise<void> {
  console.log("📋 Seeding partner_assessments...")

  const rows: Array<Record<string, unknown>> = []
  for (const p of DEMO_PARTNERS) {
    const partnerId = partnerIdByEmail.get(p.email)
    if (!partnerId) continue
    for (const a of p.assessments) {
      rows.push({
        partner_id: partnerId,
        prospect_name: a.prospectName,
        prospect_email: a.prospectEmail,
        score: a.score ?? null,
        score_tier: a.scoreTier ?? null,
        gaps: a.gaps ?? null,
        fine_low: a.fineLow ?? null,
        fine_high: a.fineHigh ?? null,
        status: a.status,
        sent_at: a.sentAt ?? null,
        completed_at: a.completedAt ?? null,
      })
    }
  }

  if (rows.length === 0) {
    console.log("   (no assessments to insert)")
    return
  }

  const { error } = await admin.from("partner_assessments").insert(rows)
  if (error) throw new Error(`partner_assessments insert failed: ${error.message}`)
  console.log(`   ✅ ${rows.length} assessments`)
}

// ──────────────────────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log("\n🌱 Protekon Demo Seed v2\n")

  await disableIncidentDeleteGuard()
  try {
    await cleanAll()

    const ctx = await createAuthUsers()
    const partnerIdByEmail = await seedPartnerProfiles(ctx)
    await seedClients(ctx, partnerIdByEmail)
    await seedUserRoles(ctx)
    const siteIdByOrgSite = await seedSites(ctx)
    await seedPartnerClients(ctx, partnerIdByEmail)
    await seedPartnerAssessments(partnerIdByEmail)

    // TODO (next turn): vertical-specific seeders
    //   - incidents, documents, audits, training_records (all orgs)
    //   - construction_subs, projects, project_subs, sub_safety_programs,
    //     vendor_payments (construction orgs)
    //   - phi_assets, baa_agreements (healthcare org)
    //   - property_portfolio (property org)
    //   - poster_compliance, acknowledgment_requests, integrations
    //   - regulatory_updates, municipal_ordinances
    //   - audit_log, intake_submissions

    // Silence unused-var lint for now — siteIdByOrgSite is wired into Turn 2 seeders.
    void siteIdByOrgSite

    console.log("\n✅ Seed Phase A complete (auth + clients + RBAC + sites + partners)")
    console.log("   Next: run Phase B for vertical-specific tables.")
    console.log("\n🔑 Logins:")
    for (const org of DEMO_ORGS) {
      console.log(`   ${org.email.padEnd(42)} / ${org.password}  [${org.vertical}/${org.plan}/${org.status}]`)
    }
    for (const u of DEMO_TEAM_USERS) {
      console.log(`   ${u.email.padEnd(42)} / ${u.password}  [team/${u.role}]`)
    }
    for (const p of DEMO_PARTNERS) {
      console.log(`   ${p.email.padEnd(42)} / ${p.password}  [partner/${p.tier}]`)
    }
  } finally {
    await enableIncidentDeleteGuard()
  }
}

main().catch((err) => {
  console.error("\n❌ Seed failed:", err)
  process.exit(1)
})
