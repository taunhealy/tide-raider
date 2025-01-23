"use client";

import { cn } from "@/app/lib/utils";
import { Inter } from "next/font/google";
import { Beach } from "@/app/types/beaches";
import { WindData } from "@/app/types/wind";
import { isBeachSuitable } from "@/app/lib/surfUtils";
import { FilterButton } from "@/app/components/ui/FilterButton";
import { useEffect, useState, memo } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";
import { Region } from "@/app/types/beaches";

const inter = Inter({ subsets: ["latin"] });

interface SavedFilters {
  continents: string[];
  countries: string[];
  regions: string[];
}

interface RegionFilterProps {
  continents: string[];
  countries: string[];
  regions: string[];
  selectedContinents: string[];
  selectedCountries: string[];
  selectedRegions: string[];
  beaches: Beach[];
  windData: WindData | null;
  onContinentClick: (continent: string) => void;
  onCountryClick: (country: string) => void;
  onRegionClick: (region: any) => void;
  isPro?: boolean;
  initialSavedFilters?: SavedFilters | null;
  selectedRegion: Region;
  onRegionChange: (region: Region) => void;
}

function getPremiumBeachCount(
  beaches: Beach[],
  windData: WindData | null,
  filterType: "continent" | "country" | "region",
  value: string
): number {
  if (!windData) return 0;

  return beaches.filter(
    (beach) =>
      beach[filterType] === value &&
      isBeachSuitable(beach, windData).score === 4
  ).length;
}

async function saveFiltersToDb(filters: SavedFilters) {
  try {
    const response = await fetch("/api/user/filters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filters),
    });

    if (!response.ok) throw new Error("Failed to save filters");
    return await response.json();
  } catch (error) {
    console.error("Error saving filters:", error);
    throw error;
  }
}

const RegionFilter = memo(function RegionFilter({
  continents,
  countries,
  regions,
  selectedContinents,
  selectedCountries,
  selectedRegions,
  beaches,
  windData,
  onContinentClick,
  onCountryClick,
  onRegionClick,
  isPro = false,
  initialSavedFilters,
  selectedRegion,
  onRegionChange,
}: RegionFilterProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (isPro && initialSavedFilters) {
      initialSavedFilters.continents.forEach(onContinentClick);
      initialSavedFilters.countries.forEach(onCountryClick);
      initialSavedFilters.regions.forEach(onRegionClick);
    }
  }, [isPro, initialSavedFilters]);

  const handleSaveFilters = async () => {
    if (!session?.user) return;

    try {
      await saveFiltersToDb({
        continents: selectedContinents,
        countries: selectedCountries,
        regions: selectedRegions,
      });
      toast.success("Filters saved successfully");
    } catch (error) {
      toast.error("Failed to save filters");
    }
  };

  const renderSaveButton = () => {
    if (!isPro || !session?.user) return null;

    return (
      <button
        onClick={handleSaveFilters}
        className="ml-auto text-sm text-blue-600 hover:text-blue-800"
      >
        Save as Default
      </button>
    );
  };

  // Filter countries based on selected continents
  const visibleCountries = countries.filter((country) =>
    beaches.some(
      (beach) =>
        beach.country === country &&
        selectedContinents.includes(beach.continent)
    )
  );

  // Filter regions based on selected continents AND countries
  const visibleRegions = regions.filter((region) =>
    beaches.some(
      (beach) =>
        beach.region === region &&
        selectedCountries.includes(beach.country) &&
        selectedContinents.includes(beach.continent)
    )
  );

  const handleCountryClick = (country: string) => {
    const newCountries = selectedCountries.includes(country)
      ? selectedCountries.filter((c) => c !== country)
      : [...selectedCountries, country];

    // Clear any selected regions when changing countries
    if (!selectedCountries.includes(country)) {
      // If selecting a new country, clear existing regions
      selectedRegions.forEach((region) => onRegionClick(region));
    }

    onCountryClick(country);
  };

  return (
    <div className="space-y-4">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-semibold">Regions</h3>
        <ChevronDown
          className={`w-5 h-5 transition-transform ${isOpen ? "transform rotate-180" : ""}`}
        />
      </div>

      {isOpen && (
        <div className="space-y-4">
          {/* Top Divider */}
          <div className="h-px bg-gray-200 mb-4" />

          {/* Continents */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 flex-wrap">
            {continents.map((continent) => (
              <FilterButton
                key={continent}
                label={continent}
                count={getPremiumBeachCount(
                  beaches,
                  windData,
                  "continent",
                  continent
                )}
                isSelected={selectedContinents.includes(continent)}
                onClick={() => onContinentClick(continent)}
                variant="continent"
              />
            ))}
          </div>

          {/* Divider */}
          {visibleCountries.length > 0 && (
            <div className="h-px bg-gray-200 my-4" />
          )}

          {/* Countries */}
          {visibleCountries.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 flex-wrap">
              {visibleCountries.map((country) => (
                <FilterButton
                  key={country}
                  label={country}
                  count={getPremiumBeachCount(
                    beaches,
                    windData,
                    "country",
                    country
                  )}
                  isSelected={selectedCountries.includes(country)}
                  onClick={() => handleCountryClick(country)}
                  variant="country"
                />
              ))}
            </div>
          )}

          {/* Divider */}
          {visibleRegions.length > 0 && visibleCountries.length > 0 && (
            <div className="h-px bg-gray-200 my-4" />
          )}

          {/* Regions */}
          {visibleRegions.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 flex-wrap">
              {visibleRegions.map((region) => (
                <FilterButton
                  key={region}
                  label={region}
                  count={getPremiumBeachCount(
                    beaches,
                    windData,
                    "region",
                    region
                  )}
                  isSelected={selectedRegions.includes(region)}
                  onClick={() => onRegionClick(region)}
                  variant="region"
                />
              ))}
            </div>
          )}

          {renderSaveButton()}
        </div>
      )}
    </div>
  );
});

export default RegionFilter;
