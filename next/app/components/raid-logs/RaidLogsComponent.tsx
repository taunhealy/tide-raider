"use client";

import RaidLogTable from "@/app/components/raid-logs/RaidLogTable";
import { RaidLogFilter } from "@/app/components/raid-logs/RaidLogFilter";
import { RaidLogForm } from "@/app/components/raid-logs/RaidLogForm";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState, useCallback, useMemo } from "react";
import { LogVisibilityToggle } from "@/app/components/LogVisibilityToggle";
import { Button } from "@/app/components/ui/Button";
import Link from "next/link";
import type { Beach } from "@/app/types/beaches";

// Add filter config types similar to QuestLogs
type FilterConfig = {
  beaches: string[];
  minRating: number;
  dateRange: { start: string; end: string };
  isPrivate: boolean;
};

const defaultFilters: FilterConfig = {
  beaches: [],
  minRating: 0,
  dateRange: { start: "", end: "" },
  isPrivate: false,
};

interface RaidLogsComponentProps {
  beaches: Beach[];
  userId: string;
  initialFilters?: { isPrivate: boolean };
}

export const RaidLogsComponent: React.FC<RaidLogsComponentProps> = ({
  beaches,
  userId,
  initialFilters,
}) => {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterConfig>(defaultFilters);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const {
    data: logEntriesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["raidLogs", filters],
    queryFn: async () => {
      const res = await fetch(
        `/api/raid-logs?filters=${JSON.stringify(filters)}`
      );
      return res.json();
    },
  });

  const handleFilterChange = useCallback(
    (newFilters: Partial<FilterConfig>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
      // Update URL params similar to QuestLogs
      const params = new URLSearchParams(searchParams);
      if (newFilters.beaches)
        params.set("beaches", newFilters.beaches.join(","));
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const handlePrivateToggle = () => setIsPrivate((prev) => !prev);

  const filteredEntries = useMemo(() => {
    if (error) {
      console.error("Raid logs fetch error:", error);
      return [];
    }
    return logEntriesData?.entries || [];
  }, [logEntriesData?.entries, error]);

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] p-9 font-primary relative">
      <div className="max-w-[1600px] mx-auto relative z-10">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-9">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-6 w-full">
            <div className="w-full border-b border-gray-200 pb-3 mb-6">
              <h2 className="text-lg sm:text-xl font-semibold font-primary">
                Raid Sessions
              </h2>
            </div>
            <div className="flex gap-4 items-center">
              <LogVisibilityToggle
                isPrivate={isPrivate}
                onChange={handlePrivateToggle}
              />

              <Link href="/raidlogs/new">
                <Button size="sm">Create Log</Button>
              </Link>

              <Button
                onClick={() => setIsFilterOpen(true)}
                variant="outline"
                size="sm"
              >
                Filter
              </Button>
            </div>
          </div>

          {filteredEntries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                {isLoading
                  ? "Loading sessions..."
                  : error
                    ? "Error loading sessions"
                    : "No matching sessions found"}
              </p>
            </div>
          ) : (
            <RaidLogTable
              entries={filteredEntries}
              isSubscribed={session?.user?.isSubscribed}
              isLoading={isLoading}
              showPrivateOnly={isPrivate}
            />
          )}
        </div>
      </div>

      <RaidLogFilter
        beaches={beaches}
        selectedBeaches={filters.beaches}
        onFilterChange={handleFilterChange}
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />
      <RaidLogForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  );
};
