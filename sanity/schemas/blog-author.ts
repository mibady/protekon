import { defineField, defineType } from 'sanity'

export const blogAuthor = defineType({
  name: 'blogAuthor',
  title: 'Blog Author',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name', maxLength: 96 }, validation: (r) => r.required() }),
    defineField({ name: 'image', title: 'Image', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'bio', title: 'Bio', type: 'text', rows: 3 }),
    defineField({ name: 'role', title: 'Role', type: 'string' }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'role', media: 'image' },
  },
})
