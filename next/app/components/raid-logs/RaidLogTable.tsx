"use client";

import { QuestLogTableColumn, LogEntry } from "@/app/types/questlogs";

import { format } from "date-fns";
import { Star, Pencil, X } from "lucide-react";
import { cn } from "@/app/lib/utils";
import {
  getWindEmoji,
  getSwellEmoji,
  getDirectionEmoji,
  degreesToCardinal,
} from "@/app/lib/forecastUtils";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ForecastData } from "@/types/wind";
import Link from "next/link";
import BeachDetailsModal from "@/app/components/BeachDetailsModal";
import { beachData, type Beach } from "@/app/types/beaches";

interface QuestTableProps {
  entries: LogEntry[];
  columns?: QuestLogTableColumn[];
  isSubscribed?: boolean;
  isLoading?: boolean;
  showPrivateOnly?: boolean;
  onFilterChange?: () => void;
  onBeachClick: (beachName: string) => void;
  nationality?: string;
}

interface LogEntryDisplayProps {
  entry: LogEntry;
  isAnonymous: boolean;
}

function LogEntryDisplay({ entry, isAnonymous }: LogEntryDisplayProps) {
  const displayName = isAnonymous ? "Anonymous" : entry.surferName;
  return (
    <div className="flex items-center gap-2">
      <Link
        href={isAnonymous ? "#" : `/profile/${entry.userId}`}
        className={cn(
          "font-primary hover:text-brand-3 transition-colors",
          isAnonymous ? "text-gray-900 cursor-default" : "text-gray-900"
        )}
      >
        {displayName}
      </Link>
      {entry.user?.nationality && (
        <span className="text-xs text-gray-500">{entry.user.nationality}</span>
      )}
    </div>
  );
}

