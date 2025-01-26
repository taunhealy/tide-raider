"use client";

import { client } from "@/app/lib/sanity";
import { urlForImage } from "@/app/lib/urlForImage";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { blogListingQuery } from "@/app/lib/queries";


async function fetchBlogData() {
  return client.fetch(blogListingQuery);
}

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const { data, isLoading } = useQuery({
    queryKey: ["blogData"],
    queryFn: fetchBlogData,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });

  const filteredPosts =
    data?.posts?.filter(
      (post: any) =>
        activeCategory === "All" ||
        post.categories?.some(
          (category: any) => category.title === activeCategory
        )
    ) ?? [];

  if (isLoading) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="container mx-auto py-16 px-4">
      <div className="max-w-[800px] py-[32px] text-left mb-8">
        <h3 className="heading-3 mb-6">Quest & Glory</h3>
        <p className="text-[var(--color-text-secondary)] max-w-[64ch] font-normal italic">
          'The winds carry whispers of forgotten realms and treasures buried
          deep, guarded by tales of curses and legend. Will ye brave the
          Kraken's grasp? Will ye uncover the troves of pirate kings past? The
          only thing certain is the thrill of the chase and the bond of yer
          loyal crew. So sharpen yer cutlass, stow yer doubloons, and set yer
          heart ablaze with wanderlust. The seas be calling, and the gold favors
          the bold! Onward, ye scallywags! 🏴‍☠️⚓✨'
        </p>
      </div>

      {/* Category Navigation */}
      <div className="mb-12">
        <div className="flex items-center justify-start overflow-x-auto no-scrollbar border-b border-gray-200">
          <button
            onClick={() => setActiveCategory("All")}
            className={`px-6 py-4 font-medium text-sm transition-colors duration-200 ${
              activeCategory === "All"
                ? "text-gray-900 bg-gray-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span className="whitespace-nowrap">All Posts</span>
          </button>

          {data?.categories?.map((category: any) => (
            <button
              key={category.slug.current}
              onClick={() => setActiveCategory(category.title)}
              className={`px-6 py-4 font-medium text-sm transition-colors duration-200 ${
                activeCategory === category.title
                  ? "text-gray-900 bg-gray-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="whitespace-nowrap">{category.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.map((post: any) => (
          <Link
            href={`/blog/${post.slug.current}`}
            key={post.slug.current}
            className="group hover:no-underline"
          >
            <article className="h-full bg-[var(--color-bg-secondary)] rounded-lg overflow-hidden">
              {post.mainImage && (
                <div className="relative aspect-[16/9] overflow-hidden">
                  {urlForImage(post.mainImage)?.url() ? (
                    <Image
                      src={
                        urlForImage(post.mainImage)!
                          .width(600)
                          .height(400)
                          .url() || "" // Default to empty string if url() returns null
                      }
                      alt={post.title}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <span>Image not available</span> // Placeholder if the image URL is missing
                  )}
                </div>
              )}

              <div className="p-6">
                <h2 className="text-[21px] md:text-[21px] mb-2 md:mb-[16px] font-semibold text-gray-900 group-hover:text-primary transition-colors duration-300">
                  {post.title}
                </h2>
                <p className="text-[var(--color-text-secondary)] mb-4 line-clamp-2">
                  {post.description}
                </p>
                {post.categories && (
                  <div className="flex flex-wrap gap-2">
                    {post.categories.map((category: any) => (
                      <span
                        key={category.slug.current}
                        className="text-xs bg-[var(--color-bg-tertiary)] text-white px-2 py-1 rounded font-secondary font-semibold uppercase"
                      >
                        {category.title}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
