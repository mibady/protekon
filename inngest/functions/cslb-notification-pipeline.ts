/**
 * inngest/functions/cslb-notification-pipeline.ts
 *
 * Wires the intel DB change-detection pipeline to the app DB + Resend.
 *
 * Schedule: runs every 4 hours.
 * Triggered also by: "cslb/detect.complete" event (fired by the scraper function).
 *
 * Flow:
 *   1. Call cslb_pending_notifications() in intel DB
 *   2. For each row: upsert alert in app DB (idempotent via source_ref)
 *   3. Update cached CSLB fields on construction_subs
 *   4. Send Resend email (only if client has email notifications enabled)
 *   5. Call cslb_mark_notified(change_ids[]) to close the loop
 *
 * Dependencies:
 *   - @supabase/supabase-js  (two clients: intel DB + app DB)
 *   - resend
 *   - inngest
 */

import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"
import { inngest } from "../client"

// ── Supabase clients ─────────────────────────────────────────────────────────
// Intel DB (vizmtkfpxxjzlpzibate) — CSLB data, change log, risk config
const intelDb = createClient(
  process.env.INTEL_SUPABASE_URL!,
  process.env.INTEL_SUPABASE_SERVICE_KEY! // service role — bypasses RLS
)

// App DB (yfkledwhwsembikpjynu) — clients, construction_subs, alerts
const appDb = createClient(
  process.env.APP_SUPABASE_URL!,
  process.env.APP_SUPABASE_SERVICE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY!)

// ── Types ────────────────────────────────────────────────────────────────────

interface PendingNotification {
  change_id: string
  license_no: string
  business_name: string
  app_client_id: string
  app_sub_id: string | null
  relationship_type: string
  change_type: string
  field_name: string
  previous_value: string | null
  new_value: string | null
  severity: "critical" | "warning"
  risk_score: number
  trade_classifications: string[] | null
  entity_type: string | null
  county: string | null
  wc_expiration_date: string | null
  license_expiration_date: string | null
  detected_at: string
  notify_critical: boolean
  notify_warning: boolean
}

interface Client {
  id: string
  email: string
  business_name: string
  notification_preferences: {
    regulatory_updates: boolean
    document_reminders: boolean
    weekly_summaries: boolean
    incident_alerts: boolean
    marketing_emails: boolean
  }
}

// ── Inngest function ─────────────────────────────────────────────────────────

