import { groq } from "next-sanity";

// Simple query to test connection and see all documents
export const homePageQuery = groq`*[_type == "homepage"] | order(_createdAt desc)[0] {
  _id,
  _type,
  hero {
    heroImageTitle,
    description,
    image,
    imagePhotographer,
    heroAboutImage,
    aboutHeading,
    aboutDescription,
    viewAppHeading,
    viewAppImage,
    aboutImage
  },
  about {
    aboutHeading,
    aboutDescription1,
    aboutDescription1Image,
    aboutDescription2,
    aboutDescription2Image
  },
  blog {
    heading,
    "posts": *[_type == "post"] | order(publishedAt desc) [0...3] {
      _id,
      title,
      "slug": slug.current,
      mainImage,
      publishedAt,
      description,
      categories[]-> {
        _id,
        title
      }
    }
  },
  heroImage {
    image,
    title,
    imagePhotographer
  },
  heroProduct{
    title,
    leftDescription,
    rightDescription,
    leftImage,
    filterItems[]{
      _key,
      type,
      icon
    }
  }
}`;

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
`;

// Single post query with template-specific fields
export const postQuery = groq`*[_type == "post" && slug.current == $slug][0]{
  title,
  mainImage,
  "slug": slug.current,
  publishedAt,
  description,
  content[] {
    _key,
    sectionHeading,
    content,
    sectionImages[] {
      source,
      uploadedImage {
        asset->,
        alt,
        caption
      },
      unsplashImage {
        asset->,
        url,
        alt
      },
      layout
    }
  },
  // Fetch categories with their details
  categories[]-> {
    _id,
    title,
    "slug": slug.current
  },
  // Fetch tags with their details
  tags[]-> {
    _id,
    title,
    "slug": slug.current
  },
  // Fetch sidebar widgets with their configurations
  sidebarWidgets[] {
    _type,
    _key,
    title,
    order,
    ...select(
      _type == 'weatherWidget' => { region },
      _type == 'surfSpotsWidget' => { region },
      _type == 'relatedPostsWidget' => { numberOfPosts },
      _type == 'locationMapWidget' => { region },
      _type == 'categoryListWidget' => { showPostCount, displayStyle },
      _type == 'tagCloudWidget' => { maxTags, showTagCount },
      _type == 'flightSearchWidget' => { destinationCode },
      _type == 'unsplashGridWidget' => { searchTerm }
    )
  },
  // Fetch related posts based on shared categories
  "relatedPosts": *[_type == "post" && 
    references(^.categories[]._ref) && 
    _id != ^._id
  ] | order(publishedAt desc)[0...3] {
    title,
    "slug": slug.current,
    mainImage,
    publishedAt,
    description
  }
}`;

// Main blog listing query - use this for all blog listings
export const blogListingQuery = groq`{
  "posts": *[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    mainImage,
    publishedAt,
    description,
    "template": template->,
    "categories": categories[]-> {
      title,
      slug
    }
  },
  "categories": *[_type == "postCategory"] | order(order asc) {
    title,
    slug
  }
}`;

// Query for sidebar widgets data
export const sidebarWidgetsQuery = groq`
{
  "relatedPosts": *[_type == "post" && references(*[_type == "postCategory" && references(^.categories[]._ref)]._id)] | order(publishedAt desc)[0...5] {
    title,
    slug,
    mainImage,
    publishedAt,
    description,
    categories[]-> {
      title,
      slug
    }
  },
  "categories": *[_type == "postCategory"] | order(order asc) {
    title,
    slug,
    "postCount": count(*[_type == "post" && references(^._id)])
  },
  "tags": *[_type == "postTag"] {
    title,
    slug,
    "postCount": count(*[_type == "post" && references(^._id)]),
    "lastUsed": *[_type == "post" && references(^._id)] | order(publishedAt desc)[0].publishedAt
  }
}`;

// Query for related posts by specific criteria
export const relatedPostsQuery = groq`
*[_type == "post" && 
  // Match by category
  count((categories[]->_id)[@ in ^.categories[]->_id]) > 0 &&
  // Exclude current post
  _id != $postId
] | order(publishedAt desc)[0...3] {
  title,
  slug,
  mainImage,
  publishedAt,
  description,
  categories[]-> {
    title,
    slug
  }
}`;
