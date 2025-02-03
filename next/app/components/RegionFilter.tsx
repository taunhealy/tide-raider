"use client";

import { Beach } from "@/app/types/beaches";
import { WindData } from "@/app/types/wind";
import { FilterButton } from "@/app/components/ui/FilterButton";
import { useEffect, useState, memo } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";
import { Region } from "@/app/types/beaches";

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
  onRegionChange: (region: string) => void;
  getGoodBeachCount: (region: string) => Promise<number>;
  BeachCountBadge: ({
    region,
    allWindData,
    beaches,
  }: {
    region: string;
    allWindData: any;
    beaches: Beach[];
  }) => JSX.Element | null;
  allWindData?: any;
  isLoading?: boolean;
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
  getGoodBeachCount,
  BeachCountBadge,
  allWindData,
  onRegionChange,
}: RegionFilterProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(true);
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    if (isPro && initialSavedFilters) {
      initialSavedFilters.continents.forEach(onContinentClick);
      initialSavedFilters.countries.forEach(onCountryClick);
      initialSavedFilters.regions.forEach(onRegionClick);
    }
  }, [isPro, initialSavedFilters]);

  useEffect(() => {
    getGoodBeachCount(selectedRegion).then(setCount);
  }, [selectedRegion, getGoodBeachCount]);

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
        className="px-4 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-900 hover:bg-gray-50 transition-colors"
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

  const handleRegionClick = (region: string) => {
    onRegionClick(region);
    onRegionChange(region);
  };

  return (
    <div className="space-y-4">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h6 className="heading-6">Regions</h6>
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
            {continents.map((continent) => {
              return (
                <FilterButton
                  key={continent}
                  label={continent}
                  isSelected={selectedContinents.includes(continent)}
                  onClick={() => onContinentClick(continent)}
                  variant="continent"
                />
              );
            })}
          </div>

          {/* Divider */}
          {visibleCountries.length > 0 && (
            <div className="h-px bg-gray-200 my-4" />
          )}

          {/* Countries */}
          {visibleCountries.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 flex-wrap">
              {visibleCountries.map((country) => {
                return (
                  <FilterButton
                    key={country}
                    label={country}
                    isSelected={selectedCountries.includes(country)}
                    onClick={() => handleCountryClick(country)}
                    variant="country"
                  />
                );
              })}
            </div>
          )}

          {/* Divider */}
          {visibleRegions.length > 0 && visibleCountries.length > 0 && (
            <div className="h-px bg-gray-200 my-4 heading-6" />
          )}

          {/* Regions */}
          {visibleRegions.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 flex-wrap">
              {visibleRegions.map((region) => {
                return (
                  <FilterButton
                    key={region}
                    label={region}
                    isSelected={selectedRegions.includes(region)}
                    onClick={() => handleRegionClick(region)}
                    variant="region"
                  />
                );
              })}
            </div>
          )}

          {renderSaveButton()}
        </div>
      )}
    </div>
  );
});

export default RegionFilter;
