import type {StructureBuilder} from 'sanity/structure'
import {schemaTypes} from './schemaTypes'

export const structure = (S: StructureBuilder) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Blog Posts')
        .child(
          S.list()
            .title('Posts by Category')
            .items([
              S.listItem()
                .title('All Posts')
                .child(S.documentList().title('All Posts').filter('_type == "post"')),
              S.listItem()
                .title('By Category')
                .child(
                  S.documentTypeList('postCategory')
                    .title('Posts by Category')
                    .child((categoryId) =>
                      S.documentList()
                        .title('Posts')
                        .filter('_type == "post" && $categoryId in categories[]._ref')
                        .params({categoryId}),
                    ),
                ),
            ]),
        ),
      S.divider(),
      S.documentTypeListItem('postTemplate').title('Post Templates'),
      S.documentTypeListItem('postCategory').title('Categories'),
    ])
