"use client ";

import { useState, useEffect } from "react";
import { cn } from "@/app/lib/utils";
import { Inter } from "next/font/google";
import { FilterButton } from "./ui/FilterButton";
import { LogEntry } from "../types/logbook";
import { Waves } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

interface LogbookRegionFilterProps {
  entries: LogEntry[];
  onFilterChange: (filters: RegionFilters) => void;
  selectedFilters: RegionFilters;
}

interface RegionFilters {
  continents: string[];
  countries: string[];
  regions: string[];
  waveTypes: string[];
  beaches: string[];
}

export function LogbookRegionFilter({
  entries,
  onFilterChange,
  selectedFilters,
}: LogbookRegionFilterProps) {
  // Extract unique values from entries
  const uniqueContinents = [
    ...new Set(entries.map((entry) => entry.beach?.continent).filter(Boolean)),
  ].sort();
  const uniqueCountries = [
    ...new Set(entries.map((entry) => entry.beach?.country).filter(Boolean)),
  ].sort();
  const uniqueRegions = [
    ...new Set(entries.map((entry) => entry.beach?.region).filter(Boolean)),
  ].sort();
  const uniqueBeaches = [
    ...new Set(entries.map((entry) => entry.beachName).filter(Boolean)),
  ].sort();

  // Update filters and apply filtering
  const updateFilters = (key: keyof RegionFilters, value: string[]) => {
    onFilterChange({
      ...selectedFilters,
      [key]: value.filter((v): v is string => v !== undefined),
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      {uniqueContinents.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3">Continent</h3>
          <div className="flex flex-wrap gap-2">
            {uniqueContinents.map((continent) => (
              <FilterButton
                key={continent}
                label={continent}
                isSelected={selectedFilters.continents.includes(continent)}
                onClick={() => {
                  updateFilters(
                    "continents",
                    selectedFilters.continents.includes(continent)
                      ? selectedFilters.continents.filter(
                          (c) => c !== continent
                        )
                      : [...selectedFilters.continents, continent]
                  );
                }}
              />
            ))}
          </div>
        </div>
      )}

      {uniqueCountries.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3">Country</h3>
          <div className="flex flex-wrap gap-2">
            {uniqueCountries.map((country) => (
              <FilterButton
                key={country}
                label={country}
                isSelected={selectedFilters.countries.includes(country)}
                onClick={() => {
                  updateFilters(
                    "countries",
                    selectedFilters.countries.includes(country)
                      ? selectedFilters.countries.filter((c) => c !== country)
                      : [...selectedFilters.countries, country]
                  );
                }}
              />
            ))}
          </div>
        </div>
      )}

      {uniqueRegions.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3">Region</h3>
          <div className="flex flex-wrap gap-2">
            {uniqueRegions.map((region) => (
              <FilterButton
                key={region}
                label={region}
                isSelected={selectedFilters.regions.includes(region)}
                onClick={() => {
                  updateFilters(
                    "regions",
                    selectedFilters.regions.includes(region)
                      ? selectedFilters.regions.filter((r) => r !== region)
                      : [...selectedFilters.regions, region]
                  );
                }}
              />
            ))}
          </div>
        </div>
      )}

      {uniqueBeaches.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3">Beaches</h3>
          <div className="flex flex-wrap gap-2">
            {uniqueBeaches.map((beach) => (
              <FilterButton
                key={beach}
                label={beach}
                isSelected={selectedFilters.beaches.includes(beach)}
                onClick={() => {
                  updateFilters(
                    "beaches",
                    selectedFilters.beaches.includes(beach)
                      ? selectedFilters.beaches.filter((b) => b !== beach)
                      : [...selectedFilters.beaches, beach]
                  );
                }}
              />
            ))}
          </div>
        </div>
      )}

      {uniqueContinents.length === 0 &&
        uniqueCountries.length === 0 &&
        uniqueRegions.length === 0 &&
        uniqueBeaches.length === 0 && (
          <div className="text-gray-500 text-sm text-center py-4">
            No location data available for filtering
          </div>
        )}
    </div>
  );
}
