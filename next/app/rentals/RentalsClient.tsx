"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { RentalItemCard } from "@/app/components/rentals/RentalItemCard";
import { RegionFilter } from "@/app/components/shared/RegionFilter";
import { SearchFilterSidebar } from "@/app/components/shared/SearchFilterSidebar";
import RippleLoader from "@/app/components/ui/RippleLoader";
import { Button } from "@/app/components/ui/Button";
import { RentalItemWithRelations } from "@/app/types/rentals";
import { cn } from "@/app/lib/utils";
import {
  LocationFilter,
  LocationFilterType,
} from "@/app/components/rentals/LocationFilter";

type Region = {
  id: string;
  name: string;
};

type SessionType = {
  user?: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
  };
} | null;

export default function RentalsClient({
  initialRentalItems,
  initialRegions,
  session,
}: {
  initialRentalItems: RentalItemWithRelations[];
  initialRegions: Region[];
  session: SessionType;
}) {
  const [rentalItems, setRentalItems] = useState(initialRentalItems || []);
  const [loading, setLoading] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [regions] = useState(initialRegions || []);
  const [activeFilters, setActiveFilters] = useState({
    itemType: null,
  });
  const [locationFilters, setLocationFilters] = useState<LocationFilterType>({
    continent: null,
    country: null,
    region: null,
    beach: null,
  });

  const filters = [
    {
      id: "itemType",
      name: "Item Type",
      options: [
        { value: "SURFBOARD", label: "Surfboard" },
        { value: "MOTORBIKE", label: "Motorbike" },
        { value: "SCOOTER", label: "Scooter" },
      ],
    },
  ];

  useEffect(() => {
    // Only run the fetch when filters change
    if (
      selectedRegion ||
      activeFilters.itemType ||
      locationFilters.continent ||
      locationFilters.country ||
      locationFilters.region ||
      locationFilters.beach
    ) {
      fetchFilteredRentalItems();
    }
  }, [selectedRegion, activeFilters, locationFilters, initialRentalItems]);

  const fetchFilteredRentalItems = async () => {
    setLoading(true);
    try {
      let url = "/api/rental-items?";
      let params = [];

      // Add region filter
      if (selectedRegion) {
        // Find the region ID from the name
        const region = regions.find((r) => r.name === selectedRegion);
        if (region) {
          params.push(`regionId=${region.id}`);
        }
      }

      // Add item type filter
      if (activeFilters.itemType) {
        params.push(`itemType=${activeFilters.itemType}`);
      }

      // Add location filters
      if (locationFilters.continent) {
        params.push(`continent=${locationFilters.continent}`);
      }
      if (locationFilters.country) {
        params.push(`country=${locationFilters.country}`);
      }
      if (locationFilters.region) {
        params.push(`region=${locationFilters.region}`);
      }
      if (locationFilters.beach) {
        params.push(`beach=${locationFilters.beach}`);
      }

      url += params.join("&");
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch filtered rental items");
      }

      const data = await response.json();
      setRentalItems(data);
    } catch (error) {
      console.error("Error filtering rental items:", error);
      // If API fails, fall back to client-side filtering
      let filteredItems = [...initialRentalItems];

      if (selectedRegion) {
        filteredItems = filteredItems.filter((item) =>
          item.availableBeaches.some(
            (ab) => ab.beach.region.name === selectedRegion
          )
        );
      }

      if (activeFilters.itemType) {
        filteredItems = filteredItems.filter(
          (item) => item.itemType === activeFilters.itemType
        );
      }

      // Apply location filters
      if (locationFilters.continent) {
        filteredItems = filteredItems.filter((item) =>
          item.availableBeaches.some(
            (ab) => ab.beach.region.continent === locationFilters.continent
          )
        );
      }
      if (locationFilters.country) {
        filteredItems = filteredItems.filter((item) =>
          item.availableBeaches.some(
            (ab) => ab.beach.region.country === locationFilters.country
          )
        );
      }
      if (locationFilters.region) {
        filteredItems = filteredItems.filter((item) =>
          item.availableBeaches.some(
            (ab) => ab.beach.region.name === locationFilters.region
          )
        );
      }
      if (locationFilters.beach) {
        filteredItems = filteredItems.filter((item) =>
          item.availableBeaches.some(
            (ab) => ab.beach.name === locationFilters.beach
          )
        );
      }

      setRentalItems(filteredItems);
    } finally {
      setLoading(false);
    }
  };

  const handleRegionChange = (region: string | null) => {
    setSelectedRegion(region);
    setLocationFilters((prev) => ({ ...prev, region }));

    if (!region && !activeFilters.itemType && !hasActiveLocationFilters()) {
      // Reset to initial data if no filters selected
      setRentalItems(initialRentalItems);
    }
  };

  const handleLocationFilterChange = (
    type: keyof LocationFilterType,
    value: string | null
  ) => {
    setLocationFilters((prev) => {
      const newFilters = { ...prev, [type]: value };

      // Clear more specific filters when selecting a broader filter
      if (type === "continent") {
        newFilters.country = null;
        newFilters.region = null;
        newFilters.beach = null;
      } else if (type === "country") {
        newFilters.region = null;
        newFilters.beach = null;
      } else if (type === "region") {
        newFilters.beach = null;
      }

      return newFilters;
    });

    if (
      !value &&
      !selectedRegion &&
      !activeFilters.itemType &&
      !hasActiveLocationFilters(type)
    ) {
      // Reset to initial data if no filters selected
      setRentalItems(initialRentalItems);
    }
  };

  const hasActiveLocationFilters = (excludeType?: keyof LocationFilterType) => {
    return Object.entries(locationFilters)
      .filter(([key]) => key !== excludeType)
      .some(([_, value]) => value !== null);
  };

  const handleFilterChange = (filterId: string, value: string | null) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterId]: value,
    }));

    if (!value && !selectedRegion && !hasActiveLocationFilters()) {
      // Reset to initial data if no filters selected
      setRentalItems(initialRentalItems);
    }
  };

  const clearAllFilters = () => {
    setSelectedRegion(null);
    setActiveFilters({
      itemType: null,
    });
    setLocationFilters({
      continent: null,
      country: null,
      region: null,
      beach: null,
    });
    setRentalItems(initialRentalItems);
  };

  // Group items by type for display
  const surfboards = rentalItems.filter(
    (item) => item.itemType === "SURFBOARD"
  );
  const motorbikes = rentalItems.filter(
    (item) => item.itemType === "MOTORBIKE"
  );
  const scooters = rentalItems.filter((item) => item.itemType === "SCOOTER");

  return (
    <div className="flex min-h-screen font-primary">
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Rentals</h1>
          {session ? (
            <Link href="/rentals/new">
              <Button className="bg-[var(--color-tertiary)] text-white">
                List Your Item
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button className="bg-[var(--color-tertiary)] text-white">
                Sign In to List Items
              </Button>
            </Link>
          )}
        </div>

        {/* Location Filter Component */}
        <LocationFilter
          locationFilters={locationFilters}
          onLocationFilterChange={handleLocationFilterChange}
          initialRentalItems={rentalItems}
          onClearFilters={clearAllFilters}
          hasOtherActiveFilters={!!activeFilters.itemType}
        />

        {/* Rental Items Grid */}
        {loading ? (
          <div className="flex justify-center py-10">
            <RippleLoader isLoading={true} />
          </div>
        ) : (
          <div className="mt-6">
            {activeFilters.itemType ? (
              // Show filtered items
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rentalItems.length > 0 ? (
                  rentalItems.map((item) => (
                    <RentalItemCard key={item.id} item={item} />
                  ))
                ) : (
                  <div className="col-span-3 text-center py-12">
                    <p className="text-gray-500">
                      No rental items available with the selected filters.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedRegion(null);
                        setActiveFilters({
                          itemType: null,
                        });
                        setRentalItems(initialRentalItems);
                      }}
                      className="mt-4 text-blue-600 hover:text-blue-800"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Show categorized items
              <>
                {surfboards.length > 0 && (
                  <section className="mb-12">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-semibold">Surfboards</h2>
                      <button
                        onClick={() =>
                          handleFilterChange("itemType", "SURFBOARD")
                        }
                        className="text-blue-600 hover:underline"
                      >
                        View All
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {surfboards.slice(0, 6).map((item) => (
                        <RentalItemCard key={item.id} item={item} />
                      ))}
                    </div>
                  </section>
                )}

                {motorbikes.length > 0 && (
                  <section className="mb-12">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-semibold">Motorbikes</h2>
                      <button
                        onClick={() =>
                          handleFilterChange("itemType", "MOTORBIKE")
                        }
                        className="text-blue-600 hover:underline"
                      >
                        View All
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {motorbikes.slice(0, 6).map((item) => (
                        <RentalItemCard key={item.id} item={item} />
                      ))}
                    </div>
                  </section>
                )}

                {scooters.length > 0 && (
                  <section className="mb-12">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-semibold">Scooters</h2>
                      <button
                        onClick={() =>
                          handleFilterChange("itemType", "SCOOTER")
                        }
                        className="text-blue-600 hover:underline"
                      >
                        View All
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {scooters.slice(0, 6).map((item) => (
                        <RentalItemCard key={item.id} item={item} />
                      ))}
                    </div>
                  </section>
                )}

                {rentalItems.length === 0 && (
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-semibold mb-4">
                      No rental items available
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Be the first to list your item for rent!
                    </p>
                    {session ? (
                      <Link href="/rentals/new">
                        <Button className="bg-[var(--color-tertiary)] text-white">
                          List Your Item
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/login">
                        <Button className="bg-[var(--color-tertiary)] text-white">
                          Sign In to List Items
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <SearchFilterSidebar
        filters={filters}
        onFilterChange={handleFilterChange}
        activeFilters={activeFilters}
      />
    </div>
  );
}
