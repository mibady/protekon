import { resource } from './resource'
import { resourceCategory } from './resource-category'
import { blogPost } from './blog-post'
import { blogCategory } from './blog-category'
import { blogAuthor } from './blog-author'
import { regulatoryUpdate } from './regulatory-update'
import { helpArticle } from './help-article'
import { helpCategory } from './help-category'
import { page } from './page'
import { faq } from './faq'

export const schemaTypes = [
  // Resources
  resource,
  resourceCategory,
  // Blog
  blogPost,
  blogCategory,
  blogAuthor,
  // Regulatory
  regulatoryUpdate,
  // Help Center
  helpArticle,
  helpCategory,
  // Pages
  page,
  // FAQ
  faq,
]
