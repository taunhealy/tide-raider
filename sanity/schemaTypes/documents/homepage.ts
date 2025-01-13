import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  fields: [
    defineField({
      name: 'hero',
      title: 'Hero Section',
      type: 'object',
      fields: [
        {name: 'heroImageTitle', type: 'string'},
        {name: 'description', type: 'string'},
        {name: 'image', type: 'image', options: {hotspot: true}},
        {
          name: 'imagePhotographer',
          type: 'string',
          description: 'Name of the photographer for image credits',
        },
        {name: 'heroAboutImage', type: 'image', options: {hotspot: true}},
        {name: 'aboutHeading', type: 'string'},
        {name: 'aboutDescription', type: 'text'},
        {name: 'viewAppHeading', type: 'string'},
        {name: 'viewAppImage', type: 'image', options: {hotspot: true}},
        {name: 'aboutImage', type: 'image', options: {hotspot: true}},
      ],
    }),
    defineField({
      name: 'about',
      title: 'About Section',
      type: 'object',
      fields: [
        {name: 'aboutHeading', type: 'string'},
        {name: 'aboutDescription1', type: 'text'},
        {name: 'aboutDescription1Image', type: 'image', options: {hotspot: true}},
        {name: 'aboutDescription2', type: 'text'},
        {name: 'aboutDescription2Image', type: 'image', options: {hotspot: true}},
      ],
    }),
    defineField({
      name: 'blog',
      title: 'Blog Section',
      type: 'object',
      fields: [
        {name: 'heading', type: 'string'},
        {
          name: 'posts',
          title: 'Featured Posts',
          type: 'array',
          of: [{type: 'reference', to: [{type: 'post'}]}],
        },
      ],
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image Section',
      type: 'object',
      fields: [
        {
          name: 'image',
          title: 'Image',
          type: 'image',
          options: {hotspot: true},
        },
        {
          name: 'title',
          title: 'Title',
          type: 'string',
        },
        {
          name: 'imagePhotographer',
          title: 'Image Photographer',
          type: 'string',
          description: 'Name of the photographer for image credits',
        },
      ],
    }),
    defineField({
      name: 'heroProduct',
      title: 'Hero Product Section',
      type: 'object',
      fields: [
        {name: 'title', type: 'string', description: 'The main title for the hero product section'},
        {name: 'leftDescription', type: 'text', description: 'Description text for the left side'},
        {
          name: 'rightDescription',
          type: 'text',
          description: 'Description text for the right side',
        },
        {name: 'leftImage', type: 'image', options: {hotspot: true}},
        {
          name: 'filterItems',
          title: 'Filter Items',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {name: 'type', type: 'string'},
                {name: 'icon', type: 'image', options: {hotspot: true}},
              ],
            },
          ],
        },
      ],
    }),
    // Add other sections as needed
  ],
})
