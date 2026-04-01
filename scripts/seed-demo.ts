/**
 * Seed script for hosted Supabase
 * Creates demo auth user + populates all tables
 *
 * Usage: npx tsx scripts/seed-demo.ts
 * Requires: .env.local with NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { resolve } from "path"

// Load .env.local without dotenv dependency
const envPath = resolve(process.cwd(), ".env.local")
const envContent = readFileSync(envPath, "utf-8")
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=]+)=["']?(.+?)["']?$/)
  if (match) process.env[match[1].trim()] = match[2].trim()
}

const DEMO_ID = "00000000-0000-0000-0000-000000000001"
const DEMO_EMAIL = "admin@coastalhealthgroup.com"
const DEMO_PASSWORD = "demo-password-2026"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function seedAuth() {
  console.log("🔑 Creating demo auth user...")

  // Delete existing user if present
  const { data: existing } = await supabase.auth.admin.listUsers()
  const existingUser = existing?.users?.find((u) => u.email === DEMO_EMAIL)
  if (existingUser) {
    await supabase.auth.admin.deleteUser(existingUser.id)
    console.log("   Deleted existing user")
  }

  const { data, error } = await supabase.auth.admin.createUser({
    user_metadata: {
      business_name: "Coastal Health Group",
      vertical: "hipaa",
      plan: "managed",
    },
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
  })

  if (error) {
    console.error("❌ Auth user creation failed:", error.message)
    process.exit(1)
  }

  console.log(`   ✅ Created user: ${data.user.id}`)
  return data.user.id
}

async function cleanTables(userId: string) {
  console.log("🧹 Cleaning existing demo data...")

  const clientTables = [
    "poster_compliance",
    "phi_assets",
    "baa_agreements",
    "audit_log",
    "scheduled_deliveries",
    "training_records",
    "audits",
    "documents",
    "incidents",
    "construction_subs",
    "property_portfolio",
  ]

  for (const table of clientTables) {
    await supabase.from(table).delete().eq("client_id", userId)
  }
  await supabase.from("clients").delete().eq("id", userId)
  await supabase
    .from("intake_submissions")
    .delete()
    .in("email", [DEMO_EMAIL, "ops@summiturgentcare.com"])
  await supabase
    .from("sample_report_leads")
    .delete()
    .in("email", [
      "maria.chen@bayviewmedical.com",
      "jturner@pacificwellness.org",
      "rpatil@sonomaclinic.com",
    ])
  await supabase.from("regulatory_updates").delete().neq("id", "00000000-0000-0000-0000-000000000000")
  await supabase
    .from("municipal_ordinances")
    .delete()
    .in("jurisdiction", ["California", "City of Los Angeles", "City of San Francisco"])

  console.log("   ✅ Clean")
}

async function seedClient(userId: string) {
  console.log("👤 Seeding client...")

  const { error } = await supabase.from("clients").insert({
    id: userId,
    email: DEMO_EMAIL,
    business_name: "Coastal Health Group",
    phone: "(310) 555-0142",
    vertical: "hipaa",
    plan: "managed",
    compliance_score: 83,
    risk_level: "medium",
    status: "active",
    notification_preferences: {
      regulatory_updates: true,
      document_reminders: true,
      weekly_summaries: true,
      incident_alerts: true,
      marketing_emails: false,
    },
    created_at: "2025-11-15T09:00:00Z",
    updated_at: "2026-03-28T14:30:00Z",
  })

  if (error) throw new Error(`Client insert failed: ${error.message}`)
  console.log("   ✅ Coastal Health Group")
}

async function seedIncidents(userId: string) {
  console.log("🚨 Seeding incidents...")

  const { error } = await supabase.from("incidents").insert([
    {
      client_id: userId,
      incident_id: "INC-2026-001",
      description:
        "Employee reported a verbal threat involving mention of a weapon from a patient family member in the waiting area. Staff de-escalated and contacted security. No physical contact occurred.",
      location: "Main Clinic — Waiting Area",
      incident_date: "2026-01-12",
      severity: "severe",
      follow_up_id: "FU-2026-001",
      metadata: {
        type: "injury",
        time: "16:45",
        injuryOccurred: false,
        medicalTreatment: false,
        witnesses: "Front desk staff, security guard",
        actionsTaken: "Area secured, incident documented, security protocols reviewed",
      },
      created_at: "2026-01-12T16:45:00Z",
    },
    {
      client_id: userId,
      incident_id: "INC-2026-002",
      description:
        "Two individuals engaged in a loud verbal confrontation in the staff parking lot at shift change. One individual followed an employee toward the building entrance before being intercepted by security.",
      location: "Staff Parking Lot B",
      incident_date: "2026-02-03",
      severity: "serious",
      follow_up_id: "FU-2026-002",
      metadata: {
        type: "near-miss",
        time: "19:20",
        injuryOccurred: false,
        medicalTreatment: false,
        witnesses: "Shift change staff",
        actionsTaken: "Security escort provided, parking lot camera reviewed",
      },
      created_at: "2026-02-03T19:20:00Z",
    },
    {
      client_id: userId,
      incident_id: "INC-2026-003",
      description:
        "Patient in exam room became agitated and threw a clipboard at the wall after a prolonged wait. No staff were in the immediate area. Patient was later calmed by attending physician.",
      location: "East Wing — Exam Room 4",
      incident_date: "2026-02-18",
      severity: "moderate",
      follow_up_id: null,
      metadata: {
        type: "property",
        time: "11:10",
        injuryOccurred: false,
        medicalTreatment: false,
        witnesses: "None present",
        actionsTaken: "Patient de-escalated by physician",
      },
      created_at: "2026-02-18T11:10:00Z",
    },
    {
      client_id: userId,
      incident_id: "INC-2026-004",
      description:
        "Security camera captured an unidentified individual attempting to enter the records storage area via a side door after business hours. Door remained locked. Individual left after two attempts.",
      location: "Records Storage — Side Entrance",
      incident_date: "2026-03-05",
      severity: "moderate",
      follow_up_id: "FU-2026-004",
      metadata: {
        type: "near-miss",
        time: "22:35",
        injuryOccurred: false,
        medicalTreatment: false,
        witnesses: "Security camera",
        actionsTaken: "Camera footage preserved, door lock verified, police notified",
      },
      created_at: "2026-03-05T22:35:00Z",
    },
    {
      client_id: userId,
      incident_id: "INC-2026-005",
      description:
        "Vending machine in break room was kicked and damaged by unknown person during lunch hour. No witnesses. Damage limited to cosmetic dent on the front panel.",
      location: "Staff Break Room",
      incident_date: "2026-03-20",
      severity: "minor",
      follow_up_id: null,
      metadata: {
        type: "property",
        time: "13:15",
        injuryOccurred: false,
        medicalTreatment: false,
        witnesses: "None",
        actionsTaken: "Damage documented, break room camera under review",
      },
      created_at: "2026-03-20T13:15:00Z",
    },
  ])

  if (error) throw new Error(`Incidents insert failed: ${error.message}`)
  console.log("   ✅ 5 incidents")
}

async function seedDocuments(userId: string) {
  console.log("📄 Seeding documents...")

  const { error } = await supabase.from("documents").insert([
    {
      client_id: userId, document_id: "DOC-2026-001", type: "wvpp",
      filename: "Coastal_Health_Group_WVPP_2026.pdf",
      storage_url: "https://storage.protekon.com/docs/00000001/wvpp-2026.pdf",
      pages: 34, status: "current", notes: null, priority: "standard",
      created_at: "2026-01-05T10:00:00Z",
    },
    {
      client_id: userId, document_id: "DOC-2026-002", type: "gap-analysis",
      filename: "Coastal_Health_Group_Gap_Analysis_Q1_2026.pdf",
      storage_url: "https://storage.protekon.com/docs/00000001/gap-analysis-q1-2026.pdf",
      pages: 18, status: "current", notes: null, priority: "standard",
      created_at: "2026-01-10T14:00:00Z",
    },
    {
      client_id: userId, document_id: "DOC-2026-003", type: "incident-response-protocol",
      filename: "Coastal_Health_Group_Incident_Response_Protocol.pdf",
      storage_url: "https://storage.protekon.com/docs/00000001/incident-response-protocol.pdf",
      pages: 12, status: "current", notes: null, priority: "standard",
      created_at: "2026-01-15T09:30:00Z",
    },
    {
      client_id: userId, document_id: "DOC-2026-004", type: "training-curriculum",
      filename: "Coastal_Health_Group_Training_Curriculum_2026.pdf",
      storage_url: "https://storage.protekon.com/docs/00000001/training-curriculum-2026.pdf",
      pages: 22, status: "current", notes: null, priority: "standard",
      created_at: "2026-01-20T11:00:00Z",
    },
    {
      client_id: userId, document_id: "DOC-2026-005", type: "audit-package",
      filename: "Coastal_Health_Group_Audit_Package_Jan_2026.pdf",
      storage_url: "https://storage.protekon.com/docs/00000001/audit-package-jan-2026.pdf",
      pages: 28, status: "current", notes: null, priority: "standard",
      created_at: "2026-02-01T08:00:00Z",
    },
    {
      client_id: userId, document_id: "DOC-2026-006", type: "salary-range",
      filename: "Coastal_Health_Group_Salary_Ranges_2026.pdf",
      storage_url: "https://storage.protekon.com/docs/00000001/salary-ranges-2026.pdf",
      pages: 8, status: "current", notes: null, priority: "standard",
      created_at: "2026-02-10T15:00:00Z",
    },
    {
      client_id: userId, document_id: "DOC-2026-007", type: "eeo-policy",
      filename: "Coastal_Health_Group_EEO_Policy.pdf",
      storage_url: "https://storage.protekon.com/docs/00000001/eeo-policy.pdf",
      pages: 6, status: "current", notes: "Annual review scheduled for Q3", priority: "standard",
      created_at: "2026-02-15T10:30:00Z",
    },
    {
      client_id: userId, document_id: "DOC-2026-008", type: "leave-policy",
      filename: "Coastal_Health_Group_Leave_Policy_CA.pdf",
      storage_url: null,
      pages: 10, status: "requested", notes: "Updated to reflect AB 1041 changes", priority: "high",
      created_at: "2026-03-01T09:00:00Z",
    },
  ])

  if (error) throw new Error(`Documents insert failed: ${error.message}`)
  console.log("   ✅ 8 documents")
}

async function seedAudits(userId: string) {
  console.log("📊 Seeding audits...")

  const { error } = await supabase.from("audits").insert([
    {
      client_id: userId, audit_id: "AUD-2026-01", month: "2026-01", score: 78, status: "completed",
      checks: [
        { name: "WVPP current and distributed", passed: true },
        { name: "Incident log maintained (SB 553)", passed: true },
        { name: "Employee training up to date", passed: false, note: "3 employees overdue on SB 553 annual training" },
        { name: "BAA agreements on file", passed: false, note: "Lab partner BAA missing" },
        { name: "PHI access controls verified", passed: true },
        { name: "Security risk assessment current", passed: false, note: "Legacy server not assessed since 2025-Q2" },
        { name: "Poster compliance verified", passed: true },
        { name: "Emergency action plan posted", passed: true },
        { name: "Termination procedures documented", passed: true },
        { name: "HIPAA breach notification plan current", passed: false, note: "Plan references outdated contact list" },
      ],
      created_at: "2026-02-01T08:00:00Z",
    },
    {
      client_id: userId, audit_id: "AUD-2026-02", month: "2026-02", score: 82, status: "completed",
      checks: [
        { name: "WVPP current and distributed", passed: true },
        { name: "Incident log maintained (SB 553)", passed: true },
        { name: "Employee training up to date", passed: false, note: "1 employee still overdue on SB 553 training" },
        { name: "BAA agreements on file", passed: false, note: "Lab partner BAA still missing" },
        { name: "PHI access controls verified", passed: true },
        { name: "Security risk assessment current", passed: true },
        { name: "Poster compliance verified", passed: true },
        { name: "Emergency action plan posted", passed: true },
        { name: "Termination procedures documented", passed: true },
        { name: "HIPAA breach notification plan current", passed: true },
      ],
      created_at: "2026-03-01T08:00:00Z",
    },
    {
      client_id: userId, audit_id: "AUD-2026-03", month: "2026-03", score: 85, status: "completed",
      checks: [
        { name: "WVPP current and distributed", passed: true },
        { name: "Incident log maintained (SB 553)", passed: true },
        { name: "Employee training up to date", passed: true },
        { name: "BAA agreements on file", passed: false, note: "Lab partner BAA under review — expected signed by April 15" },
        { name: "PHI access controls verified", passed: true },
        { name: "Security risk assessment current", passed: true },
        { name: "Poster compliance verified", passed: true },
        { name: "Emergency action plan posted", passed: true },
        { name: "Termination procedures documented", passed: true },
        { name: "HIPAA breach notification plan current", passed: true },
      ],
      created_at: "2026-03-28T08:00:00Z",
    },
  ])

  if (error) throw new Error(`Audits insert failed: ${error.message}`)
  console.log("   ✅ 3 audits")
}

async function seedTraining(userId: string) {
  console.log("🎓 Seeding training records...")

  const { error } = await supabase.from("training_records").insert([
    { client_id: userId, employee_name: "Angela Torres", training_type: "SB 553 Annual", due_date: "2026-01-31", completed_at: "2026-01-22T14:00:00Z", status: "completed" },
    { client_id: userId, employee_name: "David Kim", training_type: "SB 553 Annual", due_date: "2026-01-31", completed_at: "2026-01-28T10:30:00Z", status: "completed" },
    { client_id: userId, employee_name: "Rachel Okonkwo", training_type: "SB 553 Annual", due_date: "2026-01-31", completed_at: "2026-02-14T09:00:00Z", status: "completed" },
    { client_id: userId, employee_name: "James Whitfield", training_type: "HIPAA Privacy", due_date: "2026-02-15", completed_at: "2026-02-10T11:00:00Z", status: "completed" },
    { client_id: userId, employee_name: "Maria Sandoval", training_type: "HIPAA Privacy", due_date: "2026-02-15", completed_at: null, status: "overdue" },
    { client_id: userId, employee_name: "Angela Torres", training_type: "EEO Awareness", due_date: "2026-03-15", completed_at: "2026-03-10T15:30:00Z", status: "completed" },
    { client_id: userId, employee_name: "Kevin Pham", training_type: "EEO Awareness", due_date: "2026-03-15", completed_at: null, status: "overdue" },
    { client_id: userId, employee_name: "David Kim", training_type: "Supervisor Training", due_date: "2026-04-30", completed_at: null, status: "pending" },
    { client_id: userId, employee_name: "Lisa Nguyen", training_type: "SB 553 Annual", due_date: "2026-04-30", completed_at: null, status: "pending" },
    { client_id: userId, employee_name: "Rachel Okonkwo", training_type: "HIPAA Privacy", due_date: "2026-05-15", completed_at: null, status: "pending" },
  ])

  if (error) throw new Error(`Training insert failed: ${error.message}`)
  console.log("   ✅ 10 training records")
}

async function seedBaa(userId: string) {
  console.log("📋 Seeding BAA agreements...")

  const { error } = await supabase.from("baa_agreements").insert([
    { client_id: userId, vendor_name: "MedChart EHR Systems", service_type: "Electronic Health Records", phi_types: ["medical-records", "lab-results", "prescriptions", "demographics"], baa_status: "active", signed_date: "2025-06-01", expiration_date: "2027-06-01", document_url: "https://storage.protekon.com/baa/00000001/medchart-ehr-baa.pdf", created_at: "2025-06-01T10:00:00Z" },
    { client_id: userId, vendor_name: "CloudVault Health", service_type: "Cloud Storage (HIPAA)", phi_types: ["medical-records", "billing-data", "insurance-claims"], baa_status: "active", signed_date: "2026-02-15", expiration_date: "2027-02-28", document_url: "https://storage.protekon.com/baa/00000001/cloudvault-baa.pdf", created_at: "2026-02-15T14:00:00Z" },
    { client_id: userId, vendor_name: "Pacific Billing Solutions", service_type: "Medical Billing & Coding", phi_types: ["billing-data", "insurance-claims", "demographics"], baa_status: "pending", signed_date: null, expiration_date: null, document_url: null, created_at: "2026-03-01T09:00:00Z" },
    { client_id: userId, vendor_name: "LabConnect Diagnostics", service_type: "Laboratory Testing Partner", phi_types: ["lab-results", "specimen-data", "demographics"], baa_status: "missing", signed_date: null, expiration_date: null, document_url: null, created_at: "2026-01-10T08:00:00Z" },
    { client_id: userId, vendor_name: "TempStaff Medical", service_type: "Temporary Staffing Agency", phi_types: ["demographics", "scheduling-data"], baa_status: "active", signed_date: "2025-04-15", expiration_date: "2026-04-15", document_url: "https://storage.protekon.com/baa/00000001/tempstaff-baa.pdf", created_at: "2025-04-15T10:00:00Z" },
  ])

  if (error) throw new Error(`BAA insert failed: ${error.message}`)
  console.log("   ✅ 5 BAA agreements")
}

async function seedPhi(userId: string) {
  console.log("🔒 Seeding PHI assets...")

  const { error } = await supabase.from("phi_assets").insert([
    { client_id: userId, system_name: "MedChart EHR", system_type: "SaaS", access_description: "Role-based access via SSO. 32 active users across 3 clinic locations.", phi_content_types: ["medical-records", "lab-results", "prescriptions", "demographics"], encrypted_at_rest: true, encrypted_in_transit: true, risk_level: "low", last_assessed_at: "2026-03-15T10:00:00Z", created_at: "2025-11-20T09:00:00Z" },
    { client_id: userId, system_name: "Legacy Billing Server", system_type: "On-Premise", access_description: "Local network access only. 5 billing staff with shared login credentials. No MFA.", phi_content_types: ["billing-data", "insurance-claims", "demographics"], encrypted_at_rest: true, encrypted_in_transit: false, risk_level: "medium", last_assessed_at: "2026-02-01T14:00:00Z", created_at: "2025-11-20T09:00:00Z" },
    { client_id: userId, system_name: "CoastalHealth Mobile App", system_type: "SaaS", access_description: "Patient-facing mobile app with MFA. Patients access own records.", phi_content_types: ["medical-records", "demographics", "appointment-data"], encrypted_at_rest: true, encrypted_in_transit: true, risk_level: "low", last_assessed_at: "2026-03-10T11:00:00Z", created_at: "2025-12-05T10:00:00Z" },
    { client_id: userId, system_name: "Archive File Server", system_type: "On-Premise", access_description: "Contains pre-2020 patient records. No active access controls.", phi_content_types: ["medical-records", "billing-data", "demographics"], encrypted_at_rest: false, encrypted_in_transit: false, risk_level: "high", last_assessed_at: "2025-06-15T09:00:00Z", created_at: "2025-11-20T09:00:00Z" },
  ])

  if (error) throw new Error(`PHI insert failed: ${error.message}`)
  console.log("   ✅ 4 PHI assets")
}

async function seedPosters(userId: string) {
  console.log("📌 Seeding poster compliance...")

  const { error } = await supabase.from("poster_compliance").insert([
    { client_id: userId, location_name: "Main Clinic — Break Room", poster_type: "OSHA Job Safety and Health", jurisdiction: "Federal", status: "verified", last_verified_at: "2026-03-01T10:00:00Z", next_update_due: "2026-09-01", created_at: "2025-12-01T08:00:00Z" },
    { client_id: userId, location_name: "Main Clinic — Break Room", poster_type: "California Payday Notice", jurisdiction: "California", status: "verified", last_verified_at: "2026-03-01T10:00:00Z", next_update_due: "2026-09-01", created_at: "2025-12-01T08:00:00Z" },
    { client_id: userId, location_name: "Main Clinic — Break Room", poster_type: "FMLA Employee Rights", jurisdiction: "Federal", status: "needs-update", last_verified_at: "2026-01-15T10:00:00Z", next_update_due: "2026-04-01", created_at: "2025-12-01T08:00:00Z" },
    { client_id: userId, location_name: "East Wing — Staff Corridor", poster_type: "California Minimum Wage", jurisdiction: "California", status: "needs-update", last_verified_at: "2026-01-15T10:00:00Z", next_update_due: "2026-04-01", created_at: "2025-12-01T08:00:00Z" },
    { client_id: userId, location_name: "East Wing — Staff Corridor", poster_type: "EEO is the Law", jurisdiction: "Federal", status: "verified", last_verified_at: "2026-03-01T10:00:00Z", next_update_due: "2026-09-01", created_at: "2025-12-01T08:00:00Z" },
    { client_id: userId, location_name: "Satellite Office — Lobby", poster_type: "California Workplace Violence Prevention", jurisdiction: "California", status: "unknown", last_verified_at: null, next_update_due: "2026-04-15", created_at: "2026-02-01T08:00:00Z" },
  ])

  if (error) throw new Error(`Poster insert failed: ${error.message}`)
  console.log("   ✅ 6 poster locations")
}

async function seedScheduledDeliveries(userId: string) {
  console.log("📦 Seeding scheduled deliveries...")

  const { error } = await supabase.from("scheduled_deliveries").insert([
    { client_id: userId, delivery_type: "WVPP Update", frequency: "monthly", next_delivery_date: "2026-04-01", last_delivered_at: "2026-03-01T08:00:00Z", status: "scheduled", created_at: "2025-12-01T10:00:00Z" },
    { client_id: userId, delivery_type: "Audit Package", frequency: "quarterly", next_delivery_date: "2026-04-01", last_delivered_at: "2026-01-01T08:00:00Z", status: "scheduled", created_at: "2025-12-01T10:00:00Z" },
    { client_id: userId, delivery_type: "Training Curriculum", frequency: "annually", next_delivery_date: "2027-01-15", last_delivered_at: "2026-01-20T11:00:00Z", status: "scheduled", created_at: "2025-12-01T10:00:00Z" },
  ])

  if (error) throw new Error(`Deliveries insert failed: ${error.message}`)
  console.log("   ✅ 3 scheduled deliveries")
}

async function seedRegulatoryUpdates() {
  console.log("📜 Seeding regulatory updates...")

  const { error } = await supabase.from("regulatory_updates").insert([
    { jurisdiction: "California", category: "wage", title: "CA SB 525 — Healthcare Worker Minimum Wage Increase", summary: "Minimum wage for healthcare workers at covered facilities increases to $25/hour.", effective_date: "2026-06-01", source_url: "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202320240SB525", severity: "high", published_date: "2026-01-15", code: "SB-525", issuing_body: "California Legislature", type: "amendment", description: "Healthcare minimum wage increase to $25/hour for covered facilities.", impact_text: "Your payroll and compensation structures may require updates.", compliance_deadline: "2026-06-01", acknowledged_by: [], created_at: "2026-01-15T08:00:00Z" },
    { jurisdiction: "California", category: "leave", title: "CA AB 1041 — Expanded Designated Person for CFRA/PSL", summary: "Employees may now designate any individual as a designated person for CFRA leave and paid sick leave.", effective_date: "2026-01-01", source_url: "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202320240AB1041", severity: "medium", published_date: "2026-01-05", code: "AB-1041", issuing_body: "California Legislature", type: "amendment", description: "Expanded designated person definition for CFRA and paid sick leave.", impact_text: "Your leave policies should be updated to reflect the expanded definition.", compliance_deadline: "2026-03-01", acknowledged_by: [], created_at: "2026-01-05T08:00:00Z" },
    { jurisdiction: "Federal", category: "wage", title: "DOL Final Rule — Overtime Salary Threshold Update", summary: "Department of Labor finalizes updated salary threshold for overtime exemption.", effective_date: "2026-07-01", source_url: "https://www.dol.gov/agencies/whd/overtime/rulemaking", severity: "high", published_date: "2026-02-10", code: "DOL-OT-2026", issuing_body: "U.S. Department of Labor", type: "amendment", description: "Updated FLSA overtime salary threshold.", impact_text: "Your exempt employee classifications may need review.", compliance_deadline: "2026-07-01", acknowledged_by: [], created_at: "2026-02-10T08:00:00Z" },
    { jurisdiction: "New York", category: "leave", title: "NY Paid Prenatal Leave Expansion", summary: "New York expands paid prenatal leave eligibility to part-time employees working 20+ hours.", effective_date: "2026-04-01", source_url: "https://www.ny.gov/programs/new-york-paid-prenatal-leave", severity: "medium", published_date: "2026-02-20", code: "NY-PPL-2026", issuing_body: "New York State", type: "guidance", description: "Expanded paid prenatal leave eligibility.", impact_text: null, compliance_deadline: null, acknowledged_by: [], created_at: "2026-02-20T08:00:00Z" },
    { jurisdiction: "California", category: "wage", title: "CA SB 553 — Workplace Violence Prevention Plan Enforcement Update", summary: "Cal/OSHA publishes updated enforcement guidance for SB 553 WVPP requirements.", effective_date: "2026-03-01", source_url: "https://www.dir.ca.gov/dosh/workplace-violence-prevention.html", severity: "critical", published_date: "2026-03-01", code: "SB-553-ENF", issuing_body: "Cal/OSHA", type: "amendment", description: "Updated enforcement guidance for SB 553 WVPP requirements.", impact_text: "Your WVPP documentation, training records, and incident logs must comply.", compliance_deadline: "2026-04-15", acknowledged_by: [], created_at: "2026-03-01T08:00:00Z" },
    { jurisdiction: "Federal", category: "leave", title: "FMLA Clarification — Remote Worker Eligibility", summary: "DOL clarifies that remote workers are considered at their assigned office location for FMLA eligibility.", effective_date: "2026-05-01", source_url: "https://www.dol.gov/agencies/whd/fmla", severity: "info", published_date: "2026-03-15", code: "DOL-FMLA-2026", issuing_body: "U.S. Department of Labor", type: "guidance", description: "FMLA remote worker eligibility clarification.", impact_text: null, compliance_deadline: null, acknowledged_by: [], created_at: "2026-03-15T08:00:00Z" },
  ])

  if (error) throw new Error(`Regulatory updates insert failed: ${error.message}`)
  console.log("   ✅ 6 regulatory updates")
}

async function seedSubcontractors(userId: string) {
  console.log("🏗️  Seeding subcontractors...")

  const { error } = await supabase.from("construction_subs").insert([
    { client_id: userId, company_name: "Pacific Concrete Solutions", license_number: "CSLB-987654", license_status: "valid", license_expiry: "2027-08-15", insurance_status: "valid", insurance_expiry: "2027-03-01", verified_at: "2026-03-01T10:00:00Z", created_at: "2025-12-01T08:00:00Z" },
    { client_id: userId, company_name: "SafeBuilders Inc", license_number: "CSLB-123456", license_status: "expiring", license_expiry: "2026-05-01", insurance_status: "valid", insurance_expiry: "2026-12-15", verified_at: "2026-02-15T14:00:00Z", created_at: "2025-12-01T08:00:00Z" },
    { client_id: userId, company_name: "Bay Area Electrical Co", license_number: "CSLB-456789", license_status: "valid", license_expiry: "2028-01-20", insurance_status: "expired", insurance_expiry: "2026-02-28", verified_at: null, created_at: "2026-01-10T08:00:00Z" },
    { client_id: userId, company_name: "Golden State Plumbing", license_number: "CSLB-654321", license_status: "valid", license_expiry: "2027-11-30", insurance_status: "valid", insurance_expiry: "2027-06-15", verified_at: "2026-03-10T11:00:00Z", created_at: "2026-01-15T08:00:00Z" },
    { client_id: userId, company_name: "Foundation Experts LLC", license_number: "CSLB-246810", license_status: "suspended", license_expiry: "2026-01-15", insurance_status: "unknown", insurance_expiry: null, verified_at: null, created_at: "2026-02-01T08:00:00Z" },
  ])

  if (error) throw new Error(`Subcontractors insert failed: ${error.message}`)
  console.log("   ✅ 5 subcontractors")
}

async function seedProperties(userId: string) {
  console.log("🏢 Seeding properties...")

  const { error } = await supabase.from("property_portfolio").insert([
    { client_id: userId, property_name: "Coastal View Apartments", address: "456 Ocean Ave", city: "Santa Monica", state: "CA", units: 24, property_type: "residential", compliance_status: "compliant", created_at: "2025-11-20T09:00:00Z" },
    { client_id: userId, property_name: "Downtown Medical Plaza", address: "789 Main St", city: "Los Angeles", state: "CA", units: 8, property_type: "commercial", compliance_status: "at-risk", created_at: "2025-12-05T10:00:00Z" },
    { client_id: userId, property_name: "Harbor Point Mixed-Use", address: "123 Harbor Blvd", city: "Long Beach", state: "CA", units: 36, property_type: "mixed-use", compliance_status: "compliant", created_at: "2026-01-10T08:00:00Z" },
    { client_id: userId, property_name: "Westside Retail Center", address: "321 Wilshire Blvd", city: "Beverly Hills", state: "CA", units: 6, property_type: "commercial", compliance_status: "non-compliant", created_at: "2026-02-01T08:00:00Z" },
  ])

  if (error) throw new Error(`Properties insert failed: ${error.message}`)
  console.log("   ✅ 4 properties")
}

async function seedMunicipalOrdinances() {
  console.log("📜 Seeding municipal ordinances...")

  const { error } = await supabase.from("municipal_ordinances").insert([
    { jurisdiction: "City of Los Angeles", title: "LA Fair Work Week Ordinance", summary: "Requires healthcare employers with 500+ employees to provide 14 days advance notice of work schedules.", ordinance_number: "LA-ORD-2025-0847", effective_date: "2026-04-01", category: "scheduling", source_url: "https://clkrep.lacity.org/onlinedocs/2025/25-0847_ord.pdf", created_at: "2026-01-10T08:00:00Z" },
    { jurisdiction: "City of San Francisco", title: "SF Health Care Security Ordinance Update", summary: "Updated employer healthcare expenditure requirements for covered employers in San Francisco.", ordinance_number: "SF-ORD-2025-2241", effective_date: "2026-01-01", category: "healthcare-spending", source_url: "https://sfgov.org/olse/health-care-security-ordinance", created_at: "2025-12-15T08:00:00Z" },
    { jurisdiction: "California", title: "CA Indoor Heat Illness Prevention Standard", summary: "Cal/OSHA indoor heat illness prevention standard requires cooling measures when indoor temps exceed 82°F.", ordinance_number: "CA-OSHA-2025-IH", effective_date: "2026-05-01", category: "workplace-safety", source_url: "https://www.dir.ca.gov/dosh/indoor-heat.html", created_at: "2026-02-01T08:00:00Z" },
  ])

  if (error) throw new Error(`Municipal ordinances insert failed: ${error.message}`)
  console.log("   ✅ 3 municipal ordinances")
}

async function seedAuditLog(userId: string) {
  console.log("📝 Seeding audit log...")

  const { error } = await supabase.from("audit_log").insert([
    { client_id: userId, event_type: "document.generated", description: "WVPP document generated and delivered", metadata: { document_id: "DOC-2026-001", type: "wvpp", pages: 34 }, created_at: "2026-01-05T10:00:00Z" },
    { client_id: userId, event_type: "incident.reported", description: "Critical incident reported — verbal threat in waiting area", metadata: { incident_id: "INC-2026-001", severity: "severe" }, created_at: "2026-01-12T16:45:00Z" },
    { client_id: userId, event_type: "audit.completed", description: "January 2026 monthly compliance audit completed — score: 78", metadata: { audit_id: "AUD-2026-01", score: 78, checks_passed: 6, checks_total: 10 }, created_at: "2026-02-01T08:00:00Z" },
    { client_id: userId, event_type: "training.assigned", description: "HIPAA Privacy training assigned to 2 employees", metadata: { training_type: "HIPAA Privacy", employee_count: 2, due_date: "2026-02-15" }, created_at: "2026-02-01T09:00:00Z" },
    { client_id: userId, event_type: "baa.signed", description: "BAA signed with CloudVault Health for cloud storage services", metadata: { vendor: "CloudVault Health", service: "Cloud Storage (HIPAA)", expiration: "2027-02-28" }, created_at: "2026-02-15T14:00:00Z" },
    { client_id: userId, event_type: "audit.completed", description: "February 2026 monthly audit — score: 82", metadata: { audit_id: "AUD-2026-02", score: 82, checks_passed: 8, checks_total: 10 }, created_at: "2026-03-01T08:00:00Z" },
    { client_id: userId, event_type: "score.recalculated", description: "Compliance score recalculated: 78 → 83", metadata: { previous_score: 78, new_score: 83, factors: ["training_completions", "baa_progress"] }, created_at: "2026-03-15T10:00:00Z" },
    { client_id: userId, event_type: "audit.completed", description: "March 2026 monthly audit — score: 85", metadata: { audit_id: "AUD-2026-03", score: 85, checks_passed: 9, checks_total: 10 }, created_at: "2026-03-28T08:00:00Z" },
  ])

  if (error) throw new Error(`Audit log insert failed: ${error.message}`)
  console.log("   ✅ 8 audit log entries")
}

async function main() {
  console.log("\n🌱 Protekon Demo Seed — Hosted Supabase\n")

  const userId = await seedAuth()
  await cleanTables(userId)
  await seedClient(userId)
  await seedIncidents(userId)
  await seedDocuments(userId)
  await seedAudits(userId)
  await seedTraining(userId)
  await seedBaa(userId)
  await seedPhi(userId)
  await seedPosters(userId)
  await seedScheduledDeliveries(userId)
  await seedSubcontractors(userId)
  await seedProperties(userId)
  await seedRegulatoryUpdates()
  await seedMunicipalOrdinances()
  await seedAuditLog(userId)

  console.log("\n✅ Seed complete!")
  console.log(`   Login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`)
  console.log(`   User ID: ${userId}\n`)
}

main().catch((err) => {
  console.error("\n❌ Seed failed:", err.message)
  process.exit(1)
})
