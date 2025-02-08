import { client } from "@/app/lib/sanity";
import { PortableText, PortableTextComponents } from "@portabletext/react";
import { urlForImage } from "@/app/lib/urlForImage";
import { notFound } from "next/navigation";
import Image from "next/image";
import BlogSidebar from "@/app/components/postsSidebars/BlogSidebar";
import { postQuery } from "@/lib/queries";
import imageUrlBuilder from "@sanity/image-url";
import { Post } from "@/app/types/blog";
import { SectionImage } from "@/app/types/blog";
import { PortableTextBlock } from "@portabletext/types";
import { getVideoId } from "@/app/lib/videoUtils";
import TripDetails from "@/app/components/TripDetails";

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="mb-4">{children}</p>,
    h2: ({ children }) => (
      <h2 className="text-[21px] font-semibold mb-4">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-[18px] font-semibold mb-4">{children}</h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 mb-4 italic">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-inside mb-4">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-inside mb-4">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },
  types: {
    section: ({
      value,
    }: {
      value: {
        content: PortableTextBlock[];
        sectionImages?: SectionImage[];
        videoLink?: string;
        sectionHeading?: string;
      };
    }) => {
      const { content, sectionImages, videoLink, sectionHeading } = value;

      // Use our helper to extract the video id
      const videoId = videoLink ? getVideoId(videoLink) : null;

      return (
        <div className="mb-8">
          {sectionHeading && (
            <h2 className="text-[1.875rem] leading-[1.3] font-bold mb-6">
              {sectionHeading}
            </h2>
          )}

          <PortableText value={content} components={components} />

          {videoId && (
            <div className="my-6">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube Video"
                className="w-full h-64"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {sectionImages && sectionImages.length > 0 && (
            <div
              className={`grid gap-6 my-12 ${
                sectionImages.length === 1
                  ? "grid-cols-1"
                  : sectionImages.length === 2
                    ? "grid-cols-2"
                    : sectionImages.length === 3
                      ? "grid-cols-3"
                      : "grid-cols-2 md:grid-cols-4"
              }`}
            >
              {sectionImages.map((image: SectionImage, index: number) => {
                const alt =
                  image.source === "upload"
                    ? image.uploadedImage?.alt || ""
                    : image.unsplashImage?.alt || "";

                if (image.source === "upload") {
                  const imageUrl = urlForImage(
                    image.uploadedImage?.asset
                  )?.url();

                  return (
                    <div
                      key={index}
                      className={`relative ${
                        image.layout === "full"
                          ? "col-span-full"
                          : image.layout === "half"
                            ? "col-span-2"
                            : "col-span-1"
                      }`}
                    >
                      <div className="relative aspect-[16/9]">
                        <Image
                          src={
                            image.uploadedImage?.asset?.url ||
                            "/images/placeholder.jpg"
                          }
                          alt={alt}
                          fill
                          unoptimized
                          sizes="(max-width: 800px) 100vw, 800px"
                          className="object-cover rounded-lg"
                        />
                      </div>
                      {image.uploadedImage?.caption && (
                        <p className="text-sm text-gray-500 mt-2">
                          {image.uploadedImage.caption}
                        </p>
                      )}
                    </div>
                  );
                } else {
                  // Handle Unsplash images
                  return (
                    <div
                      key={index}
                      className={`relative ${
                        image.layout === "full"
                          ? "col-span-full"
                          : image.layout === "half"
                            ? "col-span-2"
                            : "col-span-1"
                      }`}
                    >
                      <div className="relative aspect-[16/9]">
                        <Image
                          src={
                            image.unsplashImage?.url ||
                            "/images/placeholder.jpg"
                          }
                          alt={image.unsplashImage?.alt || ""}
                          fill
                          unoptimized
                          className="object-cover rounded-lg"
                        />
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          )}
        </div>
      );
    },

    // *** The custom YouTube Portable Text component ***
    youtube: ({ value }) => {
      // Helper function to extract the YouTube video ID from the provided URL
      const getYouTubeVideoId = (url: string) => {
        const regExp =
          /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return match ? match[1] : null;
      };

      const videoId = value?.url && getYouTubeVideoId(value.url);

      if (!videoId) return null;

      return (
        <div className="my-6">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube Video"
            className="w-full h-64"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    },
  },
};

// Define a type for layout options
type LayoutOption = "full" | "half" | "quarter";

export default async function BlogPost({
  params,
}: {
  params: { slug: string };
}) {
  const post: Post = await client.fetch(
    postQuery,
    { slug: params.slug },
    { cache: "no-store" }
  );

  if (!post) return notFound();

  const sortedWidgets = post.sidebarWidgets?.sort((a, b) => a.order - b.order);

  return (
    <div className="container mx-auto px-4 py-8 max-w-[1200px]">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        <main className="max-w-[720px]">
          <h1 className="font-primary text-[2.5rem] leading-[1.2] font-bold mb-6">
            {post.title}
          </h1>

          {/* Main Image */}
          {post.mainImage?.asset && (
            <div className="relative aspect-[16/9] mb-12">
              <Image
                src={
                  urlForImage(post.mainImage)?.url() ||
                  "/images/placeholder.jpg"
                }
                alt={post.title}
                fill
                priority
                className="object-cover rounded-lg"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose max-w-none font-primary prose-lg">
            {post.content.map((section, index) => (
              <div key={index} className="mt-16">
                {section.sectionHeading && (
                  <h2 className="text-[1.875rem] leading-[1.3] font-bold mb-6">
                    {section.sectionHeading}
                  </h2>
                )}

                <PortableText value={section.content} components={components} />

                {section.videoLink && (
                  <div className="my-6">
                    <iframe
                      src={`https://www.youtube.com/embed/${getVideoId(section.videoLink)}`}
                      title="YouTube Video"
                      className="w-full h-64"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}

                {section.sectionImages &&
                  section.sectionImages.map((image, imgIndex) => {
                    const imageUrl = image.uploadedImage?.asset
                      ? urlForImage(image.uploadedImage.asset)?.url() ||
                        "/images/placeholder.jpg"
                      : "/images/placeholder.jpg";

                    return (
                      <div key={imgIndex} className="relative aspect-[16/9]">
                        <Image
                          src={
                            image.uploadedImage?.asset?.url ||
                            "/images/placeholder.jpg"
                          }
                          alt={image.uploadedImage?.alt || ""}
                          fill
                          className="object-cover rounded-lg"
                        />
                        {image.uploadedImage?.caption && (
                          <p className="text-sm text-gray-500 mt-2">
                            {image.uploadedImage.caption}
                          </p>
                        )}
                      </div>
                    );
                  })}
              </div>
            ))}

            {/* Replace the details section with the new TripDetails component */}
            {post.trip && <TripDetails trip={post.trip} />}
          </div>
        </main>

        {/* Sidebar */}
        <aside className="space-y-8 lg:sticky lg:top-4 lg:self-start">
          <BlogSidebar posts={post.relatedPosts} widgets={sortedWidgets} />
        </aside>
      </div>
    </div>
  );
}
