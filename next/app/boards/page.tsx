"use client";

import { useState, useEffect } from "react";
import { BoardCard } from "@/app/components/boards/BoardCard";
import { RegionFilter } from "@/app/components/shared/RegionFilter";
import { SearchFilterSidebar } from "@/app/components/shared/SearchFilterSidebar";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/app/components/ui/Tabs";
import RippleLoader from "@/app/components/ui/RippleLoader";
import { Button } from "@/app/components/ui/Button";
import { CreateBoardForm } from "@/app/components/boards/CreateBoardForm";

type BoardWithRelations = any; // Using any temporarily for simplicity

export default function BoardsPage() {
  const [boards, setBoards] = useState<BoardWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [regions, setRegions] = useState([]);
  const [loadingRegions, setLoadingRegions] = useState(true);
  const [activeFilters, setActiveFilters] = useState({
    boardType: null,
    finType: null,
  });
  const [listingType, setListingType] = useState<"rent" | "sale">("rent");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filters = [
    {
      id: "boardType",
      name: "Board Type",
      options: [
        { value: "SHORTBOARD", label: "Shortboard" },
        { value: "LONGBOARD", label: "Longboard" },
        { value: "FISH", label: "Fish" },
        { value: "FUNBOARD", label: "Funboard" },
        { value: "SUP", label: "SUP" },
        { value: "GUN", label: "Gun" },
        { value: "MINI_MAL", label: "Mini Mal" },
      ],
    },
    {
      id: "finType",
      name: "Fin Setup",
      options: [
        { value: "THRUSTER", label: "Thruster" },
        { value: "TWIN", label: "Twin" },
        { value: "QUAD", label: "Quad" },
        { value: "SINGLE", label: "Single" },
        { value: "FIVE", label: "Five" },
        { value: "OTHER", label: "Other" },
      ],
    },
  ];

  useEffect(() => {
    fetchBoards();
    fetchRegionsWithBoards();
  }, [selectedRegion, activeFilters, listingType]);

  const fetchBoards = async () => {
    setLoading(true);
    try {
      let url = "/api/boards?";

      // Add listing type filter
      if (listingType === "rent") {
        url += "forRent=true";
      } else {
        url += "forSale=true";
      }

      // Add region filter
      if (selectedRegion) {
        url += `&region=${selectedRegion}`;
      }

      // Add board type filter
      if (activeFilters.boardType) {
        url += `&type=${activeFilters.boardType}`;
      }

      // Add fin type filter
      if (activeFilters.finType) {
        url += `&finSetup=${activeFilters.finType}`;
      }

      console.log("Fetching boards from URL:", url);

      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const response = await fetch(url, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        console.log("Response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          throw new Error(`Failed to fetch boards: ${errorText}`);
        }

        const data = await response.json();
        console.log("Fetched boards data:", data);

        if (!Array.isArray(data)) {
          console.error("Expected array of boards, got:", typeof data, data);
          setBoards([]);
        } else {
          console.log(`Successfully fetched ${data.length} boards`);
          setBoards(data);
        }
      } catch (error: any) {
        if (error.name === "AbortError") {
          console.error("Request timed out after 10 seconds");
        } else {
          console.error("Error fetching boards:", error);
        }
        setBoards([]);
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error("Outer error in fetchBoards:", error);
      setBoards([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegionsWithBoards = async () => {
    setLoadingRegions(true);
    try {
      let url = "/api/regions?";
      if (listingType === "rent") {
        url += "hasRentals=true";
      } else {
        url += "hasSales=true";
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch regions");
      const data = await response.json();
      setRegions(data);
    } catch (error) {
      console.error("Error fetching regions:", error);
    } finally {
      setLoadingRegions(false);
    }
  };

  const handleRegionChange = (region: string | null) => {
    setSelectedRegion(region);
  };

  const handleFilterChange = (filterId: string, value: string | null) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterId]: value,
    }));
  };

  const handleListingTypeChange = (value: string) => {
    setListingType(value as "rent" | "sale");
    // Reset filters when changing listing type
    setSelectedRegion(null);
  };

  return (
    <div className="flex min-h-screen font-primary">
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Surfboards</h1>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[var(--color-tertiary)] text-white"
          >
            Upload Board
          </Button>
        </div>

        {/* Create Board Modal */}
        <CreateBoardForm
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />

        {/* Listing Type Tabs */}
        <Tabs
          defaultValue="rent"
          className="mb-6"
          onValueChange={handleListingTypeChange}
        >
          <TabsList className="grid grid-cols-2 w-[300px] mb-4">
            <TabsTrigger value="rent">For Rent</TabsTrigger>
            <TabsTrigger value="sale">For Sale</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Region Filter Buttons */}
        <RegionFilter
          selectedRegion={selectedRegion}
          onRegionChange={handleRegionChange}
          regions={regions}
          isLoading={loadingRegions}
        />

        {/* Boards Grid */}
        {loading ? (
          <div className="flex justify-center py-10">
            <RippleLoader isLoading={true} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {boards.length > 0 ? (
              boards.map((board) => <BoardCard key={board.id} board={board} />)
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-gray-500 font-primary">
                  No boards available{" "}
                  {listingType === "rent" ? "for rent" : "for sale"} with the
                  selected filters.
                </p>
                <button
                  onClick={() => {
                    setSelectedRegion(null);
                    setActiveFilters({
                      boardType: null,
                      finType: null,
                    });
                  }}
                  className="mt-4 text-blue-600 hover:text-blue-800 font-primary"
                >
                  Clear filters
                </button>
              </div>
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
