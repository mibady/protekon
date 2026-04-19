import { CTAButton } from "@/components/v2/primitives/CTAButton"
import { Card } from "@/components/v2/primitives/Card"

/**
 * Billing tab — links out to the existing Stripe portal.
 * TODO(later): inline plan details, invoice history, payment method.
 */
export function BillingTab() {
  return (
    <div className="space-y-6">
      <div
        className="font-display uppercase"
        style={{
          color: "var(--ink)",
          fontSize: "11px",
          letterSpacing: "3px",
          fontWeight: 600,
          borderBottom: "1px solid rgba(11, 29, 58, 0.08)",
          paddingBottom: "0.5rem",
        }}
      >
        Billing
      </div>

      <Card>
        <div className="space-y-4">
          <div>
            <div
              className="font-sans"
              style={{ color: "var(--ink)", fontSize: "15px", fontWeight: 600 }}
            >
              Manage billing in the Stripe customer portal
            </div>
            <div
              className="font-sans mt-1"
              style={{ color: "var(--steel)", fontSize: "13px", lineHeight: 1.5 }}
            >
              Update your payment method, download invoices, cancel, or change plans. You'll be
              redirected to Stripe's secure customer portal.
            </div>
          </div>

          <form action="/api/stripe/portal" method="POST">
            <CTAButton type="submit" icon={false}>
              Open billing portal
            </CTAButton>
          </form>
        </div>
      </Card>

      {/* TODO(later): invoice history, plan details, payment method, upgrade CTA. */}
    </div>
  )
}
