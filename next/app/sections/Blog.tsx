"use client";

import { client } from "@/app/lib/sanity";
import { urlForImage } from "@/app/lib/urlForImage";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { blogListingQuery } from "@/app/lib/queries";

export default function BlogSection() {
  const [activeCategory, setActiveCategory] = useState("All");

  const { data, isLoading } = useQuery({
    queryKey: ["blogSection"],
    queryFn: async () => {
      try {
        const data = await client.fetch(blogListingQuery);
        console.log("Fetched blog data:", data);
        if (data?.posts) {
          data.posts = data.posts.filter(
            (post: any) => post.hasSlug && post.slug
          );
        }
        return data;
      } catch (error) {
        console.error("Error fetching blog data:", error);
        return { posts: [] };
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  const filteredPosts =
    data?.posts?.filter(
      (post: any) =>
        (activeCategory === "All" ||
          post.categories?.some(
            (category: any) => category.title === activeCategory
          )) &&
        post.hasSlug &&
        post.slug
    ) ?? [];

  console.log("Filtered posts:", filteredPosts);

  if (isLoading) return <BlogSkeleton />;

  if (!data?.posts || data.posts.length === 0) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Blog</h2>
            <p className="text-lg text-gray-600">
              No posts available at the moment
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Blog</h2>
          <p className="text-lg text-gray-600">
            Insights, stories, and expert advice
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post: any) => {
            if (!post.slug) {
              console.warn("Post missing slug:", post);
              return null;
            }
            return (
              <Link
                key={post._id}
                href={`/blog/${post.slug}`}
                className="group hover:no-underline transform transition-all duration-300 hover:-translate-y-2"
              >
                <article className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl h-full flex flex-col">
                  {post.mainImage && (
                    <div className="relative aspect-[16/9]">
                      <Image
                        src={
                          urlForImage(post.mainImage)?.url() ||
                          "/images/placeholder.jpg"
                        }
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 line-clamp-3 mb-4 flex-grow">
                      {post.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {post.categories?.map((category: any) => (
                        <span
                          key={category._id}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                        >
                          {category.title}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const BlogSkeleton = () => (
  <section className="py-20 bg-gray-50">
    <div className="container mx-auto px-4">
      <div className="mb-12 text-center">
        <div className="h-12 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-lg">
            <div className="aspect-[16/9] bg-gray-200 animate-pulse"></div>
            <div className="p-6">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3 animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
              </div>
              <div className="flex gap-2 mt-4">
                <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
