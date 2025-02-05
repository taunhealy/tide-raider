import { client } from "@/app/lib/sanity";
import { PortableText } from "@portabletext/react";
import { urlForImage } from "@/app/lib/urlForImage";
import { notFound } from "next/navigation";
import Image from "next/image";
import BlogSidebar from "@/app/components/postsSidebars/BlogSidebar";
import { postQuery } from "@/lib/queries";
import imageUrlBuilder from "@sanity/image-url";

interface SidebarWidget {
  type: string;
  order: number;
  config: {
    widgetConfig: any;
  };
}

interface SectionImage {
  source: "upload" | "unsplash";
  uploadedImage?: {
    asset: any; // You might want to type this more specifically with Sanity's image asset type
    alt?: string;
    caption?: string;
  };
  unsplashImage?: {
    url: string;
    alt?: string;
  };
  layout: "full" | "half" | "quarter";
}

interface ContentSection {
  _key: string;
  sectionHeading?: string;
  content: any[]; // This is the PortableText content array
  sectionImages?: SectionImage[];
}

interface BlogPost {
  title: string;
  mainImage?: any; // Sanity image
  slug: string;
  publishedAt: string;
  description: any[]; // PortableText content
  content?: ContentSection[];
  categories: Array<{
    _id: string;
    title: string;
    slug: string;
  }>;
  tags?: Array<{
    _id: string;
    title: string;
    slug: string;
  }>;
  sidebarWidgets?: SidebarWidget[];
  relatedPosts?: Array<{
    title: string;
    slug: string;
    mainImage: any;
    publishedAt: string;
    description: any;
  }>;
}

const builder = imageUrlBuilder(client);

function urlFor(source: any) {
  return builder
    .image(source)
    .auto("format") // Automatically choose modern formats like WebP
    .width(1200) // Set a reasonable max width
    .quality(80) // Slightly higher quality
    .fit("max") // Maintain aspect ratio
    .url();
}

const components = {
  types: {
    section: ({ value }: { value: any }) => {
      const { sectionHeading, content, sectionImages } = value;

      console.log("Section data:", {
        heading: sectionHeading,
        hasImages: !!sectionImages,
        imageCount: sectionImages?.length,
        images: sectionImages,
      });

      return (
        <div className="mb-8">
          {sectionHeading && (
            <h2 className="text-[1.875rem] leading-[1.3] font-bold mb-6">
              {sectionHeading}
            </h2>
          )}

          <div className="prose max-w-none">
            <PortableText value={content} />
          </div>

          {sectionImages && sectionImages.length > 0 && (
            <div
              className={`grid gap-4 my-6 ${
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
                            image.uploadedImage?.asset
                              ? urlFor(image.uploadedImage.asset)
                              : "/images/placeholder.jpg"
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
                            image.unsplashImage?.url
                              ? urlFor(image.unsplashImage.url)
                              : "/images/placeholder.jpg"
                          }
                          alt={alt}
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
  },
};

export default async function BlogPost({
  params,
}: {
  params: { slug: string };
}) {
  const post: BlogPost = await client.fetch(
    postQuery,
    { slug: params.slug },
    {
      cache: "no-store", // Force fresh data
    }
  );

  // Add these debug logs
  console.log("Full post content:", post.content);
  console.log(
    "Sections with images:",
    post.content?.filter(
      (section) => section.sectionImages && section.sectionImages.length > 0
    )
  );

  console.log("Post data from Sanity:", {
    title: post?.title,
    widgets: post?.sidebarWidgets,
  });

  if (!post) return notFound();

  // Sort widgets by order if they exist
  const sortedWidgets = post.sidebarWidgets?.sort((a, b) => a.order - b.order);

  return (
    <div className="container mx-auto px-4 py-8 max-w-[1200px]">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        {/* Main Content */}
        <main className="max-w-[720px]">
          <h1 className="font-primary text-[2.5rem] leading-[1.2] font-bold mb-6">
            {post.title}
          </h1>

          {/* Main Image */}
          {post.mainImage?.asset && (
            <div className="relative aspect-[16/9] mb-8">
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
            {post.content?.map((section, index) => (
              <div key={section._key || index} className="mb-8">
                {section.sectionHeading && (
                  <h2 className="text-[1.875rem] leading-[1.3] font-bold mb-6">
                    {section.sectionHeading}
                  </h2>
                )}
                <PortableText value={section.content} components={components} />

                {section.sectionImages && section.sectionImages.length > 0 && (
                  <div className="grid gap-4 my-6">
                    {section.sectionImages.map((image, imageIndex) => {
                      console.log("Image data:", image);
                      const imageUrl =
                        image.source === "upload"
                          ? urlForImage(image.uploadedImage?.asset)?.url()
                          : image.unsplashImage?.url;

                      const alt =
                        image.source === "upload"
                          ? image.uploadedImage?.alt || ""
                          : image.unsplashImage?.alt || "";

                      const caption =
                        image.source === "upload"
                          ? image.uploadedImage?.caption || ""
                          : "";

                      // Layout classes based on the schema options
                      const layoutClasses = {
                        full: "col-span-full w-full",
                        half: "col-span-1 md:col-span-2 w-full",
                        quarter: "col-span-1 w-full",
                      }[image.layout || "quarter"];

                      return (
                        <div
                          key={imageIndex}
                          className={`relative ${layoutClasses}`}
                        >
                          <div className="relative aspect-[16/9]">
                            <Image
                              src={
                                image.uploadedImage?.asset
                                  ? urlFor(image.uploadedImage.asset)
                                  : "/images/placeholder.jpg"
                              }
                              alt={alt}
                              fill
                              unoptimized
                              sizes="(max-width: 800px) 100vw, 800px"
                              className="object-cover rounded-lg"
                            />
                          </div>
                          {caption && (
                            <p className="text-sm text-gray-500 mt-2">
                              {caption}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>

        {/* Sidebar - Now with sticky positioning */}
        <aside className="space-y-8 lg:sticky lg:top-4 lg:self-start">
          <BlogSidebar posts={post.relatedPosts} widgets={sortedWidgets} />
        </aside>
      </div>
    </div>
  );
}
