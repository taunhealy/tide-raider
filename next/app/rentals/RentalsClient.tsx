"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Session } from "next-auth";
import { ITEM_CATEGORIES } from "@/app/lib/rentals/constants";

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

interface RentalsClientProps {
  initialRentalItems: RentalItemWithRelations[];
  initialRegions: { id: string; name: string }[];
  session: Session | null;
  itemCategories: { value: string; label: string }[];
}

export default function RentalsClient({
  initialRentalItems,
  initialRegions,
  session,
  itemCategories,
}: RentalsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [rentalItems, setRentalItems] = useState(initialRentalItems || []);
  const [loading, setLoading] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(
    searchParams.get("region")
  );
  const [regions] = useState(initialRegions || []);
  const [activeFilters, setActiveFilters] = useState({
    itemType: searchParams.get("itemType"),
  });
  const [locationFilters, setLocationFilters] = useState<LocationFilterType>({
    continent: searchParams.get("continent"),
    country: searchParams.get("country"),
    region: searchParams.get("region"),
    beach: searchParams.get("beach"),
  });

  const filters = [
    {
      id: "itemType",
      name: "Item Type",
      options: itemCategories,
    },
  ];

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (activeFilters.itemType) {
      params.set("itemType", activeFilters.itemType);
    }

    if (locationFilters.continent) {
      params.set("continent", locationFilters.continent);
    }

    if (locationFilters.country) {
      params.set("country", locationFilters.country);
    }

    if (locationFilters.region) {
      params.set("region", locationFilters.region);
    }

    if (locationFilters.beach) {
      params.set("beach", locationFilters.beach);
    }

    // Update URL without refreshing the page
    const url = params.toString() ? `?${params.toString()}` : "/rentals";
    router.push(url, { scroll: false });
  }, [activeFilters, locationFilters, router]);

  // Fetch filtered items when filters change
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
    } else {
      // Reset to initial data if no filters selected
      setRentalItems(initialRentalItems);
    }
  }, [selectedRegion, activeFilters, locationFilters]);

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

    // Clear URL params and reset to initial data
    router.push("/rentals", { scroll: false });
    setRentalItems(initialRentalItems);
  };

  return (
    <div className="flex min-h-screen font-primary">
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Rentals</h1>
          {session ? (
            <Link href="/rentals/new">
              <Button variant="outline">List Your Item</Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button variant="outline">Sign In to List Items</Button>
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
                      onClick={clearAllFilters}
                      className="mt-4 text-black hover:text-gray-700"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Show categorized items dynamically
              <>
                {ITEM_CATEGORIES.map((category) => {
                  const categoryItems = rentalItems.filter(
                    (item) => item.itemType === category
                  );

                  if (categoryItems.length === 0) return null;

                  // Format category name for display (e.g., STAND_UP_PADDLE -> Stand Up Paddle)
                  const displayName = category
                    .split("_")
                    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
                    .join(" ");

                  return (
                    <section key={category} className="mb-12">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold">
                          {displayName}s
                        </h2>
                        <button
                          onClick={() =>
                            handleFilterChange("itemType", category)
                          }
                          className="text-black hover:underline"
                        >
                          View All
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categoryItems.map((item) => (
                          <RentalItemCard key={item.id} item={item} />
                        ))}
                      </div>
                    </section>
                  );
                })}

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
                        <Button variant="outline">List Your Item</Button>
                      </Link>
                    ) : (
                      <Link href="/login">
                        <Button variant="outline">Sign In to List Items</Button>
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
