import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "@phosphor-icons/react/dist/ssr"
import { listEnablementDocs } from "./_lib"

export const metadata: Metadata = {
  title: "Partner Enablement | PROTEKON",
  description: "Playbooks, positioning, and pricing scripts for Protekon partners.",
}

export default async function PartnerEnablementIndexPage() {
  const docs = await listEnablementDocs()

  return (
    <div className="p-6 lg:p-10 max-w-[1100px]">
      <header className="mb-10">
        <span className="font-display font-semibold text-[11px] tracking-[4px] uppercase text-crimson">
          Partner Enablement
        </span>
        <h1 className="font-display font-black text-[clamp(26px,3.5vw,36px)] text-midnight mt-3 mb-3">
          Build the practice.
        </h1>
        <p className="font-sans text-[14px] text-steel max-w-2xl leading-relaxed">
          Positioning, playbook, and pricing scripts for partners running the AI Compliance Officer
          line of business. Read these first, then run one intake this week.
        </p>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {docs.map((doc) => (
          <Link
            key={doc.slug}
            href={`/partner/enablement/${doc.slug}`}
            className="group bg-brand-white border border-midnight/[0.08] p-6 flex flex-col hover:border-crimson/60 transition-colors"
          >
            <span className="font-display font-semibold text-[10px] tracking-[3px] uppercase text-crimson mb-3">
              Guide {String(doc.order).padStart(2, "0")}
            </span>
            <h2 className="font-display font-bold text-[18px] text-midnight leading-snug mb-3">
              {doc.title}
            </h2>
            <p className="font-sans text-[13px] text-steel leading-relaxed mb-6 flex-1">
              {doc.summary}
            </p>
            <span className="inline-flex items-center gap-2 font-display font-semibold text-[12px] tracking-[2px] uppercase text-midnight group-hover:text-crimson transition-colors">
              Read
              <ArrowRight size={14} weight="bold" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
