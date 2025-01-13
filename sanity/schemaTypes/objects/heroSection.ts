import {defineField, defineType} from 'sanity'

export default defineType({
    name: 'heroSection',
    title: 'Hero Section',
    type: 'object',
    fields: [
        {
            name: 'heroImage',
            title: 'Hero Image',
            type: 'image',
            options: {
                hotspot: true,
            },
        },
        {
            name: 'heroVideo',
            title: 'Hero Video',
            type: 'string',
            description: 'Enter the URL of the video',
        },
        {
            name: 'heroTitle',
            title: 'Hero Title',
            type: 'string',
        },
        {
            name: 'heroSubtitle',
            title: 'Hero Subtitle',
            type: 'string',
        },
        {
            name: 'heroLogos',
            title: 'Hero Logos',
            type: 'array',
            of: [{type: 'image'}],
        }
    ],
    preview: {
        select: {
            title: 'heroTitle',
            subtitle: 'heroSubtitle',
            media: 'heroImage'
        },
        prepare({title, subtitle, media}) {
            return {
                title: title || 'Hero Section',
                subtitle: subtitle,
                media: media
            }
        }
    }
})