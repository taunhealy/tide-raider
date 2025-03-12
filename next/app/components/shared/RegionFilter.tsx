import { useState, useEffect } from "react";

interface RegionFilterProps {
  selectedRegion: string | null;
  onRegionChange: (region: string | null) => void;
  regions?: Array<{ id: string; name: string }>;
  isLoading?: boolean;
}

export function RegionFilter({
  selectedRegion,
  onRegionChange,
  regions: passedRegions,
  isLoading: passedLoading,
}: RegionFilterProps) {
  const [regions, setRegions] = useState<Array<{ id: string; name: string }>>(
    passedRegions || []
  );
  const [loading, setLoading] = useState<boolean>(passedLoading || true);

  useEffect(() => {
    // If regions are passed as props, use those
    if (passedRegions) {
      setRegions(passedRegions);
      setLoading(false);
    } else {
      // Otherwise fetch regions from API
      async function fetchRegions() {
        try {
          const response = await fetch("/api/regions");
          if (!response.ok) throw new Error("Failed to fetch regions");
          const data = await response.json();
          setRegions(data);
        } catch (error) {
          console.error("Error fetching regions:", error);
        } finally {
          setLoading(false);
        }
      }

      fetchRegions();
    }
  }, [passedRegions, passedLoading]);

  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-auto py-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-8 w-24 bg-gray-200 rounded-full animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 py-2 font-primary">
      <button
        onClick={() => onRegionChange(null)}
        className={`px-4 py-1 rounded-full text-sm transition-colors ${
          selectedRegion === null
            ? "bg-blue-600 text-white"
            : "bg-gray-100 hover:bg-gray-200 text-gray-800"
        }`}
      >
        All Regions
      </button>

      {regions.map((region) => (
        <button
          key={region.id}
          onClick={() => onRegionChange(region.id)}
          className={`px-4 py-1 rounded-full text-sm transition-colors ${
            selectedRegion === region.id
              ? "bg-black text-white"
              : "bg-gray-100 hover:bg-gray-200 text-gray-800"
          }`}
        >
          {region.name}
        </button>
      ))}
    </div>
  );
}
