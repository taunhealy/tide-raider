import blockContent from './blockContent'
import post from './documents/post'
import postCategory from './documents/postCategory'
import homepage from './documents/homepage'
import pricing from './documents/pricing'
// Object schemas
import heroSection from './objects/heroSection'
import blogSection from './objects/blogSection'

export const schemaTypes = [
  // Documents
  homepage,
  post,
  postCategory,  
  // Objects
  blockContent,
  heroSection,
  blogSection,
  pricing
]
