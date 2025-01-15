"use client";

import React, { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/app/lib/utils";
import { Inter } from "next/font/google";
import { Plus, Filter } from "lucide-react";
import { CreatePostModal } from "./CreatePostModal";
import { PostCard } from "./PostCard";
import { Story, StoryBeach } from "@/app/types/stories";
import { STORY_CATEGORIES, type StoryCategory } from "@/app/lib/constants";

interface WildStoriesProps {
  beaches: StoryBeach[];
}

const inter = Inter({ subsets: ["latin"] });

interface Filters {
  categories: StoryCategory[];
  beaches: string[];
  dateRange: {
    start: string;
    end: string;
  };
}

const defaultFilters: Filters = {
  categories: [],
  beaches: [],
  dateRange: {
    start: "",
    end: "",
  },
};

export default function WildStoriesContainer({ beaches }: WildStoriesProps) {
  const { data: session, status } = useSession();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: stories = [], isLoading } = useQuery<Story[]>({
    queryKey: ["stories"],
    queryFn: async () => {
      const response = await fetch("/api/stories");
      if (!response.ok) throw new Error("Failed to fetch stories");
      return response.json();
    },
    enabled: status === "authenticated",
  });

  const filteredStories = useMemo(() => {
    let filtered = stories;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (story) =>
          story.title.toLowerCase().includes(query) ||
          story.details.toLowerCase().includes(query) ||
          story.beach?.name.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter((story) =>
        filters.categories.includes(story.category)
      );
    }

    // Apply beach filter
    if (filters.beaches.length > 0) {
      filtered = filtered.filter((story) =>
        filters.beaches.includes(story.beach.id)
      );
    }

    // Apply date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter((story) => {
        const storyDate = new Date(story.date);
        const start = filters.dateRange.start
          ? new Date(filters.dateRange.start)
          : null;
        const end = filters.dateRange.end
          ? new Date(filters.dateRange.end)
          : null;

        if (start && end) {
          return storyDate >= start && storyDate <= end;
        } else if (start) {
          return storyDate >= start;
        } else if (end) {
          return storyDate <= end;
        }
        return true;
      });
    }

    return filtered;
  }, [stories, searchQuery, filters]);

  const toggleAllFilters = () => {
    if (
      Object.values(filters).some((f) =>
        Array.isArray(f) ? f.length > 0 : f.start || f.end
      )
    ) {
      // Clear all filters
      setFilters(defaultFilters);
    } else {
      // Select all filters
      setFilters({
        categories: STORY_CATEGORIES,
        beaches: beaches.map((beach) => beach.id),
        dateRange: filters.dateRange, // Keep dateRange as is since it needs specific dates
      });
    }
  };

  if (status === "loading") return null;

  if (!session) {
    return (
      <div className="max-h-full min-h-[60vh] bg-[var(--color-bg-secondary)] p-9 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-semibold mb-4">
          Sign in to view wild stories
        </h2>
        {/* Similar sign-in section as BeachContainer */}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] p-9">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-6 mb-9">
          <div className="flex items-center justify-between">
            <h1 className={`text-2xl font-semibold ${inter.className}`}>
              Wild Stories
            </h1>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--color-bg-tertiary)] text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Share Story</span>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                placeholder="Search stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-auto flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-bg-tertiary)]"
              />
              <button
                onClick={toggleAllFilters}
                className={cn(
                  inter.className,
                  "text-black font-semibold",
                  "bg-white border border-gray-200",
                  "px-4 py-1",
                  "rounded-[21px]",
                  "flex items-center gap-2",
                  "hover:bg-gray-50 transition-colors",
                  "w-full sm:w-auto justify-center sm:justify-start"
                )}
              >
                <span>Filters</span>
                {Object.values(filters).some((f) =>
                  Array.isArray(f) ? f.length > 0 : f.start || f.end
                ) && (
                  <span className="w-2 h-2 rounded-full bg-[var(--color-bg-tertiary)]" />
                )}
              </button>
            </div>

            {/* Category Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {STORY_CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    const newCategories = filters.categories.includes(category)
                      ? filters.categories.filter((c) => c !== category)
                      : [...filters.categories, category];
                    setFilters({ ...filters, categories: newCategories });
                  }}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                    filters.categories.includes(category)
                      ? "bg-[var(--color-bg-tertiary)] text-white"
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  )}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Beach Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {beaches.map((beach) => (
                <button
                  key={beach.id}
                  onClick={() => {
                    const newBeaches = filters.beaches.includes(beach.id)
                      ? filters.beaches.filter((id) => id !== beach.id)
                      : [...filters.beaches, beach.id];
                    setFilters({ ...filters, beaches: newBeaches });
                  }}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                    filters.beaches.includes(beach.id)
                      ? "bg-[var(--color-bg-tertiary)] text-white"
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  )}
                >
                  {beach.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stories Grid */}
        {isLoading ? (
          <div>Loading...</div>
        ) : filteredStories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStories.map((story) => (
              <PostCard
                key={story.id}
                story={story}
                isAuthor={story.author.id === session.user?.id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p>No stories found. Share your first wild story!</p>
          </div>
        )}
      </div>

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        beaches={beaches}
      />
    </div>
  );
}
