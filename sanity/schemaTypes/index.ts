import post from './documents/post'
import postTemplate from './documents/postTemplate'
import postCategory from './documents/postCategory'
import home from './documents/home'
import pricing from './documents/pricing'
// Object schemas
import postTag from './documents/postTag'
import {
  relatedPostsWidget,
  locationMapWidget,
  categoryListWidget,
  tagCloudWidget,
  weatherWidget,
  flightSearchWidget,
  surfSpotsWidget,
  travelWidget,
} from './objects/sidebarWidgets'

export const schemaTypes = [
  // Documents
  home,
  post,
  postTemplate,
  postCategory,
  postTag,
  pricing,
  // Widgets
  relatedPostsWidget,
  locationMapWidget,
  categoryListWidget,
  tagCloudWidget,
  weatherWidget,
  flightSearchWidget,
  surfSpotsWidget,
  travelWidget,
]
