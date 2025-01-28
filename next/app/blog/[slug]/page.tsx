import { client } from "@/app/lib/sanity";
import { PortableText } from "@portabletext/react";
import { urlForImage } from "@/app/lib/urlForImage";
import { notFound } from "next/navigation";
import Image from "next/image";
import { postQuery } from "@/app/lib/queries";
import BlogSidebar from "@/app/components/postsSidebars/BlogSidebar";

interface SidebarWidget {
  type: string;
  order: number;
  config: {
    widgetConfig: any;
  };
}

export default async function BlogPost({
  params,
}: {
  params: { slug: string };
}) {
  const post = await client.fetch(postQuery, { slug: params.slug });
  console.log("Post data from Sanity:", {
    title: post?.title,
    widgets: post?.sidebarWidgets,
    location: post?.location,
  });

  if (!post) return notFound();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        {/* Main Content */}
        <main>
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

          {/* Main Image */}
          {post.mainImage?.asset && (
            <div className="relative aspect-[16/9] mb-6">
              <Image
                src={urlForImage(post.mainImage)?.url() || "/placeholder.jpg"}
                alt={post.title}
                fill
                className="object-cover rounded-lg"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose max-w-none">
            {Array.isArray(post.content) && post.content.length > 0 ? (
              <PortableText value={post.content} />
            ) : (
              <div className="bg-yellow-50 p-4 rounded">
                <p className="text-yellow-700">
                  Content is missing. Please add content in Sanity Studio.
                </p>
              </div>
            )}
          </div>
        </main>

        {/* Sidebar */}
        <aside className="space-y-8">
          <BlogSidebar
            location={post.location}
            posts={post.relatedPosts}
            widgets={post.sidebarWidgets}
          />
        </aside>
      </div>
    </div>
  );
}
