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

  // 4. Regulatory updates are NOT cascaded from clients (they're public).
  //    Delete our [DEMO]-prefixed rows explicitly.
  await admin.from("regulatory_updates").delete().like("title", "[DEMO]%")

  // 5. Auth users — delete by email for a clean reset.
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
// Phase B — vertical tables, logs, intake, partner commissions
// ──────────────────────────────────────────────────────────────────────────────

// ID generators matching the format used in lib/actions/incidents.ts + lib/actions/documents.ts.
// Collision-safe 5-char suffix; safe for seed volume (< 10 rows per namespace).
function makeCodeId(prefix: "INC" | "DOC"): string {
  const year = new Date().getFullYear()
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // no 0/O/1/I
  let suffix = ""
  for (let i = 0; i < 5; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)]
  }
  return `${prefix}-${year}-${suffix}`
}

async function seedDocumentTemplates(): Promise<number> {
  console.log("📄 Seeding document_template_meta (WVPP for construction)...")

  // Idempotent: skip if template_key already present.
  const { data: existing, error: selErr } = await admin
    .from("document_template_meta")
    .select("template_key")
    .eq("template_key", "wvpp_construction")
    .maybeSingle()
  if (selErr) throw new Error(`seedDocumentTemplates: select failed: ${selErr.message}`)

  if (existing) {
    console.log("   ↷ wvpp_construction already present — skipping")
    return 0
  }

  const row = {
    template_key: "wvpp_construction",
    display_name: "Workplace Violence Prevention Plan (Construction)",
    category: "vertical_specific" as const,
    applicable_verticals: ["construction"],
    legal_authority: "CA SB 553 — Labor Code § 6401.9",
    retention_years: 5,
    review_frequency: "annual" as const,
    is_active: true,
  }

  const { error } = await admin.from("document_template_meta").insert(row)
  if (error) throw new Error(`seedDocumentTemplates: insert failed: ${error.message}`)
  console.log("   ✅ 1 row (wvpp_construction)")
  return 1
}

async function seedDocuments(ctx: AuthContext): Promise<void> {
  console.log("📑 Seeding documents...")

  const sierraId = ctx.orgUserIds.get("admin@sierraridgebuilders.com")
  if (!sierraId) {
    throw new Error("seedDocuments: missing client id for Sierra Ridge")
  }

  // Sierra Ridge (construction): 3 docs for demo.
  const rows = [
    {
      client_id: sierraId,
      document_id: makeCodeId("DOC"),
      type: "wvpp",
      filename: "Workplace Violence Prevention Plan.pdf",
      status: "draft",
      priority: "standard",
      pages: 18,
    },
    {
      client_id: sierraId,
      document_id: makeCodeId("DOC"),
      type: "safety_meeting_minutes",
      filename: "Safety Meeting Minutes — April 2026.pdf",
      status: "completed",
      priority: "standard",
      pages: 4,
    },
    {
      client_id: sierraId,
      document_id: makeCodeId("DOC"),
      type: "coi",
      filename: "Certificate of Insurance — ACME Framing.pdf",
      status: "completed",
      priority: "standard",
      pages: 2,
    },
  ]

  const { error } = await admin.from("documents").insert(rows)
  if (error) throw new Error(`seedDocuments: insert failed: ${error.message}`)

  console.log(`   ✅ ${rows.length} documents (Sierra Ridge)`)
}

async function seedIncidents(ctx: AuthContext): Promise<void> {
  console.log("🚨 Seeding incidents...")

  const sierraId = ctx.orgUserIds.get("admin@sierraridgebuilders.com")
  const goldenId = ctx.orgUserIds.get("admin@goldenstatehospitality.com")
  const fieldLeadUserId = ctx.teamUserIds.get("field@sierraridgebuilders.com")
  if (!sierraId || !goldenId || !fieldLeadUserId) {
    throw new Error("seedIncidents: missing client/team ids")
  }

  const now = new Date()
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 3600 * 1000)
  const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 3600 * 1000)

  // Real prod incidents schema: id, client_id, incident_id, description,
  // location, incident_date, severity, follow_up_id, created_at, metadata, site_id.
  // Everything else (status, reported_at, reported_by, type) lives in metadata.
  const rows = [
    {
      client_id: sierraId,
      incident_id: makeCodeId("INC"),
      description:
        "Near-miss: unsecured scaffold plank shifted when a worker stepped on it. No contact, no injury. Plank was re-pinned immediately and pre-shift inspection checklist updated.",
      location: "Riverside HQ — 3rd floor exterior scaffold",
      incident_date: fiveDaysAgo.toISOString().slice(0, 10),
      severity: "near-miss",
      metadata: {
        status: "submitted",
        type: "near_miss",
        reported_at: fiveDaysAgo.toISOString(),
        reported_by_user_id: fieldLeadUserId,
        assigned_to_client_id: sierraId,
        injuryOccurred: false,
        medicalTreatment: false,
      },
    },
    {
      client_id: goldenId,
      incident_id: makeCodeId("INC"),
      description:
        "SB 553 Type 2 workplace violence: guest became verbally aggressive toward front-desk staff after being asked to leave the lobby. Police were called; no physical contact.",
      location: "Downtown SF Location — front desk",
      incident_date: tenDaysAgo.toISOString().slice(0, 10),
      severity: "type_2_wvp",
      metadata: {
        status: "open",
        type: "workplace_violence",
        wvp_type: 2,
        reported_at: tenDaysAgo.toISOString(),
        injuryOccurred: false,
        medicalTreatment: false,
      },
    },
  ]

  const { error } = await admin.from("incidents").insert(rows)
  if (error) throw new Error(`seedIncidents: insert failed: ${error.message}`)
  console.log(`   ✅ ${rows.length} incidents (Sierra Ridge near-miss + Golden State WVP)`)
}

