import { client } from "./lib/sanity";
import { homePageQuery } from "./lib/queries";
import Hero from "./sections/Hero";
import HeroProduct from "./sections/HeroProduct";
import HeroBlog from "./sections/HeroBlog";
import HeroImage from "./sections/HeroImage";

export const revalidate = 0;

export default async function Home() {
  try {
    const data = await client.fetch(
      homePageQuery,
      {},
      {
        cache: "no-store",
        next: { revalidate: 0 },
      }
    );
    console.log("Hero data:", data?.homepage?.hero);

    if (!data?.homepage) {
      return (
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold">Welcome</h1>
          <p>Content is being prepared...</p>
        </div>
      );
    }

    return (
      <>
        <Hero data={data.homepage.hero} />
        <HeroProduct data={data.homepage.heroProduct} />
        <HeroBlog data={data.homepage.blog} />
        <HeroImage data={data.homepage.heroImage} />
      </>
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    return (
      <div className="p-[32px] text-center">
        <h1 className="text-2xl font-bold">Error</h1>
        <p>Failed to load content</p>
      </div>
    );
  }
}
