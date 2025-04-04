"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Star } from "lucide-react";
import { cn } from "@/app/lib/utils";
import type { LogEntry } from "@/app/types/questlogs";
import { useSubscription } from "../context/SubscriptionContext";
import Image from "next/image";
import { useState } from "react";

export default function QuestLogSidebar() {
  const { isSubscribed } = useSubscription();
  const [activeTab, setActiveTab] = useState<"top" | "recent">("recent");

  const { data: recentLogs, isLoading } = useQuery({
    queryKey: ["recentLogs"],
    queryFn: async () => {
      const res = await fetch(`/api/raid-logs`);
      if (!res.ok) throw new Error("Failed to fetch logs");
      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;

  // Ensure we have an array to work with
  const entries = Array.isArray(recentLogs?.entries)
    ? recentLogs.entries
    : Array.isArray(recentLogs)
      ? recentLogs
      : [];

  const highRatedEntries = entries
    .filter(
      (entry: LogEntry) => (entry.surferRating || 0) >= 4 && entry.imageUrl
    )
    .slice(0, 3);

  const recentEntries = [...entries]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  if (
    (!highRatedEntries || highRatedEntries.length === 0) &&
    (!recentEntries || recentEntries.length === 0)
  ) {
    return null;
  }

  if (!isSubscribed) {
    return (
      <div className="bg-[var(--color-bg-primary)] p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="text-center">
          <h3 className={`heading-6 text-gray-800 mb-4 font-primary`}>
            Cooking 🍳🔥😎
          </h3>
          <p className="text-small text-gray-600 mb-4 font-primary">
            Subscribe to view top-rated surf sessions
          </p>
          <Link
            href="/pricing"
            className="text-small inline-block px-4 py-2 bg-[var(--color-tertiary)] text-white rounded-lg hover:bg-[var(--color-tertiary)] font-primary"
          >
            View Pricing
          </Link>
        </div>
      </div>
    );
  }

  const displayEntries = activeTab === "top" ? highRatedEntries : recentEntries;

  return (
    <div className="bg-[var(--color-bg-primary)] p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold text-gray-800 font-primary`}>
          Session Logs
        </h3>
        <Link
          href="/quest-log"
          className="text-sm text-[var(--color-text-secondary)] hover:underline font-primary"
        >
          View All
        </Link>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveTab("recent")}
          className={cn(
            "py-2 px-4 text-sm font-medium font-primary",
            activeTab === "recent"
              ? "border-b-2 border-[var(--color-tertiary)] text-gray-900"
              : "text-gray-500 opacity-80 hover:text-gray-700 hover:opacity-100"
          )}
        >
          Recent
        </button>
        <button
          onClick={() => setActiveTab("top")}
          className={cn(
            "py-2 px-4 text-sm font-medium font-primary",
            activeTab === "top"
              ? "border-b-2 border-[var(--color-tertiary)] text-gray-900"
              : "text-gray-500 opacity-80 hover:text-gray-700 hover:opacity-100"
          )}
        >
          Top
        </button>
      </div>

      <div className="space-y-6">
        {displayEntries.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4 font-primary">
            No {activeTab === "top" ? "top-rated" : "recent"} sessions available
          </p>
        ) : (
          displayEntries.map((entry: LogEntry) => (
            <div key={entry.id} className="group">
              <article className="space-y-3">
                {entry.imageUrl && (
                  <Link href={`/raidlogs/${entry.id}`}>
                    <div className="relative aspect-video rounded-lg overflow-hidden cursor-pointer">
                      <Image
                        src={entry.imageUrl}
                        alt={`Session at ${entry.beachName}`}
                        fill
                        className="object-cover hover:opacity-90 transition-opacity"
                      />
                    </div>
                  </Link>
                )}
                <div className="flex-1 min-w-0">
                  <Link href={`/raidlogs/${entry.id}`}>
                    <h4 className="text-sm font-medium text-gray-900 mb-1 truncate group-hover:text-[var(--color-text-secondary)] transition-colors cursor-pointer font-primary">
                      {entry.beachName}
                    </h4>
                  </Link>
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Star
                        key={rating}
                        className={cn(
                          "w-4 h-4",
                          rating <= (entry.surferRating || 0)
                            ? "fill-yellow-400"
                            : "fill-gray-200"
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 font-primary">
                    {entry.comments}
                  </p>
                  <div className="mt-1 text-xs text-gray-400 font-primary">
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
