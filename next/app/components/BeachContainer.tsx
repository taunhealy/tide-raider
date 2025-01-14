"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { Beach, Region } from "@/app/types/beaches";
import type { WindData } from "@/app/types/wind";
import SidebarFilter from "./SidebarFilter";
import BeachGrid from "./BeachGrid";
import Map from "./Map";
import { useSubscription } from "../context/SubscriptionContext";
import { useHandleSubscription } from "../hooks/useHandleSubscription";
import { useSession } from "next-auth/react";
import { Button } from "./ui/Button";
import { useQuery } from "@tanstack/react-query";
import {
  isBeachSuitable,
  getEmojiDescription,
  getScoreEmoji,
} from "@/app/lib/surfUtils";
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
import LogbookSidebar from "./LogbookSidebar";

interface BeachContainerProps {
  initialBeaches: Beach[];
  windData: any;
  blogPosts: any;
  userPreferences: any | null;
  isPro: boolean;
}

const inter = Inter({ subsets: ["latin"] });

export default function BeachContainer({
  initialBeaches,
  windData: initialWindData,
  blogPosts,
}: BeachContainerProps) {
  const { data: session } = useSession();
  const { isSubscribed } = useSubscription();
  const { mutate: handleSubscriptionChange } = useHandleSubscription();
  const [minPoints, setMinPoints] = useState(0);
  const searchParams = useSearchParams();

  // Initialize filters from URL params
  const initialFilters = {
    continent: searchParams?.get("continent")?.split(",") || ["Africa"],
    country: searchParams?.get("country")?.split(",") || ["South Africa"],
    waveType: searchParams?.get("waveType")?.split(",") || [],
    difficulty: searchParams?.get("difficulty")?.split(",") || [],
    region: searchParams?.get("region")?.split(",") || ["Western Cape"],
    crimeLevel: searchParams?.get("crimeLevel")?.split(",") || [],
    minPoints: parseInt(searchParams?.get("minPoints") || "0"),
    sharkAttack: searchParams?.get("sharkAttack")?.split(",") || [],
    minDistance: parseInt(searchParams?.get("minDistance") || "0"),
    maxDistance: parseInt(searchParams?.get("maxDistance") || "10000"),
    // Add any other filters you need
  };

  const [filters, setFilters] = useState(initialFilters);

  // Update URL when filters change
  const updateFilters = useCallback(
    (key: string, value: any) => {
      const newFilters = { ...filters, [key]: value };
      setFilters(newFilters);

      if (typeof window !== "undefined") {
        // Check if we're in the browser
        // Update URL params
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

  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [searchQuery, setSearchQuery] = useState("");

  // Replace windData state and fetch logic with useQuery
  const {
    data: windData,
    isLoading,
    refetch: refreshData,
  } = useQuery({
    queryKey: ["windData"],
    queryFn: async () => {
      const response = await fetch("/api/surf-conditions");
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const { data } = await response.json();
      return data;
    },
    initialData: initialWindData,
    staleTime: Infinity,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Compute filtered beaches based on windData
  const filteredBeaches = useMemo(() => {
    if (!windData) return initialBeaches;

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

    // Apply continent filter
    if (filters.continent.length > 0) {
      filtered = filtered.filter((beach) =>
        filters.continent.includes(beach.continent)
      );
    }

    // Apply country filter
    if (filters.country.length > 0) {
      filtered = filtered.filter((beach) =>
        filters.country.includes(beach.country)
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

    // Apply distance filter
    filtered = filtered.filter(
      (beach) =>
        beach.distanceFromCT >= filters.minDistance &&
        beach.distanceFromCT <= filters.maxDistance
    );

    // Apply shark attack filter
    if (filters.sharkAttack?.includes("true")) {
      filtered = filtered.filter((beach) => beach.sharkAttack.hasAttack);
    }

    // Apply scoring and sort
    return filtered
      .map((beach) => ({
        beach,
        score: isBeachSuitable(beach, windData).score,
      }))
      .filter(({ score }) => minPoints === 0 || score >= minPoints)
      .sort((a, b) => b.score - a.score)
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

  const handleRegionClick = (region: string) => {
    const newRegions = filters.region.includes(region)
      ? filters.region.filter((r) => r !== region)
      : [...filters.region, region];

    updateFilters("region", newRegions);
  };

  // Get unique wave types from beach data
  const waveTypes = [...new Set(initialBeaches.map((beach) => beach.waveType))];

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
            <LogbookSidebar />
            <BeachFeedback beaches={initialBeaches} />
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
                    selectedRegions={filters.region}
                    beaches={initialBeaches}
                    windData={windData}
                    onContinentClick={(continent) =>
                      updateFilters(
                        "continent",
                        filters.continent.includes(continent)
                          ? filters.continent.filter((c) => c !== continent)
                          : [...filters.continent, continent]
                      )
                    }
                    onCountryClick={(country) =>
                      updateFilters(
                        "country",
                        filters.country.includes(country)
                          ? filters.country.filter((c) => c !== country)
                          : [...filters.country, country]
                      )
                    }
                    onRegionClick={handleRegionClick}
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
                  <BeachGrid
                    beaches={paginatedBeaches}
                    windData={windData}
                    isBeachSuitable={isBeachSuitable}
                  />
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
                  onRegionClick={handleRegionClick}
                  filters={filters}
                />
              </div>
            )}
          </main>

          {/* Right Sidebar */}
          <aside className="bg-[var(--color-bg-primary)] p-6 rounded-lg shadow-sm h-fit order-first lg:order-last mb-9 lg:mb-0">
            {/* Single Responsive Forecast Widget */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
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
                    {isLoading ? (
                      "Updating..."
                    ) : windData ? (
                      <div className="space-y-2 text-center">
                        <span className="text-xl font-semibold text-gray-800">
                          {windData.wind.direction}
                        </span>
                        <span className="block text-sm text-gray-600">
                          {windData.wind.speed} km/h
                        </span>
                      </div>
                    ) : (
                      "Loading..."
                    )}
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
                      {isLoading
                        ? "Updating..."
                        : windData
                          ? `${windData.swell.height}m`
                          : ""}
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
                      {isLoading
                        ? "Updating..."
                        : windData
                          ? `${windData.swell.period}s`
                          : "Loading..."}
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
                    {isLoading ? (
                      "Updating..."
                    ) : windData ? (
                      <div className="space-y-2 text-center">
                        <span className="text-xl font-semibold text-gray-800">
                          {windData.swell.direction}°
                        </span>
                        <span className="block text-sm text-gray-600">
                          {windData.swell.cardinalDirection}
                        </span>
                      </div>
                    ) : (
                      "Loading..."
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="hidden lg:block">
                <Insights region={selectedRegion || "Western Cape"} />
              </div>
              <div className="hidden lg:block">
                <FunFacts />
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
            onFilterChange={setFilters}
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
    </div>
  );
}
