import type { Metadata } from "next"
import { getStateConfig } from "@/lib/landing-configs"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string }>
}): Promise<Metadata> {
  const { state } = await params
  const config = getStateConfig(state)
  if (!config) return {}
  return {
    title: config.meta.title,
    description: config.meta.description,
    alternates: config.meta.canonical
      ? { canonical: config.meta.canonical }
      : undefined,
    openGraph: {
      title: config.meta.title,
      description:
        "Calculate your state-plan OSHA compliance risk. Instant results. State-specific gap analysis.",
    },
  }
}

export default function StateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