async function seedTrainingRecords(ctx: AuthContext): Promise<void> {
  console.log("🎓 Seeding training_records...")

  const coastalId = ctx.orgUserIds.get("admin@coastalhealthgroup.com")
  if (!coastalId) throw new Error("seedTrainingRecords: missing Coastal Health client id")

  const dueDate = new Date()
  dueDate.setMonth(dueDate.getMonth() + 1)

  const rows = [
    {
      client_id: coastalId,
      employee_name: "Dr. Lena Ortiz",
      training_type: "HIPAA Annual Refresher",
      due_date: dueDate.toISOString().slice(0, 10),
      status: "pending",
    },
  ]

  const { error } = await admin.from("training_records").insert(rows)
  if (error) throw new Error(`seedTrainingRecords: insert failed: ${error.message}`)
  console.log(`   ✅ ${rows.length} training record (Coastal HIPAA annual)`)
}

async function seedBaaAgreements(ctx: AuthContext): Promise<void> {
  console.log("📝 Seeding baa_agreements...")

  const coastalId = ctx.orgUserIds.get("admin@coastalhealthgroup.com")
  if (!coastalId) throw new Error("seedBaaAgreements: missing Coastal Health client id")

  const rows = [
    {
      client_id: coastalId,
      vendor_name: "CloudChart EMR Services",
      service_type: "EMR Hosting",
      phi_types: ["clinical_notes", "billing"],
      baa_status: "remediation_required",
      signed_date: "2023-07-15",
      expiration_date: "2026-07-14",
    },
  ]

  const { error } = await admin.from("baa_agreements").insert(rows)
  if (error) throw new Error(`seedBaaAgreements: insert failed: ${error.message}`)
  console.log(`   ✅ ${rows.length} BAA (Coastal vendor, remediation_required)`)
}

async function seedRegulatoryUpdates(): Promise<string> {
  console.log("📢 Seeding regulatory_updates...")

  // No unique constraint on this table — pre-delete our [DEMO] rows so
  // re-runs don't accumulate duplicates.
  await admin.from("regulatory_updates").delete().like("title", "[DEMO]%")

  const row = {
    jurisdiction: "Federal",
    category: "municipal",
    title: "[DEMO] OSHA Hearing Conservation Amendment — Municipal Operations",
    summary:
      "OSHA finalized an amendment to 29 CFR 1910.95 tightening noise-exposure action levels for municipal public-works crews. Affected employers must update their hearing conservation programs and deliver refresher training within 90 days.",
    effective_date: "2026-06-01",
    source_url: "https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.95",
    severity: "high",
  }

  const { data, error } = await admin
    .from("regulatory_updates")
    .insert(row)
    .select("id")
    .single()
  if (error || !data) {
    throw new Error(`seedRegulatoryUpdates: insert failed: ${error?.message ?? "no row returned"}`)
  }
  console.log("   ✅ 1 regulatory update ([DEMO] OSHA hearing conservation)")
  return data.id as string
}

// TODO(phase-b): acknowledgment_requests table does not exist in prod public
// schema (0 columns found via information_schema.columns on yfkledwhwsembikpjynu).
// Scenario #6 (Summit hearing-conservation sign-off) is manual for now.
// Left unused for future wiring once the table lands.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function seedAcknowledgmentRequests(
  _ctx: AuthContext,
  _regulatoryUpdateId: string
): Promise<void> {
  console.log("↷  Skipping acknowledgment_requests — table missing in prod schema (scenario #6 manual)")
}

async function seedIntakeSubmissions(): Promise<void> {
  console.log("📥 Seeding intake_submissions...")

  const rows = [
    {
      email: "admin@lonestarbuilders.com",
      business_name: "Lone Star Builders",
      vertical: "construction",
      answers: {
        employee_count: 8,
        has_wvpp: false,
        has_heat_plan: false,
        subs_count: 3,
      },
      compliance_score: 42,
      risk_level: "high",
      status: "pending",
    },
  ]

  const { error } = await admin.from("intake_submissions").insert(rows)
  if (error) throw new Error(`seedIntakeSubmissions: insert failed: ${error.message}`)
  console.log(`   ✅ ${rows.length} intake submission (Lone Star)`)
}

async function seedAuditLog(ctx: AuthContext): Promise<void> {
  console.log("📜 Seeding audit_log...")

  const sierraId = ctx.orgUserIds.get("admin@sierraridgebuilders.com")
  const auditorId = ctx.teamUserIds.get("auditor@sierraridgebuilders.com")
  if (!sierraId || !auditorId) throw new Error("seedAuditLog: missing Sierra Ridge ids")

  const now = Date.now()
  const daysAgo = (n: number) => new Date(now - n * 24 * 3600 * 1000).toISOString()

  const rows = [
    {
      client_id: sierraId,
      event_type: "user.login",
      description: "Owner logged in from Riverside HQ",
      metadata: { user_id: sierraId, ip_hint: "CA" },
      created_at: daysAgo(28),
    },
    {
      client_id: sierraId,
      event_type: "document.created",
      description: "Drafted Workplace Violence Prevention Plan",
      metadata: { user_id: sierraId, document_type: "wvpp" },
      created_at: daysAgo(22),
    },
    {
      client_id: sierraId,
      event_type: "incident.reported",
      description: "Field lead logged near-miss on Riverside scaffold",
      metadata: { user_id: ctx.teamUserIds.get("field@sierraridgebuilders.com") ?? sierraId },
      created_at: daysAgo(14),
    },
    {
      client_id: sierraId,
      event_type: "audit.exported",
      description: "Auditor exported Q1 compliance audit PDF",
      metadata: { user_id: auditorId, format: "pdf" },
      created_at: daysAgo(7),
    },
    {
      client_id: sierraId,
      event_type: "training.assigned",
      description: "Assigned Heat Illness Prevention refresher to 12 employees",
      metadata: { user_id: sierraId, employee_count: 12 },
      created_at: daysAgo(2),
    },
  ]

  const { error } = await admin.from("audit_log").insert(rows)
  if (error) throw new Error(`seedAuditLog: insert failed: ${error.message}`)
  console.log(`   ✅ ${rows.length} audit log rows (Sierra Ridge, last 30 days)`)
}

