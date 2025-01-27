"use client";

import { useQuery } from "@tanstack/react-query";
import { Inter } from "next/font/google";
import Link from "next/link";
import { Star } from "lucide-react";
import { cn } from "@/app/lib/utils";
import type { LogEntry } from "@/app/types/questlogs";

const inter = Inter({ subsets: ["latin"] });
const WEEK_IN_MS = 1000 * 60 * 60 * 24; // 7 days in milliseconds

export default function QuestLogSidebar() {
  const { data, isLoading } = useQuery({
    queryKey: ["recentQuestEntries"],
    queryFn: async () => {
      // Try to get cached data first
      const cachedData = localStorage.getItem("recentQuestEntries");
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        // Check if cache is less than a week old
        if (Date.now() - timestamp < WEEK_IN_MS) {
          return data;
        }
      }

      // If no cache or expired, fetch fresh data
      const response = await fetch("/api/quest-log?limit=3");
      if (!response.ok) throw new Error("Failed to fetch recent entries");
      const data = await response.json();

      // Cache the new data
      localStorage.setItem(
        "recentQuestEntries",
        JSON.stringify({
          data: data.entries,
          timestamp: Date.now(),
        })
      );

      return data.entries;
    },
    staleTime: WEEK_IN_MS, // Cache in memory for a week
    gcTime: WEEK_IN_MS, // Keep in cache for a week
    refetchOnMount: true, // Refetch on mount to validate cache
    // Use cached data while revalidating
    placeholderData: () => {
      const cachedData = localStorage.getItem("recentQuestEntries");
      if (cachedData) {
        const { data } = JSON.parse(cachedData);
        return data;
      }
      return undefined;
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="bg-[var(--color-bg-primary)] p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3
          className={`text-lg font-semibold text-gray-800 ${inter.className}`}
        >
          Recent Quests
        </h3>
        <Link
          href="/quest-log"
          className="text-sm text-[var(--color-text-secondary)] hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="space-y-6">
        {data && data.length > 0 ? (
          data.map((entry: LogEntry) => (
            <div key={entry.id} className="group">
              <article className="flex gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 mb-1 truncate group-hover:text-[var(--color-text-secondary)] transition-colors">
                    {entry.beachName}
                  </h4>
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Star
                        key={rating}
                        className={cn(
                          "w-4 h-4",
                          rating <= entry.surferRating
                            ? "fill-yellow-400"
                            : "fill-gray-200"
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {entry.comments}
                  </p>
                  <div className="mt-1 text-xs text-gray-400">
                    {new Date(entry.date).toLocaleDateString()}
                  </div>
                </div>
              </article>
            </div>
          ))
        ) : (
          <div>No entries available</div>
        )}
      </div>
    </div>
  );
}
