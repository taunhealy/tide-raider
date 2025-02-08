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
          type: 'object',
          name: 'section',
          title: 'Content Section',
          fields: [
            {
              name: 'sectionHeading',
              title: 'Section Heading',
              type: 'string',
              description: 'Optional heading for this section',
            },
            {
              name: 'content',
              title: 'Section Content',
              type: 'array',
              of: [
                {
                  type: 'block',
                  styles: [
                    {title: 'Normal', value: 'normal'},
                    {title: 'H2', value: 'h2'},
                    {title: 'H3', value: 'h3'},
                    {title: 'Quote', value: 'blockquote'},
                  ],
                },
              ],
            },
            {
              name: 'videoLink',
              title: 'Video Link',
              type: 'url',
              description: 'Optional link to a video',
            },
            {
              name: 'sectionImages',
              title: 'Section Images',
              type: 'array',
              of: [
                {
                  type: 'object',
                  name: 'sectionImage',
                  fields: [
                    {
                      name: 'uploadedImage',
                      title: 'Uploaded Image',
                      type: 'image',
                      options: {
                        hotspot: true,
                      },
                      fields: [
                        {
                          name: 'alt',
                          type: 'string',
                          title: 'Alternative text',
                        },
                        {
                          name: 'caption',
                          type: 'string',
                          title: 'Caption',
                        },
                      ],
                    },
                    {
                      name: 'layout',
                      title: 'Image Layout',
                      type: 'string',
                      options: {
                        list: [
                          {title: 'Full Width', value: 'full'},
                          {title: 'Half Width', value: 'half'},
                          {title: 'Quarter Width', value: 'quarter'},
                        ],
                      },
                    },
                  ],
                },
              ],
              validation: (Rule) => Rule.max(4),
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
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [{title: 'Normal', value: 'normal'}],
          lists: [],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
            ],
          },
        },
      ],
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
        {type: 'unsplashGridWidget'},
      ],
      validation: (Rule) => Rule.unique().warning('Each widget type should be unique'),
    }),
    defineField({
      name: 'trip',
      title: 'Trip',
      type: 'reference',
      to: [{type: 'trip'}],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'mainImage',
    },
  },
})
