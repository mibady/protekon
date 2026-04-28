type ResendEmail = {
  id: string
  to: string[] | string
  from: string
  created_at: string
  // Resend's list endpoint returns the latest event in `last_event`. Possible
  // values: "sent", "delivered", "delivery_delayed", "bounced", "complained",
  // "opened", "clicked". Anything other than "delivered" means the email
  // didn't make it to the inbox — which is the exact failure mode that
  // happened in 2026-04-27 with the unverified protekon.com domain.
  last_event?: string
}

const TERMINAL_FAILURES = new Set(["bounced", "complained", "delivery_delayed"])

/**
 * Polls Resend's GET /emails endpoint until an email to `recipient` shows
 * `last_event = delivered`, or until a terminal failure is reported, or
 * until timeout. Throws on terminal failure or timeout.
 *
 * This is the single check that would have caught the 2026-04-27 silent-
 * failure bug. Don't trust that sendEmail() was called — assert that the
 * email actually delivered.
 */
export async function pollResendDelivery(
  recipient: string,
  opts: { timeoutMs?: number; intervalMs?: number } = {},
): Promise<ResendEmail> {
  const apiKey = process.env.JOURNEY_RESEND_API_KEY || process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error(
      "pollResendDelivery requires JOURNEY_RESEND_API_KEY or RESEND_API_KEY",
    )
  }
  const timeoutMs = opts.timeoutMs ?? 90_000
  const intervalMs = opts.intervalMs ?? 5_000
  const deadline = Date.now() + timeoutMs
  const target = recipient.toLowerCase()
  let lastSeen: ResendEmail | null = null

  while (Date.now() < deadline) {
    const res = await fetch("https://api.resend.com/emails", {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    if (res.ok) {
      const body = (await res.json()) as { data?: ResendEmail[] }
      const matches = (body.data ?? []).filter((e) => {
        const tos = Array.isArray(e.to) ? e.to : [e.to]
        return tos.some((t) => t.toLowerCase() === target)
      })

      const delivered = matches.find((m) => m.last_event === "delivered")
      if (delivered) return delivered

      const errored = matches.find((m) => TERMINAL_FAILURES.has(m.last_event ?? ""))
      if (errored) {
        throw new Error(
          `Resend reports terminal failure for ${recipient}: ` +
            `last_event=${errored.last_event} email_id=${errored.id}`,
        )
      }

      if (matches[0]) lastSeen = matches[0]
    }
    await sleep(intervalMs)
  }

  throw new Error(
    `pollResendDelivery timed out after ${timeoutMs}ms for ${recipient} ` +
      (lastSeen
        ? `(last_event=${lastSeen.last_event ?? "unknown"} email_id=${lastSeen.id})`
        : "(no email seen — webhook or sendEmail likely failed)"),
  )
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
