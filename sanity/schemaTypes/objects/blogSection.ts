import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'blogSection',
  title: 'Blog Section',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Section Heading',
      type: 'string',
    }),
    defineField({
      name: 'subheading',
      title: 'Section Subheading',
      type: 'text',
    }),
    defineField({
      name: 'posts',
      title: 'Featured Posts',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'post'}]}],
    }),
  ],
})
