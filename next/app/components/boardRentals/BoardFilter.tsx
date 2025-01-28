"use client";

import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { BoardType, FinType } from "@prisma/client";

interface BoardFilterProps {
  isOpen: boolean;
  onClose: () => void;
  onFilterChange: (filters: any) => void;
}

export function BoardFilter({ isOpen, onClose, onFilterChange }: BoardFilterProps) {
  const [filters, setFilters] = useState({
    type: "",
    finSetup: "",
    maxPrice: "",
    minLength: "",
    maxLength: "",
  });

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleReset = () => {
    setFilters({
      type: "",
      finSetup: "",
      maxPrice: "",
      minLength: "",
      maxLength: "",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-lg z-50 overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">Filter Boards</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Board Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Board Type</label>
            <select
              value={filters.type}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, type: e.target.value }))
              }
              className="w-full p-2 border rounded-md"
            >
              <option value="">All Types</option>
              {Object.values(BoardType).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Fin Setup */}
          <div>
            <label className="block text-sm font-medium mb-2">Fin Setup</label>
            <select
              value={filters.finSetup}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, finSetup: e.target.value }))
              }
              className="w-full p-2 border rounded-md"
            >
              <option value="">All Setups</option>
              {Object.values(FinType).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Max Price per Day ($)
            </label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))
              }
              className="w-full p-2 border rounded-md"
              placeholder="Max price"
              min="0"
            />
          </div>

          {/* Length Range */}
          <div>
            <label className="block text-sm font-medium mb-2">Length Range</label>
            <div className="flex gap-4">
              <input
                type="text"
                value={filters.minLength}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, minLength: e.target.value }))
                }
                className="w-1/2 p-2 border rounded-md"
                placeholder="Min (e.g., 6'0)"
              />
              <input
                type="text"
                value={filters.maxLength}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, maxLength: e.target.value }))
                }
                className="w-1/2 p-2 border rounded-md"
                placeholder="Max (e.g., 8'0)"
              />
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
}