async function seedActionItems(ctx: AuthContext): Promise<void> {
  console.log("✅ Seeding action_items...")

  const pacificId = ctx.orgUserIds.get("admin@pacificcoastproperty.com")
  if (!pacificId) throw new Error("seedActionItems: missing Pacific Coast client id")

  const rows = [
    {
      client_id: pacificId,
      action_type: "general",
      title: "Quarterly property walkthrough scheduled",
      description:
        "Baseline action item for the Santa Monica Office. Use for tracking the Q2 walkthrough prep tasks.",
      status: "open",
      created_by: pacificId,
    },
  ]

  const { error } = await admin.from("action_items").insert(rows)
  if (error) throw new Error(`seedActionItems: insert failed: ${error.message}`)
  console.log(`   ✅ ${rows.length} action item (Pacific Coast baseline)`)
}

async function seedPartnerCommissions(
  partnerIdByEmail: Map<string, string>
): Promise<void> {
  console.log("💰 Seeding partner_commissions...")

  const safeguardId = partnerIdByEmail.get("hello@safeguardadvisors.com")
  if (!safeguardId) throw new Error("seedPartnerCommissions: missing Safeguard partner id")

  // Month-boundary helpers relative to now.
  const now = new Date()
  const monthStart = (offset: number): Date => {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1)
    return d
  }
  const monthEnd = (offset: number): Date => {
    const d = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0)
    return d
  }
  const iso = (d: Date): string => d.toISOString().slice(0, 10)

  // Period offsets: -3, -2, -1 (three complete months prior).
  const rows = [
    {
      partner_id: safeguardId,
      period_start: iso(monthStart(-3)),
      period_end: iso(monthEnd(-3)),
      amount_cents: 50000,
      currency: "usd",
      status: "paid",
      paid_at: monthEnd(-3).toISOString(),
      notes: "Demo: 2 active referrals",
    },
    {
      partner_id: safeguardId,
      period_start: iso(monthStart(-2)),
      period_end: iso(monthEnd(-2)),
      amount_cents: 75000,
      currency: "usd",
      status: "paid",
      paid_at: monthEnd(-2).toISOString(),
      notes: "Demo: 3 active referrals",
    },
    {
      partner_id: safeguardId,
      period_start: iso(monthStart(-1)),
      period_end: iso(monthEnd(-1)),
      amount_cents: 50000,
      currency: "usd",
      status: "pending",
      notes: "Demo: awaiting month-end close",
    },
  ]

  const { error } = await admin.from("partner_commissions").insert(rows)
  if (error) throw new Error(`seedPartnerCommissions: insert failed: ${error.message}`)
  console.log(`   ✅ ${rows.length} commission rows (Safeguard, 2 paid + 1 pending)`)
}

// ──────────────────────────────────────────────────────────────────────────────
// Phase C — Vertical showcase
//
// Fills the canonical resource tables (assets / permits / materials /
// inspections / findings / team_members / credentials / third_parties) plus
// construction-family extras (subs, safety programs, vendor payments,
// projects) so every demo login renders meaningful tile counts and drill-down
// rows. Each table insert is wrapped in `safeInsert` — column drift logs a
// warning rather than aborting the whole seed.
// ──────────────────────────────────────────────────────────────────────────────

const daysFromNow = (n: number): string => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

const tsFromNow = (n: number): string => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString()
}

async function safeInsert(
  table: string,
  rows: Record<string, unknown>[]
): Promise<Array<{ id: string }> | null> {
  if (rows.length === 0) return []
  const { data, error } = await admin.from(table).insert(rows).select("id")
  if (error) {
    console.warn(`   ⚠️  ${table}: ${error.message} (${rows.length} rows skipped)`)
    return null
  }
  return (data as Array<{ id: string }> | null) ?? []
}

interface ShowcaseSpec {
  team: Array<{
    full_name: string
    role: string
    is_supervisor?: boolean
    email?: string
    start_date?: string
  }>
  credentials: Array<{
    credential_type: string
    issuing_authority: string
    credential_number?: string
    issued_date?: string
    expires_date: string
    status: "active" | "expired" | "expiring"
    holderIndex: number
  }>
  assets: Array<{
    asset_name: string
    asset_type: string
    manufacturer?: string
    model?: string
    serial_number?: string
    last_inspected_at?: string
    next_inspection_due: string
    certification_status: "certified" | "due" | "overdue" | "out_of_service"
  }>
  permits: Array<{
    permit_name: string
    permit_number?: string
    issuing_agency: string
    issued_date?: string
    expires_date: string
    status: "active" | "expired"
    renewal_window_days?: number
  }>
  materials: Array<{
    material_name: string
    material_type: string
    quantity_on_hand?: number
    storage_location?: string
    sds_url?: string
    last_inventory_at?: string
    vertical_data?: Record<string, unknown>
  }>
  inspections: Array<{
    inspection_type: string
    scheduled_date: string
    status: "scheduled" | "completed" | "overdue"
    outcome?: "pass" | "fail" | "citation"
  }>
  findings: Array<{
    source_type: "inspection" | "incident" | "internal_audit" | "protekon_audit" | "regulatory_notice"
    classification: "other_than_serious" | "serious" | "willful" | "informational"
    description: string
    citation_text?: string
    citation_standard?: string
    penalty_amount?: number
    abatement_due_date?: string
    abatement_status: "open" | "in_progress" | "abated"
  }>
  thirdParties: Array<{
    entity_name: string
    relationship_type: string
    license_number?: string
    license_status?: string
    coi_status?: string
    coi_expires_at?: string
    ein?: string
  }>
}

