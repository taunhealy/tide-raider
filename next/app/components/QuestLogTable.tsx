import {
  DEFAULT_COLUMNS,
  QuestLogTableColumn,
  LogEntry,
} from "../types/questlogs";
import { format } from "date-fns";
import { Star, Pencil, X } from "lucide-react";
import { cn } from "@/app/lib/utils";
import {
  getWindEmoji,
  getSwellEmoji,
  getDirectionEmoji,
} from "@/app/lib/forecastUtils";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

interface QuestTableProps {
  entries: LogEntry[];
  columns?: QuestLogTableColumn[];
  isSubscribed?: boolean;
  isLoading?: boolean;
  showPrivateOnly?: boolean;
}

interface LogEntryDisplayProps {
  entry: LogEntry;
  isAnonymous: boolean;
}

function LogEntryDisplay({ entry, isAnonymous }: LogEntryDisplayProps) {
  const displayName = isAnonymous ? "Anonymous" : entry.surferName;
  return displayName;
}

function ForecastInfo({ forecast }: { forecast: LogEntry["forecast"] }) {
  if (!forecast) return <span className="text-gray-500">No forecast data</span>;
  if (!forecast.wind || !forecast.swell)
    return <span className="text-gray-500">Incomplete forecast data</span>;

  return (
    <div className="space-y-1 text-sm">
      <p className="break-words">
        <span
          title={`Wind Speed: ${forecast.wind.speed < 5 ? "Light" : forecast.wind.speed < 12 ? "Moderate" : forecast.wind.speed < 20 ? "Strong" : "Very Strong"}`}
        >
          {getWindEmoji(forecast.wind.speed)}
        </span>{" "}
        {forecast.wind.direction} @ {forecast.wind.speed}km/h
      </p>
      <p className="break-words">
        <span
          title={`Swell Height: ${forecast.swell.height < 0.5 ? "Flat" : forecast.swell.height < 1 ? "Small" : forecast.swell.height < 2 ? "Medium" : "Large"}`}
        >
          {getSwellEmoji(forecast.swell.height)}
        </span>{" "}
        {forecast.swell.height}m @ {forecast.swell.period}s
      </p>
      <p className="break-words">
        <span title={`Swell Direction: ${forecast.swell.cardinalDirection}`}>
          {getDirectionEmoji(parseInt(forecast.swell.direction))}
        </span>{" "}
        {forecast.swell.cardinalDirection}
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

export function QuestLogTable({
  entries,
  columns = DEFAULT_COLUMNS,
  isSubscribed = false,
  isLoading = false,
  showPrivateOnly = false,
}: QuestTableProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (entryId: string) => {
      const response = await fetch(`/api/quest-log/${entryId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Delete failed");
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({
        queryKey: ["questLogs"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["userLogs"],
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

  const filteredEntries = entries.filter((entry) => {
    if (showPrivateOnly) {
      return entry.isPrivate;
    }
    // Show private entries only if user is the owner
    if (entry.isPrivate) {
      return entry.surferEmail === session?.user?.email;
    }
    return true;
  });

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
            onClick={() => handleEdit(entry)}
            className="text-gray-500 hover:text-blue-600"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(entry.id)}
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
        {filteredEntries.map((entry) => (
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
                <span className="font-medium">Comments:</span> {entry.comments}
              </p>
            )}
          </div>
        ))}
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
                    className="px-3 py-3 sm:px-6 sm:py-3 text-xs sm:text-sm text-left text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {(column as QuestLogTableColumn).label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-3 py-4 sm:px-6 whitespace-nowrap text-sm">
                    {format(new Date(entry.date), "MMM d, yyyy")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {entry.beachName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
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
                        onClick={() => handleEdit(entry)}
                        className="text-gray-500 hover:text-[var(--brand-tertiary)]"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
