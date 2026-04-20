import { notFound } from "next/navigation"
import { getStateConfig, listStateSlugs } from "@/lib/landing-configs"
import StateLanding from "@/components/score/landing/StateLanding"

export async function generateStaticParams() {
  return listStateSlugs().map((state) => ({ state }))
}

export default async function StatePage({
  params,
}: {
  params: Promise<{ state: string }>
}) {
  const { state } = await params
  const config = getStateConfig(state)
  if (!config) notFound()
  return <StateLanding config={config} />
}
