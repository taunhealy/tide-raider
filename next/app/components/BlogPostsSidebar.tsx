import { urlForImage } from "@/app/lib/urlForImage";
import { client } from "@/app/lib/sanity";
import { FormattedDate } from "./FormattedDate";
import Link from "next/link";

interface Post {
  title: string;
  slug: { current: string };
  mainImage: any;
  publishedAt: string;
  description: string;
  categories: { title: string }[];
}

interface BlogPostsSidebarProps {
  posts: Post[];
}

export default function BlogPostsSidebar({ posts }: BlogPostsSidebarProps) {
  // Filter posts with Travel category
  const travelPosts = posts.filter(
    (post) =>
      post.categories &&
      Array.isArray(post.categories) &&
      post.categories.some(
        (category) =>
          category &&
          typeof category === "object" &&
          category.title === "Travel"
      )
  );

  return (
    <div className="bg-[var(--color-bg-primary)] p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="heading-6">Travel Posts</h3>
        <Link
          href="/blog?category=Travel"
          className="text-main hover:text-[var(--color-text-secondary)] hover:underline transition-colors"
        >
          View All
        </Link>
      </div>

      <div className="space-y-6">
        {travelPosts.slice(0, 3).map((post) => (
          <Link
            key={post.slug.current}
            href={`/blog/${post.slug.current}`}
            className="group block"
          >
            <article className="flex gap-4">
              {post.mainImage && (
                <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg">
                  <img
                    src={
                      post.mainImage
                        ? urlForImage(post.mainImage)
                            ?.width(80)
                            ?.height(80)
                            ?.url() || ""
                        : ""
                    }
                    alt={post?.title || "Post title"}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="heading-7 mb-1 truncate group-hover:text-[var(--color-text-secondary)] transition-colors">
                  {post.title}
                </h4>
                <p className="text-main text-[12px] line-clamp-2">
                  {post.description}
                </p>
                <div className="mt-1 text-main text-[12px] text-[var(--color-text-tertiary)]">
                  <FormattedDate date={new Date(post.publishedAt)} />
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
