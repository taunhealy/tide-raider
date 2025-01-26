import { client } from "@/app/lib/sanity";
import { PortableText } from "@portabletext/react";
import { urlForImage } from "@/app/lib/urlForImage";
import { notFound } from "next/navigation";
import Image from "next/image";
import { postQuery } from "@/app/lib/queries";
import BlogSidebar from "@/app/components/sidebars/BlogSidebar";
import { Post, Airport } from "@/app/types";

export default async function BlogPost({
  params,
}: {
  params: { slug: string };
}) {
  const post = await client.fetch(postQuery, { slug: params.slug });

  if (!post) return notFound();

  const transformedTravelCosts = post.travelCosts
    ? {
        ...post.travelCosts,
        airports: post.travelCosts.airports.map((airport: Airport) => ({
          iata: airport.code,
          name: airport.name,
          city: post.location.region,
          country: post.location.country,
        })),
      }
    : undefined;

  // Check if there are any sidebar widgets configured
  const shouldRenderSidebar = post.template?.sidebarWidgets?.length > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        {/* Main Content */}
        <main>
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          <div className="prose max-w-none">
            {post.content.map(
              (
                section: { type: string; text: any; image: any },
                index: number
              ) => (
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
              )
            )}
          </div>
        </main>

        {/* Sidebar */}
        {shouldRenderSidebar && (
          <aside className="space-y-8">
            <BlogSidebar
              location={post.location}
              posts={post.relatedPosts}
              widgets={post.template.sidebarWidgets}
            />
          </aside>
        )}
      </div>
    </div>
  );
}