export const cslbNotificationPipeline = inngest.createFunction(
  {
    id: "cslb-notification-pipeline",
    name: "CSLB Notification Pipeline",
    retries: 3,
    concurrency: { limit: 1, key: "cslb-pipeline" },
    triggers: [
      { cron: "0 */4 * * *" },
      { event: "cslb/detect.complete" },
    ],
  },
  async ({ step, logger }) => {
    // ── Step 1: Fetch pending notifications from intel DB ──────────────────
    const notifications = await step.run("fetch-pending-notifications", async () => {
      const { data, error } = await intelDb.rpc("cslb_pending_notifications")
      if (error) throw new Error(`cslb_pending_notifications() failed: ${error.message}`)
      return (data as PendingNotification[]) ?? []
    })

    if (notifications.length === 0) {
      logger.info("No pending CSLB notifications.")
      return { processed: 0 }
    }

    logger.info(
      `Processing ${notifications.length} pending notifications across ${
        new Set(notifications.map((n) => n.app_client_id)).size
      } clients.`
    )

    // ── Step 2: Fetch client records from app DB (batch, one query) ────────
    const clientIds = [...new Set(notifications.map((n) => n.app_client_id))]

    const clients = await step.run("fetch-clients", async () => {
      const { data, error } = await appDb
        .from("clients")
        .select("id, email, business_name, notification_preferences")
        .in("id", clientIds)
      if (error) throw new Error(`clients fetch failed: ${error.message}`)
      return Object.fromEntries((data as Client[]).map((c) => [c.id, c]))
    })

    // ── Step 3: Upsert alerts in app DB (idempotent via source_ref) ────────
    const alertsToInsert = await step.run("upsert-app-db-alerts", async () => {
      const rows = notifications.map((n) => ({
        client_id: n.app_client_id,
        type: "cslb_license_change",
        title: buildAlertTitle(n),
        message: buildAlertMessage(n),
        severity: mapSeverity(n.risk_score),
        source_ref: n.change_id, // unique — prevents duplicates on retry
        action_url: buildActionUrl(n),
        metadata: {
          risk_score: n.risk_score,
          license_no: n.license_no,
          business_name: n.business_name,
          change_type: n.change_type,
          field_name: n.field_name,
          previous_value: n.previous_value,
          new_value: n.new_value,
          trade_classifications: n.trade_classifications,
          entity_type: n.entity_type,
          county: n.county,
          wc_expiration_date: n.wc_expiration_date,
          license_expiration_date: n.license_expiration_date,
          detected_at: n.detected_at,
          relationship_type: n.relationship_type,
        },
      }))

      // upsert on source_ref — safe to re-run if Inngest retries
      const { error } = await appDb
        .from("alerts")
        .upsert(rows, { onConflict: "source_ref", ignoreDuplicates: true })

      if (error) throw new Error(`alerts upsert failed: ${error.message}`)
      return rows.length
    })

    // ── Step 4: Update cached CSLB fields on construction_subs ────────────
    // Only update rows where app_sub_id is present (not all changes have a sub reference)
    const subUpdates = notifications.filter((n) => n.app_sub_id !== null)
    if (subUpdates.length > 0) {
      await step.run("update-construction-subs-cache", async () => {
        // Group by sub_id and take the highest-risk notification for each
        const bySubId = new Map<string, PendingNotification>()
        for (const n of subUpdates) {
          const existing = bySubId.get(n.app_sub_id!)
          if (!existing || n.risk_score > existing.risk_score) {
            bySubId.set(n.app_sub_id!, n)
          }
        }

        // Batch update — one per sub (no parallel N+1 queries)
        const updates = [...bySubId.entries()].map(([subId, n]) =>
          appDb
            .from("construction_subs")
            .update({
              cslb_primary_status: n.new_value,
              cslb_risk_score: n.risk_score,
              cslb_wc_expires: n.wc_expiration_date,
              cslb_license_expires: n.license_expiration_date,
              cslb_last_synced: new Date().toISOString(),
            })
            .eq("id", subId)
        )

        const results = await Promise.all(updates)
        const failed = results.filter((r) => r.error)
        if (failed.length > 0) {
          logger.warn(`${failed.length} construction_subs updates failed (non-fatal)`)
        }
        return results.length - failed.length
      })
    }

    // ── Step 5: Send Resend emails ─────────────────────────────────────────
    // Only for critical alerts OR risk_score >= 75, and only if client has
    // regulatory_updates enabled in notification_preferences.
    const emailTargets = notifications.filter((n) => {
      const client = clients[n.app_client_id]
      if (!client) return false
      const prefs = client.notification_preferences

      // WC lapses bypass the preference check — always email (per risk_config notes)
      if (n.change_type === "wc_lapse") return true

      return prefs.regulatory_updates && (n.severity === "critical" || n.risk_score >= 75)
    })

    if (emailTargets.length > 0) {
      await step.run("send-resend-emails", async () => {
        // Cap at 50 emails per run to stay within Resend rate limits
        const batch = emailTargets.slice(0, 50)
        const emails = batch.map((n) => {
          const client = clients[n.app_client_id]
          return {
            from: "Protekon Alerts <alerts@protekon.com>",
            to: client.email,
            subject: buildEmailSubject(n),
            html: buildEmailHtml(n, client),
            tags: [
              { name: "change_type", value: n.change_type },
              { name: "severity", value: n.severity },
              { name: "risk_score", value: String(n.risk_score) },
            ],
          }
        })

        // Resend batch API — up to 100 per call
        const { error } = await resend.batch.send(emails)
        if (error) {
          // Log but don't throw — alerts are already in DB, email is best-effort
          logger.error("Resend batch failed (non-fatal):", error)
        }
        return batch.length
      })
    }

    // ── Step 6: Mark notified in intel DB ──────────────────────────────────
    // Only mark IDs that are now safely in the app DB alerts table.
    // This is the last step so that any failure in steps 3-5 will cause
    // Inngest to retry the full run — the upsert on source_ref is idempotent.
    const changeIds = notifications.map((n) => n.change_id)

    await step.run("mark-notified", async () => {
      const { data: markedCount, error } = await intelDb.rpc("cslb_mark_notified", {
        change_ids: changeIds,
      })
      if (error) throw new Error(`cslb_mark_notified() failed: ${error.message}`)
      logger.info(`Marked ${markedCount} changes as notified.`)
      return markedCount
    })

    return {
      processed: notifications.length,
      alerts_upserted: alertsToInsert,
      emails_sent: emailTargets.length,
      clients_hit: clientIds.length,
    }
  }
)

// ── Registration helper (called when a GC adds a sub in the app) ─────────────

/**
 * Call this from the app's API route or server action when a client
 * adds or updates a subcontractor with a CSLB license number.
 *
 * This is the "write" side — registers the license for monitoring.
 * The read side (alerts) is handled by the pipeline above.
 */
