import { groq } from 'next-sanity'

// Simple query to test connection and see all documents
export const homePageQuery = groq`{
  "homepage": *[_type == "homepage"][0] {
    _id,
    _type,
    _updatedAt,
    hero {
      heroImageTitle,
      description,
      "image": image.asset->url,
      imagePhotographer,
      aboutHeading,
      aboutDescription,
      viewAppHeading,
      "viewAppImage": viewAppImage.asset->url,
      "heroAboutImage": heroAboutImage.asset->url
    },
    about,
    blog {
      heading,
      "posts": *[_type == "post"] {
        _id,
        title,
        slug,
        mainImage,
        hoverImage,
        description,
        "categories": categories[]-> {
          title,
          slug
        }
      },
      "allCategories": *[_type == "postCategory"] | order(order asc) {
        title,
        slug
      }
    },
    heroImage
  }
}`

// Fetches all blog posts, sorted by publish date
// Returns: post details including title, slug, image, date, description and categories
export const postsQuery = `
  *[_type == "post"] | order(publishedAt desc) {
    title,
    slug,
    mainImage,
    publishedAt,
    description,
    "categories": categories[]-> {
      title,
      slug
    }
  }
`

// Fetches homepage content including hero and about sections
// Returns: hero and about section content
export const homepageQuery = groq`
  *[_type == "homepage"][0] {
    hero,
    about,
    // other sections
  }
`

// Add this with the other query exports
export const pricingQuery = groq`
  *[_type == "pricing"][0] {
    title,
    subtitle,
    "pricingImage": pricingImage.asset->url,
    price,
    priceSubtext,
    features
  }
`