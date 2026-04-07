import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://protekon.com").trim().replace(/\/$/, "")

  const staticPages = [
    { url: "", priority: 1.0, changeFrequency: "weekly" as const },
    { url: "/pricing", priority: 0.9, changeFrequency: "monthly" as const },
    { url: "/about", priority: 0.7, changeFrequency: "monthly" as const },
    { url: "/contact", priority: 0.7, changeFrequency: "monthly" as const },
    { url: "/solutions", priority: 0.8, changeFrequency: "monthly" as const },
    { url: "/solutions/construction", priority: 0.8, changeFrequency: "monthly" as const },
    { url: "/solutions/healthcare", priority: 0.8, changeFrequency: "monthly" as const },
    { url: "/solutions/real-estate", priority: 0.8, changeFrequency: "monthly" as const },
    { url: "/solutions/compliance-suite", priority: 0.8, changeFrequency: "monthly" as const },
    { url: "/industries", priority: 0.7, changeFrequency: "monthly" as const },
    { url: "/resources", priority: 0.6, changeFrequency: "weekly" as const },
    { url: "/marketplace", priority: 0.6, changeFrequency: "monthly" as const },
    { url: "/login", priority: 0.3, changeFrequency: "yearly" as const },
    { url: "/signup", priority: 0.5, changeFrequency: "yearly" as const },
    { url: "/privacy", priority: 0.2, changeFrequency: "yearly" as const },
    { url: "/terms", priority: 0.2, changeFrequency: "yearly" as const },
  ]

  return staticPages.map((page) => ({
    url: `${siteUrl}${page.url}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }))
}
