import { notFound } from "next/navigation"
import { getTradeConfig, listTradeSlugs } from "@/lib/landing-configs"
import TradeLanding from "@/components/score/landing/TradeLanding"

export async function generateStaticParams() {
  return listTradeSlugs().map((trade) => ({ trade }))
}

export default async function TradePage({
  params,
}: {
  params: Promise<{ trade: string }>
}) {
  const { trade } = await params
  const config = getTradeConfig(trade)
  if (!config) notFound()
  return <TradeLanding config={config} />
}
