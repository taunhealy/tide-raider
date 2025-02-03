"use client";

import React, { useState, useEffect } from "react";
import { QuestLogForm } from "./QuestLogForm";
import { useSession, signIn } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/app/lib/utils";
import { QuestLogTable } from "./QuestLogTable";
import { QuestLogFilter } from "./QuestLogFilter";
import type { LogEntry } from "@/app/types/questlogs";
import type { Beach } from "@/app/types/beaches";
import Image from "next/image";
import {
  getWindEmoji,
  getSwellEmoji,
  getDirectionEmoji,
} from "@/app/lib/forecastUtils";

import { useSubscription } from "@/app/context/SubscriptionContext";

interface QuestLogsProps {
  beaches: Beach[];
}

interface RegionFilters {
  continents: string[];
  countries: string[];
  regions: string[];
  beaches: string[];
  waveTypes: string[];
}

interface CombinedFilters extends RegionFilters {
  minRating: number;
  dateRange: {
    start: string;
    end: string;
  };
  surfers: string[];
}

const defaultFilters: CombinedFilters = {
  continents: ["Africa"],
  countries: ["South Africa"],
  regions: ["Western Cape"],
  beaches: [],
  waveTypes: [],
  minRating: 0,
  dateRange: {
    start: "",
    end: "",
  },
  surfers: [],
};

export default function QuestLogs({ beaches }: QuestLogsProps) {
  const { data: session, status: authStatus } = useSession();
  const { isSubscribed } = useSubscription();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"logs" | "new">("logs");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filteredEntries, setFilteredEntries] = useState<LogEntry[]>([]);
  const [filters, setFilters] = useState<CombinedFilters>(defaultFilters);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const { data: entries, isLoading: isEntriesLoading } = useQuery({
    queryKey: ["questLogs"],
    queryFn: async () => {
      if (!session?.user) return [];
      const response = await fetch("/api/quest-log");
      if (!response.ok) throw new Error("Failed to fetch logs");
      const data = await response.json();
      return data.entries;
    },
    enabled: !!session?.user,
    staleTime: 1000 * 60,
    retry: 2,
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

  const isLoading = isEntriesLoading || isConditionsLoading;

  useEffect(() => {
    if (entries && Array.isArray(entries)) {
      setFilteredEntries(entries);
    }
  }, [entries]);

  if (authStatus === "loading" || isLoading) {
    return <div>Loading...</div>;
  }

  if (!session?.user) {
    return <div>Please sign in to view your logs</div>;
  }

  if (!entries?.length) {
    return <div>No entries available. Add your first surf session!</div>;
  }

  const handleFilterChange = (newFilters: any) => {
    let filtered = Array.isArray(entries) ? [...entries] : [];

    // Add subscription gate for high-rated logs
    filtered = filtered.filter((entry) => {
      // Free users can only see logs rated 3 stars or less
      if (!isSubscribed && entry.surferRating > 3) {
        return false;
      }
      return true;
    });

    // Filter by beaches
    if (newFilters.beaches.length > 0) {
      filtered = filtered.filter((entry) =>
        newFilters.beaches.includes(entry.beachName)
      );
    }

    // Filter by minimum rating
    if (newFilters.minRating > 0) {
      filtered = filtered.filter(
        (entry) => entry.surferRating >= newFilters.minRating
      );
    }

    // Filter by countries
    if (newFilters.countries.length > 0) {
      filtered = filtered.filter((entry) =>
        newFilters.countries.includes(entry.beach?.country)
      );
    }

    // Filter by regions
    if (newFilters.regions.length > 0) {
      filtered = filtered.filter((entry) =>
        newFilters.regions.includes(entry.beach?.region)
      );
    }

    setFilteredEntries(filtered);
  };

  const handleRegionFilterChange = (newFilters: RegionFilters) => {
    setSelectedRegion(newFilters.regions[0]);
    setFilters((prev) => ({
      ...prev,
      regions: newFilters.regions,
    }));
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

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
              <span className="whitespace-nowrap">Logged Side Quests</span>
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
                <h2 className="heading-5">Logged Side Quests</h2>
                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="px-4 py-2 text-small font-primary text-[var(--color-text-primary)] bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Filter Logs
                </button>
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

      {/* Modal for Log Session Form */}
      <QuestLogForm
        beaches={beaches}
        userEmail={session?.user?.email || ""}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
