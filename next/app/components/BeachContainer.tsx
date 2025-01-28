"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { Beach, Region } from "@/app/types/beaches";
import type { WindData } from "@/app/types/wind";
import SidebarFilter from "./SidebarFilter";
import BeachGrid from "./BeachGrid";
import Map from "./Map";
import { useSubscription } from "../context/SubscriptionContext";
import { useHandleSubscription } from "../hooks/useHandleSubscription";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isBeachSuitable, getGoodBeachCount } from "@/app/lib/surfUtils";
import FunFacts from "@/app/components/FunFacts";
import { cn } from "@/app/lib/utils";
import { Inter } from "next/font/google";
import {
  ChevronLeft,
  ChevronRight,
  Map as MapIcon,
  List,
  X,
} from "lucide-react";
import Insights from "./Insights";
import { INITIAL_FILTERS } from "@/app/lib/constants";
import RegionFilter from "./RegionFilter";
import SearchBar from "./SearchBar";
import { WaveType } from "@/app/lib/constants";
import Image from "next/image";
import { WAVE_TYPE_ICONS, DEFAULT_PROFILE_IMAGE } from "@/app/lib/constants";
import { useSearchParams } from "next/navigation";
import BlogPostsSidebar from "./BlogPostsSidebar";
import GoldSeeker from "./GoldSeeker";
import BeachFeedback from "./BeachFeedback";
import QuestSidebar from "./QuestLogSidebar";
import RecentChronicles from "./RecentChronicles";
import RegionalSidebar from "@/app/components/RegionalSidebar";
import type { Ad } from "@/app/types/ads";
import EventsSidebar from "./EventsSidebar";
import { beachData } from "@/app/types/beaches";
import { format } from "date-fns";
import QuestLogSidebar from "./QuestLogSidebar";
import StickyForecastWidget from "./StickyForecastWidget";

interface BeachContainerProps {
  initialBeaches: Beach[];
  windData: any;
  blogPosts: any;
  availableAds: Ad[];
}

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
});

