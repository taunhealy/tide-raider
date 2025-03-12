import { client } from "./lib/sanity";
import HeroBlogSection from "@/app/sections/HeroBlog";
import HeroSection from "./sections/Hero";
import HeroImage from "./sections/HeroImage";
import HeroProduct from "./sections/HeroProduct";

export const revalidate = 0;

const blogQuery = `{
  "categories": *[_type == "category"] {
    _id,
    title
  },
  "posts": *[_type == "post"] | order(_createdAt desc) {
    _id,
    title,
    description,
    slug,
    mainImage,
    _createdAt,
    "categories": categories[]->title,
    trip->{
      country,
      region
    }
  }
}`;

// Update the landingPageQuery in lib/queries.js to include the new fields
// or extend the query here
const extendedLandingPageQuery = `{
  "landingPage": *[_type == "landingPage"][0] {
    heroHeading,
    heroSubheading,
    heroImage,
    heroFooterImage,
    heroAlertImage,
    heroLogBookImage
  }
}`;

// Only fetch content, not structure
async function getHomeContent() {
  const [content, blogData] = await Promise.all([
    client.fetch(extendedLandingPageQuery),
    client.fetch(blogQuery),
  ]);

  return {
    hero: content.landingPage
      ? {
          heroHeading: content.landingPage.heroHeading,
          heroSubheading: content.landingPage.heroSubheading,
          heroImage: content.landingPage.heroImage,
          heroFooterImage: content.landingPage.heroFooterImage,
          heroAlertImage: content.landingPage.heroAlertImage,
          heroLogBookImage: content.landingPage.heroLogBookImage,
        }
      : null,
    blog: blogData,
  };
}

export default async function HomePage() {
  const content = await getHomeContent();

  if (!content) {
    return <div className="font-primary">Loading...</div>;
  }

  return (
    <main>
      {content.hero && <HeroSection data={content.hero} />}
      <HeroProduct data={content.hero} />
      <HeroBlogSection data={content.blog} />
      {content.hero && <HeroImage data={content.hero} />}
    </main>
  );
}
