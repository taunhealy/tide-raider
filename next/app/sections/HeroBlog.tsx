"use client";

import { urlForImage } from "@/app/lib/urlForImage";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import Link from "next/link";

interface Category {
  title: string;
  slug: { current: string };
}

interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage: any;
  hoverImage: any;
  publishedAt: string;
  description: string;
  categories: Category[];
}

interface BlogProps {
  data: {
    posts: Post[];
    allCategories: Category[];
  } | null;
}

export default function Blog({ data }: BlogProps) {
  if (!data) {
    return null;
  }

  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;
  const allCategories = data.allCategories || [];
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  console.log("Raw posts data:", data.posts);

  const filteredPosts = useMemo(() => {
    console.log("Filtering for category:", activeCategory);
    return data.posts.filter((post) => {
      if (activeCategory === "All") return true;

      console.log(`Checking post "${post.title}":`);
      console.log("Post categories:", JSON.stringify(post.categories, null, 2));

      return post.categories?.some((category) => {
        const matches = category.title === activeCategory;
        console.log(
          `Category "${category.title}" matches "${activeCategory}"?`,
          matches
        );
        return matches;
      });
    });
  }, [data.posts, activeCategory]);

  console.log(
    "Filtered posts:",
    filteredPosts.map((p) => p.title)
  );

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 1);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!containerRef.current) return;

    const scrollAmount = containerRef.current.clientWidth;
    containerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      handleScroll();

      window.addEventListener("load", handleScroll);

      window.addEventListener("resize", handleScroll);
    }

    return () => {
      container?.removeEventListener("scroll", handleScroll);
      window.removeEventListener("load", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [handleScroll, filteredPosts]);

  useEffect(() => {
    const cleanup = () => {
      const shareButtons = document.querySelectorAll(".share-button");
      shareButtons.forEach((button) => {
        button.replaceWith(button.cloneNode(true));
      });
    };

    return cleanup;
  }, []);

  return (
    <section className="blog-section pt-[54px] pb-[81px] md:pt-[54px] md:pb-[121.51px] px-4 md:px-[121.51px] bg-[var(--color-bg-primary)]">
      <div className="text-left mb-8 md:mb-12">
        <h3 className="heading-3 font-primary text-3xl md:text-5xl font-bold text-gray-900">
          Latest Blog Posts
        </h3>
      </div>
      <div className="blog-nav-container flex flex-col md:flex-row justify-between gap-[32px] mb-8">
        <div className="flex justify-between items-end w-full min-w-[700px]">
          <div className="blog-nav-titles flex flex-row gap-[16px] items-end overflow-x-hidden overflow-y-hidden min-h-[32px]">
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
          <div className="blog-nav-item">
            <Link href="/blog">
              <span className="font-primary text-[16px] underline text-[var(--color-text-primary)] hover:text-[var(--color-text-secondary)] transition-colors duration-300">
                View All
              </span>
            </Link>
          </div>
        </div>
      </div>

      <div className="blog-content-container px-4 md:px-[54px] relative">
        <div
          ref={containerRef}
          className="md:flex md:overflow-x-auto gap-4 md:gap-8 scroll-smooth no-scrollbar md:min-h-[540px] flex-col md:flex-row"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {data?.posts?.slice(0, 5).map((post: Post, index: number) => (
            <article
              key={`${post._id}-${index}`}
              className="flex-none w-full md:w-[calc(33.333%-1.33rem)] min-w-[280px] md:min-w-[300px] bg-white rounded-lg overflow-hidden transition-all duration-300 group mb-4 md:mb-0"
              style={{ scrollSnapAlign: "start" }}
            >
              <a
                href={`/blog/${post.slug}/`}
                className="flex flex-row md:flex-col"
              >
                <div className="relative w-[140px] md:w-full h-[140px] md:h-[410px] overflow-hidden">
                  {post.mainImage?.asset && (
                    <>
                      <div className="w-full h-full absolute inset-0 bg-[var(--color-bg-tertiary)] opacity-0 group-hover:opacity-30 transition-all duration-300 z-10" />
                      <img
                        src={
                          urlForImage(post.mainImage)
                            ?.width(600)
                            ?.height(400)
                            ?.url() ?? ""
                        }
                        alt={post.title || "Blog post image"}
                        className="w-full h-full object-cover"
                      />
                    </>
                  )}

                  {post.hoverImage?.asset && (
                    <img
                      src={
                        urlForImage(post.hoverImage?.asset)
                          ?.width(600)
                          ?.height(400)
                          ?.url() ?? ""
                      }
                      alt={
                        post.title
                          ? `${post.title} hover image`
                          : "Blog post hover image"
                      }
                      className="your-class-name"
                    />
                  )}
                </div>

                <div className="flex-1 p-4 md:p-6">
                  {post.categories && post.categories.length > 0 && (
                    <div className="flex gap-2 mb-2">
                      {post.categories.map((category: Category) => (
                        <span
                          key={category.title}
                          className="font-primary text-xs bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] px-2 py-1 rounded font-semibold uppercase"
                        >
                          {category.title}
                        </span>
                      ))}
                    </div>
                  )}

                  <h3 className="font-primary text-lg md:text-xl mb-2 md:mb-[16px] font-semibold text-gray-900 group-hover:text-primary transition-colors duration-300">
                    {post.title}
                  </h3>

                  <div className="hidden md:flex items-center text-[var(--color-text-secondary)] font-primary font-medium mt-4">
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
              </a>
            </article>
          ))}
        </div>

        <div className="hidden md:block">
          <div
            className={`absolute left-0 top-1/2 -translate-y-1/2 transition-opacity duration-300 ease-in-out ${
              canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <button
              onClick={() => scroll("left")}
              className="bg-white rounded-full p-2 hover:bg-gray-50 transition-colors shadow-md"
            >
              <ChevronLeft size={24} />
            </button>
          </div>

          <div
            className={`absolute right-0 top-1/2 -translate-y-1/2 transition-opacity duration-300 ease-in-out ${
              canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <button
              onClick={() => scroll("right")}
              className="bg-white rounded-full p-2 hover:bg-gray-50 transition-colors shadow-md"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