const SHOWCASE: Record<string, ShowcaseSpec> = {
  construction: {
    team: [
      { full_name: "Marcus Reyes", role: "Site Supervisor", is_supervisor: true, email: "marcus@sierraridgebuilders.com", start_date: "2023-04-12" },
      { full_name: "Elena Vasquez", role: "Compliance Manager", is_supervisor: true, email: "elena@sierraridgebuilders.com", start_date: "2022-09-01" },
      { full_name: "Diego Patel", role: "Foreman", start_date: "2024-02-19" },
    ],
    credentials: [
      { credential_type: "OSHA 30", issuing_authority: "OSHA", credential_number: "OSHA-30-887421", issued_date: "2024-08-12", expires_date: daysFromNow(380), status: "active", holderIndex: 0 },
      { credential_type: "First Aid / CPR", issuing_authority: "American Red Cross", expires_date: daysFromNow(20), status: "expiring", holderIndex: 1 },
      { credential_type: "Forklift Operator", issuing_authority: "OSHA 1910.178", expires_date: daysFromNow(-15), status: "expired", holderIndex: 2 },
    ],
    assets: [
      { asset_name: "Skytrak 10054 Telehandler", asset_type: "Heavy equipment", manufacturer: "JLG", model: "Skytrak 10054", serial_number: "B021154", last_inspected_at: tsFromNow(-12), next_inspection_due: daysFromNow(80), certification_status: "certified" },
      { asset_name: "Generac XG10000E Generator", asset_type: "Power equipment", manufacturer: "Generac", model: "XG10000E", next_inspection_due: daysFromNow(8), certification_status: "due" },
      { asset_name: "Multiquip MQ80 Plate Compactor", asset_type: "Compaction", manufacturer: "Multiquip", next_inspection_due: daysFromNow(-22), certification_status: "overdue" },
    ],
    permits: [
      { permit_name: "Building Permit — Riverside HQ", permit_number: "BLD-2026-1183", issuing_agency: "City of Riverside", issued_date: "2025-11-10", expires_date: daysFromNow(220), status: "active", renewal_window_days: 60 },
      { permit_name: "Excavation / Trenching Permit", permit_number: "EXC-2026-091", issuing_agency: "Cal/OSHA", issued_date: "2026-01-05", expires_date: daysFromNow(45), status: "active", renewal_window_days: 30 },
    ],
    materials: [
      { material_name: "Diesel Fuel (#2 ULSD)", material_type: "Fuel", quantity_on_hand: 280, storage_location: "Riverside HQ — fuel cabinet B", sds_url: "https://demo.protekon.com/sds/diesel.pdf", last_inventory_at: tsFromNow(-9), vertical_data: { hazard_class: "Combustible Liquid", cas_number: "68476-34-6", container_type: "55-gal drum" } },
      { material_name: "Acetylene", material_type: "Compressed gas", quantity_on_hand: 4, storage_location: "Welding cage", last_inventory_at: tsFromNow(-2), vertical_data: { hazard_class: "Flammable Gas", cas_number: "74-86-2", container_type: "Cylinder" } },
    ],
    inspections: [
      { inspection_type: "Daily scaffold inspection", scheduled_date: daysFromNow(-1), status: "completed", outcome: "pass" },
      { inspection_type: "Weekly fall-protection audit", scheduled_date: daysFromNow(3), status: "scheduled" },
      { inspection_type: "Monthly fire-extinguisher check", scheduled_date: daysFromNow(-10), status: "overdue" },
    ],
    findings: [
      { source_type: "internal_audit", classification: "other_than_serious", description: "Two ladder-tags missing on east wing scaffolding. Remediated same day; weekly walk-throughs added.", abatement_due_date: daysFromNow(7), abatement_status: "in_progress" },
      { source_type: "protekon_audit", classification: "serious", description: "Heat illness training records older than 12 months for 3 crew members.", citation_text: "8 CCR §3395 — Heat Illness Prevention", citation_standard: "8 CCR §3395", penalty_amount: 0, abatement_due_date: daysFromNow(14), abatement_status: "open" },
    ],
    thirdParties: [
      { entity_name: "ACME Framing & Drywall", relationship_type: "Subcontractor", license_number: "CSLB-942711", license_status: "active", coi_status: "current", coi_expires_at: daysFromNow(180), ein: "84-1112233" },
      { entity_name: "Inland Empire Concrete Co", relationship_type: "Subcontractor", license_number: "CSLB-880124", license_status: "active", coi_status: "expired", coi_expires_at: daysFromNow(-12), ein: "84-3344112" },
    ],
  },
  property: {
    team: [
      { full_name: "Anika Joshi", role: "Property Manager", is_supervisor: true, email: "anika@pacificcoastproperty.com", start_date: "2022-03-04" },
      { full_name: "Robert Kim", role: "Building Engineer", start_date: "2023-07-15" },
    ],
    credentials: [
      { credential_type: "CPM (Certified Property Manager)", issuing_authority: "IREM", expires_date: daysFromNow(420), status: "active", holderIndex: 0 },
      { credential_type: "Universal EPA 608", issuing_authority: "EPA", expires_date: daysFromNow(-40), status: "expired", holderIndex: 1 },
    ],
    assets: [
      { asset_name: "Otis Gen2 Elevator (Bank A)", asset_type: "Elevator", manufacturer: "Otis", model: "Gen2", serial_number: "OT-883-A", last_inspected_at: tsFromNow(-25), next_inspection_due: daysFromNow(340), certification_status: "certified" },
      { asset_name: "Notifier NFS2-3030 Fire Panel", asset_type: "Life safety", manufacturer: "Notifier", model: "NFS2-3030", next_inspection_due: daysFromNow(12), certification_status: "due" },
      { asset_name: "Trane RTAC 130 Chiller", asset_type: "HVAC", manufacturer: "Trane", model: "RTAC 130", next_inspection_due: daysFromNow(-7), certification_status: "overdue" },
    ],
    permits: [
      { permit_name: "Annual Fire-Alarm Operating Permit", permit_number: "FAO-2026-0188", issuing_agency: "Santa Monica Fire Marshal", issued_date: "2026-01-01", expires_date: daysFromNow(330), status: "active", renewal_window_days: 30 },
      { permit_name: "Elevator Operating Certificate", permit_number: "EOC-441920", issuing_agency: "CA Dept of Industrial Relations", issued_date: "2025-09-15", expires_date: daysFromNow(60), status: "active", renewal_window_days: 60 },
    ],
    materials: [
      { material_name: "Cooling Tower Biocide", material_type: "Industrial chemical", quantity_on_hand: 30, storage_location: "Roof mechanical room", sds_url: "https://demo.protekon.com/sds/biocide.pdf", last_inventory_at: tsFromNow(-15), vertical_data: { hazard_class: "Corrosive", container_type: "5-gal pail" } },
    ],
    inspections: [
      { inspection_type: "Quarterly fire-alarm inspection", scheduled_date: daysFromNow(-5), status: "completed", outcome: "pass" },
      { inspection_type: "Backflow preventer inspection", scheduled_date: daysFromNow(20), status: "scheduled" },
    ],
    findings: [
      { source_type: "regulatory_notice", classification: "informational", description: "Fire marshal noted exit signage in parking garage requires re-illumination test.", abatement_due_date: daysFromNow(45), abatement_status: "open" },
    ],
    thirdParties: [
      { entity_name: "WestCoast Janitorial Services", relationship_type: "Vendor", license_number: "JS-44193", license_status: "active", coi_status: "current", coi_expires_at: daysFromNow(290), ein: "95-1180022" },
      { entity_name: "Apex Elevator Maintenance", relationship_type: "Vendor", license_number: "EL-99284", license_status: "active", coi_status: "current", coi_expires_at: daysFromNow(160), ein: "95-2294411" },
    ],
  },
  hipaa: {
    team: [
      { full_name: "Dr. Lena Ortiz", role: "HIPAA Privacy Officer", is_supervisor: true, email: "lortiz@coastalhealthgroup.com", start_date: "2021-05-01" },
      { full_name: "Maya Chen, RN", role: "Clinical Manager", start_date: "2023-01-09" },
      { full_name: "Andre Mitchell", role: "IT Security Lead", is_supervisor: true, start_date: "2024-06-22" },
    ],
    credentials: [
      { credential_type: "HIPAA Privacy Officer Certification", issuing_authority: "HCISPP / (ISC)²", expires_date: daysFromNow(280), status: "active", holderIndex: 0 },
      { credential_type: "BLS — Basic Life Support", issuing_authority: "American Heart Association", expires_date: daysFromNow(45), status: "active", holderIndex: 1 },
      { credential_type: "CompTIA Security+", issuing_authority: "CompTIA", expires_date: daysFromNow(-30), status: "expired", holderIndex: 2 },
    ],
    assets: [
      { asset_name: "GE Healthcare Carescape B450 Monitor", asset_type: "Medical device", manufacturer: "GE Healthcare", model: "B450", serial_number: "B450-21133", last_inspected_at: tsFromNow(-30), next_inspection_due: daysFromNow(150), certification_status: "certified" },
      { asset_name: "Sharps Disposal Cabinet — Exam 3", asset_type: "Biohazard", manufacturer: "Stericycle", next_inspection_due: daysFromNow(2), certification_status: "due" },
      { asset_name: "Welch Allyn Spot Vital Signs 4400", asset_type: "Medical device", manufacturer: "Welch Allyn", next_inspection_due: daysFromNow(-12), certification_status: "overdue" },
    ],
    permits: [
      { permit_name: "CLIA Certificate of Waiver", permit_number: "CLIA-05D2118827", issuing_agency: "CMS", issued_date: "2025-03-01", expires_date: daysFromNow(420), status: "active", renewal_window_days: 90 },
      { permit_name: "California Lab Field Services Registration", permit_number: "LFS-CA-882", issuing_agency: "CDPH", expires_date: daysFromNow(-5), status: "expired" },
    ],
    materials: [
      { material_name: "Isopropyl Alcohol 70%", material_type: "Disinfectant", quantity_on_hand: 24, storage_location: "Supply room A", sds_url: "https://demo.protekon.com/sds/ipa.pdf", last_inventory_at: tsFromNow(-7), vertical_data: { hazard_class: "Flammable Liquid", cas_number: "67-63-0", container_type: "1-gal jug" } },
      { material_name: "Glutaraldehyde", material_type: "Sterilant", quantity_on_hand: 6, storage_location: "Sterilization suite", last_inventory_at: tsFromNow(-21), vertical_data: { hazard_class: "Toxic — sensitizer", cas_number: "111-30-8" } },
    ],
    inspections: [
      { inspection_type: "Annual HIPAA risk assessment", scheduled_date: daysFromNow(15), status: "scheduled" },
      { inspection_type: "Quarterly access-log audit", scheduled_date: daysFromNow(-3), status: "completed", outcome: "pass" },
      { inspection_type: "Semi-annual EMR backup test", scheduled_date: daysFromNow(-21), status: "overdue" },
    ],
    findings: [
      { source_type: "internal_audit", classification: "serious", description: "Two terminated employee accounts retained EMR access for 9 days post-termination. Now revoked; access-review cadence tightened to weekly.", citation_text: "45 CFR §164.308(a)(3)(ii)(C) — Termination procedures", citation_standard: "45 CFR §164.308(a)(3)(ii)(C)", abatement_due_date: daysFromNow(10), abatement_status: "in_progress" },
      { source_type: "protekon_audit", classification: "other_than_serious", description: "BAA agreement with CloudChart EMR Services lapses in 90 days. Renewal in negotiation.", abatement_due_date: daysFromNow(80), abatement_status: "open" },
    ],
    thirdParties: [
      { entity_name: "CloudChart EMR Services", relationship_type: "Business Associate", coi_status: "current", coi_expires_at: daysFromNow(220), ein: "47-4419822" },
      { entity_name: "Stericycle Medical Waste", relationship_type: "Business Associate", coi_status: "current", coi_expires_at: daysFromNow(95), ein: "26-0823371" },
    ],
  },
  municipal: {
    team: [
      { full_name: "Helena Vargas", role: "Public Works Director", is_supervisor: true, email: "hvargas@summitmunicipal.com", start_date: "2018-11-12" },
      { full_name: "Tom Reilly", role: "Streets Foreman", is_supervisor: true, start_date: "2020-04-08" },
    ],
    credentials: [
      { credential_type: "Class A Commercial Driver's License", issuing_authority: "CA DMV", expires_date: daysFromNow(280), status: "active", holderIndex: 1 },
      { credential_type: "Confined-Space Entry Certified", issuing_authority: "Cal/OSHA 8 CCR §5157", expires_date: daysFromNow(60), status: "active", holderIndex: 1 },
    ],
    assets: [
      { asset_name: "Vactor 2100i Combo Sewer Truck", asset_type: "Heavy vehicle", manufacturer: "Vactor", model: "2100i", serial_number: "VAC-7733", last_inspected_at: tsFromNow(-18), next_inspection_due: daysFromNow(180), certification_status: "certified" },
      { asset_name: "Generac SD175 Standby Generator", asset_type: "Standby power", manufacturer: "Generac", model: "SD175", next_inspection_due: daysFromNow(5), certification_status: "due" },
      { asset_name: "Stihl MS 462 C-M Chainsaws (×4)", asset_type: "Hand-tool fleet", manufacturer: "Stihl", next_inspection_due: daysFromNow(-30), certification_status: "overdue" },
    ],
    permits: [
      { permit_name: "Air Quality — Generator Operating Permit", permit_number: "SCAQMD-77192", issuing_agency: "SCAQMD", issued_date: "2025-07-01", expires_date: daysFromNow(150), status: "active", renewal_window_days: 60 },
      { permit_name: "NPDES Storm-water Discharge", permit_number: "NPDES-CA-PW-2200", issuing_agency: "State Water Board", issued_date: "2024-04-15", expires_date: daysFromNow(720), status: "active", renewal_window_days: 90 },
    ],
    materials: [
      { material_name: "Sodium Hypochlorite 12.5%", material_type: "Disinfectant", quantity_on_hand: 220, storage_location: "Water-treatment containment", sds_url: "https://demo.protekon.com/sds/hypo.pdf", last_inventory_at: tsFromNow(-4), vertical_data: { hazard_class: "Corrosive", cas_number: "7681-52-9" } },
      { material_name: "Asphalt Emulsion CSS-1H", material_type: "Roadway material", quantity_on_hand: 600, storage_location: "Yard tank #2", last_inventory_at: tsFromNow(-11) },
    ],
    inspections: [
      { inspection_type: "Daily pre-trip vehicle inspection", scheduled_date: daysFromNow(-1), status: "completed", outcome: "pass" },
      { inspection_type: "Quarterly hearing-conservation noise survey", scheduled_date: daysFromNow(10), status: "scheduled" },
      { inspection_type: "Annual NPDES SWPPP walkthrough", scheduled_date: daysFromNow(-14), status: "overdue" },
    ],
    findings: [
      { source_type: "regulatory_notice", classification: "other_than_serious", description: "OSHA noted insufficient hearing-protection postings at chip-seal yard. Postings updated; documentation forwarded.", citation_text: "29 CFR §1910.95(k)(6)", citation_standard: "29 CFR §1910.95", abatement_due_date: daysFromNow(20), abatement_status: "in_progress" },
    ],
    thirdParties: [
      { entity_name: "Inland Asphalt Services", relationship_type: "Contractor", license_number: "CSLB-441199", license_status: "active", coi_status: "current", coi_expires_at: daysFromNow(200), ein: "33-1129944" },
      { entity_name: "ClearStream Water Testing Lab", relationship_type: "Vendor", license_number: "ELAP-2218", license_status: "active", coi_status: "expired", coi_expires_at: daysFromNow(-22), ein: "33-7733991" },
    ],
  },
  hospitality: {
    team: [
      { full_name: "Jasmine Park", role: "Executive Chef", is_supervisor: true, email: "jpark@goldenstatehospitality.com", start_date: "2022-08-22" },
      { full_name: "Carlos Mendoza", role: "Front-of-House Manager", is_supervisor: true, start_date: "2023-12-11" },
      { full_name: "Priya Singh", role: "Housekeeping Lead", start_date: "2024-04-03" },
    ],
    credentials: [
      { credential_type: "ServSafe Food Manager Certification", issuing_authority: "National Restaurant Association", expires_date: daysFromNow(310), status: "active", holderIndex: 0 },
      { credential_type: "California Food Handler Card", issuing_authority: "ANSI-Accredited Provider", expires_date: daysFromNow(15), status: "expiring", holderIndex: 2 },
      { credential_type: "Responsible Beverage Service (RBS)", issuing_authority: "CA ABC", expires_date: daysFromNow(-8), status: "expired", holderIndex: 1 },
    ],
    assets: [
      { asset_name: "Hobart AM16T Dishmachine", asset_type: "Dishwashing", manufacturer: "Hobart", model: "AM16T", last_inspected_at: tsFromNow(-22), next_inspection_due: daysFromNow(120), certification_status: "certified" },
      { asset_name: "Hoshizaki KM-901MAJ Ice Machine", asset_type: "Refrigeration", manufacturer: "Hoshizaki", model: "KM-901MAJ", next_inspection_due: daysFromNow(4), certification_status: "due" },
      { asset_name: "Ansul R-102 Hood Suppression", asset_type: "Life safety", manufacturer: "Ansul", model: "R-102", next_inspection_due: daysFromNow(-18), certification_status: "overdue" },
    ],
    permits: [
      { permit_name: "Food Facility Health Permit", permit_number: "FF-SF-228114", issuing_agency: "SF Dept of Public Health", issued_date: "2025-12-01", expires_date: daysFromNow(220), status: "active", renewal_window_days: 30 },
      { permit_name: "ABC Type-47 On-Sale General License", permit_number: "ABC-47-228114", issuing_agency: "CA ABC", expires_date: daysFromNow(-2), status: "expired" },
    ],
    materials: [
      { material_name: "Chlorine-Based Sanitizer Concentrate", material_type: "Sanitizer", quantity_on_hand: 18, storage_location: "Dish room chemical closet", sds_url: "https://demo.protekon.com/sds/sanitizer.pdf", last_inventory_at: tsFromNow(-3), vertical_data: { hazard_class: "Corrosive", cas_number: "7681-52-9" } },
      { material_name: "Quat Ammonium Surface Cleaner", material_type: "Sanitizer", quantity_on_hand: 12, storage_location: "Housekeeping cart prep", last_inventory_at: tsFromNow(-9) },
    ],
    inspections: [
      { inspection_type: "Daily kitchen line check", scheduled_date: daysFromNow(0), status: "scheduled" },
      { inspection_type: "Weekly hood-suppression visual", scheduled_date: daysFromNow(-3), status: "completed", outcome: "pass" },
      { inspection_type: "Quarterly health-department inspection", scheduled_date: daysFromNow(-30), status: "completed", outcome: "fail" },
    ],
    findings: [
      { source_type: "regulatory_notice", classification: "serious", description: "Health inspector cited improper hot-holding temperatures at carving station. Equipment serviced same day; line-check cadence tightened.", citation_text: "Cal. Code Regs. Title 17 §114149.1", citation_standard: "17 CCR §114149.1", penalty_amount: 0, abatement_due_date: daysFromNow(7), abatement_status: "in_progress" },
      { source_type: "protekon_audit", classification: "informational", description: "Quarterly SB 553 WVPP refresher overdue for evening front-desk team.", abatement_due_date: daysFromNow(20), abatement_status: "open" },
    ],
    thirdParties: [
      { entity_name: "Bay Area Food Distributors", relationship_type: "Vendor", license_number: "FD-99412", license_status: "active", coi_status: "current", coi_expires_at: daysFromNow(160), ein: "94-1129830" },
      { entity_name: "Premier Linen Services", relationship_type: "Vendor", license_number: "LIN-7740", license_status: "active", coi_status: "current", coi_expires_at: daysFromNow(220), ein: "94-7733992" },
    ],
  },
}

