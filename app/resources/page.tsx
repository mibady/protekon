import type { Metadata } from "next"
import { client } from "@/lib/sanity/client"
import { featuredResourcesQuery, latestArticlesQuery } from "@/lib/sanity/queries"
import ResourcesClient from "./resources-client"

export const metadata: Metadata = {
  title: "Compliance Resources & Guides | PROTEKON",
  description: "Free California compliance guides, SB 553 templates, Cal/OSHA checklists, and IIPP resources for small and mid-sized businesses.",
}

const downloads = [
  { title: "IIPP Template", format: "DOCX", size: "245 KB" },
  { title: "SB 553 Checklist", format: "PDF", size: "128 KB" },
  { title: "Incident Report Form", format: "PDF", size: "89 KB" },
  { title: "Safety Meeting Log", format: "XLSX", size: "56 KB" },
]

export default async function ResourcesPage() {
  const [featured, articles] = await Promise.all([
    client.fetch(featuredResourcesQuery),
    client.fetch(latestArticlesQuery),
  ])

  return (
    <ResourcesClient
      featured={featured}
      articles={articles}
      downloads={downloads}
    />
  )
}
