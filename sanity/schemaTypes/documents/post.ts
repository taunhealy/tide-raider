import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
      },
      validation: (Rule) => Rule.required(),
    }),
    // Main Image
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    // Content (Rich Text)
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H1', value: 'h1'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'Quote', value: 'blockquote'},
          ],
          lists: [
            {title: 'Bullet', value: 'bullet'},
            {title: 'Number', value: 'number'},
          ],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'URL',
                fields: [
                  {
                    title: 'URL',
                    name: 'href',
                    type: 'url',
                  },
                ],
              },
            ],
          },
        },
        {
          type: 'image',
          options: {hotspot: true},
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative text',
              description: 'Important for SEO and accessibility.',
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
              description: 'Optional caption for the image',
            },
          ],
        },
      ],
    }),
    // Template reference
    defineField({
      name: 'template',
      title: 'Post Template',
      type: 'reference',
      to: [{type: 'postTemplate'}],
    }),
    // Categories (high-level classification)
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{type: 'reference', to: {type: 'postCategory'}}],
      validation: (Rule) => Rule.required(),
    }),
    // Tags (specific topics)
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{type: 'reference', to: {type: 'postTag'}}],
    }),
    // Location reference
    defineField({
      name: 'location',
      title: 'Location',
      type: 'object',
      fields: [
        {name: 'beachName', type: 'string', title: 'Beach Name'},
        {name: 'region', type: 'string', title: 'Region'},
        {name: 'country', type: 'string', title: 'Country'},
        {name: 'continent', type: 'string', title: 'Continent'},
      ],
      validation: (Rule) => Rule.required(),
    }),
    // Publication date
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
    }),
    // Description/Excerpt
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    // Sidebar widgets
    defineField({
      name: 'sidebarWidgets',
      title: 'Sidebar Widgets',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'sidebarWidget',
          fields: [
            {
              name: 'type',
              type: 'string',
              title: 'Widget Type',
              options: {
                list: [
                  {title: 'Weather', value: 'weather'},
                  {title: 'Location Map', value: 'locationMap'},
                  {title: 'Related Posts', value: 'relatedPosts'},
                  {title: 'Category List', value: 'categoryList'},
                  {title: 'Tag Cloud', value: 'tagCloud'},
                  {title: 'Flight Search', value: 'flightSearch'},
                ],
              },
            },
            {
              name: 'order',
              type: 'number',
              title: 'Display Order',
            },
            {
              name: 'config',
              type: 'object',
              title: 'Widget Configuration',
              fields: [
                {
                  name: 'title',
                  type: 'string',
                  title: 'Widget Title',
                },
              ],
            },
          ],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'mainImage',
    },
  },
})