export async function registerLicenseForMonitoring(params: {
  licenseNo: string
  appClientId: string
  appSubId: string
  relationshipType: "subcontractor" | "vendor" | "own_license"
}) {
  const { licenseNo, appClientId, appSubId, relationshipType } = params

  // 1. Verify the license exists in the intel DB
  const { data: license, error: lookupError } = await intelDb
    .from("cslb_licenses")
    .select(
      "license_no, primary_status, business_type, county, wc_expiration_date, expiration_date"
    )
    .eq("license_no", licenseNo)
    .single()

  if (lookupError || !license) {
    return { success: false, reason: "license_not_found" }
  }

  // 2. Insert into cslb_monitored_licenses (upsert — idempotent)
  const { error: monitorError } = await intelDb.from("cslb_monitored_licenses").upsert(
    {
      license_no: licenseNo,
      app_client_id: appClientId,
      app_sub_id: appSubId,
      relationship_type: relationshipType,
      added_by: "client_action",
      removed_at: null, // re-activate if previously removed
    },
    { onConflict: "license_no,app_client_id" }
  )

  if (monitorError)
    throw new Error(`monitored_licenses upsert failed: ${monitorError.message}`)

  // 3. Set is_monitored = true on the license record
  await intelDb
    .from("cslb_licenses")
    .update({ is_monitored: true })
    .eq("license_no", licenseNo)

  // 4. Cache initial CSLB state on the construction_subs record
  await appDb
    .from("construction_subs")
    .update({
      cslb_license_no: licenseNo,
      cslb_sync_status: "monitoring",
      cslb_primary_status: license.primary_status,
      cslb_wc_expires: license.wc_expiration_date,
      cslb_license_expires: license.expiration_date,
      cslb_last_synced: new Date().toISOString(),
    })
    .eq("id", appSubId)

  return { success: true, current_status: license.primary_status }
}

// ── Removal helper ────────────────────────────────────────────────────────────

export async function stopMonitoringLicense(params: {
  licenseNo: string
  appClientId: string
}) {
  const { licenseNo, appClientId } = params

  // Soft-delete — preserve history
  const { error } = await intelDb
    .from("cslb_monitored_licenses")
    .update({ removed_at: new Date().toISOString() })
    .eq("license_no", licenseNo)
    .eq("app_client_id", appClientId)
    .is("removed_at", null)

  if (error) throw new Error(`deregister failed: ${error.message}`)

  // Check if any other clients still monitor this license
  const { count } = await intelDb
    .from("cslb_monitored_licenses")
    .select("*", { count: "exact", head: true })
    .eq("license_no", licenseNo)
    .is("removed_at", null)

  // If no other clients monitor it, unset is_monitored to stop WC lapse detection
  if ((count ?? 0) === 0) {
    await intelDb
      .from("cslb_licenses")
      .update({ is_monitored: false })
      .eq("license_no", licenseNo)
  }

  return { success: true }
}

// ── Notification content helpers ──────────────────────────────────────────────

function buildAlertTitle(n: PendingNotification): string {
  const subName = n.business_name ?? `License ${n.license_no}`
  switch (n.change_type) {
    case "wc_lapse":
      return `Workers' comp lapsed — ${subName}`
    case "status":
      if (n.new_value === "CLEAR") return `License restored — ${subName}`
      return `License suspended — ${subName}`
    case "bond":
      return `Bond cancelled — ${subName}`
    case "wc":
      return `Workers' comp coverage changed — ${subName}`
    case "expiration":
      return `License expiring soon — ${subName}`
    default:
      return `CSLB change detected — ${subName}`
  }
}

function buildAlertMessage(n: PendingNotification): string {
  const daysUntilExpiry = n.license_expiration_date
    ? Math.ceil(
        (new Date(n.license_expiration_date).getTime() - Date.now()) / 86400000
      )
    : null

  switch (n.change_type) {
    case "wc_lapse":
      return (
        `${n.business_name} has an active CLEAR license but their workers' compensation ` +
        `policy expired on ${n.previous_value}. Any work performed during this gap ` +
        `exposes you to full liability under the controlling employer doctrine.`
      )
    case "status":
      if (n.new_value === "CLEAR")
        return `${n.business_name} has been restored to CLEAR status. License is active.`
      return (
        `${n.business_name} status changed from ${n.previous_value} to ${n.new_value}. ` +
        `This license cannot legally perform work in California.`
      )
    case "bond":
      return (
        `${n.business_name}'s contractor bond was cancelled on ${n.new_value}. ` +
        `A suspension is typically issued within 30–90 days if not replaced. ` +
        `Do not use this sub for new work until the bond is reinstated.`
      )
    case "wc":
      return (
        `${n.business_name}'s workers' compensation coverage changed from ` +
        `"${n.previous_value}" to "${n.new_value}".`
      )
    case "expiration":
      return daysUntilExpiry !== null && daysUntilExpiry >= 0
        ? `${n.business_name}'s license expires in ${daysUntilExpiry} days (${n.new_value}).`
        : `${n.business_name}'s license has expired.`
    default:
      return `${n.change_type} changed on ${n.business_name}: ${n.previous_value} → ${n.new_value}`
  }
}

