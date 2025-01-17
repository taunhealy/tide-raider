import { client } from "@/app/lib/sanity";
import { urlForImage } from "@/app/lib/urlForImage";
import { FormattedDate } from "@/app/components/FormattedDate";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import Image from "next/image";
import { Metadata } from "next";

// Define types based on the schema
interface Post {
  title: string;
  mainImage: any;
  publishedAt: string;
  description: string;
  body: any[];
  categories: {
    title: string;
    slug: { current: string };
  }[];
}

// Generate static params for static generation
export async function generateStaticParams() {
  const posts = await client.fetch(`
    *[_type == "post"] {
      slug
    }
  `);

  return posts.map((post: { slug: { current: string } }) => ({
    slug: post.slug.current,
  }));
}

// Fetch post data
async function getPost(slug: string) {
  const post = await client.fetch(
    `
    *[_type == "post" && slug.current == $slug][0] {
      title,
      mainImage,
      publishedAt,
      description,
      body,
      categories[]-> {
        title,
        slug
      }
    }
  `,
    { slug }
  );

  return post || null;
}

// Add metadata generation
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPost(params.slug);

  if (!post) return { title: "Post Not Found" };

  const mainImageUrl = post.mainImage
    ? urlForImage(post.mainImage)?.width(1200).height(675).url()
    : null;

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      images: mainImageUrl ? [mainImageUrl] : [],
    },
  };
}

export default async function BlogPost({
  params,
}: {
  params: { slug: string };
}) {
  const post: Post | null = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  const mainImageUrl = post.mainImage
    ? urlForImage(post.mainImage)?.width(1200).height(675).url()
    : null;

  return (
    <article className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <header className="mb-12">
        {/* Categories */}
        {post.categories && post.categories.length > 0 && (
          <div className="flex gap-2 mb-4">
            {post.categories.map((category) => (
              <span
                key={category.slug.current}
                className="text-xs bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] px-2 py-1 rounded font-secondary font-semibold uppercase"
              >
                {category.title}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl font-bold text-[var(--color-text-primary)] mb-4">
          {post.title}
        </h1>

        {/* Date */}
        <div className="text-[var(--color-text-secondary)] mb-8">
          <FormattedDate date={new Date(post.publishedAt)} />
        </div>

        {/* Main Image - Updated to use Next/Image */}
        {mainImageUrl && (
          <div className="relative aspect-[16/9] mb-8 rounded-lg overflow-hidden">
            <Image
              src={mainImageUrl}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Description */}
        <p className="text-[21px] text-[var(--color-text-secondary)] leading-relaxed">
          {post.description}
        </p>
      </header>

      {/* Body Content - Updated with PortableText */}
      <div className="prose prose-lg max-w-none prose-headings:text-[var(--color-text-primary)] prose-p:text-[var(--color-text-secondary)]">
        <PortableText
          value={post.body}
          components={{
            types: {
              image: ({ value }) => {
                const imageUrl = value && value.asset
                  ? urlForImage(value)?.width(1200).height(675).url()
                  : null;
                return imageUrl ? (
                  <div className="relative aspect-[16/9] my-8 rounded-lg overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={value.alt || ""}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : null;
              },
            },
            marks: {
              link: ({ children, value }) => (
                <a
                  href={value.href}
                  className="text-[var-color-tertiary] hover:underline"
                >
                  {children}
                </a>
              ),
            },
          }}
        />
      </div>
    </article>
  );
}
