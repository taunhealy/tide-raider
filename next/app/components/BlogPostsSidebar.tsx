"use client";

import { urlForImage } from "@/app/lib/urlForImage";
import Link from "next/link";
import type { Post } from "@/app/types/blog";
import type { Trip } from "@/app/types/blog";
import { useQuery } from "@tanstack/react-query";

interface BlogPostsSidebarProps {
  posts: {
    posts: Post[];
    trip: Trip;
    categories: { title: string; slug: string }[];
  };
}

export default function BlogPostsSidebar({ posts }: BlogPostsSidebarProps) {
  // Modify the query configuration
  const { data: freshPosts, isLoading } = useQuery({
    queryKey: ["blogPosts"],
    queryFn: async () => {
      const res = await fetch("/api/posts");
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    },
    initialData: posts,
    // Remove staleTime: 0 to use default caching behavior
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // Safely access the posts array
  const postsArray = freshPosts?.posts || posts?.posts || [];

  // Filter travel posts
  const travelPosts = postsArray.filter((post: Post) => {
    return post.categories?.some((category) => category.title === "Travel");
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-[var(--color-bg-primary)] p-6 rounded-lg shadow-sm mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="heading-6">Travel Posts</h3>
          <Link
            href="/blog?category=Travel"
            className="text-main hover:text-[var(--color-text-secondary)] hover:underline transition-colors"
          >
            View All
          </Link>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex gap-4">
              <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show empty state if no posts data at all
  if (!postsArray.length) {
    return (
      <div className="bg-[var(--color-bg-primary)] p-6 rounded-lg shadow-sm mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="heading-6">Travel Posts</h3>
          <Link
            href="/blog?category=Travel"
            className="text-main hover:text-[var(--color-text-secondary)] hover:underline transition-colors"
          >
            View All
          </Link>
        </div>
        <p className="text-main text-sm">No travel posts available yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-bg-primary)] p-6 rounded-lg shadow-sm mb-6">
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
        {travelPosts.slice(0, 3).map((post: Post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block"
          >
            <article className="flex gap-4">
              {post.mainImage && (
                <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg">
                  <img
                    src={urlForImage(post.mainImage)
                      ?.width(80)
                      .height(80)
                      .url()}
                    alt={post.title || "Post title"}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="heading-7 mb-1 truncate group-hover:text-[var(--color-text-secondary)] transition-colors">
                  {post.title}
                </h4>
                {post.description && (
                  <p className="text-main text-[12px] line-clamp-2">
                    {post.description}
                  </p>
                )}
                {post.trip && (
                  <div className="mt-1 text-main text-[12px] text-[var(--color-text-tertiary)]">
                    {[post.trip.region, post.trip.country]
                      .filter(Boolean)
                      .join(" • ")}
                  </div>
                )}
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
