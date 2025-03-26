"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { Beach, Region } from "@/app/types/beaches";
import SidebarFilter from "./SidebarFilter";
import BeachGrid from "./BeachGrid";
import Map from "./Map";
import { useSubscription } from "../context/SubscriptionContext";
import { useAppMode } from "../context/AppModeContext";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  isBeachSuitable,
  FREE_BEACH_LIMIT,
  getGatedBeaches,
  degreesToCardinal,
} from "@/app/lib/surfUtils";
import FunFacts from "@/app/components/FunFacts";
import { cn } from "@/app/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Map as MapIcon,
  List,
  X,
} from "lucide-react";

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
import RegionalSidebar from "@/app/components/RegionalSidebar";
import type { Ad } from "@/app/types/ads";
import EventsSidebar from "./EventsSidebar";
import { beachData, REGIONS } from "@/app/types/beaches";
import { format } from "date-fns";
import QuestLogSidebar from "./QuestLogSidebar";
import StickyForecastWidget from "./StickyForecastWidget";
import { toast } from "sonner";
import Link from "next/link";
import SponsorContainer from "./SponsorContainer";
import FavouriteSurfVideosSidebar from "@/app/components/FavouriteSurfVideosSidebar";
import { useSurfConditions } from "@/app/hooks/useSurfConditions";
import { RandomLoader } from "./ui/random-loader";
import RegionalHighScores from "@/app/components/RegionalHighScores";

interface BeachContainerProps {
  initialBeaches: Beach[];
  blogPosts: any;
  availableAds: Ad[];
}

// Add these type definitions at the top
type Difficulty =
  | "Beginner"
  | "Intermediate"
  | "Advanced"
  | "All Levels"
  | "Expert";
type CrimeLevel = "Low" | "Medium" | "High";

interface FilterType {
  continent: string[];
  country: string[];
  waveType: string[];
  difficulty: Difficulty[];
  region: Region[];
  crimeLevel: CrimeLevel[];
  minPoints: number;
  sharkAttack: string[];
  minDistance?: number;
}

type FilterKeys = keyof FilterType;

