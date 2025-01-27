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
    defineField({
      name: 'sidebarWidgets',
      title: 'Sidebar Widgets',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'type',
              type: 'string',
              options: {
                list: [
                  {title: 'Related Posts', value: 'relatedPosts'},
                  {title: 'Location Map', value: 'locationMap'},
                  {title: 'Category List', value: 'categoryList'},
                  {title: 'Tag Cloud', value: 'tagCloud'},
                ],
              },
            },
            {name: 'order', type: 'number'},
            {
              name: 'config',
              type: 'object',
              fields: [
                {
                  name: 'widgetConfig',
                  type: 'reference',
                  to: [{type: 'relatedPostsWidget'}, {type: 'locationMapWidget'}],
                },
              ],
            },
          ],
        },
      ],
    }),
  ],
})
