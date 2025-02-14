"use client";

import { useState, useCallback } from "react";
import { X, ChevronDown } from "lucide-react";
import { cn } from "@/app/lib/utils";
import type { Beach } from "@/app/types/beaches";

interface RaidLogFilterProps {
  beaches: Beach[];
  selectedBeaches: string[];
  onFilterChange: (filters: { beaches: string[] }) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function RaidLogFilter({
  beaches,
  selectedBeaches = [],
  onFilterChange,
  isOpen,
  onClose,
}: RaidLogFilterProps) {
  const [beachSearch, setBeachSearch] = useState("");
  const [isBeachOpen, setIsBeachOpen] = useState(false);

  const handleBeachToggle = useCallback(
    (beachName: string) => {
      const newBeaches = selectedBeaches.includes(beachName)
        ? selectedBeaches.filter((b) => b !== beachName)
        : [...selectedBeaches, beachName];
      onFilterChange({ beaches: newBeaches });
    },
    [selectedBeaches, onFilterChange]
  );

  const filteredBeaches = beaches.filter((beach) =>
    beach.name.toLowerCase().includes(beachSearch.toLowerCase())
  );

  return (
    <div
      className={cn(
        "fixed top-0 right-0 h-full w-[360px] bg-white transform transition-transform duration-300 ease-in-out z-50 shadow-lg",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {/* Filter content from QuestLogFilter */}
      <div className="flex justify-between items-center p-6 border-b">
        <h2 className="text-lg font-semibold">Filter Raids</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-70px)]">
        {/* Beach filter section */}
        <div className="relative">
          <button
            onClick={() => setIsBeachOpen(!isBeachOpen)}
            className="w-full flex justify-between items-center p-2 border rounded-md hover:bg-gray-50"
          >
            <span>Beaches ({selectedBeaches.length})</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${isBeachOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isBeachOpen && (
            <div className="absolute z-10 w-full mt-2 bg-white border rounded-md shadow-lg">
              <div className="p-2">
                <input
                  type="text"
                  placeholder="Search beaches..."
                  value={beachSearch}
                  onChange={(e) => setBeachSearch(e.target.value)}
                  className="w-full p-2 mb-2 border rounded-md"
                />
                <div className="max-h-60 overflow-y-auto">
                  {filteredBeaches.map((beach) => (
                    <label
                      key={beach.id}
                      className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedBeaches.includes(beach.name)}
                        onChange={() => handleBeachToggle(beach.name)}
                        className="mr-2"
                      />
                      <span className="text-sm">{beach.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Selected beaches display */}
        {selectedBeaches.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Selected Beaches</h3>
            <div className="flex flex-wrap gap-2">
              {selectedBeaches.map((beach) => (
                <div
                  key={beach}
                  className="flex items-center bg-gray-100 px-3 py-1 rounded-md text-sm"
                >
                  {beach}
                  <button
                    onClick={() => handleBeachToggle(beach)}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}
