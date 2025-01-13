import {defineConfig, SchemaTypeDefinition} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import { structure } from './deskStructure'

export default defineConfig({
  name: 'default',
  title: 'Tide Raider',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '11x17yxj',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',

  plugins: [
    structureTool({
      structure
    }), 
    visionTool()
  ],

  schema: {
    types: schemaTypes as SchemaTypeDefinition[],
  },
})