export default {
  name: 'imageFullScreenSection',
  title: 'Full Screen Image Section',
  type: 'object',
  fields: [
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'alt',
      title: 'Alt Text',
      type: 'string',
      description: 'Alternative text for accessibility',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'caption',
      title: 'Caption',
      type: 'string',
      description: 'Optional caption to display below the image',
    },
  ],
  preview: {
    select: {
      imageUrl: 'image.asset.url',
      title: 'alt',
    },
    prepare({ imageUrl, title }: { imageUrl: string; title: string }) {
      return {
        title: title || 'Full Screen Image',
        media: imageUrl || undefined,
      };
    },
  },
};
