import { inngest } from "@/inngest/client"

/**
 * Triggered after Step 1 of the onboarding wizard. Pre-warms regulatory and
 * knowledge-base context so later steps feel instant. Phase 1A ships stubs
 * that log intent — Phase 2 wires the regulatory feed + KB seed.
 */
export const onboardingPrebuildContext = inngest.createFunction(
  {
    id: "onboarding-prebuild-context",
    triggers: [{ event: "onboarding/business.snapshot.submitted" }],
  },
  async ({ event, step }) => {
    const { clientId, vertical, operatingStates } = event.data as {
      clientId: string
      vertical: string
      operatingStates: string[]
    }

    await step.run("pre-warm-regulatory-feed", async () => {
      // TODO Phase 2: fetch regulatory change feed filtered by
      // (operatingStates × vertical) and cache for dashboard first-paint.
      return {
        status: "stubbed",
        clientId,
        vertical,
        states: operatingStates,
      }
    })

    await step.run("seed-knowledge-base", async () => {
      // TODO Phase 2: select top 8-12 KB articles by vertical tag and
      // associate them with the client for the wizard preview.
      return { status: "stubbed", clientId }
    })

    return {
      clientId,
      vertical,
      deferred: ["regulatory-feed", "knowledge-base"],
    }
  },
)
