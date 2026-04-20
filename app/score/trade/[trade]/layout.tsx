import type { Metadata } from "next"
import { getTradeConfig } from "@/lib/landing-configs"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ trade: string }>
}): Promise<Metadata> {
  const { trade } = await params
  const config = getTradeConfig(trade)
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
        "Calculate your federal OSHA compliance risk. Instant results. Trade-specific gap analysis.",
    },
  }
}

export default function TradeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
