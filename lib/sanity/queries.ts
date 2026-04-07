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
    "categories": categories[]->{ title, slug }
  }
`

export const blogPostBySlugQuery = groq`
  *[_type == "blogPost" && slug.current == $slug][0] {
    _id, title, slug, excerpt, body, coverImage, publishedAt,
    "author": author->{ name, slug, image, bio },
    "categories": categories[]->{ title, slug }
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

// Pages
export const pageBySlugQuery = groq`
  *[_type == "page" && slug.current == $slug][0] {
    _id, title, slug, sections
  }
`
