import { client } from "@/app/lib/sanity";
import { notFound } from "next/navigation";
import Image from "next/image";
import BlogSidebar from "@/app/components/postsSidebars/BlogSidebar";
import { postQuery } from "@/lib/queries";
import TripDetails from "@/app/components/TripDetails";
import CustomPortableText from "@/app/components/PortableText";
import { urlForImage } from "@/app/lib/urlForImage";
import { getVideoId } from "@/app/lib/videoUtils";
import { SectionImage } from "@/app/types/blog";
import { PortableTextBlock } from "next-sanity";

export default async function BlogPost({
  params,
}: {
  params: { slug: string };
}) {
  if (!params.slug) return notFound();

  let post;
  try {
    post = await client.fetch(
      postQuery,
      { slug: params.slug },
      { cache: "no-store" }
    );
  } catch (error) {
    return notFound();
  }

  if (!post) return notFound();

  const safePost = {
    ...post,
    publishedAt: post.publishedAt || new Date().toISOString(),
    description: post.description || "No description available",
    mainImage: post.mainImage || {
      asset: {
        url: "/images/placeholder.jpg",
      },
    },
  };

  const sortedWidgets = safePost.sidebarWidgets?.sort(
    (a: { order: number }, b: { order: number }) => a.order - b.order
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-[1200px]">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        <main className="max-w-full lg:max-w-[720px]">
          <h1 className="font-primary text-[2rem] sm:text-[2.5rem] leading-[1.2] font-bold mb-4">
            {safePost.title}
          </h1>

          {safePost.mainImage?.asset && (
            <div className="relative aspect-[16/9] mb-8 sm:mb-12">
              <Image
                src={
                  urlForImage(safePost.mainImage)?.url() ||
                  "/images/placeholder.jpg"
                }
                alt={safePost.title}
                fill
                priority
                className="object-cover rounded-lg"
              />
            </div>
          )}

          <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none font-primary">
            {safePost.content.map(
              (
                section: {
                  sectionHeading?: string;
                  content: PortableTextBlock[];
                  sectionImages?: SectionImage[];
                  videoLink?: string;
                },
                index: number
              ) => (
                <div key={index} className="mt-6 sm:mt-8">
                  {section.sectionHeading && (
                    <h2 className="text-[1.5rem] sm:text-[1.875rem] leading-[1.3] font-bold mb-3 sm:mb-4">
                      {section.sectionHeading}
                    </h2>
                  )}

                  <CustomPortableText value={section.content} />

                  {section.videoLink && (
                    <div className="my-4 sm:my-6">
                      <iframe
                        src={`https://www.youtube.com/embed/${getVideoId(section.videoLink)}`}
                        title="YouTube Video"
                        className="w-full aspect-video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}

                  {section.sectionImages &&
                    section.sectionImages.map((image, imgIndex) => (
                      <div key={imgIndex} className="my-4 sm:my-6">
                        <div className="relative aspect-[16/9]">
                          <Image
                            src={
                              image.uploadedImage?.asset?.url ||
                              "/images/placeholder.jpg"
                            }
                            alt={image.uploadedImage?.alt || ""}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                        {image.uploadedImage?.caption && (
                          <p className="text-sm text-gray-500 mt-2 px-2">
                            {image.uploadedImage.caption}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              )
            )}

            {safePost.trip && <TripDetails trip={safePost.trip} />}
          </div>
        </main>

        {/* Sidebar */}
        <aside className="space-y-6 sm:space-y-8 lg:sticky lg:top-4 lg:self-start">
          <BlogSidebar posts={safePost.relatedPosts} widgets={sortedWidgets} />
        </aside>
      </div>
    </div>
  );
}
