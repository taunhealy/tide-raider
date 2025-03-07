import { client } from "./lib/sanity";
import { landingPageQuery } from "./lib/queries";
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

// Only fetch content, not structure
async function getHomeContent() {
  const [content, blogData] = await Promise.all([
    client.fetch(landingPageQuery),
    client.fetch(blogQuery),
  ]);

  return {
    hero: content
      ? {
          heroHeading: content.heroHeading,
          heroSubheading: content.heroSubheading,
          heroImage: content.heroImage,
          heroFooterImage: content.heroFooterImage,
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
      <HeroProduct />
      <HeroBlogSection data={content.blog} />
      {content.hero && <HeroImage data={content.hero} />}
    </main>
  );
}
