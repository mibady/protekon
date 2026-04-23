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

async function seedDocuments(ctx: AuthContext): Promise<Map<string, string>> {
  console.log("📑 Seeding documents...")

  const sierraId = ctx.orgUserIds.get("admin@sierraridgebuilders.com")
  const summitId = ctx.orgUserIds.get("admin@summitmunicipal.com")
  if (!sierraId || !summitId) {
    throw new Error("seedDocuments: missing client ids for Sierra Ridge or Summit Municipal")
  }

  // Sierra Ridge (construction): 3 docs for demo. Summit: 1 policy doc so the
  // acknowledgment_requests FK has a valid target.
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
    {
      client_id: summitId,
      document_id: makeCodeId("DOC"),
      type: "hearing_conservation_policy",
      filename: "Hearing Conservation Policy.pdf",
      status: "completed",
      priority: "standard",
      pages: 6,
    },
  ]

  const { data, error } = await admin
    .from("documents")
    .insert(rows)
    .select("id, client_id, type")
  if (error) throw new Error(`seedDocuments: insert failed: ${error.message}`)

  // Map clientId -> a representative document uuid. For Summit we use its
  // hearing-conservation policy so the ack request can FK to it.
  const docIdByClient = new Map<string, string>()
  for (const d of data ?? []) {
    const clientId = d.client_id as string
    const docUuid = d.id as string
    // Prefer the policy-type rows; otherwise first one wins.
    if (d.type === "hearing_conservation_policy" || !docIdByClient.has(clientId)) {
      docIdByClient.set(clientId, docUuid)
    }
  }

  console.log(`   ✅ ${rows.length} documents (3 Sierra Ridge + 1 Summit policy)`)
  return docIdByClient
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

  // Note: the incidents schema (001 + 011 + 045) does not include columns for
  // status / reported_by / assigned_to_client. Store those hints in metadata.
  const rows = [
    {
      client_id: sierraId,
      incident_id: makeCodeId("INC"),
      description:
        "Near-miss: unsecured scaffold plank shifted when a worker stepped on it. No contact, no injury. Plank was re-pinned immediately and pre-shift inspection checklist updated.",
      location: "Riverside HQ — 3rd floor exterior scaffold",
      incident_date: fiveDaysAgo.toISOString().slice(0, 10),
      severity: "near-miss",
      reported_at: fiveDaysAgo.toISOString(),
      metadata: {
        status: "submitted",
        type: "near_miss",
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
      reported_at: tenDaysAgo.toISOString(),
      metadata: {
        status: "open",
        type: "workplace_violence",
        wvp_type: 2,
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

async function seedAcknowledgmentRequests(
  ctx: AuthContext,
  regulatoryUpdateId: string,
  docIdByClient: Map<string, string>
): Promise<void> {
  console.log("✍️  Seeding acknowledgment_requests...")

  // Silence unused-var: regulatory_updates and ack_requests are logically linked
  // via cohort_note but the schema does not FK them. We keep the parameter for
  // future wiring.
  void regulatoryUpdateId

  const summitId = ctx.orgUserIds.get("admin@summitmunicipal.com")
  if (!summitId) throw new Error("seedAcknowledgmentRequests: missing Summit client id")

  const policyDocId = docIdByClient.get(summitId)
  if (!policyDocId) {
    throw new Error(
      "seedAcknowledgmentRequests: Summit policy document missing — seedDocuments must insert a policy doc for Summit first"
    )
  }

  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 14)

  const rows = [
    {
      client_id: summitId,
      policy_document_id: policyDocId,
      policy_version: "v1.0",
      cohort_note:
        "All field crews working around sustained noise ≥85 dBA. Pending sign-off per [DEMO] OSHA hearing conservation amendment.",
      due_date: dueDate.toISOString(),
    },
  ]

  const { error } = await admin.from("acknowledgment_requests").insert(rows)
  if (error) throw new Error(`seedAcknowledgmentRequests: insert failed: ${error.message}`)
  console.log(`   ✅ ${rows.length} ack request (Summit hearing conservation)`)
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
    const docIdByClient = await seedDocuments(ctx)
    await seedIncidents(ctx)
    await seedTrainingRecords(ctx)
    await seedBaaAgreements(ctx)
    const regulatoryUpdateId = await seedRegulatoryUpdates()
    await seedAcknowledgmentRequests(ctx, regulatoryUpdateId, docIdByClient)
    await seedIntakeSubmissions()
    await seedAuditLog(ctx)
    await seedActionItems(ctx)
    await seedPartnerCommissions(partnerIdByEmail)

    // siteIdByOrgSite is reserved for future per-site seeders (projects, poster
    // compliance, etc.). Keep the reference so tsc doesn't complain.
    void siteIdByOrgSite

    console.log("\n✅ Seed Phase A + B complete (auth + clients + RBAC + sites + partners + docs + incidents + training + BAAs + regs + acks + intake + audit log + action items + commissions)")
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
