import { client } from "@/app/lib/sanity";
import { PortableText } from "@portabletext/react";
import { urlForImage } from "@/app/lib/urlForImage";
import { notFound } from "next/navigation";
import SidebarSelector from "@/app/components/SidebarSelector";
import Image from "next/image";
import { postQuery } from "@/app/lib/queries";

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

export default async function BlogPost({
  params,
}: {
  params: { slug: string };
}) {
  const post = await client.fetch<Post>(postQuery, { slug: params.slug });

  if (!post) {
    notFound();
  }

  // Get sidebar data based on template
  const getSidebarData = (post: Post) => {
    switch (post.template.sidebar) {
      case "travelExpenses":
        return post.travelCosts;
      case "surfConditions":
        return post.surfConditions;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
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
        <aside>
          {post.template.sidebar && (
            <SidebarSelector
              contentType={post.template.sidebar}
              sidebarData={getSidebarData(post)}
            />
          )}
        </aside>
      </div>
    </div>
  );
}
