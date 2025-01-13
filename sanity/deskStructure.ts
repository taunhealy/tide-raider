import type { StructureBuilder } from 'sanity/structure'
import { schemaTypes } from './schemaTypes'

export const structure = (S: StructureBuilder, context: any) => {
  // Get all document types from schema
  const documentTypes = schemaTypes
    .filter(schema => schema.type === 'document')
    .map(schema => schema.name)

  return S.list()
    .title('Content')
    .items([
      // Automatically add all document types
      ...documentTypes.map(typeName => 
        S.documentTypeListItem(typeName)
          .title(typeName.charAt(0).toUpperCase() + typeName.slice(1))
      )
    ])
}