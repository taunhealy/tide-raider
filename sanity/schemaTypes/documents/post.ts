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
        {type: 'weatherWidget'},
        {type: 'surfSpotsWidget'},
        {type: 'relatedPostsWidget'},
        {type: 'locationMapWidget'},
        {type: 'categoryListWidget'},
        {type: 'tagCloudWidget'},
        {type: 'flightSearchWidget'},
      ],
      validation: (Rule) => Rule.unique().warning('Each widget type should be unique'),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'mainImage',
    },
  },
})
