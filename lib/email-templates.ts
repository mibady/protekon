import { getSiteUrl } from "@/lib/resend"

function layoutWrapper(content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f3ef;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:24px;font-weight:800;color:#1a1a2e;letter-spacing:1px;">PROTEKON</span>
    </div>
    <div style="background:#ffffff;border:1px solid #e5e5e5;padding:32px;">
      ${content}
    </div>
    <div style="text-align:center;margin-top:24px;font-size:12px;color:#888;">
      Protekon Compliance &middot; California Workplace Safety
    </div>
  </div>
</body>
</html>`
}

export function welcomeEmail(email: string) {
  return {
    subject: "Welcome to Protekon",
    html: layoutWrapper(`
      <h2 style="color:#1a1a2e;margin:0 0 16px;">Welcome to Protekon</h2>
      <p style="color:#555;line-height:1.6;">Your account (${email}) is set up. Log in to your dashboard to complete your compliance intake questionnaire and get started.</p>
      <a href="${getSiteUrl()}/dashboard" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#1a1a2e;color:#f5f3ef;text-decoration:none;font-weight:600;font-size:13px;letter-spacing:1px;">GO TO DASHBOARD</a>
    `),
  }
}

export function intakeWelcomeEmail(email: string, score: number, riskLevel: string, plan?: string) {
  const color = riskLevel === "low" ? "#16a34a" : riskLevel === "medium" ? "#ca8a04" : "#dc2626"
  const tierName = plan === "multi-site" ? "Multi-Site" : plan === "professional" ? "Professional" : "Core"

  const tierFeatures: Record<string, string[]> = {
    core: [
      "1 location covered",
      "AI-generated IIPP + SB 553 WVPP",
      "Incident logging with PII stripping",
      "Weekly regulatory monitoring",
      "Monthly compliance report to inbox",
      "AI compliance chat assistant",
    ],
    professional: [
      "Up to 2 locations covered",
      "AI-generated IIPP + SB 553 + Emergency Action Plan",
      "Unlimited incident logging + AI classification",
      "Daily regulatory monitoring + AI impact analysis",
      "Weekly + monthly reports delivered to inbox",
      "Quarterly compliance reviews",
      "Priority support + dedicated analyst",
    ],
    "multi-site": [
      "Up to 3 locations covered",
      "Full vertical compliance stack",
      "Consolidated multi-site reporting",
      "Same-day document delivery",
      "Dedicated compliance analyst (human review)",
      "Annual audit package",
      "White-glove onboarding — your analyst will reach out within 24 hours",
    ],
  }

  const features = tierFeatures[plan || "core"] ?? tierFeatures.core

  return {
    subject: `Your Compliance Score: ${score}% — ${tierName} Plan Activated`,
    html: layoutWrapper(`
      <h2 style="color:#1a1a2e;margin:0 0 16px;">Intake Complete — ${tierName} Plan</h2>
      <p style="color:#555;line-height:1.6;">Thanks for completing your intake, ${email}. Here's your initial assessment:</p>
      <div style="text-align:center;margin:24px 0;">
        <span style="font-size:48px;font-weight:800;color:${color};">${score}%</span>
        <br><span style="font-size:14px;color:#888;text-transform:uppercase;letter-spacing:2px;">${riskLevel} risk</span>
      </div>
      <h3 style="color:#1a1a2e;margin:24px 0 12px;font-size:15px;">Your ${tierName} Plan Includes:</h3>
      <ul style="color:#555;line-height:1.8;padding-left:20px;">
        ${features.map(f => `<li>${f}</li>`).join("")}
      </ul>
      <p style="color:#555;line-height:1.6;margin-top:16px;">Your compliance documents are being generated and will be ready within 48 hours.</p>
      ${plan === "multi-site" ? '<p style="color:#C9A84C;font-weight:600;margin-top:12px;">Your dedicated compliance analyst will reach out within 24 hours to begin your white-glove onboarding.</p>' : ""}
    `),
  }
}

export function documentReadyEmail(documentType: string, businessName: string) {
  return {
    subject: `Document Ready: ${documentType}`,
    html: layoutWrapper(`
      <h2 style="color:#1a1a2e;margin:0 0 16px;">Your Document is Ready</h2>
      <p style="color:#555;line-height:1.6;">A new document has been generated for <strong>${businessName}</strong>:</p>
      <div style="background:#f5f3ef;padding:16px;margin:16px 0;border-left:3px solid #b91c1c;">
        <strong style="color:#1a1a2e;">${documentType}</strong>
      </div>
      <a href="${getSiteUrl()}/dashboard/documents" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#1a1a2e;color:#f5f3ef;text-decoration:none;font-weight:600;font-size:13px;letter-spacing:1px;">VIEW DOCUMENTS</a>
    `),
  }
}

export function incidentAlertEmail(incidentId: string, businessName: string, severity: string) {
  const color = severity === "severe" ? "#dc2626" : severity === "serious" ? "#ca8a04" : "#555"
  return {
    subject: `Incident Alert: ${incidentId} — ${severity.toUpperCase()}`,
    html: layoutWrapper(`
      <h2 style="color:#1a1a2e;margin:0 0 16px;">Incident Reported</h2>
      <p style="color:#555;line-height:1.6;">A new incident has been logged for <strong>${businessName}</strong>.</p>
      <div style="background:#f5f3ef;padding:16px;margin:16px 0;border-left:3px solid ${color};">
        <strong style="color:#1a1a2e;">ID:</strong> ${incidentId}<br>
        <strong style="color:#1a1a2e;">Severity:</strong> <span style="color:${color};font-weight:600;">${severity.toUpperCase()}</span>
      </div>
      <a href="${getSiteUrl()}/dashboard/incidents" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#1a1a2e;color:#f5f3ef;text-decoration:none;font-weight:600;font-size:13px;letter-spacing:1px;">VIEW INCIDENT</a>
    `),
  }
}

export function paymentWarning1Email(amount: number, invoiceId: string) {
  return {
    subject: "Payment Failed — Action Required",
    html: layoutWrapper(`
      <h2 style="color:#1a1a2e;margin:0 0 16px;">Payment Failed</h2>
      <p style="color:#555;line-height:1.6;">We were unable to process your payment of <strong>$${amount.toFixed(2)}</strong> (invoice ${invoiceId}).</p>
      <p style="color:#555;line-height:1.6;">Please update your payment method to avoid service interruption.</p>
      <a href="${getSiteUrl()}/dashboard/settings" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#1a1a2e;color:#f5f3ef;text-decoration:none;font-weight:600;font-size:13px;letter-spacing:1px;">UPDATE PAYMENT</a>
    `),
  }
}

export function paymentWarning2Email(businessName: string) {
  return {
    subject: "URGENT: Account at Risk of Suspension",
    html: layoutWrapper(`
      <h2 style="color:#dc2626;margin:0 0 16px;">Account at Risk</h2>
      <p style="color:#555;line-height:1.6;">This is a second notice for <strong>${businessName}</strong>. Your payment is still outstanding and your account will be suspended in 7 days if not resolved.</p>
      <a href="${getSiteUrl()}/dashboard/settings" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#dc2626;color:#fff;text-decoration:none;font-weight:600;font-size:13px;letter-spacing:1px;">UPDATE PAYMENT NOW</a>
    `),
  }
}

export function suspensionNoticeEmail(businessName: string, invoiceId: string) {
  return {
    subject: "Account Suspended — Immediate Action Required",
    html: layoutWrapper(`
      <h2 style="color:#dc2626;margin:0 0 16px;">Account Suspended</h2>
      <p style="color:#555;line-height:1.6;">The account for <strong>${businessName}</strong> has been suspended due to non-payment (invoice ${invoiceId}).</p>
      <p style="color:#555;line-height:1.6;">Compliance monitoring and document delivery have been paused. Contact us to restore your account.</p>
      <a href="${getSiteUrl()}/contact" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#1a1a2e;color:#f5f3ef;text-decoration:none;font-weight:600;font-size:13px;letter-spacing:1px;">CONTACT SUPPORT</a>
    `),
  }
}

export function auditAlertEmail(businessName: string, score: number, status: string) {
  const color = status === "at-risk" ? "#ca8a04" : "#dc2626"
  return {
    subject: `Monthly Audit: ${businessName} — ${status}`,
    html: layoutWrapper(`
      <h2 style="color:#1a1a2e;margin:0 0 16px;">Monthly Compliance Audit</h2>
      <p style="color:#555;line-height:1.6;">Your monthly audit for <strong>${businessName}</strong> is complete.</p>
      <div style="text-align:center;margin:24px 0;">
        <span style="font-size:48px;font-weight:800;color:${color};">${score}%</span>
        <br><span style="font-size:14px;color:${color};text-transform:uppercase;letter-spacing:2px;">${status}</span>
      </div>
      <p style="color:#555;line-height:1.6;">Log in to review findings and take corrective action.</p>
      <a href="${getSiteUrl()}/dashboard/reports" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#1a1a2e;color:#f5f3ef;text-decoration:none;font-weight:600;font-size:13px;letter-spacing:1px;">VIEW REPORT</a>
    `),
  }
}

export function trainingOverdueEmail(employeeName: string, trainingType: string, dueDate: string) {
  return {
    subject: `Training Overdue: ${employeeName} — ${trainingType}`,
    html: layoutWrapper(`
      <h2 style="color:#dc2626;margin:0 0 16px;">Training Overdue</h2>
      <p style="color:#555;line-height:1.6;"><strong>${employeeName}</strong> has not completed required training:</p>
      <div style="background:#f5f3ef;padding:16px;margin:16px 0;border-left:3px solid #dc2626;">
        <strong style="color:#1a1a2e;">${trainingType}</strong><br>
        <span style="color:#888;">Due: ${dueDate}</span>
      </div>
      <a href="${getSiteUrl()}/dashboard" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#1a1a2e;color:#f5f3ef;text-decoration:none;font-weight:600;font-size:13px;letter-spacing:1px;">VIEW TRAINING</a>
    `),
  }
}

export function trainingUpcomingEmail(employeeName: string, trainingType: string, dueDate: string) {
  return {
    subject: `Training Due Soon: ${employeeName} — ${trainingType}`,
    html: layoutWrapper(`
      <h2 style="color:#1a1a2e;margin:0 0 16px;">Training Reminder</h2>
      <p style="color:#555;line-height:1.6;"><strong>${employeeName}</strong> has upcoming training due within 7 days:</p>
      <div style="background:#f5f3ef;padding:16px;margin:16px 0;border-left:3px solid #ca8a04;">
        <strong style="color:#1a1a2e;">${trainingType}</strong><br>
        <span style="color:#888;">Due: ${dueDate}</span>
      </div>
    `),
  }
}

export function trainingEscalationEmail(count: number) {
  return {
    subject: `Training Escalation: ${count} records 2+ weeks overdue`,
    html: layoutWrapper(`
      <h2 style="color:#dc2626;margin:0 0 16px;">Training Escalation</h2>
      <p style="color:#555;line-height:1.6;"><strong>${count}</strong> training record${count === 1 ? "" : "s"} are more than 2 weeks overdue and require immediate attention.</p>
      <a href="${getSiteUrl()}/dashboard" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#dc2626;color:#fff;text-decoration:none;font-weight:600;font-size:13px;letter-spacing:1px;">REVIEW NOW</a>
    `),
  }
}
