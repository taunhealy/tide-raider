import { client } from "./lib/sanity";

import { groq } from "next-sanity";
import HeroBlogSection from "@/app/sections/HeroBlog";
import HeroSection from "./sections/Hero";
import HeroImage from "./sections/HeroImage";

export const revalidate = 0;

// Only fetch content, not structure
async function getHomeContent() {
  const content = await client.fetch(groq`
    *[_type == "landingPage"][0] {
      heroHeading,
      heroSubheading,
      heroImage,
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
      <HeroBlogSection data={content.blog} />
      <HeroImage data={content.image} />
    </main>
  );
}
