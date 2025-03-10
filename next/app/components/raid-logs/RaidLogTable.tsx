"use client";

import { QuestLogTableColumn, LogEntry } from "@/app/types/questlogs";

import { format } from "date-fns";
import { Star, Pencil, X, Bell } from "lucide-react";
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
import { useMemo, useState, useEffect } from "react";
import { ForecastData } from "@/types/wind";
import Link from "next/link";
import BeachDetailsModal from "@/app/components/BeachDetailsModal";
import { beachData, type Beach } from "@/app/types/beaches";
import { AlertConfigTypes } from "@/app/types/alerts";
import { v4 as uuidv4 } from "uuid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/app/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import ForecastAlertModal from "@/app/components/alerts/ForecastAlertModal";
import { AlertConfig } from "../alerts/AlertConfiguration";
import { ForecastA } from "@prisma/client";

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

function ForecastInfo({ forecast }: { forecast: ForecastA | null }) {
  if (!forecast) return null;

  // Ensure we have valid numeric values
  const windSpeed =
    typeof forecast.windSpeed === "number" ? forecast.windSpeed : 0;
  const windDirection =
    typeof forecast.windDirection === "number" ? forecast.windDirection : 0;
  const swellHeight =
    typeof forecast.swellHeight === "number" ? forecast.swellHeight : 0;
  const swellPeriod =
    typeof forecast.swellPeriod === "number" ? forecast.swellPeriod : 0;
  const swellDirection =
    typeof forecast.swellDirection === "number" ? forecast.swellDirection : 0;

  return (
    <div className="space-y-1 text-sm">
      <p>
        {getWindEmoji(windSpeed)} {windSpeed}kts{" "}
        {degreesToCardinal(windDirection)}
      </p>
      <p>
        {getSwellEmoji(swellHeight)} {swellHeight}m @ {swellPeriod}s
      </p>
      <p>
        {getDirectionEmoji(swellDirection)} {degreesToCardinal(swellDirection)}
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
            i < rating
              ? "fill-[var(--color-alert-icon-rating)] text-[var(--color-alert-icon-rating)]"
              : "fill-gray-200 text-gray-200"
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

const normalizeLogEntry = (entry: LogEntry): LogEntry => {
  return {
    ...entry,
    date: new Date(entry.date),
    isPrivate: entry.isPrivate ?? false,
    isAnonymous: entry.isAnonymous ?? false,
    hasAlert: entry.hasAlert ?? false,
    isMyAlert: entry.isMyAlert ?? false,
    alertId: entry.alertId ?? "",
  };
};

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
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [selectedLogForAlert, setSelectedLogForAlert] =
    useState<LogEntry | null>(null);
  const [selectedAlertForEdit, setSelectedAlertForEdit] = useState<
    AlertConfig | undefined
  >(undefined);
  const { toast } = useToast();
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const normalizedEntries = useMemo(() => {
    return entries.map(normalizeLogEntry);
  }, [entries]);

  const router = useRouter();

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

  // Load user alerts from localStorage
  const userAlerts = useMemo(() => {
    if (typeof window !== "undefined") {
      const savedAlerts = localStorage.getItem("userAlerts");
      return savedAlerts ? JSON.parse(savedAlerts) : [];
    }
    return [];
  }, [alertModalOpen]); // Refresh when dialog closes

  // Edit handler
  const handleEdit = (entry: LogEntry) => {
    router.push(`/raidlogs/${entry.id}`);
  };

  // Delete handler
  const handleDelete = (entryId: string) => {
    deleteMutation.mutate(entryId);
  };

  // Create new alert handler
  const handleAlertClick = async (entry: LogEntry) => {
    if (entry.isMyAlert) {
      // If it's my alert, navigate to the alerts page
      router.push(`/alerts/${entry.alertId}`);
    } else {
      // If it's not my alert, open the modal to create a new one
      setSelectedLogForAlert(entry);
      setAlertModalOpen(true);
    }
  };

  const handleAlertSaved = () => {
    // Refresh alerts data
    queryClient.invalidateQueries({ queryKey: ["alerts"] });
    toast({
      title: "Success",
      description: "Alert saved successfully",
      variant: "default",
    });
    setAlertModalOpen(false);
    setSelectedAlertForEdit(undefined);
    setSelectedLogForAlert(null);
  };

  const filteredEntries = useMemo(() => {
    console.log("Filtering entries:", normalizedEntries.length);

    // For public viewing (no session)
    if (!session) {
      const publicEntries = normalizedEntries.filter(
        (entry) => !entry.isPrivate
      );
      console.log("Public entries:", publicEntries.length);
      return publicEntries;
    }

    // For authenticated users
    if (showPrivateOnly) {
      const privateEntries = normalizedEntries.filter(
        (entry) => entry.isPrivate && entry.userId === session.user?.id
      );
      console.log("Private entries:", privateEntries.length);
      return privateEntries;
    }

    // Show all public entries and user's private entries
    const visibleEntries = normalizedEntries.filter(
      (entry) => !entry.isPrivate || entry.userId === session.user?.id
    );
    console.log("Visible entries:", visibleEntries.length);
    return visibleEntries;
  }, [normalizedEntries, session, showPrivateOnly]);

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
            className="text-gray-500 hover:text-[var(--color-text-primary)]"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAlertClick(entry);
            }}
            className={cn(
              "text-gray-500 hover:text-[var(--color-alert-icon-rating)]",
              entry.hasAlert
                ? "text-[var(--color-alert-icon-rating)] fill-[var(--color-alert-icon-rating)]"
                : ""
            )}
          >
            <Bell
              className={cn(
                "w-4 h-4 cursor-pointer",
                entry.hasAlert
                  ? entry.isMyAlert
                    ? "text-[var(--color-alert-icon-rating)] fill-[var(--color-alert-icon-rating)]"
                    : "text-[var(--color-alert-icon-rating)] fill-none hover:text-[var(--color-alert-icon-rating)]"
                  : "text-gray-500 fill-none hover:text-[var(--color-alert-icon-rating)]"
              )}
              onClick={(e) => {
                e.stopPropagation(); // Prevent event bubbling
                if (!entry.isMyAlert) {
                  // Set the selected log entry and open the modal directly
                  setSelectedLogForAlert(entry);
                  setAlertModalOpen(true);
                }
              }}
            />
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

  useEffect(() => {
    console.log("RaidLogTable received entries:", entries?.length);

    if (entries && entries.length > 0) {
      console.log("First entry:", entries[0]);
      console.log(
        "Entries with alerts:",
        entries.filter((e) => e.hasAlert).length
      );
    }
  }, [entries]);

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <>
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
            {isLoading ? (
              <div className="text-center p-4">Loading...</div>
            ) : entries.length === 0 ? (
              <div className="text-center p-4">No matching sessions found</div>
            ) : (
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {columnsWithAction.map((column) => (
                      <th
                        key={column.key}
                        className={cn(
                          "px-4 py-3 sm:px-6 sm:py-4 text-sm text-left text-gray-500 uppercase tracking-wider",
                          column.key === "date"
                            ? "min-w-[140px]"
                            : "min-w-[180px]",
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
                                unoptimized={
                                  process.env.NODE_ENV === "development"
                                }
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
                              className="text-gray-500 hover:text-[var(--color-text-primary)]"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAlertClick(entry);
                              }}
                              className={cn(
                                "text-gray-500 hover:text-[var(--color-alert-icon-rating)]",
                                entry.hasAlert
                                  ? "text-[var(--color-alert-icon-rating)] fill-[var(--color-alert-icon-rating)]"
                                  : ""
                              )}
                            >
                              <Bell
                                className={cn(
                                  "w-4 h-4 cursor-pointer",
                                  entry.hasAlert
                                    ? entry.isMyAlert
                                      ? "text-[var(--color-alert-icon-rating)] fill-[var(--color-alert-icon-rating)]"
                                      : "text-[var(--color-alert-icon-rating)] fill-none hover:text-[var(--color-alert-icon-rating)]"
                                    : "text-gray-500 fill-none hover:text-[var(--color-alert-icon-rating)]"
                                )}
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent event bubbling
                                  if (!entry.isMyAlert) {
                                    // Set the selected log entry and open the modal directly
                                    setSelectedLogForAlert(entry);
                                    setAlertModalOpen(true);
                                  }
                                }}
                              />
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
            )}
          </div>
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

      {/* Alert Modal */}
      <ForecastAlertModal
        isOpen={alertModalOpen}
        onClose={() => {
          setAlertModalOpen(false);
          setSelectedAlertForEdit(undefined);
          setSelectedLogForAlert(null);
        }}
        logEntry={selectedLogForAlert}
        existingAlert={selectedAlertForEdit}
        onSaved={handleAlertSaved}
        isNew={!selectedAlertForEdit}
      />
    </>
  );
}
