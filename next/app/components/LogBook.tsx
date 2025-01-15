"use client";

import React, { useState, useEffect } from "react";
import { LogSessionForm } from "./LogSessionForm";
import { useSession, signIn } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/app/lib/utils";
import { LogbookTable } from "./LogbookTable";
import { LogbookFilter } from "./LogbookFilter";
import type { Beach, LogEntry } from "@/app/types/logbook";
import Image from "next/image";
import {
  getWindEmoji,
  getSwellEmoji,
  getDirectionEmoji,
} from "@/app/lib/forecastUtils";

interface LogBookProps {
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

export default function LogBook({ beaches }: LogBookProps) {
  const { data: session, status } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"logs" | "new">("logs");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filteredEntries, setFilteredEntries] = useState<LogEntry[]>([]);
  const [filters, setFilters] = useState<CombinedFilters>(defaultFilters);

  const { data: logEntries = [], isLoading } = useQuery<LogEntry[]>({
    queryKey: ["logEntries"],
    queryFn: async () => {
      const response = await fetch("/api/logbook");
      if (!response.ok) throw new Error("Failed to fetch log entries");
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    retry: 3,
    retryDelay: 1000,
    onError: (error) => {
      console.error("Error fetching log entries:", error);
    },
    enabled: status === "authenticated",
  });

  useEffect(() => {
    if (logEntries && Array.isArray(logEntries)) {
      setFilteredEntries(logEntries);
    }
  }, [logEntries]);

  const handleFilterChange = (newFilters: any) => {
    let filtered = [...logEntries];

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

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  if (status === "loading") return null;

  if (!session) {
    return (
      <div className="max-h-full min-h-[60vh] bg-[var(--color-bg-secondary)] p-9 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-semibold mb-4">
          Sign in to view the logs
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
        <div className="flex gap-6 mb-4 justify-start max-h-[250px]">
          <button
            onClick={() => setActiveTab("logs")}
            className={cn(
              "px-6 py-2 text-[16px] font-medium transition-all duration-300",
              activeTab === "logs"
                ? "border-[var(--color-text-primary)] text-[var(--color-text-primary)]"
                : "border-transparent text-gray-500 hover:text-[var(--color-text-primary)]"
            )}
          >
            Logged Sessions
          </button>
          <button
            onClick={handleOpenModal}
            className={cn(
              "px-6 py-2 text-[16px] font-medium transition-all duration-300",
              "border-b-2",
              activeTab === "new"
                ? "border-[var(--color-text-primary)] text-[var(--color-text-primary)]"
                : "border-transparent text-gray-500 hover:text-[var(--color-text-primary)]"
            )}
          >
            Log A Session
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm p-9">
          {activeTab === "logs" ? (
            <div className="w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className={cn("text-[21px] font-semibold")}>
                  Logged Sessions
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
                <LogbookTable
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
      <LogbookFilter
        entries={logEntries}
        onFilterChange={handleFilterChange}
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />

      {/* Modal for Log Session Form */}
      <LogSessionForm
        beaches={beaches}
        userEmail={session.user?.email || ""}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
