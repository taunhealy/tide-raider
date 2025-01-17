import { useState, useEffect } from "react";
import type { Beach, Region } from "@/app/types/beaches";
import "@/styles/filters.css";
import {
  INITIAL_FILTERS,
  MAX_DISTANCE,
  WAVE_TYPE_ICONS,
  WaveType,
  DEFAULT_PROFILE_IMAGE,
} from "@/app/lib/constants";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

type FilterType = {
  continent: string[];
  country: string[];
  waveType: string[];
  difficulty: string[];
  region: Region[];
  crimeLevel: string[];
  minPoints: number;
  sharkAttack: string[];
  minDistance: number;
  maxDistance: number;
  maxWaveHeight: number;
};

interface SidebarFilterProps {
  beaches: Beach[];
  minPoints: number;
  onMinPointsChange: (value: number) => void;
  onFilterChange: (filters: FilterType) => void;
  filters: FilterType;
}

export default function SidebarFilter({
  beaches,
  onFilterChange,
  minPoints,
  onMinPointsChange,
  filters,
}: SidebarFilterProps) {
  const FILTERS_STORAGE_KEY = "surfspot_filters";

  const updateFilters = (key: keyof typeof INITIAL_FILTERS, value: any) => {
    const newFilters = { ...filters, [key]: value };
    onFilterChange(newFilters);
  };

  // Get unique wave types from beach data
  const waveTypes = [...new Set(beaches.map((beach) => beach.waveType))];

  // First, get unique regions from beaches data
  const uniqueRegions = Array.from(
    new Set(beaches.map((beach) => beach.region))
  ).sort() as Region[];

  const handleFilterChange = (newFilters: FilterType) => {
    console.log("Filter change:", newFilters);
    let filteredBeaches = [...beaches];

    // Apply region filter
    if (newFilters.region.length > 0) {
      filteredBeaches = filteredBeaches.filter((beach) =>
        newFilters.region.includes(beach.region)
      );
    }

    // Apply difficulty filter
    if (newFilters.difficulty.length > 0) {
      filteredBeaches = filteredBeaches.filter((beach) =>
        newFilters.difficulty.includes(beach.difficulty)
      );
    }

    // Apply crime level filter
    if (newFilters.crimeLevel.length > 0) {
      filteredBeaches = filteredBeaches.filter((beach) =>
        newFilters.crimeLevel.includes(beach.crimeLevel)
      );
    }

    // Apply distance filter
    filteredBeaches = filteredBeaches.filter(
      (beach) =>
        beach.distanceFromCT >= newFilters.minDistance &&
        beach.distanceFromCT <= newFilters.maxDistance
    );

    // Apply wave type filter
    if (newFilters.waveType.length > 0) {
      filteredBeaches = filteredBeaches.filter((beach) =>
        newFilters.waveType.includes(beach.waveType)
      );
    }

    // Apply wave height filter
    filteredBeaches = filteredBeaches.filter(
      (beach) => beach.swellSize.max <= newFilters.maxWaveHeight
    );

    // Apply shark attack filter
    if (newFilters.sharkAttack.length > 0) {
      console.log("Filtering for shark attacks");
      filteredBeaches = filteredBeaches.filter((beach) => {
        console.log(`${beach.name}: ${beach.sharkAttack.hasAttack}`);
        return beach.sharkAttack.hasAttack === true;
      });
    }

    console.log("Filtered beaches count:", filteredBeaches.length); // Debug log
    onFilterChange(newFilters);
  };

  useEffect(() => {
    console.log(
      "Beaches with shark attacks:",
      beaches
        .filter((beach) => beach.sharkAttack.hasAttack)
        .map((beach) => beach.name)
    );
  }, [beaches]);

  const [isRegionOpen, setIsRegionOpen] = useState(false);

  return (
    <div className="p-9 bg-[var(--color-bg-secondary)] rounded-lg">
      {/* Region Selection Filter */}
      <div className="filter-section">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsRegionOpen(!isRegionOpen)}
        >
          <h5 className="filter-heading">Region</h5>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${isRegionOpen ? "transform rotate-180" : ""}`}
          />
        </div>

        {isRegionOpen && (
          <div>
            {uniqueRegions.map((region) => (
              <label key={region} className="filter-option">
                <input
                  type="checkbox"
                  className="filter-checkbox"
                  checked={filters.region.includes(region)}
                  onChange={(e) => {
                    const newRegions = e.target.checked
                      ? [...filters.region, region]
                      : filters.region.filter((r) => r !== region);
                    updateFilters("region", newRegions);
                  }}
                />
                {region}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Difficulty Level Filter */}
      <div className="filter-section">
        <h5 className="filter-heading">Difficulty</h5>
        {["Beginner", "Intermediate", "Advanced"].map((level) => (
          <label key={level} className="filter-option">
            <input
              type="checkbox"
              className="filter-checkbox"
              checked={filters.difficulty.includes(level)}
              onChange={(e) => {
                const newDifficulty = e.target.checked
                  ? [...filters.difficulty, level]
                  : filters.difficulty.filter((d) => d !== level);
                updateFilters("difficulty", newDifficulty);
              }}
            />
            {level}
          </label>
        ))}
      </div>

      {/* Crime Level Filter */}
      <div className="filter-section">
        <h5 className="filter-heading">Crime Level</h5>
        {["Low", "Medium", "High"].map((level) => (
          <label key={level} className="filter-option">
            <input
              type="checkbox"
              className="filter-checkbox"
              checked={filters.crimeLevel.includes(level)}
              onChange={(e) => {
                const newCrimeLevels = e.target.checked
                  ? [...filters.crimeLevel, level]
                  : filters.crimeLevel.filter((l) => l !== level);
                updateFilters("crimeLevel", newCrimeLevels);
              }}
            />
            {level}
          </label>
        ))}
      </div>

      {/* Shark Attack History Filter */}
      <div className="filter-section">
        <h5 className="filter-heading">Shark Attacks</h5>
        <label className="filter-option">
          <input
            type="checkbox"
            className="filter-checkbox"
            checked={filters.sharkAttack.includes("true")}
            onChange={(e) => {
              const newSharkAttacks = e.target.checked ? ["true"] : [];
              updateFilters("sharkAttack", newSharkAttacks);
            }}
          />
          Reported Attacks
        </label>
      </div>

      {/* Distance Range Filter */}
      <div className="filter-section">
        <h5 className="filter-heading">Distance from CT</h5>
        <div className="relative w-full py-2.5">
          <div className="flex justify-between mb-1.5 text-[var(--color-text-secondary)] text-sm">
            <span>{filters.minDistance}km</span>
            <span>{filters.maxDistance}km</span>
          </div>
          <input
            type="range"
            className="w-full absolute left-0 pointer-events-none appearance-none opacity-50 hover:opacity-100 bg-[var(--color-bg-secondary)]
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                     [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--color-bg-tertiary)] 
                     [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto
                     [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full 
                     [&::-moz-range-thumb]:bg-[var(--color-bg-tertiary)] [&::-moz-range-thumb]:cursor-pointer 
                     [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:pointer-events-auto"
            min="0"
            max={MAX_DISTANCE}
            value={filters.minDistance}
            onChange={(e) =>
              updateFilters("minDistance", parseInt(e.target.value))
            }
          />
          <input
            type="range"
            className="w-full absolute left-0 pointer-events-none appearance-none opacity-50 hover:opacity-100 bg-[var(--color-bg-secondary)]
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                     [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--color-bg-tertiary)] 
                     [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto
                     [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full 
                     [&::-moz-range-thumb]:bg-[var(--color-bg-tertiary)] [&::-moz-range-thumb]:cursor-pointer 
                     [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:pointer-events-auto"
            min="0"
            max={MAX_DISTANCE}
            value={filters.maxDistance}
            onChange={(e) =>
              updateFilters("maxDistance", parseInt(e.target.value))
            }
          />
        </div>
      </div>

      {/* Wave Type Filter */}
      <div className="filter-section">
        <h5 className="filter-heading">Wave Type</h5>
        <div className="flex flex-wrap gap-3">
          {waveTypes.map((waveType) => (
            <button
              key={waveType}
              onClick={() => {
                const newWaveTypes = filters.waveType.includes(waveType)
                  ? filters.waveType.filter((t) => t !== waveType)
                  : [...filters.waveType, waveType];
                updateFilters("waveType", newWaveTypes);
              }}
              className={`
                relative aspect-square w-[54px] rounded-lg overflow-hidden cursor-pointer
                hover:opacity-90 transition-opacity duration-300
                ${
                  filters.waveType.includes(waveType)
                    ? "ring-2 ring-[var(--color-bg-tertiary)]"
                    : "border border-gray-200"
                }
              `}
            >
              <Image
                src={
                  WAVE_TYPE_ICONS[waveType as WaveType] ?? DEFAULT_PROFILE_IMAGE
                }
                alt={`${waveType} icon`}
                fill
                className="object-cover"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                {/* Black base overlay */}
                <div className="absolute inset-0 bg-black opacity-30"></div>
                {/* Blue brand overlay */}
                <div className="absolute inset-0 bg-black opacity-30"></div>
                {/* Text */}
                <span className="relative z-10 text-white text-sm font-medium px-2 text-center">
                  {waveType}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
