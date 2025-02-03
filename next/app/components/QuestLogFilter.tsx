import { useState, useEffect, useCallback } from "react";
import { X, ChevronDown } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { LogEntry } from "../types/questlogs";
import RegionFilter from "./RegionFilter";

interface Beach {
  id: string;
  name: string;
  location: {
    country: string;
    region: string;
    continent?: string;
  };
}

interface RegionFilterType {
  continents: string[];
  countries: string[];
  regions: string[];
  beaches: string[];
  waveTypes: string[];
}

interface QuestLogFilterProps {
  entries: LogEntry[];
  onFilterChange: (filters: any) => void;
  onRegionFilterChange: (filters: RegionFilterType) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function QuestLogFilter({
  entries,
  onFilterChange,
  onRegionFilterChange,
  isOpen,
  onClose,
}: QuestLogFilterProps) {
  const [filters, setFilters] = useState({
    dateRange: {
      start: "",
      end: "",
    },
    beaches: [] as string[],
    surfers: [] as string[],
    countries: [] as string[],
    regions: [] as string[],
    minRating: 0,
  });

  const [beachSearch, setBeachSearch] = useState("");

  // Get unique values from entries
  const uniqueBeaches = [
    ...new Set(
      (Array.isArray(entries) ? entries : [])
        .map((entry) => entry.beachName)
        .filter(Boolean)
    ),
  ].sort();
  const uniqueSurfers = [
    ...new Set(
      (Array.isArray(entries) ? entries : [])
        .map((entry) => entry.surferName)
        .filter(Boolean)
    ),
  ].sort();
  const uniqueCountries = [
    ...new Set(
      (Array.isArray(entries) ? entries : [])
        .map((entry) => entry.beach?.country)
        .filter(Boolean)
    ),
  ].sort();
  const uniqueRegions = [
    ...new Set(
      (Array.isArray(entries) ? entries : [])
        .map((entry) => entry.beach?.region)
        .filter(Boolean)
    ),
  ].sort();

  // Update parent component when filters change
  useEffect(() => {
    // Skip the initial render
    const timeoutId = setTimeout(() => {
      onFilterChange(filters);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters]); // Remove onFilterChange from dependencies

  return (
    <div
      className={cn(
        "fixed top-0 right-0 h-full w-[360px] bg-white transform transition-transform duration-300 ease-in-out z-50 shadow-lg",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="flex justify-between items-center p-6 border-b">
        <h2 className="text-lg font-semibold">Filter Logs</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-70px)]">
        {/* Date Range */}
        <div>
          <h3 className="text-sm font-medium mb-2">Date Range</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500">Start Date</label>
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: e.target.value },
                  }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">End Date</label>
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: e.target.value },
                  }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Beaches */}
        <div>
          <h3 className="text-sm font-medium mb-2">Beaches</h3>
          <div>
            <input
              type="text"
              placeholder="Search beaches..."
              value={beachSearch}
              className="w-full p-2 border rounded-md"
              onChange={(e) => setBeachSearch(e.target.value)}
            />
            <div className="mt-2 space-y-1">
              {filters.beaches.map((beach) => (
                <div
                  key={beach}
                  className="flex items-center justify-between bg-gray-100 px-3 py-1 rounded-md"
                >
                  <span className="text-sm">{beach}</span>
                  <button
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        beaches: prev.beaches.filter((b) => b !== beach),
                      }))
                    }
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            {beachSearch && (
              <div className="w-full mt-1 max-h-40 overflow-y-auto bg-white border rounded-md shadow-lg">
                {uniqueBeaches
                  .filter(
                    (beach) =>
                      !filters.beaches.includes(beach) &&
                      beach.toLowerCase().includes(beachSearch.toLowerCase())
                  )
                  .map((beach) => (
                    <button
                      key={beach}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                      onClick={() => {
                        setFilters((prev) => ({
                          ...prev,
                          beaches: [...prev.beaches, beach],
                        }));
                        setBeachSearch("");
                      }}
                    >
                      {beach}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Rating */}
        <div>
          <h3 className="text-sm font-medium mb-2">Minimum Rating</h3>
          <input
            type="range"
            min="0"
            max="5"
            value={filters.minRating}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                minRating: parseInt(e.target.value),
              }))
            }
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Any</span>
            <span>{filters.minRating} Stars</span>
          </div>
        </div>

        {/* Reset Filters */}
        <button
          onClick={() =>
            setFilters({
              dateRange: { start: "", end: "" },
              beaches: [],
              surfers: [],
              countries: [],
              regions: [],
              minRating: 0,
            })
          }
          className="w-full px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}