function buildEmailSubject(n: PendingNotification): string {
  if (n.risk_score === 100) return `[Action Required] ${buildAlertTitle(n)}`
  if (n.risk_score >= 75) return `[Warning] ${buildAlertTitle(n)}`
  return `[Notice] ${buildAlertTitle(n)}`
}

function buildActionUrl(n: PendingNotification): string {
  return n.app_sub_id
    ? `/dashboard/construction/subs/${n.app_sub_id}`
    : `/dashboard/construction/subs?license=${n.license_no}`
}

function mapSeverity(riskScore: number): "high" | "medium" | "low" {
  if (riskScore >= 85) return "high"
  if (riskScore >= 60) return "medium"
  return "low"
}

function buildEmailHtml(n: PendingNotification, client: Client): string {
  const isWcLapse = n.change_type === "wc_lapse"
  const isRestored = n.change_type === "status" && n.new_value === "CLEAR"

  const urgencyColor =
    n.risk_score === 100 ? "#ef4444" : n.risk_score >= 75 ? "#f59e0b" : "#3b82f6"

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="font-family: system-ui, sans-serif; background: #f9fafb; margin: 0; padding: 24px;">
  <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e4e7ec;">
    <div style="background: ${urgencyColor}; padding: 4px 24px;">
      <span style="color: white; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em;">
        ${isRestored ? "License Restored" : n.severity === "critical" ? "Critical Alert" : "Warning"} · Risk Score ${n.risk_score}/100
      </span>
    </div>

    <div style="padding: 28px 28px 20px;">
      <p style="font-size: 13px; color: #6b7280; margin: 0 0 4px;">Hello ${client.business_name},</p>

      <h2 style="font-size: 18px; font-weight: 700; color: #111827; margin: 0 0 16px; line-height: 1.3;">
        ${buildAlertTitle(n)}
      </h2>

      <p style="font-size: 14px; color: #374151; line-height: 1.6; margin: 0 0 20px;">
        ${buildAlertMessage(n)}
      </p>

      <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 20px; font-size: 12px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="color: #6b7280; padding: 4px 0; width: 140px;">License #</td>
            <td style="color: #111827; font-family: monospace;">${n.license_no}</td>
          </tr>
          <tr>
            <td style="color: #6b7280; padding: 4px 0;">Business</td>
            <td style="color: #111827;">${n.business_name}</td>
          </tr>
          ${n.county ? `<tr><td style="color: #6b7280; padding: 4px 0;">County</td><td style="color: #111827;">${n.county}</td></tr>` : ""}
          ${n.trade_classifications?.length ? `<tr><td style="color: #6b7280; padding: 4px 0;">Trade Classes</td><td style="color: #111827;">${n.trade_classifications.join(", ")}</td></tr>` : ""}
          ${isWcLapse ? `<tr><td style="color: #6b7280; padding: 4px 0;">WC Expired</td><td style="color: #ef4444; font-weight: 600;">${n.wc_expiration_date}</td></tr>` : ""}
          ${n.license_expiration_date ? `<tr><td style="color: #6b7280; padding: 4px 0;">License Expires</td><td style="color: #111827;">${n.license_expiration_date}</td></tr>` : ""}
        </table>
      </div>

      ${!isRestored ? `
      <a href="${process.env.NEXT_PUBLIC_APP_URL}${buildActionUrl(n)}"
         style="display: inline-block; background: ${urgencyColor}; color: white;
                padding: 10px 20px; border-radius: 7px; text-decoration: none;
                font-size: 13px; font-weight: 600;">
        View in Protekon
      </a>
      ` : ""}
    </div>

    <div style="padding: 16px 28px; border-top: 1px solid #f3f4f6;">
      <p style="font-size: 11px; color: #9ca3af; margin: 0;">
        Protekon monitors CSLB data daily and alerts you to changes that create liability exposure.
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/notifications"
           style="color: #6b7280; text-decoration: underline;">Manage alert preferences</a>
      </p>
    </div>
  </div>
</body>
</html>`
}