const REGULATORY_BODY_BY_VERTICAL: Record<string, string> = {
  construction: "Cal/OSHA",
  property: "City Fire Marshal",
  hipaa: "Office for Civil Rights (HHS)",
  municipal: "Cal/OSHA",
  hospitality: "County Health Department",
}

async function seedVerticalShowcase(
  ctx: AuthContext,
  siteIdByOrgSite: Map<string, Map<string, string>>
): Promise<void> {
  console.log("🎨 Seeding vertical showcase (assets/permits/materials/inspections/findings/team/credentials/third_parties)...")

  for (const org of DEMO_ORGS) {
    const clientId = ctx.orgUserIds.get(org.email)
    if (!clientId) continue
    const spec = SHOWCASE[org.vertical]
    if (!spec) continue

    const siteMap = siteIdByOrgSite.get(org.email)
    const primarySite = org.sites.find((s) => s.isPrimary) ?? org.sites[0]
    const siteId = siteMap?.get(primarySite?.name ?? "") ?? null

    console.log(`   → ${org.businessName} (${org.vertical})`)

    const teamRows = spec.team.map((t) => ({
      client_id: clientId,
      site_id: siteId,
      full_name: t.full_name,
      role: t.role,
      is_supervisor: t.is_supervisor ?? false,
      email: t.email ?? null,
      start_date: t.start_date ?? null,
      status: "active",
    }))
    const teamData = await safeInsert("team_members", teamRows)
    const teamIds = (teamData ?? []).map((r) => r.id)

    const credRows = spec.credentials.map((c) => ({
      client_id: clientId,
      holder_id: teamIds[c.holderIndex] ?? null,
      holder_name: spec.team[c.holderIndex]?.full_name ?? "Unassigned",
      credential_type: c.credential_type,
      credential_number: c.credential_number ?? null,
      issuing_authority: c.issuing_authority,
      issued_date: c.issued_date ?? null,
      expires_date: c.expires_date,
      status: c.status === "expiring" ? "active" : c.status,
    }))
    await safeInsert("credentials", credRows)

    const assetRows = spec.assets.map((a) => ({
      client_id: clientId,
      site_id: siteId,
      asset_name: a.asset_name,
      asset_type: a.asset_type,
      manufacturer: a.manufacturer ?? null,
      model: a.model ?? null,
      serial_number: a.serial_number ?? null,
      last_inspected_at: a.last_inspected_at ?? null,
      next_inspection_due: a.next_inspection_due,
      certification_status: a.certification_status,
    }))
    await safeInsert("assets", assetRows)

    const permitRows = spec.permits.map((p) => ({
      client_id: clientId,
      site_id: siteId,
      permit_name: p.permit_name,
      permit_number: p.permit_number ?? null,
      issuing_agency: p.issuing_agency,
      issued_date: p.issued_date ?? null,
      expires_date: p.expires_date,
      status: p.status,
      renewal_window_days: p.renewal_window_days ?? null,
    }))
    await safeInsert("permits", permitRows)

    const materialRows = spec.materials.map((m) => ({
      client_id: clientId,
      site_id: siteId,
      material_name: m.material_name,
      material_type: m.material_type,
      quantity_on_hand: m.quantity_on_hand ?? null,
      storage_location: m.storage_location ?? null,
      sds_url: m.sds_url ?? null,
      last_inventory_at: m.last_inventory_at ?? null,
      vertical_data: m.vertical_data ?? {},
    }))
    await safeInsert("materials", materialRows)

    const regulatoryBody = REGULATORY_BODY_BY_VERTICAL[org.vertical] ?? "Internal Audit"
    const inspectionRows = spec.inspections.map((i) => ({
      client_id: clientId,
      site_id: siteId,
      inspection_type: i.inspection_type,
      regulatory_body: regulatoryBody,
      scheduled_date: i.scheduled_date,
      status: i.status,
      outcome: i.outcome ?? null,
    }))
    await safeInsert("inspections", inspectionRows)

    const findingRows = spec.findings.map((f) => ({
      client_id: clientId,
      site_id: siteId,
      source_type: f.source_type,
      source_id: null,
      classification: f.classification,
      description: f.description,
      citation_text: f.citation_text ?? null,
      citation_standard: f.citation_standard ?? null,
      penalty_amount: f.penalty_amount ?? null,
      abatement_due_date: f.abatement_due_date ?? null,
      abatement_status: f.abatement_status,
    }))
    await safeInsert("findings", findingRows)

    const tpRows = spec.thirdParties.map((tp) => ({
      client_id: clientId,
      entity_name: tp.entity_name,
      relationship_type: tp.relationship_type,
      license_number: tp.license_number ?? null,
      license_status: tp.license_status ?? null,
      coi_status: tp.coi_status ?? null,
      coi_expires_at: tp.coi_expires_at ?? null,
      ein: tp.ein ?? null,
    }))
    await safeInsert("third_parties", tpRows)
  }

  console.log("   ✅ Vertical showcase complete")
}

