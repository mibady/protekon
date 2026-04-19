/**
 * TemplateGroup — ported from dashboard.jsx:680.
 * Section-labeled bucket of TemplateCards (Canonical Nine, Industry Hazards, Specialized).
 */

import type { Template } from "../mocks"
import { SectionLabel } from "@/components/v2/primitives/SectionLabel"
import { TemplateCard } from "./TemplateCard"

type TemplateGroupProps = {
  title: string
  subtitle: string
  accent?: string | null
  templates: readonly Template[]
  columns?: 1 | 2 | 3
}

export function TemplateGroup({
  title,
  subtitle,
  accent = null,
  templates,
  columns = 3,
}: TemplateGroupProps) {
  const gridCls = columns === 3 ? "grid-cols-3" : columns === 2 ? "grid-cols-2" : "grid-cols-1"
  return (
    <section>
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <SectionLabel>{title}</SectionLabel>
          <div className="font-sans" style={{ color: "var(--steel)", fontSize: "13px" }}>
            {subtitle}
          </div>
        </div>
        <span className="font-sans" style={{ color: "var(--steel)", fontSize: "12px" }}>
          {templates.length} {templates.length === 1 ? "template" : "templates"}
        </span>
      </div>
      <div className={`grid ${gridCls} gap-3`}>
        {templates.map((t) => (
          <TemplateCard key={t.id} tpl={t} accent={accent} />
        ))}
      </div>
    </section>
  )
}
