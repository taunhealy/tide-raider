import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    // Basic Fields
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
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'template',
      title: 'Template',
      type: 'object',
      fields: [
        {
          name: 'name',
          title: 'Template Name',
          type: 'string',
          options: {
            list: [
              { title: 'Default', value: 'default' },
              { title: 'Travel Guide', value: 'travel' },
            ]
          }
        },
        {
          name: 'sidebarWidgets',
          title: 'Sidebar Widgets',
          type: 'array',
          of: [{
            type: 'object',
            name: 'widget',
            fields: [
              {
                name: 'type',
                title: 'Widget Type',
                type: 'string',
                options: {
                  list: [
                    { title: 'Flight Search', value: 'FlightWidget' },
                    { title: 'Weather', value: 'WeatherWidget' },
                    { title: 'Related Posts', value: 'RelatedPostsWidget' },
                    { title: 'Quest Log', value: 'QuestLogWidget' },
                    { title: 'Events', value: 'EventsWidget' }
                  ]
                }
              },
              {
                name: 'order',
                title: 'Display Order',
                type: 'number'
              },
              {
                name: 'config',
                title: 'Widget Configuration',
                type: 'object',
                fields: [
                  // Add widget-specific configuration fields here
                  // These will be shown/hidden based on the widget type
                ]
              }
            ]
          }],
          options: {
            sortable: true
          }
        }
      ]
    },
    // Location Fields
    defineField({
      name: 'location',
      title: 'Location',
      type: 'object',
      fields: [
        {name: 'beachName', type: 'string', title: 'Beach Name'},
        {name: 'region', type: 'string', title: 'Region'},
        {name: 'country', type: 'string', title: 'Country'},
        {name: 'continent', type: 'string', title: 'Continent'},
        {name: 'weatherCity', type: 'string', title: 'City for Weather Data'},
      ],
      validation: (Rule) => Rule.required(),
    }),
    
  preview: {
    select: {
      title: 'title',
      location: 'location.beachName',
      media: 'content.0.image',
    },
    prepare(selection) {
      const {title, location, media} = selection
      return {
        title: title,
        subtitle: location,
        media: media,
      }
    },
  },
})
