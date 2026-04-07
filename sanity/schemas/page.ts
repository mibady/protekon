import { defineField, defineType } from 'sanity'

export const page = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title', maxLength: 96 }, validation: (r) => r.required() }),
    defineField({
      name: 'sections',
      title: 'Page Sections',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'heroSection',
          title: 'Hero Section',
          fields: [
            defineField({ name: 'heading', title: 'Heading', type: 'string' }),
            defineField({ name: 'subheading', title: 'Subheading', type: 'text', rows: 2 }),
            defineField({ name: 'ctaText', title: 'CTA Text', type: 'string' }),
            defineField({ name: 'ctaLink', title: 'CTA Link', type: 'string' }),
            defineField({ name: 'image', title: 'Image', type: 'image', options: { hotspot: true } }),
          ],
        },
        {
          type: 'object',
          name: 'contentSection',
          title: 'Content Section',
          fields: [
            defineField({ name: 'heading', title: 'Heading', type: 'string' }),
            defineField({ name: 'body', title: 'Body', type: 'array', of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }] }),
          ],
        },
        {
          type: 'object',
          name: 'ctaSection',
          title: 'CTA Section',
          fields: [
            defineField({ name: 'heading', title: 'Heading', type: 'string' }),
            defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 }),
            defineField({ name: 'ctaText', title: 'CTA Text', type: 'string' }),
            defineField({ name: 'ctaLink', title: 'CTA Link', type: 'string' }),
          ],
        },
      ],
    }),
  ],
  preview: {
    select: { title: 'title' },
  },
})
