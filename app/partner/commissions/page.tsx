import { getPartnerCommissions } from "@/lib/actions/partner-commissions"
import { formatCents } from "@/lib/partner-commissions-format"

export const dynamic = "force-dynamic"

export default async function PartnerCommissionsPage() {
  const { commissions, totalCents, paidCents, pendingCents, currency } =
    await getPartnerCommissions()

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="font-display font-bold text-[22px] tracking-[3px] uppercase text-midnight">
          Commissions
        </h1>
        <p className="font-sans text-[13px] text-steel mt-1">
          Every dollar earned on referred clients, rolled up by period.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Earned"
          value={formatCents(totalCents, currency)}
          testId="commissions-total"
        />
        <StatCard
          label="Paid"
          value={formatCents(paidCents, currency)}
          testId="commissions-paid"
          accent="forest"
        />
        <StatCard
          label="Pending"
          value={formatCents(pendingCents, currency)}
          testId="commissions-pending"
          accent="crimson"
        />
      </div>

      <div className="bg-brand-white border border-midnight/[0.08]">
        {commissions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-sans text-[13px] text-steel">
              No commissions recorded yet. They&apos;ll appear here once a
              referred client reaches their first billing period.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-parchment border-b border-midnight/[0.08]">
              <tr>
                <th className="text-left px-4 py-3 font-display font-semibold text-[11px] tracking-[1.5px] uppercase text-steel">
                  Period
                </th>
                <th className="text-left px-4 py-3 font-display font-semibold text-[11px] tracking-[1.5px] uppercase text-steel">
                  Amount
                </th>
                <th className="text-left px-4 py-3 font-display font-semibold text-[11px] tracking-[1.5px] uppercase text-steel">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-display font-semibold text-[11px] tracking-[1.5px] uppercase text-steel">
                  Paid At
                </th>
              </tr>
            </thead>
            <tbody>
              {commissions.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-midnight/[0.04] last:border-b-0"
                >
                  <td className="px-4 py-3 font-sans text-[13px] text-midnight">
                    {new Date(c.period_start).toLocaleDateString()} –{" "}
                    {new Date(c.period_end).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 font-sans text-[13px] text-midnight tabular-nums">
                    {formatCents(c.amount_cents, c.currency)}
                  </td>
                  <td className="px-4 py-3 font-sans text-[12px]">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-[11px] uppercase tracking-[1px] font-display font-semibold ${
                        c.status === "paid"
                          ? "bg-forest/10 text-forest"
                          : c.status === "reversed"
                          ? "bg-steel/10 text-steel"
                          : "bg-crimson/10 text-crimson"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-sans text-[12px] text-steel">
                    {c.paid_at
                      ? new Date(c.paid_at).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  testId,
  accent,
}: {
  label: string
  value: string
  testId: string
  accent?: "forest" | "crimson"
}) {
  const accentClass =
    accent === "forest"
      ? "text-forest"
      : accent === "crimson"
      ? "text-crimson"
      : "text-midnight"
  return (
    <div className="bg-brand-white border border-midnight/[0.08] px-5 py-4">
      <p className="font-display font-semibold text-[11px] tracking-[1.5px] uppercase text-steel">
        {label}
      </p>
      <p
        data-testid={testId}
        className={`font-display font-bold text-[22px] mt-1 tabular-nums ${accentClass}`}
      >
        {value}
      </p>
    </div>
  )
}
