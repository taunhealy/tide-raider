import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'trip',
  title: 'Trip',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'destination',
      title: 'Destination',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'travelInsurance',
      title: 'Travel Insurance',
      type: 'object',
      fields: [
        {
          name: 'documentRequired',
          title: 'Insurance Document Required',
          type: 'boolean',
        },
        {
          name: 'documentType',
          title: 'MedVac Required',
          type: 'boolean',
        },
      ],
    }),
    defineField({
      name: 'days',
      title: 'Days',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'day',
          fields: [
            {
              name: 'dayNumber',
              title: 'Day Number',
              type: 'number',
              validation: (Rule) => Rule.required().min(1),
            },
            {
              name: 'activities',
              title: 'Activities',
              type: 'array',
              of: [
                {
                  type: 'object',
                  name: 'activity',
                  fields: [
                    {
                      name: 'title',
                      title: 'Title',
                      type: 'string',
                      validation: (Rule) => Rule.required(),
                    },
                    {
                      name: 'duration',
                      title: 'Duration',
                      type: 'string',
                      validation: (Rule) => Rule.required(),
                    },
                    {
                      name: 'price',
                      title: 'Price',
                      type: 'number',
                      validation: (Rule) => Rule.min(0),
                    },
                    {
                      name: 'transport',
                      title: 'Transport',
                      type: 'string',
                    },
                    {
                      name: 'bookingURL',
                      title: 'Booking URL',
                      type: 'url',
                    },
                  ],
                },
              ],
            },
            {
              name: 'stay',
              title: 'Stay',
              type: 'object',
              fields: [
                {
                  name: 'title',
                  title: 'Title',
                  type: 'string',
                  validation: (Rule) => Rule.required(),
                },
                {
                  name: 'price',
                  title: 'Price',
                  type: 'number',
                  validation: (Rule) => Rule.min(0),
                },
                {
                  name: 'bookingURL',
                  title: 'Booking URL',
                  type: 'url',
                },
                {
                  name: 'includes',
                  title: 'Includes',
                  type: 'array',
                  of: [{type: 'string'}],
                },
                {
                  name: 'notes',
                  title: 'Notes',
                  type: 'text',
                  description: 'Special payment requirements or other important information',
                },
              ],
            },
            {
              name: 'rental',
              title: 'Rentals',
              type: 'array',
              of: [
                {
                  type: 'object',
                  name: 'rentalItem',
                  fields: [
                    {
                      name: 'title',
                      title: 'Title',
                      type: 'string',
                      validation: (Rule) => Rule.required(),
                    },
                    {
                      name: 'price',
                      title: 'Price',
                      type: 'number',
                      validation: (Rule) => Rule.min(0),
                    },
                    {
                      name: 'bookingURL',
                      title: 'Booking URL',
                      type: 'url',
                    },
                    {
                      name: 'includes',
                      title: 'Includes',
                      type: 'array',
                      of: [{type: 'string'}],
                    },
                    {
                      name: 'notes',
                      title: 'Notes',
                      type: 'text',
                      description: 'Special payment requirements or other important information',
                    },
                  ],
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
      subtitle: 'destination',
    },
  },
})
