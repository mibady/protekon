import Link from "next/link"
import type { ComponentType } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { VerticalSummary } from "@/lib/actions/healthcare-summary"

type IconProps = { size?: number; className?: string; weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone" }
type Icon = ComponentType<IconProps>

export type VerticalOverviewProps = {
  title: string
  description: string
  icon: Icon
  summary: VerticalSummary
  emptyCta?: { label: string; href: string; description: string }
}

function formatRelative(at: string): string {
  if (!at) return ""
  const t = Date.parse(at)
  if (Number.isNaN(t)) return ""
  const diffMs = Date.now() - t
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (days <= 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 30) return `${days}d ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

export function VerticalOverview({ title, description, icon: Icon, summary, emptyCta }: VerticalOverviewProps) {
  const hasData =
    summary.kpis.length > 0 &&
    summary.kpis.some((k) => (typeof k.value === "number" ? k.value > 0 : Boolean(k.value)))

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Hero */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center bg-crimson/[0.08]">
          <Icon size={24} className="text-crimson" weight="regular" />
        </div>
        <div className="flex-1">
          <h1 className="font-display font-bold text-[28px] tracking-[2px] text-midnight uppercase">{title}</h1>
          <p className="mt-1 font-sans text-[14px] text-steel leading-relaxed max-w-2xl">{description}</p>
        </div>
      </div>

      {/* KPIs */}
      {summary.kpis.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {summary.kpis.map((kpi) => (
            <Card key={kpi.label}>
              <CardHeader className="pb-2">
                <CardTitle className="font-display font-medium text-[10px] tracking-[2px] uppercase text-steel">
                  {kpi.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-display font-bold text-[28px] text-midnight">{kpi.value}</div>
                {kpi.hint ? (
                  <div className="mt-1 font-sans text-[12px] text-steel">{kpi.hint}</div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!hasData && emptyCta && (
        <Card>
          <CardContent className="py-8 text-center space-y-3">
            <h2 className="font-display font-semibold text-[16px] tracking-[1px] uppercase text-midnight">Get started</h2>
            <p className="font-sans text-[13px] text-steel max-w-md mx-auto">{emptyCta.description}</p>
            <Link
              href={emptyCta.href}
              className="inline-block bg-crimson text-brand-white px-5 py-2 font-display font-medium text-[11px] tracking-[2px] uppercase hover:bg-crimson/90 transition-colors"
            >
              {emptyCta.label}
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display font-semibold text-[12px] tracking-[2px] uppercase text-midnight">
              Recent activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary.recent.length === 0 ? (
              <p className="font-sans text-[13px] text-steel">No recent activity yet.</p>
            ) : (
              <ul className="divide-y divide-midnight/[0.06]">
                {summary.recent.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className="flex items-center justify-between py-3 group hover:bg-midnight/[0.02] -mx-2 px-2 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="font-display font-medium text-[13px] text-midnight truncate group-hover:text-crimson transition-colors">
                          {item.title}
                        </div>
                        {item.subtitle ? (
                          <div className="font-sans text-[12px] text-steel truncate">{item.subtitle}</div>
                        ) : null}
                      </div>
                      <span className="font-sans text-[11px] text-steel shrink-0 ml-3">{formatRelative(item.at)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Quick links */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display font-semibold text-[12px] tracking-[2px] uppercase text-midnight">
              Quick links
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary.links.length === 0 ? (
              <p className="font-sans text-[13px] text-steel">No links configured.</p>
            ) : (
              <ul className="space-y-2">
                {summary.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block border border-midnight/[0.08] px-4 py-3 hover:border-crimson/40 hover:bg-crimson/[0.02] transition-colors"
                    >
                      <div className="font-display font-medium text-[13px] text-midnight">{link.label}</div>
                      <div className="mt-1 font-sans text-[12px] text-steel leading-relaxed">{link.description}</div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
