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

import { useSubscription } from "@/app/context/SubscriptionContext";
import { LogVisibilityToggle } from "@/app/components/LogVisibilityToggle";
import { useSearchParams, useRouter } from "next/navigation";
import RippleLoader from "./ui/RippleLoader";
import dynamic from "next/dynamic";
import { Button } from "@/app/components/ui/Button";
import { RandomLoader } from "./ui/RandomLoader";
import { useQueryClient } from "@tanstack/react-query";

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

const FireFlies = dynamic(() => import("@/app/components/ui/FireFlies"), {
  ssr: false,
  loading: () => null,
});

export default function QuestLogs({ beaches }: QuestLogsProps) {
  const { data: session, status: authStatus } = useSession();
  const { isSubscribed } = useSubscription();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"logs" | "new">("logs");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterConfig>(defaultFilters);
  const [regionFilters, setRegionFilters] =
    useState<RegionFilters>(defaultRegionFilters);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPrivateOnly, setShowPrivateOnly] = useState(
    searchParams.get("visibility") === "private"
  );
  const queryClient = useQueryClient();

  const { data: logEntriesData, isLoading } = useQuery({
    queryKey: ["questLogs", showPrivateOnly, selectedRegion, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        showPrivate: showPrivateOnly.toString(),
        ...(selectedRegion && { region: selectedRegion }),
        ...(filters.regions.length && { regions: filters.regions.join(",") }),
        ...(filters.beaches.length && { beaches: filters.beaches.join(",") }),
        ...(filters.countries.length && {
          countries: filters.countries.join(","),
        }),
        ...(filters.waveTypes.length && {
          waveTypes: filters.waveTypes.join(","),
        }),
        ...(filters.minRating && { minRating: filters.minRating.toString() }),
        ...(filters.dateRange.start && {
          startDate: new Date(filters.dateRange.start).toISOString(),
        }),
        ...(filters.dateRange.end && {
          endDate: new Date(filters.dateRange.end).toISOString(),
        }),
      });

      const response = await fetch(`/api/quest-log?${params.toString()}`);

      if (!response.ok) throw new Error("Failed to fetch logs");

      const data = await response.json();
      return data.entries.map((entry: any) => ({
        ...entry,
        sessionDate: new Date(entry.date),
        beachName: entry.beachName,
        surferName: entry.surferName,
        surferEmail: entry.surferEmail,
        surferRating: entry.surferRating,
        comments: entry.comments,
        imageUrl: entry.imageUrl,
        isPrivate: entry.isPrivate,
      })) as LogEntry[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: conditions, isLoading: isConditionsLoading } = useQuery({
    queryKey: ["surfConditions", selectedRegion],
    queryFn: async () => {
      const response = await fetch(
        `/api/surf-conditions?region=${selectedRegion || ""}&date=${new Date().toISOString()}`
      );
      if (!response.ok) throw new Error("Failed to fetch conditions");
      const data = await response.json();
      return data;
    },
    enabled: !!selectedRegion,
  });

  const isLoadingCombined = isLoading || isConditionsLoading;

  if (isLoadingCombined) {
    return <RandomLoader isLoading={true} />;
  }

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
    queryClient.invalidateQueries({ queryKey: ["questLogs"] }); // Refresh data
  };

  const handleFiltersChange = (filters: FilterConfig) => {
    const params = new URLSearchParams();

    // Handle all filter properties
    if (filters.regions.length)
      params.set("regions", filters.regions.join(","));
    if (filters.beaches.length)
      params.set("beaches", filters.beaches.join(","));
    if (filters.countries.length)
      params.set("countries", filters.countries.join(","));
    if (filters.waveTypes.length)
      params.set("waveTypes", filters.waveTypes.join(","));
    if (filters.minRating)
      params.set("minRating", filters.minRating.toString());
    if (filters.surferName) params.set("surferName", filters.surferName);
    if (filters.beachName) params.set("beachName", filters.beachName);

    // Date range handling
    if (filters.dateRange.start)
      params.set("startDate", filters.dateRange.start);
    if (filters.dateRange.end) params.set("endDate", filters.dateRange.end);

    window.history.replaceState(null, "", `?${params.toString()}`);
  };

  const filteredEntries =
    logEntriesData?.filter((entry) => {
      const matchesRegion =
        !selectedRegion || entry.beach?.region === selectedRegion;
      const matchesPrivacy = showPrivateOnly ? entry.isPrivate : true;
      return matchesRegion && matchesPrivacy;
    }) || [];

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] p-9 font-primary relative">
      <FireFlies />

      <div className="max-w-[1600px] mx-auto relative z-10">
        {/* Tabs */}
        <div className="mb-6 sm:mb-12">
          <div className="flex flex-col sm:flex-row items-center justify-start overflow-x-auto no-scrollbar border-b border-gray-200">
            <button
              onClick={() => setActiveTab("logs")}
              className={`px-4 py-3 sm:px-6 sm:py-4 text-small font-primary transition-colors duration-200 ${
                activeTab === "logs"
                  ? "text-[var(--color-text-primary)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-gray-50"
              }`}
            >
              <span className="whitespace-nowrap">Logged Sessions</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("new");
                setIsModalOpen(true);
              }}
              className={`px-4 py-3 sm:px-6 sm:py-4 text-small font-primary transition-colors duration-200 ${
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
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-9">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-6 w-full">
            <div className="w-full border-b border-gray-200 pb-3 mb-6">
              <h2 className="text-lg sm:text-xl font-semibold font-primary">
                Logged Sessions
              </h2>
            </div>
            <div className="flex gap-4 items-center">
              <LogVisibilityToggle
                isPrivate={showPrivateOnly}
                onChange={handleVisibilityChange}
              />
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Filter
              </button>
            </div>
          </div>
          {filteredEntries?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                {isLoading
                  ? "Loading sessions..."
                  : "No matching sessions found"}
              </p>
              {!isLoading && (
                <Button onClick={() => setIsModalOpen(true)}>
                  Log Your First Session
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar Filter */}
      <QuestLogFilter
        entries={filteredEntries || []}
        onFiltersChange={handleFiltersChange}
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
