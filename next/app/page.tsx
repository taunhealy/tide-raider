import { client } from "./lib/sanity";
import { landingPageQuery } from "./lib/queries";
import HeroBlogSection from "@/app/sections/HeroBlog";
import HeroSection from "./sections/Hero";
import HeroImage from "./sections/HeroImage";
import HeroProduct from "./sections/HeroProduct";
import VHSEffect from "@/app/components/VHSEffect";

export const revalidate = 0;

// Only fetch content, not structure
async function getHomeContent() {
  const content = await client.fetch(landingPageQuery);

  return content
    ? {
        hero: {
          heroHeading: content.heroHeading,
          heroSubheading: content.heroSubheading,
          heroImage: content.heroImage,
          heroFooterImage: content.heroFooterImage,
        },
        blog: content.blog,
        image: content.heroImage,
      }
    : null;
}

export default async function HomePage() {
  const content = await getHomeContent();

  if (!content) {
    return <div className="font-primary">Loading...</div>;
  }

  return (
    <main>
      <VHSEffect />
      <HeroSection data={content.hero} />
      <HeroProduct />
      <HeroBlogSection data={content.blog} />
      <HeroImage data={content.hero} />
    </main>
  );
}