export default function BeachContainer({
  initialBeaches,
  windData: initialWindData,
  blogPosts,
  availableAds,
}: BeachContainerProps) {
  const { isSubscribed } = useSubscription();
  const { mutate: handleSubscriptionChange } = useHandleSubscription();
  const [minPoints, setMinPoints] = useState(0);
  const searchParams = useSearchParams();

  // Initialize filters from URL params
  const initialFilters = {
    continent: searchParams?.get("continent")?.split(",")[0] || "Africa",
    country: searchParams?.get("country")?.split(",")[0] || "South Africa",
    waveType: searchParams?.get("waveType")?.split(",") || [],
    difficulty: searchParams?.get("difficulty")?.split(",") || [],
    region: searchParams?.get("region")?.split(",") || [],
    crimeLevel: searchParams?.get("crimeLevel")?.split(",") || [],
    minPoints: parseInt(searchParams?.get("minPoints") || "0"),
    sharkAttack: searchParams?.get("sharkAttack")?.split(",") || [],
  };

  type FilterKeys = keyof typeof initialFilters;

  const [filters, setFilters] = useState({
    ...initialFilters,
    continent: [initialFilters.continent],
    country: [initialFilters.country],
    minDistance: 0,
  });

  // Initialize with Western Cape as default
  const [selectedRegion, setSelectedRegion] = useState<string>(
    searchParams?.get("region") || "Western Cape"
  );

  // Move this function above updateFilters
  const handleRegionChange = (newRegion: string) => {
    console.log("Region changed to:", newRegion); // Debug log
    setSelectedRegion(newRegion);
    updateFilters("region", [newRegion]); // Update filters to match
  };

  // Update dependency array to remove handleRegionChange since it's defined above
  const updateFilters = useCallback(
    (key: FilterKeys, value: any) => {
      const newFilters = { ...filters };

      // Handle single-select for continent and country
      if (key === "continent" || key === "country") {
        newFilters[key] = [value]; // Ensure it's an array with single value
      } else if (key === "region") {
        newFilters.region = Array.isArray(value) ? value : [value];
      } else {
        newFilters[key] = value; // Keep array behavior for other filters
      }

      setFilters(newFilters);

      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        Object.entries(newFilters).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            if (value.length > 0) {
              params.set(key, value.join(","));
            } else {
              params.delete(key);
            }
          } else if (value) {
            params.set(key, value.toString());
          } else {
            params.delete(key);
          }
        });

        window.history.replaceState(
          {},
          "",
          `${window.location.pathname}?${params.toString()}`
        );
      }
    },
    [filters]
  );

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [searchQuery, setSearchQuery] = useState("");

  // Modify the useQuery to include the score calculation
  const { data: windData, isLoading } = useQuery({
    queryKey: ["surfConditions", selectedRegion],
    queryFn: async () => {
      if (!selectedRegion) return null;
      const response = await fetch(
        `/api/surf-conditions?region=${selectedRegion}`
      );
      if (!response.ok) throw new Error("Failed to fetch conditions");
      const data = await response.json();

      // Calculate scores after we have the fresh wind data
      const scores: Record<string, number> = {};

      initialBeaches.forEach((beach) => {
        if (beach.region === selectedRegion) {
          const { score } = isBeachSuitable(beach, data);
          if (score >= 4) {
            scores[beach.region] = (scores[beach.region] || 0) + 1;
            scores[beach.country] = (scores[beach.country] || 0) + 1;
            scores[beach.continent] = (scores[beach.continent] || 0) + 1;
          }
        }
      });

      console.log("Calculated scores with fresh data:", scores);
      setCachedBeachScores((prev) => ({ ...prev, ...scores }));

      return data;
    },
    enabled: !!selectedRegion,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  // Add debug effect
  useEffect(() => {
    console.log("Current windData:", windData);
    console.log("Current region:", selectedRegion);
  }, [windData, selectedRegion]);

  const queryClient = useQueryClient();

  // Compute filtered beaches based on windData
  const filteredBeaches = useMemo(() => {
    let filtered = initialBeaches;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((beach) => {
        // Check main beach properties
        const mainPropertiesMatch =
          beach.name.toLowerCase().includes(query) ||
          beach.region.toLowerCase().includes(query) ||
          beach.description.toLowerCase().includes(query) ||
          beach.location.toLowerCase().includes(query);

        // Check videos if they exist
        const videoTitlesMatch =
          beach.videos?.some((video) =>
            video.title.toLowerCase().includes(query)
          ) || false;

        return mainPropertiesMatch || videoTitlesMatch;
      });
    }

    // Apply continent filter (single select)
    if (filters.continent) {
      filtered = filtered.filter(
        (beach) => beach.continent === filters.continent[0]
      );
    }

    // Apply country filter (single select)
    if (filters.country) {
      filtered = filtered.filter(
        (beach) => beach.country === filters.country[0]
      );
    }

    // Apply region filter only if regions are specifically selected
    if (filters.region.length > 0) {
      filtered = filtered.filter((beach) =>
        filters.region.includes(beach.region)
      );
    }

    // Apply difficulty filter
    if (filters.difficulty.length > 0) {
      filtered = filtered.filter((beach) =>
        filters.difficulty.includes(beach.difficulty)
      );
    }

    // Apply crime level filter
    if (filters.crimeLevel.length > 0) {
      filtered = filtered.filter((beach) =>
        filters.crimeLevel.includes(beach.crimeLevel)
      );
    }

    // Apply wave type filter
    if (filters.waveType.length > 0) {
      filtered = filtered.filter((beach) =>
        filters.waveType.includes(beach.waveType)
      );
    }

    // Apply shark attack filter
    if (filters.sharkAttack?.includes("true")) {
      filtered = filtered.filter((beach) => beach.sharkAttack.hasAttack);
    }

    // Apply scoring and sort - modified to handle missing windData
    return filtered
      .map((beach) => ({
        beach,
        score: windData ? isBeachSuitable(beach, windData).score : 0,
      }))
      .filter(({ score }) => minPoints === 0 || score >= minPoints)
      .sort((a, b) => {
        // If no windData, sort alphabetically by name
        if (!windData) {
          return a.beach.name.localeCompare(b.beach.name);
        }
        return b.score - a.score;
      })
      .map(({ beach }) => beach);
  }, [
    windData,
    initialBeaches,
    minPoints,
    filters,
    selectedRegion,
    searchQuery,
  ]);

  const paginatedBeaches = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredBeaches.slice(startIndex, endIndex);
  }, [filteredBeaches, currentPage]);

  const totalPages = Math.ceil(filteredBeaches.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const uniqueRegions = Array.from(
    new Set(initialBeaches.map((beach) => beach.region))
  ).sort() as Region[];
  const uniqueContinents = Array.from(
    new Set(initialBeaches.map((beach) => beach.continent))
  ).sort();
  const uniqueCountries = Array.from(
    new Set(initialBeaches.map((beach) => beach.country))
  ).sort();

  // Get unique wave types from beach data
  const waveTypes = [...new Set(initialBeaches.map((beach) => beach.waveType))];

  // Add state for cached scores
  const [cachedBeachScores, setCachedBeachScores] = useState<
    Record<string, number>
  >({});

  const fetchRegionData = useCallback(async (region: string) => {
    try {
      const response = await fetch(`/api/wind-data?region=${region}`);
      const data = await response.json();
    } catch (error) {
      console.error("Error fetching wind data:", error);
    }
  }, []);

  // Add this function before the return statement
  const getGoodBeachCount = useCallback(
    (beaches: Beach[], windData: WindData | null) => {
      if (!windData) return 0;
      return beaches.filter((beach) => {
        const { score } = isBeachSuitable(beach, windData);
        return score >= 4;
      }).length;
    },
    []
  );

  return (
    <div className="bg-[var(--color-bg-secondary)] p-6 mx-auto relative min-h-[calc(100vh-72px)] flex flex-col">
      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-[54px]">
        {/* Left Sidebar */}
        {/* Blog Section */}
        <aside className="hidden lg:block lg:w-[300px] flex-shrink-0">
          <BlogPostsSidebar posts={blogPosts} />
          <div className="space-y-6">
            <GoldSeeker />
            <QuestLogSidebar />
            <EventsSidebar />
            <BeachFeedback beaches={initialBeaches} />
            <RegionalSidebar
              selectedRegion={selectedRegion || "Western Cape"}
              ads={availableAds}
            />
          </div>
        </aside>

        {/* Main Content and Right Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 lg:gap-[54px] flex-1 overflow-hidden">
          <main className="min-w-0 overflow-y-auto">
            {/* Header Section - Moved inside main content */}
            <div className="flex flex-col gap-6 mb-9">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h3
                  className={`text-xl sm:text-2xl font-semibold text-[var(--color-text-primary)] ${inter.className}`}
                >
                  This Morning's Recommendations
                </h3>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className={cn(
                    inter.className,
                    "text-black font-semibold",
                    "bg-white border border-gray-200",
                    "px-4 py-1",
                    "rounded-[21px]",
                    "flex items-center gap-2",
                    "hover:bg-gray-50 transition-colors",
                    "w-full sm:w-auto justify-center sm:justify-start"
                  )}
                >
                  <span>Filters</span>
                  {Object.values(filters).some((f) =>
                    Array.isArray(f) ? f.length > 0 : f !== 0
                  ) && (
                    <span className="w-2 h-2 rounded-full bg-[var(--color-bg-tertiary)]" />
                  )}
                </button>

                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search by name, region or description..."
                />

                {/* View Toggle */}
                <div className="flex items-center gap-2 bg-white rounded-md border border-gray-200">
                  <button
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "p-2 rounded-l-md",
                      viewMode === "list" ? "bg-gray-100" : "hover:bg-gray-50"
                    )}
                  >
                    <List className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("map")}
                    className={cn(
                      "p-2 rounded-r-md",
                      viewMode === "map" ? "bg-gray-100" : "hover:bg-gray-50"
                    )}
                  >
                    <MapIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {viewMode === "list" ? (
              <>
                {/* Region filters */}
                <div className="mb-6">
                  <RegionFilter
                    continents={uniqueContinents}
                    countries={uniqueCountries}
                    regions={uniqueRegions}
                    selectedContinents={filters.continent}
                    selectedCountries={filters.country}
                    selectedRegions={[filters.region[0]]}
                    beaches={initialBeaches}
                    windData={windData}
                    onContinentClick={(continent) =>
                      updateFilters("continent", continent)
                    }
                    onCountryClick={(country) =>
                      updateFilters("country", country)
                    }
                    onRegionClick={handleRegionChange}
                    selectedRegion={filters.region[0] || ""}
                    onRegionChange={handleRegionChange}
                    getGoodBeachCount={getGoodBeachCount}
                    cachedBeachScores={cachedBeachScores}
                    BeachCountBadge={({ count }) => {
                      // Always show the count, even if it's 0
                      return <span className="ml-2 text-sm">({count})</span>;
                    }}
                  />
                </div>

                {/* Wave Type Icons - Separate section above beach grid */}
                <div className="mb-9">
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {waveTypes.map((waveType) => (
                      <button
                        key={waveType}
                        onClick={() => {
                          const newWaveTypes = filters.waveType.includes(
                            waveType
                          )
                            ? filters.waveType.filter((t) => t !== waveType)
                            : [...filters.waveType, waveType];
                          setFilters({ ...filters, waveType: newWaveTypes });
                        }}
                        className={`
                          relative w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] lg:w-[121px] lg:h-[121px] 
                          rounded-lg overflow-hidden cursor-pointer
                          hover:opacity-90 transition-all duration-200
                          ${
                            filters.waveType.includes(waveType)
                              ? "ring-2 ring-[var(--color-bg-tertiary)]"
                              : "border border-gray-200"
                          }
                        `}
                      >
                        <Image
                          src={WAVE_TYPE_ICONS[waveType as WaveType]}
                          alt={`${waveType} icon`}
                          fill
                          className="object-cover"
                        />
                        {/* Hover overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute inset-0 bg-black opacity-30"></div>
                          <div className="absolute inset-0 bg-[var(--color-tertiary)] opacity-50"></div>
                          <span className="relative z-10 text-white text-xs sm:text-sm font-medium px-2 text-center">
                            {waveType}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {filteredBeaches.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-[var(--color-text-primary)] text-left max-w-[34ch]">
                      No beaches match filters. Try adjusting the filters or
                      your search query.
                    </p>
                  </div>
                ) : (
                  <>
                    {isLoading ? (
                      <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg animate-pulse">
                        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    ) : (
                      !windData && (
                        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-yellow-800">
                            No forecast data available for {selectedRegion}.
                            Showing beaches with their optimal conditions.
                          </p>
                        </div>
                      )
                    )}
                    <BeachGrid
                      beaches={paginatedBeaches}
                      windData={windData}
                      isBeachSuitable={isBeachSuitable}
                      isLoading={isLoading}
                    />
                  </>
                )}

                {/* Pagination */}
                <div className="mt-12 flex justify-center items-center gap-3">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={cn(
                      "p-2 rounded-md border",
                      currentPage === 1
                        ? "text-gray-400 border-gray-200 cursor-not-allowed"
                        : "text-gray-700 border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={cn(
                            "px-3 py-1 rounded-md",
                            currentPage === page
                              ? "bg-[var(--color-bg-tertiary)] text-white"
                              : "text-gray-700 hover:bg-gray-50"
                          )}
                        >
                          {page}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={cn(
                      "p-2 rounded-md border",
                      currentPage === totalPages
                        ? "text-gray-400 border-gray-200 cursor-not-allowed"
                        : "text-gray-700 border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>

                {/* Move Fun Facts below beach cards */}
                <div className="lg:hidden mt-6">
                  <FunFacts />
                </div>
              </>
            ) : (
              <div className="h-full relative">
                <Map
                  beaches={filteredBeaches}
                  windData={windData}
                  regions={uniqueRegions}
                  selectedRegions={filters.region}
                  onRegionClick={handleRegionChange}
                  filters={filters}
                />
              </div>
            )}
          </main>

          {/* Right Sidebar */}
          <aside className="bg-[var(--color-bg-primary)] p-6 rounded-lg shadow-sm h-fit order-first lg:order-last mb-9 lg:mb-0">
            {/* Single Responsive Forecast Widget */}
            <div
              className="bg-white p-6 rounded-lg shadow-sm min-h-[300px]"
              data-forecast-widget
            >
              <div className="flex items-center justify-between mb-6">
                <h3
                  className={`text-[21px] font-semibold text-gray-800 ${inter.className}`}
                >
                  Today's Forecast
                </h3>
                <div
                  className={`
                  ${inter.className}
                  text-black
                  bg-gray-100
                  px-3
                  py-1
                  rounded-[21px]
                  text-sm
                  font-medium
                `}
                >
                  8AM
                </div>
              </div>

              {/* Responsive Grid Layout */}
              <div className="grid grid-cols-2 gap-4">
                {isLoading ? (
                  <div className="col-span-2 flex items-center justify-center p-8">
                    <span className="text-gray-600">
                      Loading forecast data...
                    </span>
                  </div>
                ) : !windData ? (
                  <div className="col-span-2 flex items-center justify-center p-8">
                    <span className="text-gray-600">
                      No forecast data available
                    </span>
                  </div>
                ) : (
                  <>
                    {/* Wind Direction */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 aspect-square flex flex-col">
                      <label
                        className={cn(
                          "text-sm text-gray-500 uppercase tracking-wide mb-2",
                          inter.className
                        )}
                      >
                        Wind
                      </label>
                      <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="space-y-2 text-center">
                          <span className="text-xl font-semibold text-gray-800">
                            {windData?.wind?.direction || "N/A"}
                          </span>
                          <span className="block text-sm text-gray-600">
                            {windData?.wind?.speed || "N/A"} km/h
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Swell Height */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 aspect-square flex flex-col">
                      <label
                        className={cn(
                          "text-sm text-gray-500 uppercase tracking-wide mb-2",
                          inter.className
                        )}
                      >
                        Swell Height
                      </label>
                      <div className="flex-1 flex flex-col items-center justify-center">
                        <span className="text-xl font-semibold text-gray-800">
                          {windData?.swell?.height || "N/A"}m
                        </span>
                      </div>
                    </div>

                    {/* Swell Period */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 aspect-square flex flex-col">
                      <label
                        className={cn(
                          "text-sm text-gray-500 uppercase tracking-wide mb-2",
                          inter.className
                        )}
                      >
                        Swell Period
                      </label>
                      <div className="flex-1 flex flex-col items-center justify-center">
                        <span className="text-xl font-semibold text-gray-800">
                          {windData?.swell?.period || "N/A"}s
                        </span>
                      </div>
                    </div>

                    {/* Swell Direction */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 aspect-square flex flex-col">
                      <label
                        className={cn(
                          "text-sm text-gray-500 uppercase tracking-wide mb-2",
                          inter.className
                        )}
                      >
                        Swell Direction
                      </label>
                      <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="space-y-2 text-center">
                          <span className="text-xl font-semibold text-gray-800">
                            {windData?.swell?.direction || "N/A"}°
                          </span>
                          <span className="block text-sm text-gray-600">
                            {windData?.swell?.cardinalDirection || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="mt-4">
              <div className="hidden lg:block">
                <FunFacts />
              </div>
              <div className="hidden lg:block">
                <Insights region={selectedRegion || "Western Cape"} />
              </div>
            </div>
          </aside>
        </div>
      </div>
      {/* Filter Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full 
          w-full sm:w-[360px] 
          bg-[var(--color-bg-primary)]
          transform transition-transform duration-300 ease-in-out z-50
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-70px)]">
          <SidebarFilter
            beaches={initialBeaches}
            minPoints={minPoints}
            onMinPointsChange={setMinPoints}
            onFilterChange={(newFilters) => {
              const updatedFilters = {
                ...newFilters,
                continent: [newFilters.continent].flat(),
                country: [newFilters.country].flat(),
              };
              setFilters(updatedFilters as typeof filters);
            }}
            filters={filters}
          />
        </div>
      </div>
      {/* Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[49]"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sticky Forecast Widget */}
      <StickyForecastWidget windData={windData} />
    </div>
  );
}
