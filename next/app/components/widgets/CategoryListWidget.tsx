"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/app/lib/sanity";

interface CategoryListWidgetProps {
  title?: string;
  displayStyle?: "list" | "grid" | "dropdown";
  showPostCount?: boolean;
}

export default function CategoryListWidget({
  title = "Categories",
  displayStyle = "list",
  showPostCount = true,
}: CategoryListWidgetProps) {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const query = `
        *[_type == "postCategory"] {
          title,
          slug,
          "postCount": count(*[_type == "post" && references(^._id)])
        }
      `;
      return client.fetch(query);
    },
  });

  if (isLoading) return <div>Loading categories...</div>;

  const containerStyles = {
    list: "space-y-2",
    grid: "grid grid-cols-2 gap-4",
    dropdown: "relative",
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className={containerStyles[displayStyle]}>
        {categories?.map((category: any) => (
          <Link
            key={category.slug.current}
            href={`/blog?category=${category.slug.current}`}
            className="flex items-center justify-between hover:text-blue-600 transition-colors"
          >
            <span>{category.title}</span>
            {showPostCount && (
              <span className="text-sm text-gray-500">
                ({category.postCount})
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
