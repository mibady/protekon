import type { MetadataRoute } from "next"
import { client } from "@/lib/sanity/client"
import { allBlogSlugsQuery, allResourceSlugsQuery, allRegulatoryUpdateSlugsQuery } from "@/lib/sanity/queries"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
    { url: "/blog", priority: 0.7, changeFrequency: "daily" as const },
    { url: "/marketplace", priority: 0.6, changeFrequency: "monthly" as const },
    { url: "/login", priority: 0.3, changeFrequency: "yearly" as const },
    { url: "/privacy", priority: 0.2, changeFrequency: "yearly" as const },
    { url: "/terms", priority: 0.2, changeFrequency: "yearly" as const },
  ]

  // Fetch dynamic content from Sanity
  const [blogSlugs, resourceSlugs, regUpdateSlugs] = await Promise.all([
    client.fetch(allBlogSlugsQuery).catch(() => []),
    client.fetch(allResourceSlugsQuery).catch(() => []),
    client.fetch(allRegulatoryUpdateSlugsQuery).catch(() => []),
  ])

  const blogPages = (blogSlugs || []).map((post: any) => ({
    url: `/blog/${post.slug}`,
    priority: 0.6,
    changeFrequency: "monthly" as const,
    lastModified: post.publishedAt ? new Date(post.publishedAt) : new Date(),
  }))

  const resourcePages = (resourceSlugs || []).map((resource: any) => ({
    url: `/resources/${resource.slug}`,
    priority: 0.5,
    changeFrequency: "monthly" as const,
    lastModified: resource.publishedAt ? new Date(resource.publishedAt) : new Date(),
  }))

  const regUpdatePages = (regUpdateSlugs || []).map((update: any) => ({
    url: `/regulatory-updates/${update.slug}`,
    priority: 0.5,
    changeFrequency: "monthly" as const,
    lastModified: update.effectiveDate ? new Date(update.effectiveDate) : new Date(),
  }))

  const allPages = [
    ...staticPages.map((page) => ({
      url: `${siteUrl}${page.url}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    ...blogPages.map((page: any) => ({
      url: `${siteUrl}${page.url}`,
      lastModified: page.lastModified,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    ...resourcePages.map((page: any) => ({
      url: `${siteUrl}${page.url}`,
      lastModified: page.lastModified,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    ...regUpdatePages.map((page: any) => ({
      url: `${siteUrl}${page.url}`,
      lastModified: page.lastModified,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
  ]

  return allPages
}
