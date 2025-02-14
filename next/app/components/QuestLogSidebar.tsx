"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Star } from "lucide-react";
import { cn } from "@/app/lib/utils";
import type { LogEntry } from "@/app/types/questlogs";
import { useSubscription } from "../context/SubscriptionContext";
import Image from "next/image";

export default function QuestLogSidebar() {
  const { isSubscribed } = useSubscription();
  const { data: recentLogs, isLoading } = useQuery({
    queryKey: ["recentLogs"],
    queryFn: async () => {
      const res = await fetch(`/api/raid-logs?limit=3`);
      if (!res.ok) throw new Error("Failed to fetch logs");
      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;

  if (!isSubscribed) {
    return (
      <div className="bg-[var(--color-bg-primary)] p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="text-center">
          <h3 className={`heading-6 text-gray-800 mb-4`}>Cooking 🍳🔥😎</h3>
          <p className="text-small text-gray-600 mb-4">
            Subscribe to view top-rated surf sessions
          </p>
          <Link
            href="/pricing"
            className="text-small inline-block px-4 py-2 bg-[var(--color-tertiary)] text-white rounded-lg hover:bg-[var(--color-tertiary)]"
          >
            View Pricing
          </Link>
        </div>
      </div>
    );
  }

  const highRatedEntries = recentLogs?.entries
    .filter((entry: LogEntry) => entry.surferRating >= 4 && entry.imageUrl)
    .slice(0, 3);

  return (
    <div className="bg-[var(--color-bg-primary)] p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-lg font-semibold text-gray-800 font-primary`}>
          Top Rated Sessions
        </h3>
        <Link
          href="/quest-log"
          className="text-sm text-[var(--color-text-secondary)] hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="space-y-6">
        {highRatedEntries && highRatedEntries.length > 0 ? (
          highRatedEntries.map((entry: LogEntry) => (
            <div key={entry.id} className="group">
              <article className="space-y-3">
                {entry.imageUrl && (
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    <Image
                      src={entry.imageUrl}
                      alt={`Session at ${entry.beachName}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
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
          <div>No top-rated entries available</div>
        )}
      </div>
    </div>
  );
}
