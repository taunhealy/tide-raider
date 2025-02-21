"use client";

import {
  DEFAULT_COLUMNS,
  QuestLogTableColumn,
  LogEntry,
} from "@/app/types/questlogs";

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
import { useMemo } from "react";

interface QuestTableProps {
  entries: LogEntry[];
  columns?: QuestLogTableColumn[];
  isSubscribed?: boolean;
  isLoading?: boolean;
  showPrivateOnly?: boolean;
  onFilterChange?: () => void;
  onBeachClick: (beachName: string) => void;
}

interface LogEntryDisplayProps {
  entry: LogEntry;
  isAnonymous: boolean;
}

function LogEntryDisplay({ entry, isAnonymous }: LogEntryDisplayProps) {
  const displayName = isAnonymous ? "Anonymous" : entry.surferName;
  return <span className="font-primary text-gray-900">{displayName}</span>;
}

function ForecastInfo({ forecast }: { forecast: any }) {
  if (!forecast?.wind || !forecast?.swell) {
    return <span className="text-gray-500">No forecast data</span>;
  }

  return (
    <div className="space-y-1 text-sm">
      <p className="break-words">
        <span title={`Wind Speed: ${forecast.wind.speed} km/h`}>
          {getWindEmoji(forecast.wind.speed)}
        </span>{" "}
        {forecast.wind.direction} @ {forecast.wind.speed}km/h
      </p>
      <p className="break-words">
        <span title={`Swell Height: ${forecast.swell.height}m`}>
          {getSwellEmoji(forecast.swell.height)}
        </span>{" "}
        {forecast.swell.height}m @ {forecast.swell.period}s
      </p>
      <p className="break-words">
        <span
          title={`Swell Direction: ${forecast.swell.cardinalDirection || degreesToCardinal(Number(forecast.swell.direction))}`}
        >
          {getDirectionEmoji(forecast.swell.direction)}
        </span>{" "}
        {forecast.swell.cardinalDirection ||
          degreesToCardinal(Number(forecast.swell.direction))}
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
  date: new Date(entry.date),
  isPrivate: entry.isPrivate ?? false,
  isAnonymous: entry.isAnonymous ?? false,
});

export default function RaidLogTable({
  entries,
  columns = DEFAULT_COLUMNS,
  isSubscribed = false,
  isLoading = false,
  showPrivateOnly = false,
  onBeachClick,
}: QuestTableProps) {
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
              className="bg-white rounded-lg border border-gray-200 shadow p-4 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{entry.beachName}</h3>
                  <p className="text-sm text-gray-500">
                    {format(new Date(entry.date), "MMM d, yyyy")}
                  </p>
                  <p className="text-sm text-gray-500">{entry.region}</p>
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
      <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 shadow">
        <div className="min-h-[500px]">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columnsWithAction.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      "px-3 py-3 sm:px-6 sm:py-3 text-xs sm:text-sm text-left text-gray-500 uppercase tracking-wider whitespace-nowrap",
                      column.key === "date"
                        ? "min-w-[120px] max-w-[200px]"
                        : "min-w-[160px] max-w-[300px]",
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
                    <td className="px-3 py-4 sm:px-6 whitespace-nowrap text-sm min-w-[120px] max-w-[200px] h-[60px]">
                      {format(new Date(entry.date), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap min-w-[160px] max-w-[250px] h-[60px]">
                      <button
                        onClick={() => onBeachClick(entry.beachName)}
                        className="text-brand-3 hover:underline font-primary"
                      >
                        {entry.beachName}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap min-w-[160px] max-w-[250px] h-[60px]">
                      {entry.region}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-primary">
                      <LogEntryDisplay
                        entry={entry}
                        isAnonymous={entry.isAnonymous ?? false}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <StarRating rating={entry.surferRating} />
                    </td>
                    <td className="px-4 py-4">
                      <ForecastInfo forecast={entry.forecast} />
                    </td>
                    <td className="px-6 py-4">{entry.comments}</td>
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
    </div>
  );
}
