import { defineField, defineType } from 'sanity'

export const regulatoryUpdate = defineType({
  name: 'regulatoryUpdate',
  title: 'Regulatory Update',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title', maxLength: 96 }, validation: (r) => r.required() }),
    defineField({ name: 'body', title: 'Body', type: 'array', of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }] }),
    defineField({ name: 'source', title: 'Source', type: 'string', description: 'e.g. Cal/OSHA, DIR, Legislature' }),
    defineField({ name: 'effectiveDate', title: 'Effective Date', type: 'date' }),
    defineField({
      name: 'severity',
      title: 'Severity',
      type: 'string',
      options: { list: ['critical', 'high', 'medium', 'low', 'informational'] },
    }),
    defineField({
      name: 'industries',
      title: 'Affected Industries',
      type: 'array',
      of: [{ type: 'string' }],
      options: { list: ['construction', 'healthcare', 'hospitality', 'manufacturing', 'retail', 'real-estate', 'agriculture', 'transportation', 'wholesale', 'all'] },
    }),
    defineField({ name: 'standard', title: 'Standard/Code', type: 'string', description: 'e.g. SB 553, T8 CCR 3203' }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'severity' },
  },
})