async function seedConstructionExtras(ctx: AuthContext): Promise<void> {
  console.log("🏗️  Seeding construction extras (subs, safety programs, payments, projects)...")

  const constructionEmails = DEMO_ORGS
    .filter((o) => o.vertical === "construction" && o.status === "active")
    .map((o) => o.email)

  for (const email of constructionEmails) {
    const clientId = ctx.orgUserIds.get(email)
    if (!clientId) continue

    const subRows = [
      { client_id: clientId, company_name: "ACME Framing & Drywall", license_number: "CSLB-942711", license_status: "active", license_expiry: daysFromNow(180), insurance_status: "current", insurance_expiry: daysFromNow(220), verified_at: tsFromNow(-30), cslb_license_no: "942711", cslb_sync_status: "synced", cslb_risk_score: 12, cslb_last_synced: tsFromNow(-2), cslb_primary_status: "active", cslb_wc_expires: daysFromNow(220), cslb_license_expires: daysFromNow(180), coi_gl_expires: daysFromNow(180), coi_wc_expires: daysFromNow(220), coi_last_uploaded: tsFromNow(-15), coi_status: "current" },
      { client_id: clientId, company_name: "Inland Empire Concrete Co", license_number: "CSLB-880124", license_status: "active", license_expiry: daysFromNow(420), insurance_status: "expired", insurance_expiry: daysFromNow(-15), verified_at: tsFromNow(-60), cslb_license_no: "880124", cslb_sync_status: "synced", cslb_risk_score: 47, cslb_last_synced: tsFromNow(-3), cslb_primary_status: "active", cslb_wc_expires: daysFromNow(-15), cslb_license_expires: daysFromNow(420), coi_gl_expires: daysFromNow(-12), coi_wc_expires: daysFromNow(-15), coi_last_uploaded: tsFromNow(-90), coi_status: "expired" },
      { client_id: clientId, company_name: "Riverside Electric Services", license_number: "CSLB-771285", license_status: "active", license_expiry: daysFromNow(260), insurance_status: "current", insurance_expiry: daysFromNow(310), verified_at: tsFromNow(-45), cslb_license_no: "771285", cslb_sync_status: "synced", cslb_risk_score: 8, cslb_last_synced: tsFromNow(-1), cslb_primary_status: "active", cslb_wc_expires: daysFromNow(310), cslb_license_expires: daysFromNow(260), coi_gl_expires: daysFromNow(310), coi_wc_expires: daysFromNow(310), coi_last_uploaded: tsFromNow(-7), coi_status: "current" },
    ]
    const subsData = await safeInsert("construction_subs", subRows)
    const subIds = (subsData ?? []).map((r) => r.id)

    if (subIds.length >= 2) {
      const programRows = [
        { client_id: clientId, sub_id: subIds[0], program_type: "iipp", document_url: "https://demo.protekon.com/safety/iipp-acme.pdf", effective_date: daysFromNow(-60), status: "approved", reviewed_at: tsFromNow(-30) },
        { client_id: clientId, sub_id: subIds[0], program_type: "wvpp", document_url: "https://demo.protekon.com/safety/wvpp-acme.pdf", effective_date: daysFromNow(-90), status: "approved", reviewed_at: tsFromNow(-45) },
        { client_id: clientId, sub_id: subIds[1], program_type: "iipp", status: "pending" },
      ]
      await safeInsert("sub_safety_programs", programRows)

      const taxYear = new Date().getFullYear()
      const payRows = [
        { client_id: clientId, sub_id: subIds[0], payment_date: daysFromNow(-90), amount: 48500, category: "labor", tax_year: taxYear, source: "manual" },
        { client_id: clientId, sub_id: subIds[0], payment_date: daysFromNow(-30), amount: 32200, category: "labor", tax_year: taxYear, source: "manual" },
        { client_id: clientId, sub_id: subIds[1], payment_date: daysFromNow(-45), amount: 17800, category: "materials", tax_year: taxYear, source: "manual" },
      ]
      await safeInsert("vendor_payments", payRows)
    }

    await safeInsert("projects", [{
      client_id: clientId,
      name: "Riverside HQ Tenant Improvement",
      start_date: daysFromNow(-90),
      end_date: daysFromNow(120),
      status: "active",
      notes: "Multi-trade TI; demo project for showcase",
    }])
  }

  console.log("   ✅ Construction extras complete")
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

    // Phase B — vertical tables, logs, intake, commissions
    await seedDocumentTemplates()
    await seedDocuments(ctx)
    await seedIncidents(ctx)
    await seedTrainingRecords(ctx)
    await seedBaaAgreements(ctx)
    await seedRegulatoryUpdates()
    // acknowledgment_requests skipped — table does not exist in prod schema.
    await seedIntakeSubmissions()
    await seedAuditLog(ctx)
    await seedActionItems(ctx)
    await seedPartnerCommissions(partnerIdByEmail)

    // Phase C — vertical showcase (eliminates empty drill-downs across all 5 verticals)
    await seedVerticalShowcase(ctx, siteIdByOrgSite)
    await seedConstructionExtras(ctx)

    // Reference the stubbed ack seeder so tsc doesn't flag it as unused while
    // the table is missing from prod.
    void seedAcknowledgmentRequests

    console.log("\n✅ Seed Phase A + B + C complete (auth + clients + RBAC + sites + partners + docs + incidents + training + BAAs + regs + intake + audit log + action items + commissions + vertical showcase)")
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
