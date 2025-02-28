import { useState, useEffect } from "react";
import { BoardCard } from "../boards/BoardCard";
import { RegionFilter } from "../shared/RegionFilter";
import { SearchFilterSidebar } from "../shared/SearchFilterSidebar";
import { Board } from "@prisma/client";

interface RegionFilterProps {
  selectedRegion: string | null;
  onRegionChange: (region: string | null) => void;
  regions: any[]; // Update with proper type
  isLoading?: boolean;
}

// Use the same type that BoardCard expects
type BoardWithRelations = Board & {
  user?: {
    name: string;
    image?: string | null;
  };
  availableBeaches?: {
    beach: {
      name: string;
      region: {
        name: string;
      };
    };
  }[];
};

export function BoardsGrid() {
  const [boards, setBoards] = useState<BoardWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [regions, setRegions] = useState([]);
  const [loadingRegions, setLoadingRegions] = useState(true);
  const [activeFilters, setActiveFilters] = useState({
    boardType: null,
    finType: null,
  });

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
  }, [selectedRegion, activeFilters]);

  const fetchBoards = async () => {
    setLoading(true);
    try {
      let url = "/api/boards?forRent=true";

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

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch boards");
      const data = await response.json();
      setBoards(data);
    } catch (error) {
      console.error("Error fetching boards:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegionsWithBoards = async () => {
    setLoadingRegions(true);
    try {
      const response = await fetch("/api/regions?hasRentals=true");
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

  return (
    <div className="flex min-h-screen font-primary">
      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Surfboard Rentals</h1>

        {/* Region Filter Buttons */}
        <RegionFilter
          selectedRegion={selectedRegion}
          onRegionChange={handleRegionChange}
          regions={regions}
          isLoading={loadingRegions}
        />

        {/* Boards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-gray-100 rounded-lg h-64 animate-pulse"
              ></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {boards.length > 0 ? (
              boards.map((board) => <BoardCard key={board.id} board={board} />)
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-gray-500 font-primary">
                  No boards available for rent with the selected filters.
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
