"use client";

import { useQuery } from "@tanstack/react-query";
import { Inter } from "next/font/google";
import Link from "next/link";
import { Star } from "lucide-react";
import { cn } from "@/app/lib/utils";
import type { LogEntry } from "@/app/types/logbook";

const inter = Inter({ subsets: ["latin"] });

export default function LogbookSidebar() {
  console.log("LogbookSidebar rendering");

  const { data: logEntries = [], isLoading } = useQuery({
    queryKey: ["logEntries"],
    queryFn: async () => {
      const response = await fetch("/api/logbook");
      if (!response.ok) throw new Error("Failed to fetch log entries");
      return response.json();
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  return (
    <div className="bg-[var(--color-bg-primary)] p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3
          className={`text-lg font-semibold text-gray-800 ${inter.className}`}
        >
          Recent Sessions
        </h3>
        <Link
          href="/logbook"
          className="text-sm text-[var(--color-text-secondary)] hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          logEntries.slice(0, 3).map((entry: LogEntry) => (
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
        )}
      </div>
    </div>
  );
}
