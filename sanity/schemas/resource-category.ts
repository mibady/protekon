import { defineField, defineType } from 'sanity'

export const resourceCategory = defineType({
  name: 'resourceCategory',
  title: 'Resource Category',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title', maxLength: 96 }, validation: (r) => r.required() }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 }),
  ],
})
