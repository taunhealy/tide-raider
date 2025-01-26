import { client } from "@/app/lib/sanity";
import { PortableText } from "@portabletext/react";
import { urlForImage } from "@/app/lib/urlForImage";
import { notFound } from "next/navigation";
import Image from "next/image";
import { postQuery } from "@/app/lib/queries";
import TripExpensesSidebar from "@/app/components/sidebars/TripExpensesSidebar";

interface Post {
  title: string;
  template: {
    name: string;
    sidebar: string;
  };
  location: {
    beachName: string;
    region: string;
    country: string;
    continent: string;
    weatherCity: string;
  };
  travelCosts?: {
    airports: Array<{
      code: string;
      name: string;
      baseCost: number;
    }>;
    accommodation: {
      costPerNight: number;
      hotelName: string;
      bookingLink: string;
    };
    dailyExpenses: {
      food: number;
      transport: number;
      activities: number;
      medical: number;
    };
  };
  surfConditions?: {
    // Add your surf conditions type here
  };
  content: Array<{
    type: "intro" | "content" | "conclusion";
    text: any;
    image: any;
  }>;
  publishedAt: string;
  categories: Array<{
    title: string;
    slug: { current: string };
  }>;
}

export default async function Post({ params }: { params: { slug: string } }) {
  const post: Post = await client.fetch(postQuery, { slug: params.slug });

  if (!post) return notFound();

  const transformedTravelCosts = post.travelCosts
    ? {
        ...post.travelCosts,
        airports: post.travelCosts.airports.map((airport) => ({
          iata: airport.code,
          name: airport.name,
          city: post.location.region,
          country: post.location.country,
        })),
      }
    : undefined;

  const shouldRenderSidebar = post.template?.sidebar === "travelExpenses";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        {/* Main Content */}
        <main>
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          <div className="prose max-w-none">
            {post.content.map((section, index) => (
              <div key={index} className="mb-8">
                {section.image && (
                  <Image
                    src={urlForImage(section.image)?.url() || ""}
                    alt={`Section ${index + 1}`}
                    width={800}
                    height={400}
                    className="rounded-lg mb-4"
                  />
                )}
                <PortableText value={section.text} />
              </div>
            ))}
          </div>
        </main>

        {/* Sidebar */}
        {shouldRenderSidebar && (
          <aside className="space-y-8">
            <TripExpensesSidebar
              travelCosts={transformedTravelCosts}
              location={post.location}
            />
          </aside>
        )}
      </div>
    </div>
  );
}
