import { inngest } from "@/inngest/client"
import { createAdminClient } from "@/lib/supabase/admin"

type ClientRow = {
  id: string
  email: string | null
  business_name: string | null
  vertical: string | null
  vertical_metadata: Record<string, unknown> | null
}

type DocRow = {
  type: string
  status: string
}

type IncidentRow = {
  id: string
}

type SiteRow = {
  employee_count: number | null
}

const IIPP_CATEGORIES = new Set([
  "iipp",
  "wvpp",
  "safety_program",
  "iipp_template",
  "wvpp_template",
])

const TRAINING_CATEGORIES = new Set([
  "training",
  "training_record",
  "heat_illness",
  "respirator",
  "hazcom",
  "ghs_sds",
])

const SATISFIED_STATUS = new Set(["approved", "generated", "active"])

function deriveIntakeAnswers(
  docs: DocRow[],
  incidents: IncidentRow[],
  sites: SiteRow[],
  automations: { expirationSweep?: boolean; regulatoryAlerts?: boolean } | null,
): Record<string, boolean> {
  const satisfied = docs.filter((d) => SATISFIED_STATUS.has(d.status))
  const hasIipp = satisfied.some((d) => IIPP_CATEGORIES.has(d.type))
  const hasTraining = satisfied.some((d) => TRAINING_CATEGORIES.has(d.type))

  const incidentLogActive = incidents.length > 0 || satisfied.length > 0
  const hazardsIdentified = sites.some(
    (s) => (s.employee_count ?? 0) > 0,
  )

  const reportingPolicy =
    Boolean(automations?.expirationSweep) || Boolean(automations?.regulatoryAlerts)

  return {
    wvpp_drafted: hasIipp,
    training_completed: hasTraining,
    incident_log_active: incidentLogActive,
    hazards_identified: hazardsIdentified,
    reporting_policy: reportingPolicy,
    union_confirmed: false,
  }
}

/**
 * Final step of the wizard. Stamps `onboarded_at`, flips status to completed,
 * then fires `compliance/intake.submitted` with a payload that matches the
 * legacy `lib/actions/intake.ts` contract exactly so `intake-pipeline.ts`
 * runs unchanged.
 */
export const onboardingFinalizeOnboarding = inngest.createFunction(
  {
    id: "onboarding-finalize-onboarding",
    retries: 3,
    triggers: [{ event: "onboarding/automations.configured" }],
  },
  async ({ event, step }) => {
    const { clientId, automations } = event.data

    await step.run("mark-completed", async () => {
      const admin = createAdminClient()
      const { error } = await admin
        .from("clients")
        .update({
          onboarding_status: "completed",
          onboarded_at: new Date().toISOString(),
          last_onboarding_step_completed: 7,
        })
        .eq("id", clientId)
      if (error) throw new Error(error.message)
    })

    const client = await step.run("load-client", async () => {
      const admin = createAdminClient()
      const { data, error } = await admin
        .from("clients")
        .select("id, email, business_name, vertical, vertical_metadata")
        .eq("id", clientId)
        .single<ClientRow>()
      if (error || !data) {
        throw new Error(error?.message ?? "client_not_found")
      }
      return data
    })

    const [docs, incidents, sites] = await Promise.all([
      step.run("load-documents", async () => {
        const admin = createAdminClient()
        const { data } = await admin
          .from("documents")
          .select("type, status")
          .eq("client_id", clientId)
          .returns<DocRow[]>()
        return data ?? []
      }),
      step.run("load-incidents", async () => {
        const admin = createAdminClient()
        const { data } = await admin
          .from("incidents")
          .select("id")
          .eq("client_id", clientId)
          .limit(1)
          .returns<IncidentRow[]>()
        return data ?? []
      }),
      step.run("load-sites", async () => {
        const admin = createAdminClient()
        const { data } = await admin
          .from("sites")
          .select("employee_count")
          .eq("client_id", clientId)
          .returns<SiteRow[]>()
        return data ?? []
      }),
    ])

    const automationToggles =
      (automations as Record<string, boolean> | undefined) ?? null
    const answers = deriveIntakeAnswers(docs, incidents, sites, automationToggles)

    await step.sendEvent("fire-intake-submitted", {
      name: "compliance/intake.submitted",
      data: {
        email: client.email ?? "",
        businessName: client.business_name ?? "",
        vertical: client.vertical ?? "other",
        answers,
      },
    })

    return { clientId, completed: true, answers }
  },
)