export default function BeachContainer({
  initialBeaches,
  blogPosts,
  availableAds,
}: BeachContainerProps) {
  const { isSubscribed, hasActiveTrial } = useSubscription();
  const { isBetaMode } = useAppMode();
  const [minPoints, setMinPoints] = useState(0);
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // Fetch default filters
  const { data: defaultFilters, isLoading: isLoadingDefaults } = useQuery({
    queryKey: ["userDefaultFilters"],
    queryFn: async () => {
      const response = await fetch("/api/user/filters");
      if (!response.ok) return null;
      return response.json();
    },
  });

  // Update the filters state
  const [filters, setFilters] = useState<FilterType>(() => {
    if (searchParams.toString()) {
      return {
        continent: [searchParams.get("continent")].filter(Boolean) as string[],
        country: [searchParams.get("country")].filter(Boolean) as string[],
        waveType:
          searchParams.get("waveType")?.split(",").filter(Boolean) || [],
        difficulty: (searchParams
          .get("difficulty")
          ?.split(",")
          .filter(Boolean) || []) as Difficulty[],
        region: (searchParams
          .get("region")
          ?.split(",")
          .filter((val) => REGIONS.includes(val)) || []) as Region[],
        crimeLevel: (searchParams
          .get("crimeLevel")
          ?.split(",")
          .filter(Boolean) || []) as CrimeLevel[],
        minPoints: parseInt(searchParams.get("minPoints") || "0"),
        sharkAttack:
          searchParams.get("sharkAttack")?.split(",").filter(Boolean) || [],
        minDistance: 0,
      };
    }
    // Return empty filters initially, let useEffect handle default loading
    return INITIAL_FILTERS;
  });

  // Update the useEffect for default filters
  useEffect(() => {
    if (defaultFilters && !searchParams.toString()) {
      console.log("Loading default filters:", defaultFilters);

      // Update filters state
      setFilters((prevFilters) => ({
        continent: defaultFilters.continent || prevFilters.continent,
        country: defaultFilters.country || prevFilters.country,
        region: defaultFilters.region || [],
        waveType: defaultFilters.waveType || [],
        difficulty: defaultFilters.difficulty || [],
        crimeLevel: defaultFilters.crimeLevel || [],
        sharkAttack: defaultFilters.sharkAttack || [],
        minPoints: defaultFilters.minPoints || 0,
        minDistance: defaultFilters.minDistance || 0,
      }));

      // Update URL with default filters
      const params = new URLSearchParams();
      if (defaultFilters.continent?.length)
        params.set("continent", defaultFilters.continent.join(","));
      if (defaultFilters.country?.length)
        params.set("country", defaultFilters.country.join(","));
      if (defaultFilters.region?.length)
        params.set("region", defaultFilters.region.join(","));
      if (defaultFilters.waveType?.length)
        params.set("waveType", defaultFilters.waveType.join(","));
      if (defaultFilters.difficulty?.length)
        params.set("difficulty", defaultFilters.difficulty.join(","));
      if (defaultFilters.crimeLevel?.length)
        params.set("crimeLevel", defaultFilters.crimeLevel.join(","));
      if (defaultFilters.sharkAttack?.length)
        params.set("sharkAttack", defaultFilters.sharkAttack.join(","));
      if (defaultFilters.minPoints)
        params.set("minPoints", defaultFilters.minPoints.toString());

      // Update URL without causing navigation
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?${params.toString()}`
      );
    }
  }, [defaultFilters]);

  // Update selectedRegion state initialization (remove localStorage check)
  const [selectedRegion, setSelectedRegion] = useState<string>("");

  // Update handleRegionChange (remove localStorage setItem)
  const handleRegionChange = (newRegion: string) => {
    setSelectedRegion(newRegion);
    const newFilters = { ...filters };
    newFilters.region = [newRegion as Region];
    setFilters(newFilters);
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
  const itemsPerPage = 18;
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [searchQuery, setSearchQuery] = useState("");

  // Store counts in state
  const [regionScoreCounts, setRegionScoreCounts] = useState<
    Record<string, number>
  >({});

  // Add the allWindData query with proper structure
  const { data: allWindData, isLoading: isAllDataLoading } = useQuery({
    queryKey: ["surfConditions", "all"],
    queryFn: async () => {
      const response = await fetch(`/api/surf-conditions`);
      if (!response.ok) throw new Error("Failed to fetch conditions");
      const data = await response.json();
      return data;
    },
    enabled: !isSidebarOpen,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });

  // Calculate scores and counts using allWindData
  const beachScores = useMemo(() => {
    if (!allWindData) {
      return {};
    }

    console.log("🎯 Calculating scores with data:", allWindData);
    const scores: Record<string, number> = {};
    const counts: Record<string, number> = {};

    initialBeaches.forEach((beach) => {
      try {
        const { score } = isBeachSuitable(beach, allWindData);
        scores[beach.id] = score;

        // Debug each beach's score

        if (score >= 4) {
          counts[beach.region] = (counts[beach.region] || 0) + 1;
        } else {
          // Debug why beach didn't score well
        }
      } catch (error) {
        console.error(`Error calculating score for ${beach.name}:`, error);
      }
    });

    setRegionScoreCounts(counts);
    return scores;
  }, [allWindData, initialBeaches]);

  // Fetch specific region data using the same optimized flow
  const {
    data: windData,
    error: windError,
    isLoading,
  } = useSurfConditions(selectedRegion);

  // Add this console.log to debug the response
  useEffect(() => {
    if (windData) {
      console.log("Received wind data:", windData);
    }
    if (windError) {
      console.error("Wind data error:", windError);
    }
  }, [windData, windError]);

  // Compute filtered beaches based on windData
  const filteredBeaches = useMemo(() => {
    let filtered = initialBeaches;

    // Add a check to ensure beaches are properly filtered
    if (!Array.isArray(filtered)) {
      console.error("Invalid beaches data:", filtered);
      return [];
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((beach) => {
        // Check main beach properties
        const mainPropertiesMatch =
          beach.name.toLowerCase().includes(query) ||
          beach.region.toLowerCase().includes(query) ||
          beach.description.toLowerCase().includes(query) ||
          (beach.location && beach.location.toLowerCase().includes(query));

        // Check videos if they exist
        const videoTitlesMatch =
          beach.videos?.some((video) =>
            video.title.toLowerCase().includes(query)
          ) || false;

        return mainPropertiesMatch || videoTitlesMatch;
      });

      // Add debug logging for search results
      console.log(`Search for "${query}" found ${filtered.length} matches`);
    }

    // Apply continent filter (single select)
    if (filters.continent.length > 0) {
      filtered = filtered.filter(
        (beach) => beach.continent === filters.continent[0]
      );
    }

    // Apply country filter (single select)
    if (filters.country.length > 0) {
      filtered = filtered.filter(
        (beach) => beach.country === filters.country[0]
      );
    }

    // Apply region filter - check both filters.region and selectedRegion
    if (filters.region.length > 0) {
      filtered = filtered.filter((beach) =>
        filters.region.includes(beach.region as Region)
      );
    } else if (selectedRegion) {
      // If no region in filters but selectedRegion exists, filter by selectedRegion
      filtered = filtered.filter((beach) => beach.region === selectedRegion);
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

  // Modify the pagination to respect subscription status and app mode
  const { visibleBeaches, lockedBeaches } = getGatedBeaches(
    filteredBeaches,
    windData || null,
    isSubscribed,
    hasActiveTrial,
    isBetaMode
  );

  // Apply pagination to the VISIBLE beaches only
  const totalBeaches = visibleBeaches.length;
  const totalPages = Math.ceil(totalBeaches / itemsPerPage);
  const currentItems = visibleBeaches.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const uniqueRegions = Array.from(
    new Set(initialBeaches.map((beach) => beach.region))
  ).sort();
  const uniqueContinents = Array.from(
    new Set(initialBeaches.map((beach) => beach.continent))
  ).sort();
  const uniqueCountries = Array.from(
    new Set(initialBeaches.map((beach) => beach.country))
  ).sort();

  // Get unique wave types from beach data
  const waveTypes = [...new Set(initialBeaches.map((beach) => beach.waveType))];

  const fetchRegionData = useCallback(async (region: string) => {
    try {
      const response = await fetch(`/api/wind-data?region=${region}`);
      const data = await response.json();
    } catch (error) {
      console.error("Error fetching wind data:", error);
    }
  }, []);

  // Modify the calculateInitialScores function to use windData directly
  const calculateInitialScores = useCallback(() => {
    const scores: Record<string, number> = {};

    if (!windData) return scores;

    initialBeaches.forEach((beach) => {
      if (beach.region === selectedRegion) {
        const { score } = isBeachSuitable(beach, windData);
        if (score >= 4) {
          scores[beach.region] = (scores[beach.region] || 0) + 1;
          scores[beach.country] = (scores[beach.country] || 0) + 1;
          scores[beach.continent] = (scores[beach.continent] || 0) + 1;
        }
      }
    });

    return scores;
  }, [windData, selectedRegion, initialBeaches]);

  // Set initial scores when allRegionsData is loaded
  useEffect(() => {
    if (windData) {
      const initialScores = calculateInitialScores();
    }
  }, [windData, calculateInitialScores]);

  // Update the useEffect to only use Redis cache:
  useEffect(() => {
    async function initializeBeachData() {
      if (windData) {
        const today = new Date().toISOString().split("T")[0];

        // Call API endpoint instead of using Prisma directly
        const res = await fetch(
          `/api/beach-counts?region=${selectedRegion}&date=${today}`
        );
        const data = await res.json();

        // The API endpoint will handle checking/storing ratings
        if (data.count) {
          // Update UI with counts
        }
      }
    }

    initializeBeachData();
  }, [windData, selectedRegion]);

  // Update regionCounts calculation
  const regionCounts = useMemo(() => {
    if (!beachScores || Object.keys(beachScores).length === 0) {
      console.log("No beach scores available for counting");
      return {};
    }

    const counts: Record<string, number> = {};

    beachData.forEach((beach) => {
      const score = beachScores[beach.id];
      if (score && score >= 4) {
        // Increment counts for region, country, and continent
        counts[beach.region] = (counts[beach.region] || 0) + 1;
        counts[beach.country] = (counts[beach.country] || 0) + 1;
        counts[beach.continent] = (counts[beach.continent] || 0) + 1;
      }
    });

    console.log("📊 Final region counts:", JSON.stringify(counts, null, 2));
    return counts;
  }, [beachScores, beachData]);

  // Show counts for all regions
  const getBadgeCount = (location: string) => {
    return regionScoreCounts[location] || 0;
  };

  // Instead of setRegionCounts, store the data in a new state
  const [goodBeachCounts, setGoodBeachCounts] = useState<
    Record<string, number>
  >({});

  // Update the fetch to use the new state

  const { data: beachCounts } = useQuery({
    queryKey: ["beachCounts", selectedRegion],
    queryFn: async () => {
      // Only proceed if selectedRegion has a value
      if (!selectedRegion) {
        return {};
      }

      const today = new Date().toISOString().split("T")[0];
      const response = await fetch(
        `/api/beach-counts?region=${encodeURIComponent(selectedRegion)}&date=${today}`
      );
      const data = await response.json();

      // Structure the response to include region, country, and continent
      if (data.count > 0) {
        const regionBeach = initialBeaches.find(
          (b) => b.region === selectedRegion
        );
        if (regionBeach) {
          return {
            [regionBeach.region]: data.count,
            [regionBeach.country]: data.count,
            [regionBeach.continent]: data.count,
          };
        }
      }
      return {};
    },
    // Only enable the query when selectedRegion has a value
    enabled: !!selectedRegion,
  });

  // Update the save handler with proper error handling
  const [isSavingDefaults, setIsSavingDefaults] = useState(false);

  const handleSaveDefault = async (filters: FilterType) => {
    setIsSavingDefaults(true);
    try {
      // Save the exact URL parameters
      const params = new URLSearchParams(window.location.search);
      const currentParams = Object.fromEntries(params.entries());

      const response = await fetch("/api/user/filters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          urlParams: currentParams, // Save the exact URL parameters
          ...filters,
        }),
      });

      if (!response.ok) throw new Error("Failed to save filters");
      await queryClient.invalidateQueries({ queryKey: ["userDefaultFilters"] });
      toast.success("Default filters saved successfully!");
    } catch (error) {
      console.error("Error saving filters:", error);
      toast.error("Failed to save default filters");
      throw error;
    } finally {
      setIsSavingDefaults(false);
    }
  };

  // Update the query and data handling
  const { data: recentLogs } = useQuery({
    queryKey: ["recentLogs"],
    queryFn: async () => {
      const res = await fetch(`/api/raid-logs`);
      if (!res.ok) throw new Error("Failed to fetch logs");
      const data = await res.json();
      return Array.isArray(data) ? data : []; // Ensure we always return an array
    },
  });

  // Update how we get the latest logs
  const latestLogs = useMemo(() => {
    if (!recentLogs) return [];
    return recentLogs.slice(0, 3); // Get first 3 logs
  }, [recentLogs]);

  // Update the forecast widget section
  const [forecastSource, setForecastSource] = useState<"A" | "B">("A");

  useEffect(() => {
    // Only add parameters that have values
    const params = new URLSearchParams();

    // Only add filters that are actually selected
    if (filters.continent.length > 0) {
      params.set("continent", filters.continent[0]);
    }

    if (filters.country.length > 0) {
      params.set("country", filters.country[0]);
    }

    if (filters.region.length > 0) {
      params.set("region", filters.region[0]);
    }

    // Add other filter parameters only if they have values
    if (filters.waveType.length > 0) {
      params.set("waveType", filters.waveType.join(","));
    }

    if (filters.difficulty.length > 0) {
      params.set("difficulty", filters.difficulty.toString());
    }

    // Update the URL without refreshing the page
    const newUrl =
      window.location.pathname +
      (params.toString() ? `?${params.toString()}` : "");

    window.history.pushState({}, "", newUrl);
  }, [filters]);

  // 2. Add explicit modal control
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 3. Update the beach click handler
  const handleBeachClick = useCallback((beach: Beach) => {
    // Update URL without page reload
    const params = new URLSearchParams(window.location.search);
    params.set("beach", beach.id);
    window.history.pushState({}, "", `?${params.toString()}`);

    setSelectedBeach(beach);
    setIsModalOpen(true);
  }, []);

  // 4. Update the modal close handler
  const handleCloseBeachModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedBeach(null);
  }, []);

  // Add this state for tracking selected beach
  const [selectedBeach, setSelectedBeach] = useState<Beach | null>(null);

  // Add a useEffect to log when selectedBeach changes
  useEffect(() => {
    console.log("selectedBeach changed:", selectedBeach);
  }, [selectedBeach]);

  // Add at the top of the component
  console.log("BeachContainer rendering with isModalOpen:", isModalOpen);

  // Add this useEffect
  useEffect(() => {
    console.log("isModalOpen changed to:", isModalOpen);
  }, [isModalOpen]);

  // Add URL parameter synchronization
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const beachId = params.get("beach");

    if (beachId) {
      const beach = initialBeaches.find((b) => b.id === beachId);
      if (beach) {
        setSelectedBeach(beach);
        setIsModalOpen(true);
      }
    }
  }, [initialBeaches]);

  return (
    <div className="bg-[var(--color-bg-secondary)] p-4 sm:p-6 mx-auto relative min-h-[calc(100vh-72px)] flex flex-col">
      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-[30px] xl:gap-[54px]">
        {/* Left Sidebar - Show only on laptop and larger screens */}
        <aside className="hidden lg:block lg:w-[250px] xl:w-[300px] flex-shrink-0">
          <div className="hidden lg:block">
            <BlogPostsSidebar
              posts={blogPosts}
              selectedCountry={
                filters.country.length > 0 ? filters.country[0] : undefined
              }
              selectedContinent={
                filters.continent.length > 0 ? filters.continent[0] : undefined
              }
            />
          </div>
          <div className="space-y-6">
            <FavouriteSurfVideosSidebar />
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
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-4 sm:gap-6 lg:gap-[30px] xl:gap-[54px] flex-1 overflow-hidden">
          <main className="min-w-0 overflow-y-auto">
            {/* Header Section */}
            <div className="flex flex-col gap-4 sm:gap-6 mb-6 sm:mb-9">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h3 className="text-xl sm:text-2xl font-semi-bold text-[var(--color-text-primary)] font-primary">
                  This Morning's Recommendations
                </h3>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className={cn(
                    "font-primary",
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
                  className="font-primary w-full sm:w-auto"
                />

                {/* View Toggle */}
                <div className="flex items-center gap-2 bg-white rounded-md border border-gray-200 mt-3 sm:mt-0">
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
                {/* Wave Type Icons - Make scrollable on mobile */}
                <div className="mb-6 overflow-x-auto pb-2">
                  <div className="flex flex-nowrap gap-2 min-w-max">
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
                          relative w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] lg:w-[80px] lg:h-[80px] 
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
                          <span className="relative z-10 text-white text-xs font-medium px-2 text-center font-primary">
                            {waveType}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Forecast widget - Improve mobile layout */}
                <div className="mb-6">
                  {isLoading ? (
                    <RandomLoader isLoading={isLoading} />
                  ) : windError ? (
                    <div className="text-red-600 font-primary text-sm">
                      Forecast loading failed
                    </div>
                  ) : !windData ? (
                    <div className="text-yellow-600 font-primary text-sm">
                      Please select a region to view a region's forecast.
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 font-primary bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-gray-800">
                          🌬️ Wind
                        </span>
                        <span>
                          {degreesToCardinal(
                            parseFloat(windData.windDirection)
                          ) || "N/A"}
                        </span>
                        <span>{windData.windSpeed}kts</span>
                      </div>

                      <div className="hidden sm:block h-4 w-px bg-gray-300" />

                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-gray-800">
                          🌊 Swell
                        </span>
                        <span>{windData.swellHeight}m</span>
                        <span>@{windData.swellPeriod}s</span>
                        <span>
                          {degreesToCardinal(windData.swellDirection)}
                        </span>
                      </div>

                      <div className="hidden sm:block h-4 w-px bg-gray-300" />

                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-gray-800">
                          ⏱️ Time
                        </span>
                        <span>{format(new Date(), "haaa")}</span>
                      </div>
                    </div>
                  )}
                </div>

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
                    windData={windData || null}
                    onContinentClick={(continent) =>
                      updateFilters("continent", continent)
                    }
                    onCountryClick={(country) =>
                      updateFilters("country", country)
                    }
                    onRegionClick={(region) => updateFilters("region", region)}
                    isPro={isSubscribed}
                    selectedRegion={selectedRegion}
                    onRegionChange={handleRegionChange}
                    getGoodBeachCount={async (region: string) => {
                      const today = new Date().toISOString().split("T")[0];
                      const res = await fetch(
                        `/api/beach-counts?region=${region}&date=${today}`
                      );
                      const data = await res.json();
                      return data.count;
                    }}
                    BeachCountBadge={({ region }) => {
                      const count = regionScoreCounts[region] || 0;

                      if (isAllDataLoading) {
                        return (
                          <div className="inline-flex items-center justify-center w-6 h-6 ml-2 bg-gray-200 rounded-full animate-pulse">
                            <span className="sr-only">Loading</span>
                          </div>
                        );
                      }

                      if (!count) return null;

                      return (
                        <div className="inline-flex items-center justify-center w-6 h-6 ml-2 text-sm text-white bg-[var(--color-bg-tertiary)] rounded-full font-primary">
                          {count}
                        </div>
                      );
                    }}
                    isLoading={isAllDataLoading}
                  />
                </div>

                {filteredBeaches.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-[var(--color-text-primary)] text-left max-w-[34ch] font-primary">
                      No beaches match filters. Try adjusting the filters or
                      your search query.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Forecast Source Toggle */}
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-[21px] heading-6 text-gray-800 font-primary">
                        Breaks
                      </h3>
                      <div className="flex items-center gap-2">
                        {/* Source Toggle Buttons */}
                      </div>
                    </div>

                    {/* Beach Grid */}
                    <BeachGrid
                      beaches={currentItems}
                      windData={windData}
                      isBeachSuitable={isBeachSuitable}
                      isLoading={isLoading}
                      onBeachClick={handleBeachClick}
                    />

                    {/* Subscription Banner */}
                    {!isSubscribed &&
                      filteredBeaches.length > FREE_BEACH_LIMIT && (
                        <div className="mt-8 p-6 bg-[var(--color-bg-tertiary)] rounded-lg text-white shadow-lg">
                          <div className="flex flex-col items-center text-center space-y-4">
                            <h3 className="text-xl font-semibold font-primary">
                              Unlock {filteredBeaches.length - FREE_BEACH_LIMIT}{" "}
                              More Surf Breaks In This Region
                            </h3>
                            <p className="text-white/90 max-w-md font-primary">
                              Subscribe to access all beaches and logs. Seek
                              your perfect wave.
                            </p>
                            <Link
                              href="/pricing"
                              className="mt-4 px-6 py-2 bg-white text-[var(--color-bg-tertiary)] rounded-full font-semibold font-primary hover:bg-gray-100 transition-colors"
                            >
                              {hasActiveTrial
                                ? "Subscribe Now"
                                : "Start Free Trial"}
                            </Link>
                          </div>
                        </div>
                      )}

                    {/* Pagination */}
                    {(isSubscribed ? totalPages > 1 : false) && (
                      <div className="mt-12 flex justify-center items-center gap-3">
                        <button
                          onClick={() => setCurrentPage(currentPage - 1)}
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
                          {Array.from(
                            {
                              length: Math.ceil(
                                filteredBeaches.length / itemsPerPage
                              ),
                            },
                            (_, i) => i + 1
                          ).map((page) => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={cn(
                                "px-3 py-1 rounded-md",
                                currentPage === page
                                  ? "bg-[var(--color-bg-tertiary)] text-white"
                                  : "text-gray-700 hover:bg-gray-50"
                              )}
                            >
                              {page}
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={
                            currentPage ===
                            Math.ceil(filteredBeaches.length / itemsPerPage)
                          }
                          className={cn(
                            "p-2 rounded-md border",
                            currentPage ===
                              Math.ceil(filteredBeaches.length / itemsPerPage)
                              ? "text-gray-400 border-gray-200 cursor-not-allowed"
                              : "text-gray-700 border-gray-300 hover:bg-gray-50"
                          )}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* Move Fun Facts below beach cards */}
                <div className="lg:hidden mt-6">
                  <FunFacts />
                </div>
              </>
            ) : (
              <div className="h-[50vh] sm:h-[60vh] lg:h-[calc(100vh-300px)] w-full relative">
                <Map
                  beaches={filteredBeaches.map((beach) => {
                    // If user is not subscribed and not on trial and not in beta mode, mask the beach names for good beaches
                    if (
                      !isBetaMode &&
                      !isSubscribed &&
                      !hasActiveTrial &&
                      beachScores[beach.id] >= 4
                    ) {
                      return {
                        ...beach,
                        name: "Subscribe To View",
                      };
                    }
                    return beach;
                  })}
                  windData={windData || null}
                  regions={uniqueRegions}
                  selectedRegions={filters.region}
                  onRegionClick={handleRegionChange}
                  filters={filters}
                  hasActiveTrial={hasActiveTrial}
                  isBetaMode={isBetaMode}
                />
              </div>
            )}
          </main>

          {/* Right Sidebar - Hidden on all devices below xl breakpoint */}
          {typeof window !== "undefined" && (
            <aside className="hidden xl:block bg-[var(--color-bg-primary)] p-4 sm:p-6 rounded-lg shadow-sm h-fit order-first xl:order-last mb-6 sm:mb-9 xl:mb-0">
              {/* Single Responsive Forecast Widget - Hidden on mobile and iPad */}
              <div
                className="bg-white p-6 rounded-lg shadow-sm min-h-[300px]"
                data-forecast-widget
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[21px] heading-6 text-gray-800 font-primary">
                    Today's Forecast
                  </h3>
                  <div className="flex items-center gap-2">
                    {/* Source Toggle Buttons */}
                    <div className="flex rounded-[21px] bg-gray-100 p-1"></div>
                    <div className="font-primary text-black bg-gray-100 px-3 py-1 rounded-[21px] text-sm">
                      8AM
                    </div>
                  </div>
                </div>

                {/* Responsive Grid Layout */}
                <div className="grid grid-cols-2 gap-4">
                  {isLoading ? (
                    <div className="col-span-2 flex items-center justify-center p-8">
                      <RandomLoader isLoading={isLoading} />
                    </div>
                  ) : !windData ? (
                    <div className="col-span-2 flex items-center justify-left p-6">
                      <span className="text-gray-600 font-primary text-center">
                        No forecast data available. Please select a region to
                        view forecast.
                      </span>
                    </div>
                  ) : (
                    <>
                      {/* Wind Direction */}
                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 aspect-square flex flex-col">
                        <label className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-primary font-medium">
                          Wind
                        </label>
                        <div className="flex-1 flex flex-col items-center justify-center">
                          <div className="space-y-2 text-center">
                            <span className="text-2xl font-semibold text-gray-800 font-primary">
                              {degreesToCardinal(
                                parseFloat(windData.windDirection)
                              ) || "N/A"}
                            </span>
                            <span className="block text-sm text-gray-600 font-primary">
                              {windData.windDirection.toFixed(1)}°
                            </span>
                            <span className="block text-sm text-gray-600 font-primary">
                              {windData.windSpeed || "N/A"} kts
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Swell Height */}
                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 aspect-square flex flex-col">
                        <label className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-primary font-medium">
                          Swell Height
                        </label>
                        <div className="flex-1 flex flex-col items-center justify-center">
                          <span className="text-2xl font-semibold text-gray-800 font-primary">
                            {windData.swellHeight || "N/A"}m
                          </span>
                        </div>
                      </div>

                      {/* Swell Period */}
                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 aspect-square flex flex-col">
                        <label className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-primary font-medium">
                          Swell Period
                        </label>
                        <div className="flex-1 flex flex-col items-center justify-center">
                          <span className="text-2xl font-semibold text-gray-800 font-primary">
                            {windData.swellPeriod || "N/A"}s
                          </span>
                        </div>
                      </div>

                      {/* Swell Direction */}
                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 aspect-square flex flex-col">
                        <label className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-primary font-medium">
                          Swell Direction
                        </label>
                        <div className="flex-1 flex flex-col items-center justify-center">
                          <div className="space-y-2 text-center">
                            <span className="text-2xl font-semibold text-gray-800 font-primary">
                              {degreesToCardinal(windData.swellDirection) ||
                                "N/A"}
                            </span>
                            <span className="block text-sm text-gray-600 font-primary">
                              {windData.swellDirection || "N/A"}°
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-4">
                {selectedRegion && (
                  <RegionalHighScores
                    beaches={initialBeaches}
                    selectedRegion={selectedRegion}
                    onBeachClick={handleBeachClick}
                  />
                )}
                <div className="block">
                  <FunFacts />
                </div>
                <div className="block"></div>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Filter Sidebar - Improve tablet experience */}
      <div
        className={`
          fixed top-0 left-0 h-full 
          w-full sm:w-[360px] md:w-[400px]
          bg-[var(--color-bg-primary)]
          transform transition-transform duration-300 ease-in-out z-50
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold font-primary">Filters</h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors font-primary"
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
            onSaveDefault={handleSaveDefault}
            isLoadingDefaults={isLoadingDefaults}
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
      <StickyForecastWidget forecasts={{ today: windData || null }} />

      {/* Add Sponsor Container */}
      <SponsorContainer />
    </div>
  );
}
