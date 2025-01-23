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
  const { data: session, status } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"logs" | "new">("logs");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filteredEntries, setFilteredEntries] = useState<LogEntry[]>([]);
  const [filters, setFilters] = useState<CombinedFilters>(defaultFilters);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const { data: questEntries = [], isLoading } = useQuery({
    queryKey: ["questEntries"],
    queryFn: async () => {
      const response = await fetch("/api/quest-log");
      if (!response.ok) throw new Error("Failed to fetch quest entries");
      return response.json();
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const { data: conditions } = useQuery({
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

  useEffect(() => {
    if (questEntries && Array.isArray(questEntries)) {
      setFilteredEntries(questEntries);
    }
  }, [questEntries]);

  const handleFilterChange = (newFilters: any) => {
    let filtered = [...questEntries];

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

  if (status === "loading") return null;

  if (!session) {
    return (
      <div className="max-h-full min-h-[60vh] bg-[var(--color-bg-secondary)] p-9 flex flex-col items-center justify-center">
        <h2 className="text-center text-lg font-semibold mb-4">
          Sign in to view your Side Quests
        </h2>
        <div className="relative">
          <Image
            src="/images/Leonardo_Phoenix_10_A_majestic_intricately_designed_pirate_gun_3.webp"
            alt="Decorative pirate gun"
            width={300}
            height={200}
            className="mt-6 rounded-lg"
            priority
          />
          <button
            onClick={() => signIn("google", { callbackUrl: "/raid" })}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                     flex items-center gap-3 px-6 py-3 bg-white text-gray-800 rounded-lg 
                     shadow-sm hover:shadow-md transition-all z-10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              className="w-5 h-5"
            >
              <path
                fill="#FFC107"
                d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
              />
              <path
                fill="#FF3D00"
                d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
              />
              <path
                fill="#4CAF50"
                d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
              />
              <path
                fill="#1976D2"
                d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
              />
            </svg>
            <span>Sign in</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] p-9">
      <div className="max-w-[1600px] mx-auto">
        {/* Tabs */}
        <div className="mb-12">
          <div className="flex items-center justify-start overflow-x-auto no-scrollbar border-b border-gray-200">
            <button
              onClick={() => setActiveTab("logs")}
              className={`px-6 py-4 font-medium text-sm transition-colors duration-200 ${
                activeTab === "logs"
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="whitespace-nowrap">Logged Side Quests</span>
            </button>
            <button
              onClick={handleOpenModal}
              className={`px-6 py-4 font-medium text-sm transition-colors duration-200 ${
                activeTab === "new"
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
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
                <h2 className={cn("text-[21px] font-semibold")}>
                  Logged Side Quests
                </h2>
                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="px-4 py-2 text-sm font-medium bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Filter Logs
                </button>
              </div>
              {isLoading ? (
                <div>Loading...</div>
              ) : filteredEntries.length > 0 ? (
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
                />
              ) : (
                <div>No entries available</div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Right Sidebar Filter */}
      <QuestLogFilter
        entries={questEntries}
        onFilterChange={handleFilterChange}
        onRegionFilterChange={handleRegionFilterChange}
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />

      {/* Modal for Log Session Form */}
      <QuestLogForm
        beaches={beaches}
        userEmail={session.user?.email || ""}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
