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
      title: 'Post Template',
      type: 'reference',
      to: [{type: 'postTemplate'}],
      validation: (Rule) => Rule.required(),
    }),
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
    // Travel Costs
    defineField({
      name: 'travelCosts',
      title: 'Travel Costs',
      type: 'object',
      hidden: ({document}) => {
        const doc = document as any
        return !doc?.template?.sidebar || doc.template.sidebar !== 'travelExpenses'
      },
      fields: [
        {
          name: 'airports',
          title: 'Available Airports',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {name: 'code', type: 'string', title: 'Airport Code'},
                {name: 'name', type: 'string', title: 'Airport Name'},
                {name: 'baseCost', type: 'number', title: 'Base Flight Cost (USD)'},
              ],
            },
          ],
        },
        {
          name: 'accommodation',
          title: 'Accommodation',
          type: 'object',
          fields: [
            {name: 'costPerNight', type: 'number', title: 'Cost per Night (USD)'},
            {name: 'hotelName', type: 'string', title: 'Recommended Hotel/Stay'},
            {name: 'bookingLink', type: 'url', title: 'Booking Link'},
          ],
        },
        {
          name: 'dailyExpenses',
          title: 'Daily Expenses',
          type: 'object',
          fields: [
            {name: 'food', type: 'number', title: 'Food Cost per Day (USD)'},
            {name: 'transport', type: 'number', title: 'Local Transport per Day (USD)'},
            {name: 'activities', type: 'number', title: 'Activities per Day (USD)'},
            {name: 'medical', type: 'number', title: 'Medical Insurance per Day (USD)'},
          ],
        },
      ],
    }),
    // Content Sections
    defineField({
      name: 'content',
      title: 'Blog Content',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'type',
              title: 'Section Type',
              type: 'string',
              options: {
                list: [
                  {title: 'Introduction', value: 'intro'},
                  {title: 'Main Content', value: 'content'},
                  {title: 'Conclusion', value: 'conclusion'},
                ],
              },
            },
            {name: 'text', type: 'blockContent', title: 'Text Content'},
            {
              name: 'image',
              title: 'Section Image',
              type: 'image',
              options: {
                hotspot: true,
              },
            },
          ],
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
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
