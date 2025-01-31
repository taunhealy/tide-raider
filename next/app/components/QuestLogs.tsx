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
import { handleSignIn } from "../lib/auth-utils";
import Link from "next/link";

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

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--color-bg-secondary)] p-4">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center font-primary">
          <h2 className="heading-5 mb-4">Sign in Required</h2>
          <p className="text-main text-[var(--color-text-secondary)] mb-6">
            Please sign in to view and create quest logs.
          </p>
          <button
            onClick={() => signIn()}
            className="px-4 py-2 bg-[var(--color-tertiary)] text-white rounded-lg hover:bg-[var(--color-tertiary)] font-primary"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const { data: questEntries = [], isLoading } = useQuery({
    queryKey: ["questEntries"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/quest-log", {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch quest entries: ${response.status}`);
        }

        const data = await response.json();
        return data.entries || [];
      } catch (error) {
        console.error("Error fetching entries:", error);
        return [];
      }
    },
    enabled: status === "authenticated",
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
    } else {
      setFilteredEntries([]);
    }
  }, [questEntries]);

  const handleFilterChange = (newFilters: any) => {
    // Ensure questEntries is an array before spreading
    let filtered = Array.isArray(questEntries) ? [...questEntries] : [];

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
        entries={questEntries}
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
