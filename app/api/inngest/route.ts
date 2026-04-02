import { serve } from "inngest/next"
import { inngest } from "@/inngest/client"
import { postSignup } from "@/inngest/functions/post-signup"
import { intakePipeline } from "@/inngest/functions/intake-pipeline"
import { documentGeneration } from "@/inngest/functions/document-generation"
import { incidentReport } from "@/inngest/functions/incident-report"
import { monthlyAudit } from "@/inngest/functions/monthly-audit"
import { trainingReminders } from "@/inngest/functions/training-reminders"
import { regulatoryScan } from "@/inngest/functions/regulatory-scan"
import { paymentFailed } from "@/inngest/functions/payment-failed"
import { scheduledDelivery } from "@/inngest/functions/scheduled-delivery"

export const maxDuration = 300

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    postSignup,
    intakePipeline,
    documentGeneration,
    incidentReport,
    monthlyAudit,
    trainingReminders,
    regulatoryScan,
    paymentFailed,
    scheduledDelivery,
  ],
})
