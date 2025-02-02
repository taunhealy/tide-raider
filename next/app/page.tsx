import { client } from "./lib/sanity";

import { groq } from "next-sanity";
import HeroBlogSection from "@/app/sections/HeroBlog";
import HeroSection from "./sections/Hero";
import HeroImage from "./sections/HeroImage";
import HeroProduct from "./sections/HeroProduct";

export const revalidate = 0;

// Only fetch content, not structure
async function getHomeContent() {
  const content = await client.fetch(groq`
    *[_type == "landingPage"][0] {
      heroHeading,
      heroSubheading,
      heroImage {
        asset->,
        alt,
        "dimensions": asset->metadata.dimensions,
        overlayText
      },
      "blog": {
        "posts": *[_type == "post"] | order(publishedAt desc) [0...3] {
          _id,
          title,
          slug,
          mainImage,
          publishedAt,
          description,
          categories[]-> {
            title,
            slug
          }
        }
      }
    }
  `);

  console.log("Home content:", content);
  return content
    ? {
        hero: {
          heroHeading: content.heroHeading,
          heroSubheading: content.heroSubheading,
          heroImage: content.heroImage,
        },
        blog: content.blog,
        image: content.heroImage,
      }
    : null;
}

export default async function HomePage() {
  const content = await getHomeContent();

  if (!content) {
    return <div>Loading...</div>;
  }

  return (
    <main>
      <HeroSection data={content.hero} />
      <HeroProduct />
      <HeroBlogSection data={content.blog} />
      <HeroImage data={content.hero} />
    </main>
  );
}
