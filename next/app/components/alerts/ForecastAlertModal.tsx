"use client";

import { useState, useEffect, useMemo } from "react";
import { LogEntry } from "@/app/types/questlogs";
import { AlertConfigTypes } from "@/app/types/alerts";
import { useSession } from "next-auth/react";
import { v4 as uuidv4 } from "uuid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Slider } from "@/app/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Button } from "@/app/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/app/lib/utils";
import { Bell } from "lucide-react";
import { CustomCalendar } from "@/app/components/ui/custom-calendar";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { InfoIcon } from "lucide-react";
import { Search } from "lucide-react";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { AlertConfig } from "./AlertConfiguration";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { StarIcon } from "lucide-react";

interface ForecastAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  logEntry: LogEntry | null;
  existingAlert?: AlertConfig;
  onSaved?: () => void;
  isNew?: boolean;
}

export default function ForecastAlertModal({
  isOpen,
  onClose,
  logEntry,
  existingAlert,
  onSaved,
  isNew = false,
}: ForecastAlertModalProps) {
  const isEditing = !!existingAlert;
  const isLinkedToLogEntry =
    isEditing && logEntry && existingAlert?.logEntryId === logEntry.id;

  const [alertType, setAlertType] = useState<"variables" | "rating">(
    existingAlert?.alertType || "variables"
  );
  const [starRating, setStarRating] = useState<"4+" | "5">(
    existingAlert?.starRating || "4+"
  );

  const [alertConfig, setAlertConfig] = useState<Partial<AlertConfigTypes>>({
    name: existingAlert?.name || "",
    properties: existingAlert?.properties || [
      { property: "windSpeed", range: 10 },
      { property: "windDirection", range: 180 },
      { property: "swellHeight", range: 1.5 },
      { property: "swellPeriod", range: 10 },
      { property: "swellDirection", range: 180 },
    ],
    notificationMethod: existingAlert?.notificationMethod || "email",
    contactInfo: existingAlert?.contactInfo || "",
    active: existingAlert?.active ?? true,
    region: existingAlert?.region || logEntry?.region || "",
    forecastDate: existingAlert?.forecastDate
      ? new Date(existingAlert.forecastDate)
      : logEntry?.forecast?.date || new Date(),
    logEntryId: existingAlert?.logEntryId || null,
    alertType: existingAlert?.alertType || "variables",
    starRating: existingAlert?.starRating || "4+",
  });

  const { data: session } = useSession();
  const queryClient = useQueryClient();

  // Add loading states for better UX
  const [isFetchingForecast, setIsFetchingForecast] = useState(false);

  // Use useState instead of useQuery for regions and dates to prevent loops
  const [regions, setRegions] = useState<string[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [isLoadingRegions, setIsLoadingRegions] = useState(false);
  const [isLoadingDates, setIsLoadingDates] = useState(false);

  // Add a ref to track if we've already fetched forecast for this combination
  const [fetchedCombinations, setFetchedCombinations] = useState<Set<string>>(
    new Set()
  );

  // Add state for forecast data
  const [forecastData, setForecastData] = useState<any>(null);

  // Add state for log entry search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLogEntry, setSelectedLogEntry] = useState<LogEntry | null>(
    logEntry
  );

  // Fetch user's log entries
  const { data: userLogEntries, isLoading: isLoadingLogEntries } = useQuery({
    queryKey: ["userLogEntries"],
    queryFn: async () => {
      const response = await fetch("/api/logs");
      if (!response.ok) throw new Error("Failed to fetch log entries");
      return response.json();
    },
    enabled: isOpen && !logEntry, // Only fetch if modal is open and no log entry is provided
  });

  // Filter log entries based on search term
  const filteredLogEntries = useMemo(() => {
    if (!userLogEntries) return [];
    return userLogEntries.filter(
      (entry: LogEntry) =>
        entry.beachName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.region?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [userLogEntries, searchTerm]);

  // Fetch regions once on component mount
  useEffect(() => {
    const fetchRegions = async () => {
      setIsLoadingRegions(true);
      try {
        const response = await fetch("/api/alerts?region");
        if (response.ok) {
          const data = await response.json();
          setRegions(data);
        } else {
          toast.error("Failed to load regions");
        }
      } catch (error) {
        console.error("Error fetching regions:", error);
        toast.error("Failed to load regions");
      } finally {
        setIsLoadingRegions(false);
      }
    };

    fetchRegions();
  }, []);

  // Fetch dates when region changes
  useEffect(() => {
    if (!alertConfig.region) return;

    const fetchDates = async () => {
      setIsLoadingDates(true);
      try {
        const response = await fetch(
          `/api/alerts?region=${encodeURIComponent(alertConfig.region || "")}`
        );
        if (response.ok) {
          const data = await response.json();
          setAvailableDates(data);
          if (data.length === 0) {
            toast.warning("No forecast dates available for this region");
          }
        } else {
          toast.error("Failed to load dates");
        }
      } catch (error) {
        console.error("Error fetching dates:", error);
        toast.error("Failed to load dates");
      } finally {
        setIsLoadingDates(false);
      }
    };

    fetchDates();
  }, [alertConfig.region]);

  // Add this function to fetch an alert by ID
  const fetchAlert = async (alertId: string) => {
    try {
      console.log(`Fetching alert with ID: ${alertId}`);
      const response = await fetch(`/api/alerts/${alertId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      const alert = await response.json();
      console.log("Fetched alert:", alert);

      // Set the alert config
      setAlertConfig({
        ...alert,
        // Ensure forecastDate is a Date object if it exists
        forecastDate: alert.forecastDate
          ? new Date(alert.forecastDate)
          : undefined,
      });

      // If the alert has a logEntryId, set it as the selected log entry
      if (alert.logEntryId) {
        // Fetch the log entry
        try {
          const logResponse = await fetch(`/api/logs/${alert.logEntryId}`);
          if (logResponse.ok) {
            const logEntry = await logResponse.json();
            setSelectedLogEntry(logEntry);
          }
        } catch (logError) {
          console.error("Error fetching log entry:", logError);
        }
      }

      // Fetch forecast data if region is available
      if (alert.region && alert.forecastDate) {
        fetchForecast(alert.region, alert.forecastDate);
      }

      return alert;
    } catch (error) {
      console.error("Error fetching alert:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to load alert details"
      );
      return null;
    }
  };

  // Use this in the useEffect for initializing with existing alert
  useEffect(() => {
    if (existingAlert?.id && isEditing) {
      fetchAlert(existingAlert.id);
    } else if (existingAlert) {
      console.log("Loading existing alert data:", existingAlert);

      // Set alert name
      setAlertConfig((prev) => ({
        ...prev,
        name: existingAlert.name || "",
        region: existingAlert.region || "",
        forecastDate: existingAlert.forecastDate || "",
        alertType: existingAlert.alertType || "variables",
        active: existingAlert.active ?? true,
      }));

      // Set notification method
      setAlertConfig((prev) => ({
        ...prev,
        notificationMethod: existingAlert.notificationMethod || "email",
      }));
      setAlertConfig((prev) => ({
        ...prev,
        contactInfo: existingAlert.contactInfo || "",
      }));

      // Set properties
      if (existingAlert.properties && existingAlert.properties.length > 0) {
        const propertyMap = existingAlert.properties.reduce<
          Record<string, number>
        >((acc, prop) => {
          acc[prop.property] = prop.range;
          return acc;
        }, {});

        setAlertConfig((prev) => ({
          ...prev,
          properties: existingAlert.properties,
        }));
      }

      // Set selected log entry if available
      if (existingAlert.logEntryId) {
        fetchLogEntry(existingAlert.logEntryId);
      }
    }
  }, [existingAlert, isEditing]);

  // Initialize contact info with user email when session changes
  useEffect(() => {
    if (session?.user?.email && !isEditing) {
      setAlertConfig((prev) => ({
        ...prev,
        contactInfo: session.user.email || "",
      }));
    }
  }, [session, isEditing]);

  // Update alert name when log entry changes (only if not editing)
  useEffect(() => {
    if (selectedLogEntry && !isEditing) {
      setAlertConfig((prev) => ({
        ...prev,
        name: `Alert for ${selectedLogEntry.beachName || selectedLogEntry.region}`,
        region: selectedLogEntry.region || "",
        logEntryId: selectedLogEntry.id,
        // Automatically set the forecast date to the log entry's date
        forecastDate: new Date(selectedLogEntry.date),
      }));

      // If the log entry has forecast data, use it directly
      if (selectedLogEntry.forecast) {
        setForecastData(selectedLogEntry.forecast);

        // Use a callback form for setFetchedCombinations to avoid dependency on fetchedCombinations
        const dateStr = getDateString(new Date(selectedLogEntry.date));
        const combinationKey = `${selectedLogEntry.region}-${dateStr}`;
        setFetchedCombinations((prev) => new Set(prev).add(combinationKey));
      }
      // If no forecast data in log entry but region exists, fetch available dates
      else if (selectedLogEntry.region) {
        queryClient.invalidateQueries({
          queryKey: ["forecastDates", selectedLogEntry.region],
        });
      }
    }
  }, [selectedLogEntry, isEditing, queryClient]);

  const createAlertMutation = useMutation({
    mutationFn: async (data: AlertConfigTypes) => {
      const response = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          forecastDate: logEntry?.forecast?.date || data.forecastDate,
        }),
      });
      if (!response.ok) throw new Error("Failed to create alert");
      return response.json();
    },
    onSuccess: () => {
      toast.success("Alert created successfully");
      onSaved?.();
      onClose();
    },
  });

  const updateAlertMutation = useMutation({
    mutationFn: async (alert: AlertConfig) => {
      // Show a loading toast when the update starts
      const toastId = toast.loading("Updating alert...");

      try {
        console.log("Updating alert with ID:", alert.id);
        const response = await fetch(`/api/alerts/${alert.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(alert),
        });

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ error: `HTTP error ${response.status}` }));
          // Dismiss the loading toast
          toast.dismiss(toastId);
          throw new Error(
            errorData.error || `Failed to update alert (${response.status})`
          );
        }

        const result = await response.json();
        // Dismiss the loading toast
        toast.dismiss(toastId);
        return result;
      } catch (error) {
        // Dismiss the loading toast in case of error
        toast.dismiss(toastId);
        throw error;
      }
    },
    onSuccess: () => {
      // Show success toast
      toast.success("Alert Updated", {
        description: "Your alert has been updated successfully.",
      });

      // Trigger confetti effect
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      onSaved?.();
      onClose();
    },
    onError: (error: Error) => {
      console.error("Update error:", error);
      // Show error toast
      toast.error("Error", {
        description: error.message,
      });
    },
  });

  // Helper function to check if a date has forecast data
  const hasForecaseData = (date: Date) => {
    if (!availableDates) return false;
    return availableDates.some((d: string) => {
      const forecastDate = new Date(d);
      return forecastDate.toDateString() === date.toDateString();
    });
  };

  // Add this function to fetch a log entry by ID
  const fetchLogEntry = async (logEntryId: string) => {
    try {
      const response = await fetch(`/api/logs/${logEntryId}`);
      if (!response.ok) throw new Error("Failed to fetch log entry");

      const logEntry = await response.json();
      setSelectedLogEntry(logEntry);
    } catch (error) {
      console.error("Error fetching log entry:", error);
      toast.error("Failed to load log entry details");
    }
  };

  // Update the fetchForecast function to use the correct API endpoint
  const fetchForecast = async (region: string, date: Date | string) => {
    if (!region || !date) return null;

    setIsFetchingForecast(true);
    setForecastData(null);

    // Convert date to string format for API and tracking
    let dateStr;
    try {
      dateStr =
        typeof date === "string"
          ? date
          : date instanceof Date && !isNaN(date.getTime())
            ? date.toISOString().split("T")[0]
            : "";
    } catch (error) {
      console.error("Invalid date format:", date, error);
      dateStr = "";
    }

    if (!dateStr) {
      toast.error("Invalid date format");
      setIsFetchingForecast(false);
      return null;
    }

    const combinationKey = `${region}-${dateStr}`;

    // Check if we've already fetched this combination to prevent loops
    if (fetchedCombinations.has(combinationKey)) {
      setIsFetchingForecast(false);
      return null;
    }

    try {
      console.log(`Fetching forecast for ${region} on ${dateStr}`);
      // Use the existing raid-logs/forecast endpoint instead
      const response = await fetch(
        `/api/raid-logs/forecast?region=${encodeURIComponent(region)}&date=${encodeURIComponent(dateStr)}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch forecast: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Forecast data:", data);

      // Add to fetched combinations set
      setFetchedCombinations(new Set(fetchedCombinations).add(combinationKey));

      // Update forecast data state
      setForecastData(data);
      return data;
    } catch (error) {
      console.error("Error fetching forecast:", error);
      toast.error("Failed to load forecast data");
      return null;
    } finally {
      setIsFetchingForecast(false);
    }
  };

  // Only fetch forecast when both region and date are selected and changed
  useEffect(() => {
    if (alertConfig.region && alertConfig.forecastDate) {
      const dateStr = getDateString(alertConfig.forecastDate);
      const combinationKey = `${alertConfig.region}-${dateStr}`;

      // Use a callback to check if we've already fetched this combination
      setFetchedCombinations((prev) => {
        if (!prev.has(combinationKey)) {
          if (alertConfig.region && alertConfig.forecastDate) {
            fetchForecast(alertConfig.region, alertConfig.forecastDate);
          }
          return new Set(prev).add(combinationKey);
        }
        return prev;
      });
    }
  }, [alertConfig.region, alertConfig.forecastDate]);

  // Add a saveAlert function with debounce to prevent multiple submissions
  const saveAlert = async () => {
    console.log("Saving alert with config:", alertConfig);
    console.log("Notification method:", alertConfig.notificationMethod);
    console.log("Contact info:", alertConfig.contactInfo);

    // Check if all required fields are present
    if (
      !alertConfig.name ||
      !alertConfig.region ||
      !alertConfig.notificationMethod ||
      !alertConfig.contactInfo
    ) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const alertData: AlertConfigTypes = {
        id: existingAlert?.id || uuidv4(),
        name: alertConfig.name!,
        region: alertConfig.region!,
        properties: alertConfig.properties || [],
        notificationMethod: alertConfig.notificationMethod!,
        contactInfo: alertConfig.contactInfo!,
        active: alertConfig.active ?? true,
        logEntryId: selectedLogEntry?.id || logEntry?.id || null,
        alertType: alertType,
        starRating: alertType === "rating" ? starRating : null,
        forecastDate: alertConfig.forecastDate || new Date(),
      };

      if (isEditing) {
        updateAlertMutation.mutate(alertData);
      } else {
        createAlertMutation.mutate(alertData);
      }
    } catch (error) {
      console.error("Error saving alert:", error);
      toast.error("Failed to save alert");
    }
  };

  // Helper function to safely get date string
  const getDateString = (date: Date | string | undefined): string => {
    if (!date) return "";

    try {
      if (typeof date === "string") {
        // If it's already a string, try to parse it
        const parsedDate = new Date(date);
        return !isNaN(parsedDate.getTime())
          ? parsedDate.toISOString().split("T")[0]
          : "";
      } else if (date instanceof Date && !isNaN(date.getTime())) {
        // If it's a valid Date object
        return date.toISOString().split("T")[0];
      }
    } catch (e) {
      console.error("Invalid date:", date, e);
    }
    return "";
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!createAlertMutation.isPending && !updateAlertMutation.isPending) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-primary">
            {isEditing ? "Edit Forecast Alert" : "Create Forecast Alert"}
          </DialogTitle>
          <DialogDescription className="font-primary">
            {isNew
              ? "Create a new alert to get notified when forecast conditions match your preferences."
              : "Get notified when forecast conditions match this session."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Step 1: Select Log Entry (if not already provided) */}
          {!logEntry && !isEditing && (
            <div className="space-y-2">
              <Label className="font-primary flex items-center">
                <span className="bg-gray-200 text-gray-700 rounded-full w-5 h-5 inline-flex items-center justify-center mr-2 text-xs">
                  1
                </span>
                Select Log Entry
              </Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search your log entries..."
                  className="pl-8 font-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {isLoadingLogEntries ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <ScrollArea className="h-[200px] border rounded-md p-2">
                  {filteredLogEntries.length > 0 ? (
                    filteredLogEntries.map((entry: LogEntry) => (
                      <div
                        key={entry.id}
                        className={cn(
                          "p-2 cursor-pointer hover:bg-gray-100 rounded-md",
                          selectedLogEntry?.id === entry.id
                            ? "bg-blue-50 border border-blue-200"
                            : ""
                        )}
                        onClick={() => setSelectedLogEntry(entry)}
                      >
                        <p className="font-medium font-primary">
                          {entry.beachName || "Unnamed Beach"}
                        </p>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>{entry.region}</span>
                          <span>
                            {format(new Date(entry.date), "MMM d, yyyy")}
                          </span>
                        </div>
                        {entry.forecast && (
                          <div className="text-xs text-gray-600 mt-1">
                            Wind: {entry.forecast.windSpeed}kts, Waves:{" "}
                            {entry.forecast.swellHeight}m
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4 font-primary">
                      {searchTerm
                        ? "No matching log entries found"
                        : "No log entries found"}
                    </p>
                  )}
                </ScrollArea>
              )}

              {selectedLogEntry && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm font-primary text-blue-700 flex items-center">
                    <InfoIcon className="w-4 h-4 mr-2" />
                    Selected:{" "}
                    {selectedLogEntry.beachName || selectedLogEntry.region}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Date:{" "}
                    {format(new Date(selectedLogEntry.date), "MMM d, yyyy")}
                  </p>
                  {selectedLogEntry.forecast && (
                    <p className="text-xs text-blue-600">
                      Forecast data available
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Alert Name */}
          <div className="space-y-2">
            <Label
              htmlFor="alert-name"
              className="font-primary flex items-center"
            >
              <span className="bg-gray-200 text-gray-700 rounded-full w-5 h-5 inline-flex items-center justify-center mr-2 text-xs">
                {!logEntry && !isEditing ? "2" : "1"}
              </span>
              Alert Name
            </Label>
            <Input
              id="alert-name"
              value={alertConfig.name || ""}
              onChange={(e) =>
                setAlertConfig({ ...alertConfig, name: e.target.value })
              }
              className="font-primary border-gray-300"
              placeholder="Name your alert"
            />
          </div>

          {/* Step 3: Region Selection - Only show if no log entry selected */}
          {!selectedLogEntry && !logEntry && (
            <div className="space-y-2">
              <Label className="font-primary flex items-center">
                <span className="bg-gray-200 text-gray-700 rounded-full w-5 h-5 inline-flex items-center justify-center mr-2 text-xs">
                  {!logEntry && !isEditing ? "3" : "2"}
                </span>
                Select Region
              </Label>
              <select
                value={alertConfig.region || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  console.log("Region selected:", value);
                  setAlertConfig({
                    ...alertConfig,
                    region: value,
                    forecastDate: undefined,
                  });
                }}
                className="w-full p-2 border rounded-md font-primary border-gray-300"
                disabled={
                  isLoadingRegions || isLinkedToLogEntry || !!selectedLogEntry
                }
              >
                <option value="">Select region</option>
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
              {isLoadingRegions && (
                <p className="text-sm text-gray-500 font-primary">
                  Loading available regions...
                </p>
              )}
            </div>
          )}

          {/* Step 4: Date Selection - Only show if no log entry selected */}
          {!selectedLogEntry && !logEntry && (
            <div className="space-y-2">
              <Label className="font-primary flex items-center">
                <span className="bg-gray-200 text-gray-700 rounded-full w-5 h-5 inline-flex items-center justify-center mr-2 text-xs">
                  {!logEntry && !isEditing ? "4" : "3"}
                </span>
                Select Forecast Date
              </Label>
              <select
                value={
                  alertConfig.forecastDate &&
                  !isNaN(new Date(alertConfig.forecastDate).getTime())
                    ? new Date(alertConfig.forecastDate)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                onChange={(e) => {
                  const value = e.target.value;
                  console.log("Date selected:", value);
                  setAlertConfig({
                    ...alertConfig,
                    forecastDate: value ? new Date(value) : undefined,
                  });
                }}
                className="w-full p-2 border rounded-md font-primary border-gray-300"
                disabled={
                  !alertConfig.region ||
                  isLoadingDates ||
                  isLinkedToLogEntry ||
                  !!selectedLogEntry
                }
              >
                <option value="">Select date</option>
                {availableDates.map((date) => (
                  <option key={date} value={date}>
                    {new Date(date).toLocaleDateString()}
                  </option>
                ))}
              </select>
              {alertConfig.region && isLoadingDates && (
                <p className="text-sm text-gray-500 font-primary">
                  Loading available forecast dates...
                </p>
              )}
            </div>
          )}

          {/* Forecast Data Display */}
          {((alertConfig.region && alertConfig.forecastDate) ||
            selectedLogEntry?.forecast) && (
            <div className="space-y-2 border rounded-md p-3 bg-gray-50">
              <Label className="font-primary flex items-center">
                <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 inline-flex items-center justify-center mr-2 text-xs">
                  i
                </span>
                Forecast Data
                {selectedLogEntry && (
                  <span className="ml-2 text-xs text-blue-600">
                    (from log entry)
                  </span>
                )}
              </Label>

              {isFetchingForecast ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ) : forecastData ? (
                <div className="grid grid-cols-2 gap-2 text-sm font-primary">
                  <div className="flex flex-col">
                    <span className="text-gray-500">Wind Speed</span>
                    <span className="font-medium">
                      {forecastData.windSpeed || 0} knots
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500">Wind Direction</span>
                    <span className="font-medium">
                      {forecastData.windDirection || 0}°
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500">Wave Height</span>
                    <span className="font-medium">
                      {forecastData.swellHeight || 0}m
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500">Wave Period</span>
                    <span className="font-medium">
                      {forecastData.swellPeriod || 0}s
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 font-primary">
                  No forecast data available for the selected date and region.
                </p>
              )}
            </div>
          )}

          {/* New Step: Choose Alert Type */}
          <div className="space-y-2">
            <Label className="font-primary flex items-center">
              <span className="bg-gray-200 text-gray-700 rounded-full w-5 h-5 inline-flex items-center justify-center mr-2 text-xs">
                {!logEntry && !isEditing && !selectedLogEntry
                  ? "5"
                  : selectedLogEntry || logEntry
                    ? "2"
                    : "4"}
              </span>
              Alert Type
            </Label>
            <RadioGroup
              value={alertType}
              onValueChange={(value) => {
                setAlertType(value as "variables" | "rating");
                setAlertConfig({
                  ...alertConfig,
                  alertType: value as "variables" | "rating",
                } as Partial<AlertConfigTypes>);
              }}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="variables" id="variables" />
                <Label
                  htmlFor="variables"
                  className="font-primary cursor-pointer"
                >
                  Set Forecast Variables
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rating" id="rating" />
                <Label htmlFor="rating" className="font-primary cursor-pointer">
                  Set Star Rating
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Conditional rendering based on alert type */}
          {alertType === "variables" ? (
            /* Step: Accuracy Range */
            <div className="space-y-2">
              <Label className="font-primary flex items-center">
                <span className="bg-gray-200 text-gray-700 rounded-full w-5 h-5 inline-flex items-center justify-center mr-2 text-xs">
                  {!logEntry && !isEditing && !selectedLogEntry
                    ? "6"
                    : selectedLogEntry || logEntry
                      ? "3"
                      : "5"}
                </span>
                Set Accuracy Range
              </Label>
              <div className="space-y-4">
                {alertConfig.properties?.map((prop, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between">
                      <Label className="text-sm font-primary">
                        {prop.property === "windSpeed"
                          ? "Wind Speed"
                          : prop.property === "windDirection"
                            ? "Wind Direction"
                            : prop.property === "swellHeight"
                              ? "Wave Height"
                              : prop.property === "swellPeriod"
                                ? "Wave Period"
                                : prop.property}
                      </Label>
                      <span className="text-sm font-primary">
                        ±{prop.range}%
                      </span>
                    </div>
                    <Slider
                      value={[prop.range]}
                      min={5}
                      max={30}
                      step={5}
                      onValueChange={(value) => {
                        const updatedProps = [
                          ...(alertConfig.properties || []),
                        ];
                        updatedProps[index] = {
                          ...updatedProps[index],
                          range: value[0],
                        };
                        setAlertConfig({
                          ...alertConfig,
                          properties: updatedProps,
                        });
                      }}
                      className="border border-gray-300 rounded-md p-1"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Star Rating Selection */
            <div className="space-y-2">
              <Label className="font-primary flex items-center">
                <span className="bg-gray-200 text-gray-700 rounded-full w-5 h-5 inline-flex items-center justify-center mr-2 text-xs">
                  {!logEntry && !isEditing && !selectedLogEntry
                    ? "6"
                    : selectedLogEntry || logEntry
                      ? "3"
                      : "5"}
                </span>
                Select Star Rating
              </Label>
              <RadioGroup
                value={starRating}
                onValueChange={(value) => {
                  setStarRating(value as "4+" | "5");
                  setAlertConfig({
                    ...alertConfig,
                    starRating: value as "4+" | "5",
                  });
                }}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="4+" id="four-plus" />
                  <Label
                    htmlFor="four-plus"
                    className="font-primary cursor-pointer flex items-center"
                  >
                    <div className="flex">
                      {[1, 2, 3, 4].map((i) => (
                        <StarIcon
                          key={i}
                          className="h-5 w-5 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                      <StarIcon className="h-5 w-5 text-gray-300" />
                    </div>
                    <span className="ml-2">4+ Stars (Good conditions)</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="5" id="five" />
                  <Label
                    htmlFor="five"
                    className="font-primary cursor-pointer flex items-center"
                  >
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <StarIcon
                          key={i}
                          className="h-5 w-5 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <span className="ml-2">5 Stars (Perfect conditions)</span>
                  </Label>
                </div>
              </RadioGroup>
              <p className="text-sm text-gray-500 font-primary mt-2">
                You'll be notified when the beach conditions match your selected
                star rating.
              </p>
            </div>
          )}

          {/* Step 5: Notification Method */}
          <div className="space-y-2">
            <Label className="font-primary flex items-center">
              <span className="bg-gray-200 text-gray-700 rounded-full w-5 h-5 inline-flex items-center justify-center mr-2 text-xs">
                {!logEntry && !isEditing && !selectedLogEntry
                  ? "7"
                  : selectedLogEntry || logEntry
                    ? "4"
                    : "6"}
              </span>
              Notification Method
            </Label>
            <Select
              value={alertConfig.notificationMethod || "email"}
              onValueChange={(value: string) =>
                setAlertConfig({
                  ...alertConfig,
                  notificationMethod: value as "email" | "whatsapp" | "both",
                })
              }
            >
              <SelectTrigger className="font-primary border-gray-300">
                <SelectValue placeholder="Select notification method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email" className="font-primary">
                  Email
                </SelectItem>
                <SelectItem value="whatsapp" className="font-primary">
                  WhatsApp
                </SelectItem>
                <SelectItem value="both" className="font-primary">
                  Both
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Step 6: Contact Info */}
          <div className="space-y-2">
            <Label
              htmlFor="contact-info"
              className="font-primary flex items-center"
            >
              <span className="bg-gray-200 text-gray-700 rounded-full w-5 h-5 inline-flex items-center justify-center mr-2 text-xs">
                {!logEntry && !isEditing && !selectedLogEntry
                  ? "8"
                  : selectedLogEntry || logEntry
                    ? "5"
                    : "7"}
              </span>
              {alertConfig.notificationMethod === "email"
                ? "Email Address"
                : alertConfig.notificationMethod === "whatsapp"
                  ? "WhatsApp Number"
                  : "Email & WhatsApp"}
            </Label>
            <Input
              id="contact-info"
              value={alertConfig.contactInfo || ""}
              onChange={(e) =>
                setAlertConfig({
                  ...alertConfig,
                  contactInfo: e.target.value,
                })
              }
              placeholder={
                alertConfig.notificationMethod === "email"
                  ? "you@example.com"
                  : alertConfig.notificationMethod === "whatsapp"
                    ? "+1234567890"
                    : "email@example.com, +1234567890"
              }
              className="font-primary border-gray-300"
            />
          </div>

          {/* Alert Status Toggle */}
          <div className="flex items-center space-x-2 pt-2">
            <Button
              type="button"
              variant={alertConfig.active ? "default" : "outline"}
              onClick={() =>
                setAlertConfig({
                  ...alertConfig,
                  active: !alertConfig.active,
                })
              }
              className="font-primary"
            >
              <Bell
                className={cn(
                  "w-4 h-4 mr-2",
                  alertConfig.active ? "fill-current" : ""
                )}
              />
              {alertConfig.active ? "Active" : "Inactive"}
            </Button>
            <span className="text-sm text-gray-500 font-primary">
              {alertConfig.active
                ? "You will receive notifications"
                : "Notifications are disabled"}
            </span>
          </div>

          {/* Log Entry Details */}
          {(logEntry || selectedLogEntry) && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm font-primary text-blue-700 flex items-center">
                <InfoIcon className="w-4 h-4 mr-2" />
                This alert is linked to your log entry for{" "}
                {(logEntry || selectedLogEntry)?.beachName ||
                  (logEntry || selectedLogEntry)?.region}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Date:{" "}
                {format(
                  new Date((logEntry || selectedLogEntry)?.date || new Date()),
                  "MMM d, yyyy"
                )}
              </p>
              {(logEntry || selectedLogEntry)?.forecast && (
                <p className="text-xs text-blue-600">
                  Using forecast data from this log entry
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={saveAlert}
            className="font-primary"
            disabled={
              createAlertMutation.isPending ||
              updateAlertMutation.isPending ||
              !alertConfig.name ||
              !alertConfig.notificationMethod ||
              !alertConfig.contactInfo ||
              isFetchingForecast
            }
          >
            {createAlertMutation.isPending || updateAlertMutation.isPending
              ? isEditing
                ? "Updating..."
                : "Creating..."
              : isEditing
                ? "Update Alert"
                : "Create Alert"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
