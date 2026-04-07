import { defineField, defineType } from 'sanity'

export const helpCategory = defineType({
  name: 'helpCategory',
  title: 'Help Category',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title', maxLength: 96 }, validation: (r) => r.required() }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 }),
    defineField({ name: 'icon', title: 'Icon', type: 'string', description: 'Lucide icon name (e.g. "book-open")' }),
    defineField({ name: 'order', title: 'Sort Order', type: 'number', initialValue: 0 }),
  ],
})
