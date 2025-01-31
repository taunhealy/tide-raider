 import blockContent from './blockContent'
import post from './documents/post'
import postTemplate from './documents/postTemplate'
import postCategory from './documents/postCategory'
import homepage from './documents/homepage'
import pricing from './documents/pricing'
// Object schemas
import heroSection from './objects/heroSection'
import blogSection from './objects/blogSection'
import postTag from './documents/postTag'
import {
  relatedPostsWidget,
  locationMapWidget,
  categoryListWidget,
  tagCloudWidget,
  weatherWidget,
  flightSearchWidget,
} from './objects/sidebarWidgets'

export const schemaTypes = [
  // Documents
  homepage,
  post,
  postTemplate,
  postCategory,
  postTag,
  pricing,
  // Objects
  blockContent,
  heroSection,
  blogSection,
  relatedPostsWidget,
  locationMapWidget,
  categoryListWidget,
  tagCloudWidget,
  weatherWidget,
  flightSearchWidget,
]