function ForecastInfo({ forecast }: { forecast?: LogEntry["forecast"] }) {
  if (!forecast?.windSpeed || !forecast?.swellHeight) {
    return <p className="font-primary text-gray-500 italic">—</p>;
  }

  const windDirection = parseFloat(forecast.windDirection) || 0;
  const swellDirection = forecast.swellDirection || 0;

  const windCardinal = degreesToCardinal(windDirection);
  const swellCardinal = degreesToCardinal(swellDirection);

  return (
    <div className="space-y-1 text-sm">
      <p className="break-words">
        <span title={`Wind Speed: ${forecast.windSpeed} kts`}>
          {getWindEmoji(forecast.windSpeed)}
        </span>{" "}
        {windCardinal} @ {forecast.windSpeed}kts
      </p>
      <p className="break-words">
        <span title={`Swell Height: ${forecast.swellHeight}m`}>
          {getSwellEmoji(forecast.swellHeight)}
        </span>{" "}
        {forecast.swellHeight}m @ {forecast.swellPeriod}s
      </p>
      <p className="break-words">
        <span title={`Swell Direction: ${swellCardinal}`}>
          {getDirectionEmoji(forecast.swellDirection)}
        </span>{" "}
        {swellCardinal}
      </p>
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "w-4 h-4",
            i < rating ? "fill-yellow-400" : "fill-gray-200"
          )}
        />
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="w-full">
      {/* Mobile View Skeleton */}
      <div className="md:hidden space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 shadow p-4 space-y-3"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div
                    key={star}
                    className="w-4 h-4 bg-gray-200 rounded animate-pulse"
                  ></div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-36 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View Skeleton */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 shadow">
        <div className="min-h-[500px]">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {DEFAULT_COLUMNS.map((column) => (
                  <th
                    key={column.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  {DEFAULT_COLUMNS.map((column) => (
                    <td
                      key={column.key}
                      className="px-6 py-4 whitespace-nowrap"
                    >
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const normalizeLogEntry = (entry: LogEntry): LogEntry => ({
  ...entry,
  date: new Date(entry.date.split("T")[0]).toISOString().split("T")[0],
  isPrivate: entry.isPrivate ?? false,
  isAnonymous: entry.isAnonymous ?? false,
});

export const DEFAULT_COLUMNS: QuestLogTableColumn[] = [
  {
    key: "date",
    label: "Date",
  },
  {
    key: "beachName",
    label: "Beach",
  },
  {
    key: "region",
    label: "Region",
  },
  {
    key: "surferName",
    label: "Logger",
  },
  {
    key: "surferRating",
    label: "Rating",
  },
  {
    key: "forecastSummary",
    label: "Conditions",
  },
  {
    key: "comments",
    label: "Comments",
  },
];

export default function RaidLogTable({
  entries,
  columns = DEFAULT_COLUMNS,
  isSubscribed = false,
  isLoading = false,
  showPrivateOnly = false,
  onBeachClick,
}: QuestTableProps) {
  const [selectedBeach, setSelectedBeach] = useState<Beach | null>(null);

  const normalizedEntries = useMemo(() => {
    return entries.map(normalizeLogEntry);
  }, [entries]);

  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (entryId: string) => {
      const response = await fetch(`/api/raid-logs/${entryId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Delete failed");
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({
        queryKey: ["raidLogs"],
        refetchType: "active",
      });
    },
  });

  // Edit handler
  const handleEdit = (entry: LogEntry) => {
    router.push(`/raidlogs/${entry.id}`);
  };

  // Delete handler
  const handleDelete = (entryId: string) => {
    deleteMutation.mutate(entryId);
  };

  const filteredEntries = normalizedEntries.filter((entry) => {
    // For public viewing (no session)
    if (!session) {
      return !entry.isPrivate;
    }

    // For authenticated users
    if (showPrivateOnly) {
      return entry.isPrivate && entry.userId === session.user?.id;
    }
    return !entry.isPrivate || entry.userId === session.user?.id;
  });

  console.log("[RaidLogTable] Filtered entries:", filteredEntries);

  const actionColumn = {
    key: "actions",
    header: "",
    accessor: "actions",
    cell: ({ row }: { row: any }) => {
      const entry = row.original;
      const isOwner = session?.user?.email === entry.surferEmail;

      if (!isOwner) return null;

      return (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(entry);
            }}
            className="text-gray-500 hover:text-[var(--brand-tertiary)]"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(entry.id);
            }}
            className="text-gray-500 hover:text-red-600"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <span className="loading-spinner" />
            ) : (
              <X className="w-4 h-4" />
            )}
          </button>
        </div>
      );
    },
  };

  const columnsWithAction = [...columns, actionColumn];

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <div className="w-full">
      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-4">
        {filteredEntries.map((entry) => {
          console.log("[TableDebug] Processing entry:", {
            id: entry.id,
            beachName: entry.beachName,
            forecast: entry.forecast,
          });

          return (
            <div
              key={entry.id}
              className="bg-white rounded-lg border border-gray-200 shadow p-3 sm:p-4 space-y-2 sm:space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0">
                <div>
                  <h3 className="text-sm sm:text-base font-medium">
                    {entry.beachName}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {format(new Date(entry.date), "MMM d, yyyy")}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {entry.region}
                  </p>
                </div>
                <StarRating rating={entry.surferRating} />
              </div>

              <div className="text-sm">
                <p className="text-gray-600">
                  Logger:{" "}
                  <LogEntryDisplay
                    entry={entry}
                    isAnonymous={entry.isAnonymous ?? false}
                  />
                </p>
                <div className="mt-2">
                  <ForecastInfo forecast={entry.forecast} />
                </div>
              </div>

              {entry.comments && (
                <p className="text-sm text-gray-600 break-words">
                  <span className="font-medium">Comments:</span>{" "}
                  {entry.comments}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden md:block rounded-lg border border-gray-200 shadow">
        <div className="min-h-[500px] w-full">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columnsWithAction.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      "px-4 py-3 sm:px-6 sm:py-4 text-sm text-left text-gray-500 uppercase tracking-wider",
                      column.key === "date" ? "min-w-[140px]" : "min-w-[180px]",
                      column.key === "comments" && "min-w-[300px]",
                      "h-[40px]"
                    )}
                  >
                    {(column as QuestLogTableColumn).label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEntries.map((entry) => {
                console.log("[TableDebug] Processing entry:", {
                  id: entry.id,
                  beachName: entry.beachName,
                  forecast: entry.forecast,
                });

                return (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 sm:px-6 whitespace-nowrap text-sm min-w-[140px]">
                      {format(new Date(entry.date), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-4 sm:px-6 whitespace-nowrap min-w-[180px]">
                      <button
                        onClick={() => {
                          const foundBeach = beachData.find(
                            (b) => b.name === entry.beachName
                          );
                          console.log("Found beach data:", foundBeach);
                          setSelectedBeach(foundBeach || null);
                        }}
                        className="font-primary text-gray-900 hover:text-brand-3 transition-colors text-left"
                      >
                        {entry.beachName}
                      </button>
                    </td>
                    <td className="px-4 py-4 sm:px-6 whitespace-nowrap min-w-[180px]">
                      {entry.region}
                    </td>
                    <td className="px-4 py-4 sm:px-6 whitespace-nowrap min-w-[180px]">
                      <LogEntryDisplay
                        entry={entry}
                        isAnonymous={entry.isAnonymous ?? false}
                      />
                    </td>
                    <td className="px-4 py-4 sm:px-6 min-w-[140px]">
                      <StarRating rating={entry.surferRating} />
                    </td>
                    <td className="px-4 py-4 sm:px-6 min-w-[200px]">
                      <ForecastInfo forecast={entry.forecast} />
                    </td>
                    <td className="px-4 py-4 sm:px-6 min-w-[300px] whitespace-normal">
                      {entry.comments}
                    </td>
                    {isSubscribed && entry.imageUrl && (
                      <td className="px-2 py-2 sm:px-4">
                        <div className="relative w-[80px] h-[80px] sm:w-[120px] sm:h-[120px]">
                          <Image
                            src={entry.imageUrl}
                            alt="Session photo"
                            width={80}
                            height={80}
                            className="object-cover rounded-md"
                            unoptimized={process.env.NODE_ENV === "development"}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(entry);
                          }}
                          className="text-gray-500 hover:text-[var(--brand-tertiary)]"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(entry.id);
                          }}
                          className="text-gray-500 hover:text-red-600"
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending ? (
                            <span className="loading-spinner" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Beach Details Modal */}
      {selectedBeach && (
        <BeachDetailsModal
          beach={selectedBeach}
          isOpen={!!selectedBeach}
          onClose={() => setSelectedBeach(null)}
          isSubscribed={isSubscribed}
          onSubscribe={() => {}}
        />
      )}
    </div>
  );
}
