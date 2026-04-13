import { groq } from 'next-sanity'

// Resources
export const allResourcesQuery = groq`
  *[_type == "resource"] | order(publishedAt desc) {
    _id, title, slug, resourceType, excerpt, coverImage, publishedAt,
    "categories": categories[]->{ title, slug }
  }
`

export const resourceBySlugQuery = groq`
  *[_type == "resource" && slug.current == $slug][0] {
    _id, title, slug, resourceType, excerpt, body, coverImage, publishedAt, downloadUrl,
    "categories": categories[]->{ title, slug },
    "industries": industries
  }
`

export const featuredResourcesQuery = groq`
  *[_type == "resource" && featured == true] | order(publishedAt desc) [0...3] {
    _id, title, slug, resourceType, excerpt, coverImage, publishedAt,
    "categories": categories[]->{ title, slug }
  }
`

export const latestArticlesQuery = groq`
  *[_type == "resource" && resourceType == "article"] | order(publishedAt desc) [0...6] {
    _id, title, slug, excerpt, publishedAt,
    "categories": categories[]->{ title, slug }
  }
`

// Blog
export const allBlogPostsQuery = groq`
  *[_type == "blogPost"] | order(publishedAt desc) {
    _id, title, slug, excerpt, coverImage, publishedAt,
    "author": author->{ name, slug, image },
    "categories": categories[]->{ title, slug },
    regulatoryDomain, industries, keywordCluster, contentTier
  }
`

export const blogPostBySlugQuery = groq`
  *[_type == "blogPost" && slug.current == $slug][0] {
    _id, title, slug, excerpt, body, coverImage, publishedAt,
    "author": author->{ name, slug, image, bio },
    "categories": categories[]->{ _id, title, slug },
    regulatoryDomain, industries, keywordCluster, contentTier
  }
`

// Regulatory Updates
export const allRegulatoryUpdatesQuery = groq`
  *[_type == "regulatoryUpdate"] | order(effectiveDate desc) {
    _id, title, slug, source, effectiveDate, severity, industries
  }
`

export const regulatoryUpdateBySlugQuery = groq`
  *[_type == "regulatoryUpdate" && slug.current == $slug][0] {
    _id, title, slug, body, source, effectiveDate, severity, industries, standard
  }
`

// Help Articles
export const allHelpArticlesQuery = groq`
  *[_type == "helpArticle"] | order(order asc) {
    _id, title, slug, "category": category->{ title, slug, icon }, order
  }
`

export const helpArticleBySlugQuery = groq`
  *[_type == "helpArticle" && slug.current == $slug][0] {
    _id, title, slug, body, order,
    "category": category->{ title, slug, icon },
    "relatedArticles": relatedArticles[]->{ _id, title, slug }
  }
`

// FAQs
export const allFaqsQuery = groq`
  *[_type == "faq"] | order(order asc) {
    _id, question, answer, category, order
  }
`

// Blog: Filtered
export const blogPostsByCategoryQuery = groq`
  *[_type == "blogPost" && $slug in categories[]->slug.current] | order(publishedAt desc) {
    _id, title, slug, excerpt, coverImage, publishedAt,
    "author": author->{ name, slug, image },
    "categories": categories[]->{ title, slug },
    regulatoryDomain, industries, keywordCluster, contentTier
  }
`

export const blogPostsByDomainQuery = groq`
  *[_type == "blogPost" && regulatoryDomain == $domain] | order(publishedAt desc) {
    _id, title, slug, excerpt, coverImage, publishedAt,
    "author": author->{ name, slug, image },
    "categories": categories[]->{ title, slug },
    regulatoryDomain, industries, keywordCluster, contentTier
  }
`

export const blogPostsByIndustryQuery = groq`
  *[_type == "blogPost" && $industry in industries] | order(publishedAt desc) {
    _id, title, slug, excerpt, coverImage, publishedAt,
    "author": author->{ name, slug, image },
    "categories": categories[]->{ title, slug },
    regulatoryDomain, industries, keywordCluster, contentTier
  }
`

export const blogPostsByTierQuery = groq`
  *[_type == "blogPost" && contentTier == $tier] | order(publishedAt desc) {
    _id, title, slug, excerpt, coverImage, publishedAt,
    "author": author->{ name, slug, image },
    "categories": categories[]->{ title, slug },
    regulatoryDomain, industries, keywordCluster, contentTier
  }
`

// Blog: Related posts (same domain or shared categories, excluding current)
export const relatedPostsQuery = groq`
  *[_type == "blogPost" && _id != $currentId && (
    regulatoryDomain == $domain ||
    count(categories[@._ref in $categoryIds]) > 0
  )] | order(publishedAt desc) [0...4] {
    _id, title, slug, excerpt, coverImage, publishedAt,
    "categories": categories[]->{ title, slug }
  }
`

// Blog: All categories with post counts
export const allBlogCategoriesQuery = groq`
  *[_type == "blogCategory"] | order(title asc) {
    _id, title, slug,
    "postCount": count(*[_type == "blogPost" && references(^._id)])
  }
`

// Resources: Filtered by type
export const resourcesByTypeQuery = groq`
  *[_type == "resource" && resourceType == $type] | order(publishedAt desc) {
    _id, title, slug, resourceType, excerpt, coverImage, publishedAt,
    "categories": categories[]->{ title, slug }
  }
`

// Resources: Filtered by industry
export const resourcesByIndustryQuery = groq`
  *[_type == "resource" && $industry in industries] | order(publishedAt desc) {
    _id, title, slug, resourceType, excerpt, coverImage, publishedAt,
    "categories": categories[]->{ title, slug }
  }
`

// Sitemap: All slugs for dynamic generation
export const allBlogSlugsQuery = groq`
  *[_type == "blogPost" && defined(slug.current)] { "slug": slug.current, publishedAt }
`

export const allResourceSlugsQuery = groq`
  *[_type == "resource" && defined(slug.current)] { "slug": slug.current, publishedAt }
`

export const allRegulatoryUpdateSlugsQuery = groq`
  *[_type == "regulatoryUpdate" && defined(slug.current)] { "slug": slug.current, effectiveDate }
`

// Pages
export const pageBySlugQuery = groq`
  *[_type == "page" && slug.current == $slug][0] {
    _id, title, slug, sections
  }
`
