"use client";

import React, { useState, useEffect } from "react";
import { LogSessionForm } from "./LogSessionForm";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/app/lib/utils";
import { LogbookTable } from "./LogbookTable";
import { LogbookFilter } from "./LogbookFilter";
import type { Beach, LogEntry } from "@/app/types/logbook";

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
  const { data: sessionData } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"logs" | "new">("logs");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filteredEntries, setFilteredEntries] = useState<LogEntry[]>([]);
  const [filters, setFilters] = useState<CombinedFilters>(defaultFilters);

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
      filtered = filtered.filter((entry) => 
        entry.surferRating >= newFilters.minRating
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

  const { data: logEntries = [], isLoading } = useQuery<LogEntry[]>({
    queryKey: ["logEntries"],
    queryFn: async () => {
      const response = await fetch("/api/logbook");
      if (!response.ok) throw new Error("Failed to fetch log entries");
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
  });

  useEffect(() => {
    if (logEntries && Array.isArray(logEntries)) {
      setFilteredEntries(logEntries);
    }
  }, [logEntries]);

  if (!sessionData) {
    return (
      <div className="text-[16px]">Please sign in to view your logbook.</div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] p-9">
      <div className="max-w-[1600px] mx-auto">
        {/* Tabs */}
        <div className="flex gap-6 mb-9 justify-center">
          <button
            onClick={() => setActiveTab("logs")}
            className={cn(
              "px-6 py-4 text-[18px] font-medium rounded-lg transition-colors",
              activeTab === "logs"
                ? "bg-[var(--color-bg-tertiary)] text-white"
                : "bg-white text-[var(--color-text-primary)] hover:bg-gray-50"
            )}
          >
            Logged Sessions
          </button>
          <button
            onClick={handleOpenModal}
            className={cn(
              "px-6 py-4 text-[18px] font-medium rounded-lg transition-colors",
              activeTab === "new"
                ? "bg-[var(--color-bg-tertiary)] text-white"
                : "bg-white text-[var(--color-text-primary)] hover:bg-gray-50"
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
                  Previous Sessions
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
                <LogbookTable entries={filteredEntries} />
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
        userEmail={sessionData.user?.email || ""}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
