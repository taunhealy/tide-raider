export default {
    name: 'contactSection',
    title: 'Contact Section',
    type: 'object',
    fields: [
      {
        name: 'heading',
        title: 'Heading',
        type: 'string',
        validation: (Rule: any) => Rule.required(),
      },
      {
        name: 'subheading',
        title: 'Subheading',
        type: 'text',
      },
      {
        name: 'contactInfo',
        title: 'Contact Information',
        type: 'object',
        fields: [
          {
            name: 'email',
            title: 'Email Address',
            type: 'string',
            validation: (Rule: any) => Rule.email(),
          },
          {
            name: 'phone',
            title: 'Phone Number',
            type: 'string',
          },
          {
            name: 'address',
            title: 'Address',
            type: 'text',
          }
        ]
      },
      {
        name: 'formFields',
        title: 'Form Fields',
        type: 'array',
        of: [
          {
            type: 'object',
            fields: [
              {
                name: 'fieldName',
                title: 'Field Name',
                type: 'string',
                validation: (Rule: any) => Rule.required(),
              },
              {
                name: 'fieldType',
                title: 'Field Type',
                type: 'string',
                options: {
                  list: [
                    { title: 'Text', value: 'text' },
                    { title: 'Email', value: 'email' },
                    { title: 'Phone', value: 'tel' },
                    { title: 'Textarea', value: 'textarea' },
                  ],
                },
                validation: (Rule: any) => Rule.required(),
              },
              {
                name: 'required',
                title: 'Required Field',
                type: 'boolean',
                initialValue: false,
              },
              {
                name: 'placeholder',
                title: 'Placeholder Text',
                type: 'string',
              }
            ]
          }
        ]
      },
      {
        name: 'submitButtonText',
        title: 'Submit Button Text',
        type: 'string',
        initialValue: 'Send Message',
      },
      {
        name: 'successMessage',
        title: 'Success Message',
        type: 'text',
        initialValue: 'Thank you for your message. We will get back to you soon!',
      }
    ],
    preview: {
      select: {
        title: 'heading',
      },
      prepare({ title }: { title: string }) {
        return {
          title: title || 'Contact Section',
        }
      }
    }
  }