import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'postTemplate',
  title: 'Post Template',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Template Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{type: 'postCategory'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sidebar',
      title: 'Sidebar Schema',
      type: 'string',
      options: {
        list: [
          {title: 'Travel Expenses', value: 'travelExpenses'},
          {title: 'Surf Conditions', value: 'surfConditions'},
          {title: 'Beach Info', value: 'beachInfo'},
        ],
      },
    }),
  ],
})
