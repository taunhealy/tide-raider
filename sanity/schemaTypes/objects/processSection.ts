import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'processSection',
  title: 'Process Section',
  type: 'object',
  fields: [
    defineField({
      name: 'processes',
      title: 'Processes',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'process'}]}],
    }),
  ],
})