import { inngest } from "../client"
import { createAdminClient } from "@/lib/supabase/admin"

const VERTICAL_DOC_TYPES: Record<string, string[]> = {
  construction: ["construction-compliance-plan", "construction-gap-analysis"],
  healthcare: ["healthcare-compliance-plan", "bbp-exposure-control"],
  "real-estate": ["real-estate-compliance-plan", "habitability-report"],
  manufacturing: ["manufacturing-compliance-plan", "loto-procedures"],
  hospitality: ["hospitality-compliance-plan"],
  retail: ["retail-compliance-plan"],
  wholesale: ["wholesale-compliance-plan"],
  agriculture: ["agriculture-compliance-plan"],
  transportation: ["transportation-compliance-plan", "fleet-safety-program"],
  "auto-services": ["auto-services-compliance-plan"],
}

export const planUpdatePipeline = inngest.createFunction(
  { id: "plan-update-pipeline", triggers: [{ event: "compliance/regulation.changed" }] },
  async ({ event, step }) => {
    const { regulationId, affectedVerticals, severity } = event.data as {
      regulationId: string
      affectedVerticals: string[]
      severity: string
    }
    const supabase = createAdminClient()

    // Step 1: Find affected clients
    const clients = await step.run("find-affected-clients", async () => {
      const { data } = await supabase
        .from("clients")
        .select("id, email, business_name, vertical, plan")
        .eq("status", "active")
        .in("vertical", affectedVerticals)

      return data || []
    })

    if (clients.length === 0) return { success: true, affected: 0 }

    // Step 2: Queue document regeneration for each client
    const queued = await step.run("queue-doc-regeneration", async () => {
      let count = 0
      for (const client of clients) {
        const docTypes = VERTICAL_DOC_TYPES[client.vertical] || [`${client.vertical}-compliance-plan`]

        for (const docType of docTypes) {
          // Mark existing doc as outdated
          await supabase
            .from("documents")
            .update({ status: "outdated" })
            .eq("client_id", client.id)
            .eq("type", docType)
            .eq("status", "current")

          // Request regeneration
          await inngest.send({
            name: "compliance/document.requested",
            data: {
              clientId: client.id,
              email: client.email,
              businessName: client.business_name,
              documentType: docType,
              vertical: client.vertical,
            },
          })
          count++
        }
      }
      return count
    })

    // Step 3: Log the batch update
    await step.run("log-batch-update", async () => {
      await supabase.from("audit_log").insert({
        client_id: clients[0]?.id,
        event_type: "regulatory.batch_plan_update",
        description: `Regulatory change triggered plan updates for ${clients.length} clients (${queued} documents queued)`,
        metadata: {
          regulationId,
          affectedVerticals,
          severity,
          clientCount: clients.length,
          documentsQueued: queued,
        },
      })
    })

    return { success: true, affected: clients.length, documentsQueued: queued }
  }
)
