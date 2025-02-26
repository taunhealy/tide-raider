"use client";

import { urlForImage } from "@/app/lib/urlForImage";
import { Post as BasePost } from "@/app/types/blog";
import { useState, useMemo } from "react";
import Link from "next/link";
import ClientImage from "@/app/components/ClientImage";

interface Category {
  title: string;
  slug: { current: string };
}

interface HeroPost
  extends Pick<
    BasePost,
    | "_id"
    | "title"
    | "slug"
    | "mainImage"
    | "publishedAt"
    | "description"
    | "categories"
  > {
  hoverImage: any;
  trip?: {
    country?: string;
    region?: string;
  };
}

interface BlogProps {
  data: {
    posts: HeroPost[];
    allCategories: Category[];
  } | null;
}

export default function BlogGrid({ data }: BlogProps) {
  if (!data) {
    return null;
  }

  const [activeCategory, setActiveCategory] = useState("All");
  const allCategories = data.allCategories || [];

  const filteredPosts = useMemo(() => {
    return data.posts.filter((post) => {
      if (activeCategory === "All") return true;
      return post.categories?.some(
        (category) => category?.title === activeCategory
      );
    });
  }, [data.posts, activeCategory]);

  return (
    <section className="blog-section pt-[32px] pb-[81px] md:pt-[32px] md:pb-[121.51px] px-4 md:px-[121.51px] bg-[var(--color-bg-primary)]">
      <div className="blog-nav-container flex flex-col md:flex-row justify-between gap-[32px] mb-4">
        <div className="flex justify-between items-end w-full">
          <div className="blog-nav-titles flex flex-row gap-[16px] items-end overflow-x-auto overflow-y-hidden min-h-[32px] max-w-full">
            {["All", ...allCategories.map((cat) => cat.title)].map(
              (category) => (
                <h6
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`font-primary cursor-pointer whitespace-nowrap transition-all ease-in-out duration-300 ${
                    activeCategory === category
                      ? "text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <span
                    className={`relative after:content-[""] after:absolute after:left-0 after:bottom-[-3px] after:h-[2px] after:bg-gray-900 after:transition-all after:duration-300 after:ease-out ${
                      activeCategory === category ? "after:w-full" : "after:w-0"
                    }`}
                  >
                    {category}
                  </span>
                </h6>
              )
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.map((post: HeroPost) => {
          if (!post.slug) {
            console.warn("Post missing slug:", post);
            return null;
          }
          return (
            <article
              key={post._id}
              className="bg-white rounded-lg overflow-hidden transition-all duration-300 group"
            >
              <Link
                href={`/blog/${post.slug}`}
                className="flex flex-col hover:no-underline"
              >
                <div className="relative w-full h-[410px] overflow-hidden">
                  {post.mainImage?.asset && (
                    <>
                      <div className="w-full h-full absolute inset-0 opacity-0 group-hover:opacity-30 transition-all duration-300 z-10" />
                      {post.trip && (post.trip.country || post.trip.region) && (
                        <div className="absolute top-4 right-4 flex gap-2 text-xs text-white z-20">
                          {post.trip.country && (
                            <span className="font-medium bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                              {post.trip.country}
                            </span>
                          )}
                        </div>
                      )}
                      <ClientImage
                        src={
                          urlForImage(post.mainImage)
                            ?.width(600)
                            ?.height(400)
                            ?.url() ?? ""
                        }
                        alt={post.title || "Blog post image"}
                        className="w-full h-full object-cover transition-transform duration-300"
                      />
                    </>
                  )}
                </div>

                <div className="p-6">
                  {post.categories && post.categories.length > 0 && (
                    <div className="flex gap-2 mb-3">
                      {post.categories
                        .filter(
                          (category): category is Category => !!category?.slug
                        )
                        .map((category) => (
                          <span
                            key={category.title}
                            className="font-primary text-xs bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] px-3 py-1 rounded font-semibold uppercase"
                          >
                            {category.title}
                          </span>
                        ))}
                    </div>
                  )}

                  <h3 className="font-primary text-lg mb-2 font-semibold text-gray-900 group-hover:text-primary transition-colors duration-300">
                    {post.title}
                  </h3>

                  <div className="flex items-center text-[var(--color-text-secondary)] font-primary font-medium">
                    Read More
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-300"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
