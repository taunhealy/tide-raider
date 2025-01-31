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
        next: { revalidate: 0 },
      }
    );

    console.log("Raw data:", data); // Let's see the full data structure

    if (!data) {
      return (
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold">Welcome</h1>
          <p>Content is being prepared...</p>
        </div>
      );
    }

    return (
      <>
        <Hero data={data.hero} />
        {data.heroProduct && <HeroProduct data={data.heroProduct} />}
        {data.blog && <HeroBlog data={data.blog} />}
        {data.heroImage && <HeroImage data={data.heroImage} />}
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
