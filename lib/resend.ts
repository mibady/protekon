import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const FROM_ADDRESS = "Protekon <compliance@protekon.com>"

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  if (!resend) {
    console.log(`[email-dev] To: ${to} | Subject: ${subject}`)
    return null
  }

  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject,
    html,
  })

  if (error) {
    throw new Error(`Failed to send email to ${to}: ${error.message}`)
  }

  return data
}

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://protekon.com"
}

export function getComplianceOfficerEmail(): string {
  const email = process.env.COMPLIANCE_OFFICER_EMAIL
  if (!email) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("COMPLIANCE_OFFICER_EMAIL env var is required in production")
    }
    console.warn("[email-dev] COMPLIANCE_OFFICER_EMAIL not set, using fallback")
    return "compliance-dev@example.com"
  }
  return email
}
