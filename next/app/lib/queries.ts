import { groq } from "next-sanity";

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
      "posts": *[_type == "post"][0...3] | order(publishedAt desc) {
        _id,
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
    },
    heroProduct {
      title,
      leftDescription,
      rightDescription,
      "leftImage": leftImage.asset->url,
      "filterItems": filterItems[] {
        type,
        "icon": icon.asset->url
      }
    },
    heroImage
  }
}`;

// Fetches homepage content including hero and about sections
// Returns: hero and about section content
export const homepageQuery = groq`
  *[_type == "homepage"][0] {
    hero,
    about,
    // other sections
  }
`;

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
export const postQuery = groq`
  *[_type == "post" && slug.current == $slug][0] {
    title,
    "template": template->,
    location {
      beachName,
      region,
      country,
      continent,
      weatherCity
    },
    // Conditional includes based on template
    ...select(template.sidebar == "travelExpenses" => {
      travelCosts {
        airports[] {
          code,
          name,
          baseCost
        },
        accommodation {
          costPerNight,
          hotelName,
          bookingLink
        },
        dailyExpenses
      }
    }),
    ...select(template.sidebar == "surfConditions" => {
      surfConditions {
        // Add your surf conditions fields here
      }
    }),
    content[] {
      type,
      text,
      image
    },
    publishedAt,
    mainImage,
    description,
    "categories": categories[]-> {
      title,
      slug
    }
  }
`;

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
