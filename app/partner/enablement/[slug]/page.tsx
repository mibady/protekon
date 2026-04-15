import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr"
import { getEnablementDoc, ENABLEMENT_SLUGS, renderMarkdown } from "../_lib"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return ENABLEMENT_SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const doc = await getEnablementDoc(slug)
  if (!doc) return { title: "Partner Enablement | PROTEKON" }
  return {
    title: `${doc.title} | Partner Enablement | PROTEKON`,
    description: doc.summary,
  }
}

export default async function EnablementDocPage({ params }: Props) {
  const { slug } = await params
  const doc = await getEnablementDoc(slug)
  if (!doc) notFound()

  return (
    <div className="p-6 lg:p-10 max-w-[780px]">
      <Link
        href="/partner/enablement"
        className="inline-flex items-center gap-2 text-[12px] font-display font-semibold tracking-[2px] uppercase text-steel hover:text-crimson transition-colors mb-8"
      >
        <ArrowLeft size={14} weight="bold" />
        Back to Enablement
      </Link>

      <article className="prose prose-lg max-w-none">
        {renderMarkdown(doc.body)}
      </article>
    </div>
  )
}
