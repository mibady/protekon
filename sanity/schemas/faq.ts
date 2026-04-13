import { defineField, defineType } from 'sanity'

export const faq = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  fields: [
    defineField({ name: 'question', title: 'Question', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'answer', title: 'Answer', type: 'array', of: [{ type: 'block' }] }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          'general', 'pricing', 'compliance', 'technical', 'onboarding',
          'sb-553', 'cal-osha', 'federal-osha', 'hipaa',
          'training', 'incidents', 'enforcement', 'wvpp', 'iipp', 'vertical-specific',
        ],
      },
    }),
    defineField({ name: 'order', title: 'Sort Order', type: 'number', initialValue: 0 }),
  ],
  preview: {
    select: { title: 'question', subtitle: 'category' },
  },
})
