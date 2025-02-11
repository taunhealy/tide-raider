"use client";

import React, { useState, useEffect } from "react";
import { QuestLogForm } from "./QuestLogForm";
import { useSession, signIn } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { QuestLogTable } from "./QuestLogTable";
import { QuestLogFilter } from "./QuestLogFilter";
import type {
  LogEntry,
  FilterConfig,
  RegionFilters,
} from "@/app/types/questlogs";
import type { Beach } from "@/app/types/beaches";
import Image from "next/image";
import {
  getWindEmoji,
  getSwellEmoji,
  getDirectionEmoji,
} from "@/app/lib/forecastUtils";

import { useSubscription } from "@/app/context/SubscriptionContext";
import { LogVisibilityToggle } from "@/app/components/LogVisibilityToggle";
import { useSearchParams, useRouter } from "next/navigation";

interface QuestLogsProps {
  beaches: Beach[];
  userId: string;
}

const defaultFilters: FilterConfig = {
  beachName: "",
  surferName: "",
  minRating: 0,
  dateRange: {
    start: "",
    end: "",
  },
};

const defaultRegionFilters: RegionFilters = {
  continents: [],
  countries: [],
  regions: [],
  beaches: [],
  waveTypes: [],
};

export default function QuestLogs({ beaches }: QuestLogsProps) {
  const { data: session, status: authStatus } = useSession();
  const { isSubscribed } = useSubscription();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"logs" | "new">("logs");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filteredEntries, setFilteredEntries] = useState<LogEntry[]>([]);
  const [filters, setFilters] = useState<FilterConfig>(defaultFilters);
  const [regionFilters, setRegionFilters] =
    useState<RegionFilters>(defaultRegionFilters);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPrivateOnly, setShowPrivateOnly] = useState(false);

  const { data: entries, isLoading } = useQuery({
    queryKey: ["questLogs"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/quest-log");
        if (!response.ok) {
          console.error("Failed to fetch logs:", await response.text());
          throw new Error("Failed to fetch logs");
        }
        const data = await response.json();
        // Transform the data to match the LogEntry type
        return data.entries.map((entry: any) => ({
          ...entry,
          sessionDate: new Date(entry.date), // Convert date field to sessionDate
          beachName: entry.beachName,
          surferName: entry.surferName,
          surferEmail: entry.surferEmail,
          surferRating: entry.surferRating,
          comments: entry.comments,
          imageUrl: entry.imageUrl,
          isPrivate: entry.isPrivate,
          // Extract forecast data if it exists
          windSpeed: entry.forecast?.windSpeed,
          windDirection: entry.forecast?.windDirection,
          swellHeight: entry.forecast?.swellHeight,
          swellDirection: entry.forecast?.swellDirection,
        }));
      } catch (error) {
        console.error("Error fetching logs:", error);
        throw error;
      }
    },
  });

  const { data: conditions, isLoading: isConditionsLoading } = useQuery({
    queryKey: ["surfConditions", selectedRegion],
    queryFn: async () => {
      const response = await fetch(
        `/api/surf-conditions?region=${selectedRegion || ""}`
      );
      if (!response.ok) throw new Error("Failed to fetch conditions");
      const data = await response.json();
      return data;
    },
    enabled: !!selectedRegion,
  });

  const isLoadingCombined = isLoading || isConditionsLoading;

  useEffect(() => {
    if (entries && Array.isArray(entries)) {
      setFilteredEntries(entries);
    }
  }, [entries]);

  if (isLoadingCombined) {
    return <div></div>;
  }

  if (!entries?.length) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-secondary)] p-9 font-primary">
        <div className="max-w-[1600px] mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-9 text-center">
            <h2 className="heading-5 mb-4">Welcome to Quest Logs!</h2>
            <p className="text-[var(--color-text-secondary)] mb-6">
              No surf sessions logged yet. Start your journey by logging your
              first session!
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-[var(--color-tertiary)] text-white rounded-lg hover:bg-[var(--color-tertiary)]/90 transition-colors"
            >
              Log Your First Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleFilterChange = (newFilters: FilterConfig) => {
    setFilters(newFilters);
    let filtered = entries;

    // Apply filters
    if (newFilters.beachName) {
      filtered = filtered.filter((entry: LogEntry) =>
        entry.beachName.includes(newFilters.beachName)
      );
    }

    if (newFilters.minRating > 0) {
      filtered = filtered.filter(
        (entry: LogEntry) => entry.surferRating >= newFilters.minRating
      );
    }

    // ... other filter logic

    setFilteredEntries(filtered);
  };

  const handleRegionFilterChange = (newRegionFilters: RegionFilters) => {
    setRegionFilters(newRegionFilters);
    // Apply region filters...
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  // Add visibility toggle handler
  const handleVisibilityChange = (isPrivate: boolean) => {
    const newParams = new URLSearchParams(searchParams.toString());
    isPrivate
      ? newParams.set("visibility", "private")
      : newParams.delete("visibility");
    router.replace(`?${newParams.toString()}`, { scroll: false });
    setShowPrivateOnly(isPrivate);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] p-9 font-primary">
      <div className="max-w-[1600px] mx-auto">
        {/* Tabs */}
        <div className="mb-12">
          <div className="flex items-center justify-start overflow-x-auto no-scrollbar border-b border-gray-200">
            <button
              onClick={() => setActiveTab("logs")}
              className={`px-6 py-4 text-small font-primary transition-colors duration-200 ${
                activeTab === "logs"
                  ? "text-[var(--color-text-primary)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-gray-50"
              }`}
            >
              <span className="whitespace-nowrap">Logged Sessions</span>
            </button>
            <button
              onClick={handleOpenModal}
              className={`px-6 py-4 text-small font-primary transition-colors duration-200 ${
                activeTab === "new"
                  ? "text-[var(--color-text-primary)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-gray-50"
              }`}
            >
              <span className="whitespace-nowrap">Log A Session</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm p-9">
          {activeTab === "logs" ? (
            <div className="w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="heading-5">Logged Sessions</h2>
                <div className="flex gap-4 items-center">
                  <LogVisibilityToggle
                    isPrivate={showPrivateOnly}
                    onChange={handleVisibilityChange}
                  />
                  <button
                    onClick={() => setIsFilterOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Filter Logs
                  </button>
                </div>
              </div>
              {isLoading ? (
                <div className="text-main text-[var(--color-text-secondary)]">
                  Loading...
                </div>
              ) : filteredEntries.length > 0 ? (
                <>
                  {!isSubscribed && (
                    <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-700">
                        Subscribe to view sessions rated above 3 stars and
                        access all features.
                      </p>
                    </div>
                  )}
                  <QuestLogTable
                    entries={filteredEntries.map((entry) => ({
                      ...entry,
                      forecastConditions:
                        entry.windSpeed && entry.swellHeight
                          ? {
                              wind: `${getWindEmoji(entry.windSpeed)} ${entry.windSpeed}kts ${getDirectionEmoji(entry.windDirection || 0)}`,
                              swell: `${getSwellEmoji(entry.swellHeight)} ${entry.swellHeight}m ${getDirectionEmoji(entry.swellDirection || 0)}`,
                            }
                          : undefined,
                    }))}
                    isSubscribed={isSubscribed}
                    showPrivateOnly={showPrivateOnly}
                  />
                </>
              ) : (
                <div className="text-main text-[var(--color-text-secondary)]">
                  No entries available
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Right Sidebar Filter */}
      <QuestLogFilter
        entries={entries}
        onFilterChange={handleFilterChange}
        onRegionFilterChange={handleRegionFilterChange}
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />

      {/* Quest Log Form Modal */}
      {isModalOpen && (
        <QuestLogForm
          userEmail={session?.user?.email || ""}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          beaches={beaches}
        />
      )}
    </div>
  );
}
