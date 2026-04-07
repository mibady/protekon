import { defineField, defineType } from 'sanity'

export const helpArticle = defineType({
  name: 'helpArticle',
  title: 'Help Article',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title', maxLength: 96 }, validation: (r) => r.required() }),
    defineField({ name: 'body', title: 'Body', type: 'array', of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }] }),
    defineField({ name: 'category', title: 'Category', type: 'reference', to: [{ type: 'helpCategory' }] }),
    defineField({ name: 'order', title: 'Sort Order', type: 'number', initialValue: 0 }),
    defineField({ name: 'relatedArticles', title: 'Related Articles', type: 'array', of: [{ type: 'reference', to: [{ type: 'helpArticle' }] }] }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'category.title' },
  },
})
