import { defineField, defineType } from 'sanity'

export const resource = defineType({
  name: 'resource',
  title: 'Resource',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title', maxLength: 96 }, validation: (r) => r.required() }),
    defineField({
      name: 'resourceType',
      title: 'Type',
      type: 'string',
      options: { list: ['guide', 'template', 'webinar', 'article', 'checklist', 'whitepaper'] },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'excerpt', title: 'Excerpt', type: 'text', rows: 3 }),
    defineField({ name: 'coverImage', title: 'Cover Image', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'body', title: 'Body', type: 'array', of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }] }),
    defineField({ name: 'categories', title: 'Categories', type: 'array', of: [{ type: 'reference', to: [{ type: 'resourceCategory' }] }] }),
    defineField({
      name: 'industries',
      title: 'Industries',
      type: 'array',
      of: [{ type: 'string' }],
      options: { list: ['construction', 'healthcare', 'hospitality', 'manufacturing', 'retail', 'real-estate', 'agriculture', 'transportation', 'wholesale'] },
    }),
    defineField({ name: 'featured', title: 'Featured', type: 'boolean', description: 'Show in featured section on resources hub', initialValue: false }),
    defineField({ name: 'downloadUrl', title: 'Download URL', type: 'url', description: 'Optional: link to downloadable file' }),
    defineField({ name: 'publishedAt', title: 'Published At', type: 'datetime', initialValue: () => new Date().toISOString() }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'resourceType', media: 'coverImage' },
  },
})
