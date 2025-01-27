import {defineType, defineField} from 'sanity'

// Related Posts Widget
export const relatedPostsWidget = defineType({
  name: 'relatedPostsWidget',
  title: 'Related Posts Widget',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Widget Title',
      type: 'string',
      initialValue: 'Related Posts',
    }),
    defineField({
      name: 'numberOfPosts',
      title: 'Number of Posts to Show',
      type: 'number',
      initialValue: 3,
      validation: (Rule) => Rule.min(1).max(10),
    }),
    defineField({
      name: 'criteria',
      title: 'Match Criteria',
      type: 'array',
      of: [
        {
          type: 'string',
          options: {
            list: [
              {title: 'Same Category', value: 'category'},
              {title: 'Same Tags', value: 'tags'},
              {title: 'Same Location', value: 'location'},
            ],
          },
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
})

// Location Map Widget
export const locationMapWidget = defineType({
  name: 'locationMapWidget',
  title: 'Location Map Widget',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Widget Title',
      type: 'string',
      initialValue: 'Location',
    }),
    defineField({
      name: 'mapStyle',
      title: 'Map Style',
      type: 'string',
      options: {
        list: [
          {title: 'Standard', value: 'standard'},
          {title: 'Satellite', value: 'satellite'},
          {title: 'Terrain', value: 'terrain'},
        ],
      },
      initialValue: 'standard',
    }),
    defineField({
      name: 'showNearbyBeaches',
      title: 'Show Nearby Beaches',
      type: 'boolean',
      initialValue: true,
    }),
  ],
})

// Category List Widget
export const categoryListWidget = defineType({
  name: 'categoryListWidget',
  title: 'Category List Widget',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Widget Title',
      type: 'string',
      initialValue: 'Categories',
    }),
    defineField({
      name: 'displayStyle',
      title: 'Display Style',
      type: 'string',
      options: {
        list: [
          {title: 'List', value: 'list'},
          {title: 'Grid', value: 'grid'},
          {title: 'Dropdown', value: 'dropdown'},
        ],
      },
      initialValue: 'list',
    }),
    defineField({
      name: 'showPostCount',
      title: 'Show Post Count',
      type: 'boolean',
      initialValue: true,
    }),
  ],
})

// Tag Cloud Widget
export const tagCloudWidget = defineType({
  name: 'tagCloudWidget',
  title: 'Tag Cloud Widget',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Widget Title',
      type: 'string',
      initialValue: 'Tags',
    }),
    defineField({
      name: 'maxTags',
      title: 'Maximum Number of Tags',
      type: 'number',
      initialValue: 20,
      validation: (Rule) => Rule.min(1).max(50),
    }),
    defineField({
      name: 'orderBy',
      title: 'Order By',
      type: 'string',
      options: {
        list: [
          {title: 'Popularity', value: 'popularity'},
          {title: 'Alphabetical', value: 'alphabetical'},
          {title: 'Recent', value: 'recent'},
        ],
      },
      initialValue: 'popularity',
    }),
    defineField({
      name: 'showTagCount',
      title: 'Show Tag Count',
      type: 'boolean',
      initialValue: true,
    }),
  ],
})

// Weather Widget
export const weatherWidget = defineType({
  name: 'weatherWidget',
  title: 'Weather Widget',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Widget Title',
      type: 'string',
      initialValue: 'Local Weather',
    }),
    defineField({
      name: 'type',
      type: "string",
      initialValue: "weather",
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: "order",
      type: 'number',
      title: 'Order',
      initialValue: 1,
    }),
  ],
})

// Flight Search Widget
export const flightSearchWidget = {
  name: 'flightSearchWidget',
  title: 'Flight Search Widget',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Widget Title',
      type: 'string',
      initialValue: 'Find Flights',
    }),
    defineField({
      name: 'destinationCode',
      title: 'Destination Airport Code',
      type: 'string',
      description: 'IATA airport code (e.g., CPT for Cape Town)',
      validation: (Rule) => Rule.required().length(3).uppercase(),
    }),
  ],
}
