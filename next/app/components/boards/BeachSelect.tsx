"use client";

import { Beach } from "@/app/types/beaches";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

interface BeachSelectProps {
  selectedBeaches: string[];
  onChange: (beaches: string[]) => void;
  label?: string;
  multiple?: boolean;
  boardId: string;
}

export function BeachSelect({
  selectedBeaches,
  onChange,
  label,
  multiple = false,
  boardId,
}: BeachSelectProps) {
  // Fetch connected beaches from the database
  const { data: connectedBeaches, isLoading } = useQuery({
    queryKey: ["connectedBeaches", boardId],
    queryFn: async () => {
      const response = await fetch(`/api/boards/${boardId}/beaches`);
      if (!response.ok) throw new Error("Failed to fetch connected beaches");
      return response.json();
    },
  });

  if (isLoading) {
    return <div className="animate-pulse h-40 bg-gray-100 rounded-lg" />;
  }

  if (!connectedBeaches?.length) {
    return (
      <div className="text-sm text-gray-500 font-primary">
        No beaches connected to this board
      </div>
    );
  }

  // Group beaches by country and region
  const beachHierarchy = connectedBeaches.reduce(
    (acc: Record<string, Record<string, Beach[]>>, beach: Beach) => {
      if (!acc[beach.country]) {
        acc[beach.country] = {};
      }
      if (!acc[beach.country][beach.region]) {
        acc[beach.country][beach.region] = [];
      }
      acc[beach.country][beach.region].push(beach);
      return acc;
    },
    {} as Record<string, Record<string, Beach[]>>
  );

  return (
    <div className="space-y-4">
      {label && (
        <label className="block text-sm font-medium font-primary">
          {label}
        </label>
      )}

      {/* Iterate through countries */}
      {Object.entries(beachHierarchy).map(([country, regions]) => (
        <div key={country} className="space-y-3">
          <h3 className="font-medium font-primary text-sm text-gray-700">
            {country}
          </h3>

          {/* Iterate through regions */}
          {Object.entries(regions as Record<string, Beach[]>).map(
            ([region, regionBeaches]) => (
              <div key={region} className="pl-4 space-y-2">
                <h4 className="font-primary text-sm text-gray-600">{region}</h4>

                {/* Beaches within region */}
                <div className="pl-4 grid grid-cols-1 gap-2">
                  {regionBeaches.map((beach) => (
                    <label
                      key={beach.id}
                      className={cn(
                        "flex items-center space-x-2 p-2 rounded-lg",
                        "hover:bg-gray-50 transition-colors cursor-pointer"
                      )}
                    >
                      <input
                        type={multiple ? "checkbox" : "radio"}
                        name="beach-select"
                        checked={selectedBeaches.includes(beach.id)}
                        onChange={(e) => {
                          if (multiple) {
                            onChange(
                              e.target.checked
                                ? [...selectedBeaches, beach.id]
                                : selectedBeaches.filter(
                                    (id) => id !== beach.id
                                  )
                            );
                          } else {
                            onChange([beach.id]);
                          }
                        }}
                        className="text-[var(--color-brand-primary)]"
                      />
                      <span className="font-primary text-sm">{beach.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      ))}
    </div>
  );
}
