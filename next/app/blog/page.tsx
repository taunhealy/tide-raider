"use client";

import { client } from "@/app/lib/sanity";
import { urlForImage } from "@/app/lib/urlForImage";
import Link from "next/link";
import { useState, useMemo } from "react";

interface Category {
  title: string;
  slug: { current: string };
}

interface Post {
  title: string;
  slug: { current: string };
  mainImage: any;
  publishedAt: string;
  description: string;
  categories: Category[];
}

interface BlogPageProps {
  initialPosts: Post[];
  categories: Category[];
}

async function getData() {
  const posts = await client.fetch(`
    *[_type == "post"] | order(publishedAt desc) {
      title,
      slug,
      mainImage,
      publishedAt,
      description,
      categories[]-> {
        title,
        slug
      }
    }
  `);

  const categories = await client.fetch(`
    *[_type == "postCategory"] | order(order asc) {
      title,
      slug
    }
  `);

  return {
    posts,
    categories,
  };
}

export default async function BlogPage() {
  const { posts, categories } = await getData();

  return <BlogPageContent initialPosts={posts} categories={categories} />;
}

function BlogPageContent({ initialPosts, categories }: BlogPageProps) {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredPosts = useMemo(() => {
    if (activeCategory === "All") return initialPosts;

    return initialPosts.filter((post) =>
      post.categories?.some((category) => category.title === activeCategory)
    );
  }, [initialPosts, activeCategory]);

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
          heart ablaze with wanderlust! The seas be vast, and the treasure waits
          for none! Onward, ye scallywags, to adventure and a life worthy of
          song! 🏴‍☠️⚓✨'
        </p>
      </div>

      {/* Category Navigation */}
      <div className="mb-12 border-b border-gray-200">
        <div className="flex overflow-x-auto no-scrollbar gap-8 pb-4">
          <button
            onClick={() => setActiveCategory("All")}
            className={`shrink-0 relative pb-4 ${
              activeCategory === "All"
                ? "text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <span className="whitespace-nowrap">All Posts</span>
            {activeCategory === "All" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900" />
            )}
          </button>

          {categories.map((category) => (
            <button
              key={category.slug.current}
              onClick={() => setActiveCategory(category.title)}
              className={`shrink-0 relative pb-4 ${
                activeCategory === category.title
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="whitespace-nowrap">{category.title}</span>
              {activeCategory === category.title && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.map((post) => (
          <Link
            href={`/blog/${post.slug.current}`}
            key={post.slug.current}
            className="group hover:no-underline"
          >
            <article className="h-full bg-[var(--color-bg-secondary)] rounded-lg overflow-hidden">
              {post.mainImage && (
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src={urlForImage(post.mainImage)
                      .width(600)
                      .height(400)
                      .url()}
                    alt={post.title}
                    className="object-cover w-full h-full transition duration-300 group-hover:scale-105"
                  />
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
                    {post.categories.map((category: Category) => (
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
