"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { LogEntry } from "@/app/types/questlogs";
import {
  AlertConfigTypes,
  ForecastProperty,
  NotificationMethod,
} from "@/app/types/alerts";
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
import { Input } from "@/app/components/ui/Input";
import { Label } from "@/app/components/ui/Label";
import { Slider } from "@/app/components/ui/Slider";
import { Button } from "@/app/components/ui/Button";
import { useMutation, useQuery } from "@tanstack/react-query";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import {
  CalendarIcon,
  Bell,
  InfoIcon,
  Search,
  StarIcon,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/app/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { ScrollArea } from "@/app/components/ui/ScrollArea";
import { AlertConfig } from "@/app/types/alerts";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { Checkbox } from "@/app/components/ui/checkbox";
import { BasicSelect, BasicOption } from "@/app/components/ui/BasicSelect";

interface ForecastAlertModalProps {
  isOpen?: boolean;
  onClose: () => void;
  logEntry: LogEntry | null;
  existingAlert?: AlertConfig;
  onSaved?: () => void;
  isNew?: boolean;
  logEntries?: LogEntry[];
}

const forecastProperties = [
  { id: "windSpeed" as ForecastProperty, name: "Wind Speed", unit: "knots" },
  {
    id: "windDirection" as ForecastProperty,
    name: "Wind Direction",
    unit: "°",
  },
  { id: "swellHeight" as ForecastProperty, name: "Swell Height", unit: "m" },
  { id: "swellPeriod" as ForecastProperty, name: "Swell Period", unit: "s" },
  {
    id: "swellDirection" as ForecastProperty,
    name: "Swell Direction",
    unit: "°",
  },
] as const;

// Define a more specific type for property updates
type PropertyUpdateAction = {
  index: number;
  key: "property" | "range";
  value: ForecastProperty | number;
};

// Add this before usePropertyManager
const getPropertyConfig = (propertyId: string) => {
  const configs = {
    windSpeed: { maxRange: 15, step: 1, unit: "knots" },
    windDirection: { maxRange: 45, step: 1, unit: "°" },
    swellHeight: { maxRange: 2, step: 0.1, unit: "m" },
    swellPeriod: { maxRange: 5, step: 0.1, unit: "s" },
    swellDirection: { maxRange: 45, step: 1, unit: "°" },
    waveHeight: { maxRange: 1, step: 0.1, unit: "m" },
    wavePeriod: { maxRange: 4, step: 0.1, unit: "s" },
    temperature: { maxRange: 5, step: 0.1, unit: "°C" },
  };

  return (
    configs[propertyId as keyof typeof configs] || {
      maxRange: 10,
      step: 0.1,
      unit: "",
    }
  );
};

// Custom hook for property management
function usePropertyManager(initialProperties: AlertConfigTypes["properties"]) {
  const [properties, setProperties] =
    useState<AlertConfigTypes["properties"]>(initialProperties);

  const updateProperty = useCallback(
    ({ index, key, value }: PropertyUpdateAction) => {
      setProperties((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          [key]: value,
        };
        return updated;
      });
    },
    []
  );

  const removeProperty = useCallback((index: number) => {
    setProperties((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  }, []);

  const addProperty = useCallback(() => {
    const usedProperties = new Set(properties.map((p) => p.property));

    // Find the first property that's not already in use
    const availableProperty =
      forecastProperties.find((p) => !usedProperties.has(p.id))?.id ||
      "windSpeed";

    setProperties((prev) => [
      ...prev,
      {
        property: availableProperty,
        range: getPropertyConfig(availableProperty).step * 10,
      },
    ]);
  }, [properties]);

  return {
    properties,
    updateProperty,
    removeProperty,
    addProperty,
    setProperties,
  };
}

// Add this type definition
type AlertType = "variables" | "rating";

export default function ForecastAlertModal({
  isOpen = false,
  onClose,
  logEntry,
  existingAlert,
  onSaved,
}: ForecastAlertModalProps) {
  const isEditing = !!existingAlert;
  const isLinkedToLogEntry =
    isEditing && logEntry && existingAlert?.logEntryId === logEntry.id;

  const { data: session } = useSession();

  // Add state for alert type
  const [alertType, setAlertType] = useState<AlertType>(
    existingAlert?.alertType || "variables"
  );
  const [starRating, setStarRating] = useState<"4+" | "5">(
    (existingAlert?.starRating as "4+" | "5") || "4+"
  );

  const [alertConfig, setAlertConfig] = useState<AlertConfigTypes>({
    id: existingAlert?.id || uuidv4(),
    name: existingAlert?.name || "",
    region: existingAlert?.region || "",
    properties: existingAlert?.properties || [
      { property: "windSpeed", range: 2 },
      { property: "windDirection", range: 10 },
      { property: "swellHeight", range: 0.2 },
      { property: "swellPeriod", range: 1 },
      { property: "swellDirection", range: 10 },
    ],
    notificationMethod: existingAlert?.notificationMethod || "app",
    contactInfo: existingAlert?.contactInfo || "",
    active: existingAlert?.active ?? true,
    forecastDate: existingAlert?.forecastDate
      ? new Date(existingAlert.forecastDate)
      : new Date(),
    alertType:
      existingAlert?.alertType ||
      (logEntry?.surferRating ? "rating" : "variables"),
    starRating:
      existingAlert?.starRating ||
      (logEntry?.surferRating && logEntry.surferRating >= 5 ? "5" : "4+"),
    userId: session?.user?.id || "",
    logEntryId: existingAlert?.logEntryId || logEntry?.id || null,
    forecast: null,
    forecastId: null,
  });

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
  const fetchAlert = useCallback(async () => {
    if (!existingAlert?.id) return;

    try {
      const response = await fetch(`/api/alerts/${existingAlert.id}`);
      const data = await response.json();

      if (!data) {
        console.error("No alert data received");
        return;
      }

      setAlertConfig({
        ...data,
        forecastDate: data.forecastDate
          ? new Date(data.forecastDate)
          : new Date(),
        logEntry: data.logEntry || null,
      });
    } catch (error) {
      console.error("Error fetching alert:", error);
    }
  }, [existingAlert?.id]);

  // Use this in the useEffect for initializing with existing alert
  useEffect(() => {
    if (existingAlert?.id && isEditing) {
      fetchAlert();
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
      setAlertConfig(
        (prev: AlertConfig) =>
          ({
            ...prev,
            contactInfo: existingAlert.contactInfo || session?.user.email || "",
            notificationMethod: (existingAlert.notificationMethod ||
              "app") as NotificationMethod,
          }) as AlertConfig
      );

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
  }, [existingAlert, isEditing, session?.user.email]);

  // Then update the contact info when session is available
  useEffect(() => {
    if (session?.user?.email) {
      setAlertConfig(
        (prev: AlertConfig) =>
          ({
            ...prev,
            contactInfo: existingAlert?.contactInfo || session.user.email || "",
            notificationMethod: (existingAlert?.notificationMethod ||
              "app") as NotificationMethod,
          }) as AlertConfig
      );
    }
  }, [session, existingAlert]);

  // Update alert name when log entry changes (only if not editing)
  useEffect(() => {
    if (selectedLogEntry && !isEditing) {
      setAlertConfig((prev) => ({
        ...prev,
        name: `Alert for ${
          selectedLogEntry.beachName || selectedLogEntry.region
        }`,
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

  // Update this useEffect to handle the LogEntry type correctly
  useEffect(() => {
    if (logEntry && !existingAlert) {
      // Initialize alert config with log entry data
      setAlertConfig({
        id: uuidv4(),
        name: `Alert for ${logEntry.beachName}`,
        properties: [
          { property: "windSpeed", range: 2 },
          { property: "windDirection", range: 10 },
          { property: "swellHeight", range: 0.2 },
          { property: "swellPeriod", range: 1 },
          { property: "swellDirection", range: 10 },
        ],
        notificationMethod: "app",
        contactInfo: session?.user?.email || "",
        active: true,
        region: logEntry.region || "",
        forecastDate: new Date(logEntry.date),
        logEntryId: logEntry.id,
        alertType: "variables",
        starRating: "4+",
        forecast: null,
        forecastId: null,
        userId: session?.user?.id || "",
      });

      // If the log entry has forecast data, use it
      if (logEntry.forecast) {
        // Map the forecast data to the expected format
        const mappedForecast = {
          windSpeed: logEntry.forecast.windSpeed || 0,
          windDirection: logEntry.forecast.windDirection || 0,
          swellHeight: logEntry.forecast.swellHeight || 0,
          swellPeriod: logEntry.forecast.swellPeriod || 0,
          swellDirection: logEntry.forecast.swellDirection || 0,
        };
        setForecastData(mappedForecast);
      }
    }
  }, [logEntry, existingAlert, session?.user?.email]);

  const createAlertMutation = useMutation({
    mutationFn: async (data: AlertConfigTypes) => {
      const response = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          forecastDate: data.forecastDate,
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
        `/api/raid-logs/forecast?region=${encodeURIComponent(
          region
        )}&date=${encodeURIComponent(dateStr)}`
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
    console.log("Alert type:", alertType);

    // Check if all required fields are present
    if (
      !alertConfig.name ||
      !alertConfig.region ||
      !alertConfig.notificationMethod ||
      !alertConfig.contactInfo
    ) {
      toast.error("Please fill in all required fields");
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
        forecast: null,
        forecastId: null,
        userId: session?.user?.id || "",
      };

      if (isEditing) {
        // Cast alertData to AlertConfig and include the missing properties from existingAlert
        updateAlertMutation.mutate({
          ...alertData,

          forecast: existingAlert?.forecast || null,
          forecastId: existingAlert?.forecastId || null,
          logEntry: existingAlert?.logEntryId || null,
        } as AlertConfig);
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

  // Add this function to get the appropriate unit for each property
  const getPropertyUnit = (property: string): string => {
    switch (property.toLowerCase()) {
      case "windspeed":
        return "kts";
      case "winddirection":
      case "swelldirection":
        return "°";
      case "swellheight":
        return "m";
      case "swellperiod":
        return "s";
      default:
        return "";
    }
  };

  // Add this helper function to map property names to forecast properties
  function getForecastProperty(property: string): string {
    switch (property.toLowerCase()) {
      case "windspeed":
        return "windSpeed";
      case "winddirection":
        return "windDirection";
      case "swellheight":
        return "swellHeight";
      case "swellperiod":
        return "swellPeriod";
      case "swelldirection":
        return "swellDirection";
      default:
        return property;
    }
  }

  // Add this helper function to map property names to forecast properties
  function getForecastPropertyValue(
    forecast: any,
    property: ForecastProperty
  ): number {
    switch (property) {
      case "waveHeight":
        return forecast.swellHeight || 0;
      case "wavePeriod":
        return forecast.swellPeriod || 0;
      default:
        return forecast[property] || 0;
    }
  }

  // In your component:
  const {
    properties,
    updateProperty,
    removeProperty,
    addProperty,
    setProperties,
  } = usePropertyManager(
    existingAlert?.properties || [
      { property: "windSpeed", range: 2 },
      { property: "windDirection", range: 10 },
      { property: "swellHeight", range: 0.2 },
      { property: "swellPeriod", range: 1 },
      { property: "swellDirection", range: 10 },
    ]
  );

  // Update alertConfig when properties change
  useEffect(() => {
    setAlertConfig((prev) => ({
      ...prev,
      properties,
    }));
  }, [properties]);

  // When a log entry is selected, update the alert type based on the log's rating
  useEffect(() => {
    if (selectedLogEntry) {
      setAlertConfig((prev) => ({
        ...prev,
        region: selectedLogEntry.region || prev.region,
        logEntryId: selectedLogEntry.id,
        // If the log has a rating, default to rating-based alert
        alertType: selectedLogEntry.surferRating ? "rating" : prev.alertType,
        starRating:
          selectedLogEntry.surferRating && selectedLogEntry.surferRating >= 5
            ? "5"
            : selectedLogEntry.surferRating &&
                selectedLogEntry.surferRating >= 4
              ? "4+"
              : prev.starRating,
      }));
    }
  }, [selectedLogEntry]);

  // Add React Query caching
  const { data: alert, isLoading } = useQuery({
    queryKey: ["alert", alertConfig.id],
    queryFn: async () => {
      console.log("Fetching alert with ID:", alertConfig.id);
      if (!alertConfig.id) {
        console.log("No alert ID to fetch");
        return null; // Return null instead of undefined
      }
      return fetchAlert();
    },
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    // Add this to prevent the query from running when there's no ID
    enabled: !!alertConfig.id && !!existingAlert?.id,
  });

  useEffect(() => {
    if (existingAlert?.id) {
      fetchAlert();
    }
  }, [existingAlert?.id, fetchAlert]);

  // Update the initialization to avoid "both" comparison
  const [selectedNotificationMethods, setSelectedNotificationMethods] = useState<string[]>(
    existingAlert?.notificationMethod 
      ? (existingAlert.notificationMethod === "email" 
        ? ["email"] 
        : ["app"])
      : ["app"]
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-primary">
            {existingAlert
              ? "Edit Alert"
              : logEntry
                ? `Create Alert from ${logEntry.beachName}'s Log`
                : "Create New Alert"}
          </DialogTitle>
          <DialogDescription className="font-primary">
            {existingAlert
              ? "Modify your existing alert settings"
              : logEntry
                ? "Create an alert based on these logged conditions"
                : "Set up a new alert for specific conditions"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
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
                <BasicSelect
                  value={alertConfig.region || ""}
                  onValueChange={(value) => {
                    console.log("Region selected:", value);
                    setAlertConfig({
                      ...alertConfig,
                      region: value,
                      forecastDate: new Date(),
                    });
                  }}
                  className="w-full font-primary border-gray-300"
                  disabled={
                    isLoadingRegions || isLinkedToLogEntry || !!selectedLogEntry
                  }
                >
                  <BasicOption value="">Select region</BasicOption>
                  {regions.map((region) => (
                    <BasicOption key={region} value={region}>
                      {region}
                    </BasicOption>
                  ))}
                </BasicSelect>
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
                <BasicSelect
                  value={
                    alertConfig.forecastDate &&
                    !isNaN(new Date(alertConfig.forecastDate).getTime())
                      ? new Date(alertConfig.forecastDate)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onValueChange={(value) => {
                    console.log("Date selected:", value);
                    setAlertConfig({
                      ...alertConfig,
                      forecastDate: value ? new Date(value) : new Date(),
                    });
                  }}
                  className="w-full font-primary border-gray-300"
                  disabled={
                    !alertConfig.region ||
                    isLoadingDates ||
                    isLinkedToLogEntry ||
                    !!selectedLogEntry
                  }
                >
                  <BasicOption value="">Select date</BasicOption>
                  {availableDates.map((date) => (
                    <BasicOption key={date} value={date}>
                      {new Date(date).toLocaleDateString()}
                    </BasicOption>
                  ))}
                </BasicSelect>
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
                onValueChange={(value: string) => {
                  setAlertType(value as AlertType);
                  setAlertConfig((prev) => ({
                    ...prev,
                    alertType: value as AlertType,
                  }));
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
                  <Label
                    htmlFor="rating"
                    className="font-primary cursor-pointer"
                  >
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
                  {properties.map((prop, index) => (
                    <div
                      key={index}
                      className="space-y-2 p-4 border rounded-md bg-[var(--color-bg-secondary)] border-[var(--color-border-light)]"
                    >
                      <div className="flex justify-between items-center">
                        <BasicSelect
                          value={prop.property}
                          onValueChange={(value) =>
                            updateProperty({
                              index,
                              key: "property",
                              value: value as ForecastProperty,
                            })
                          }
                          className="font-primary"
                        >
                          {forecastProperties.map((forecastProp) => (
                            <BasicOption
                              key={forecastProp.id}
                              value={forecastProp.id}
                              className="font-primary"
                            >
                              {forecastProp.name}
                            </BasicOption>
                          ))}
                        </BasicSelect>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProperty(index)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          ✕
                        </Button>
                      </div>

                      <div className="mt-2">
                        <div className="flex justify-between items-center">
                          <Label className="font-primary">
                            Variation Range: ±{prop.range}
                            {
                              forecastProperties.find(
                                (fp) => fp.id === prop.property
                              )?.unit
                            }
                          </Label>
                          <span className="text-xs text-gray-500 font-primary">
                            {getPropertyConfig(prop.property).step} increments
                          </span>
                        </div>
                        <Slider
                          min={0}
                          max={getPropertyConfig(prop.property).maxRange}
                          step={getPropertyConfig(prop.property).step}
                          value={[prop.range]}
                          onValueChange={(value) =>
                            updateProperty({
                              index,
                              key: "range",
                              value: value[0],
                            })
                          }
                          className="mt-2"
                        />
                        {selectedLogEntry?.forecast && (
                          <div className="text-xs text-[var(--color-text-secondary)] font-primary mt-1">
                            Range:{" "}
                            {(
                              getForecastPropertyValue(
                                selectedLogEntry.forecast,
                                prop.property
                              ) - prop.range
                            ).toFixed(1)}
                            -{" "}
                            {(
                              getForecastPropertyValue(
                                selectedLogEntry.forecast,
                                prop.property
                              ) + prop.range
                            ).toFixed(1)}{" "}
                            {
                              forecastProperties.find(
                                (fp) => fp.id === prop.property
                              )?.unit
                            }
                          </div>
                        )}
                      </div>
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
                  onValueChange={(value: string) => {
                    setStarRating(value as "4+" | "5");
                    setAlertConfig((prev) => ({
                      ...prev,
                      starRating: value as "4+" | "5",
                    }));
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
                  You'll be notified when the beach conditions match your
                  selected star rating.
                </p>
              </div>
            )}

            {/* Notification Method Checkboxes */}
            <div className="space-y-2">
              <Label className="font-primary flex items-center">
                <span className="bg-gray-200 text-gray-700 rounded-full w-5 h-5 inline-flex items-center justify-center mr-2 text-xs">
                  {!logEntry && !isEditing && !selectedLogEntry
                    ? "7"
                    : selectedLogEntry || logEntry
                      ? "4"
                      : "6"}
                </span>
                Notification Methods
              </Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50">
                  <Checkbox
                    id="app-notification"
                    checked={selectedNotificationMethods.includes("app")}
                    onCheckedChange={(checked) => {
                      setSelectedNotificationMethods((prev) => {
                        const newMethods = [...prev];
                        if (checked) {
                          if (!newMethods.includes("app")) {
                            newMethods.push("app");
                          }
                        } else {
                          const index = newMethods.indexOf("app");
                          if (index !== -1) {
                            newMethods.splice(index, 1);
                          }
                        }

                        // Update the alertConfig with the appropriate value for backward compatibility
                        let compatValue: NotificationMethod = "app";
                        if (
                          newMethods.includes("app") &&
                          newMethods.includes("email")
                        ) {
                          compatValue = "app" as NotificationMethod; // Use app as default when both are selected
                        } else if (newMethods.includes("email")) {
                          compatValue = "email";
                        }

                        setAlertConfig((prev) => ({
                          ...prev,
                          notificationMethod: compatValue,
                        }));

                        return newMethods;
                      });
                    }}
                  />
                  <Label
                    htmlFor="app-notification"
                    className="font-primary cursor-pointer"
                  >
                    In-App Notification
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50">
                  <Checkbox
                    id="email-notification"
                    checked={selectedNotificationMethods.includes("email")}
                    onCheckedChange={(checked) => {
                      setSelectedNotificationMethods((prev) => {
                        const newMethods = [...prev];
                        if (checked) {
                          if (!newMethods.includes("email")) {
                            newMethods.push("email");
                          }
                        } else {
                          const index = newMethods.indexOf("email");
                          if (index !== -1) {
                            newMethods.splice(index, 1);
                          }
                        }

                        // Update the alertConfig with the appropriate value for backward compatibility
                        let compatValue: NotificationMethod = "app";
                        if (
                          newMethods.includes("app") &&
                          newMethods.includes("email")
                        ) {
                          compatValue = "app" as NotificationMethod; // Use app as default when both are selected
                        } else if (newMethods.includes("email")) {
                          compatValue = "email";
                        }

                        setAlertConfig((prev) => ({
                          ...prev,
                          notificationMethod: compatValue,
                        }));

                        return newMethods;
                      });
                    }}
                  />
                  <Label
                    htmlFor="email-notification"
                    className="font-primary cursor-pointer"
                  >
                    Email
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50">
                  <Checkbox
                    id="whatsapp-notification"
                    disabled
                    checked={selectedNotificationMethods.includes("whatsapp")}
                  />
                  <Label
                    htmlFor="whatsapp-notification"
                    className="font-primary cursor-pointer text-gray-400"
                  >
                    WhatsApp (Coming Soon)
                  </Label>
                </div>
              </div>
            </div>

            {/* Step 6: Contact Info - Only show for email/WhatsApp */}
            {alertConfig.notificationMethod !== "app" && (
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
            )}

            {/* Alert Status Toggle */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <Button
                type="button"
                variant={alertConfig.active ? "default" : "outline"}
                onClick={() =>
                  setAlertConfig({
                    ...alertConfig,
                    active: !alertConfig.active,
                  })
                }
                className={cn(
                  "font-primary transition-colors",
                  alertConfig.active
                    ? "bg-primary hover:bg-primary/90"
                    : "border-2 border-gray-200"
                )}
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
            {logEntry && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm font-primary text-black flex items-center">
                  <InfoIcon className="w-4 h-4 mr-2" />
                  This alert is based on {logEntry.surferName}'s log entry for{" "}
                  {logEntry.beachName}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Date: {format(new Date(logEntry.date), "MMM d, yyyy")}
                </p>
                {logEntry.forecast && (
                  <p className="text-xs text-blue-600">
                    Using forecast data from this log entry
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Forecast data display with better visual hierarchy */}
          <div className="space-y-2 border rounded-md p-4 bg-blue-50/50 border-blue-100">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1 p-3 bg-white rounded-md border border-blue-100">
                <span className="text-gray-500">Wind Speed</span>
                <span className="font-medium">
                  {forecastData?.windSpeed || 0} knots
                </span>
              </div>
              <div className="flex flex-col space-y-1 p-3 bg-white rounded-md border border-blue-100">
                <span className="text-gray-500">Wind Direction</span>
                <span className="font-medium">
                  {forecastData?.windDirection || 0}°
                </span>
              </div>
              <div className="flex flex-col space-y-1 p-3 bg-white rounded-md border border-blue-100">
                <span className="text-gray-500">Wave Height</span>
                <span className="font-medium">
                  {forecastData?.swellHeight || 0}m
                </span>
              </div>
              <div className="flex flex-col space-y-1 p-3 bg-white rounded-md border border-blue-100">
                <span className="text-gray-500">Wave Period</span>
                <span className="font-medium">
                  {forecastData?.swellPeriod || 0}s
                </span>
              </div>
            </div>
          </div>

          {/* Alert status with improved visibility */}
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-100"></div>
        </div>

        <DialogFooter className="border-t bg-gray-50 p-4 rounded-b-lg">
          <Button
            onClick={saveAlert}
            className={cn(
              "font-primary w-full sm:w-auto",
              "bg-primary hover:bg-primary/90 transition-colors"
            )}
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
