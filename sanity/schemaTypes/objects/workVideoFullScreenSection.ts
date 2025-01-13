export default {
    name: 'workVideoFullScreenSection',
    title: 'Full Screen Video Section',
    type: 'object',
    fields: [
      {
        name: 'videoUrl',
        title: 'Video URL',
        type: 'string',
        validation: (Rule: any) => Rule.required()
      },
      {
        name: 'overlayHeading',
        title: 'Overlay Heading',
        type: 'string',
        description: 'Optional text to display over the video'
      }
    ],
    preview: {
      select: {
        title: 'overlayHeading'
      },
      prepare({ title }: { title: string }) {
        return {
          title: title || 'Full Screen Video Section'
        }
      }
    }
  }