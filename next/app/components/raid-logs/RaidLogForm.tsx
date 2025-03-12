"use client";
import { useState, useEffect } from "react";
import { Star, Search, X, Upload, Lock, Bell } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { cn } from "@/app/lib/utils";
import type { Beach } from "@/app/types/beaches";
import type { CreateLogEntryInput, LogEntry } from "@/app/types/questlogs";
import SurfForecastWidget from "../SurfForecastWidget";
import confetti from "canvas-confetti";
import { Button } from "@/app/components/ui/Button";
import { validateFile, compressImageIfNeeded } from "@/app/lib/file";
import { useSubscription } from "@/app/context/SubscriptionContext";
import { useSession } from "next-auth/react";
import { Select, SelectItem } from "@/app/components/ui/Select";
import { useHandleTrial } from "@/app/hooks/useHandleTrial";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { format } from "date-fns";
import { useToast } from "@/app/components/ui/use-toast";
import { Dialog, DialogContent } from "@/app/components/ui/Dialog";
import { useForecast } from "@/app/hooks/useForecast";
import { AlertConfiguration } from "../alerts/AlertConfiguration";
import {
  Alert,
  AlertConfigTypes,
  ForecastProperty,
  NotificationMethod,
} from "@/types/alerts";
import { Checkbox } from "@/app/components/ui/Checkbox";

interface RaidLogFormProps {
  userEmail?: string;
  isOpen?: boolean;
  onClose?: () => void;
  beaches?: Beach[];
  entry?: LogEntry;
  isEditing?: boolean;
}

export function RaidLogForm({
  userEmail,
  isOpen = false,
  onClose = () => {},
  beaches,
  entry,
  isEditing,
}: RaidLogFormProps) {
  const queryClient = useQueryClient();
  const { isSubscribed, hasActiveTrial } = useSubscription();
  const { data: session } = useSession();
  const router = useRouter();
  const { mutate: handleTrial } = useHandleTrial();
  const [selectedDate, setSelectedDate] = useState<string>(
    entry?.date ? format(new Date(entry.date), "yyyy-MM-dd") : ""
  );
  const [selectedBeach, setSelectedBeach] = useState<Beach | null>(
    entry?.beachId ? beaches?.find((b) => b.id === entry.beachId) || null : null
  );
  const [surferRating, setSurferRating] = useState(entry?.surferRating || 0);
  const [comments, setComments] = useState(entry?.comments || "");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [forecast, setForecast] = useState<any>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [isHovered, setIsHovered] = useState(false);
  const [isPrivate, setIsPrivate] = useState<boolean>(
    entry?.isPrivate || false
  );
  const [createAlert, setCreateAlert] = useState<boolean>(
    !!entry?.existingAlert
  );
  const [alertConfig, setAlertConfig] = useState<AlertConfigTypes>({
    id: entry?.existingAlert?.id || crypto.randomUUID(),
    name: entry?.existingAlert?.name || "",
    region: selectedBeach?.region || "",
    properties: entry?.existingAlert?.properties || [
      { property: "windSpeed", range: 5 },
      { property: "windDirection", range: 15 },
      { property: "swellHeight", range: 0.5 },
      { property: "swellPeriod", range: 2 },
    ],
    notificationMethod: entry?.existingAlert?.notificationMethod || "app",
    contactInfo: userEmail || "",
    active: true,
    forecastDate: new Date(),
    alertType: entry?.existingAlert?.alertType || "rating",
    starRating: entry?.existingAlert?.starRating || "4+",
    logEntryId: entry?.id || null,
    forecast: null,
    forecastId: null,
    userId: session?.user?.id || "",
  });
  const { toast } = useToast();

  // Add this query to fetch the alert
  const { data: existingAlert } = useQuery({
    queryKey: ["alert", entry?.id],
    queryFn: async () => {
      if (!entry?.id) return null;
      const response = await fetch(`/api/alerts?logEntryId=${entry.id}`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!entry?.id,
  });

  // Initialize contact info with user email if available
  useEffect(() => {
    if (userEmail) {
      setAlertConfig((prev) => ({
        ...prev,
        contactInfo: userEmail,
      }));
    }
  }, [userEmail]);

  const { data: forecastData } = useForecast(
    selectedBeach?.region || "",
    new Date(selectedDate)
  );

  const createLogEntry = useMutation({
    mutationFn: async (newEntry: CreateLogEntryInput) => {
      const method = entry?.id ? "PATCH" : "POST";
      const response = await fetch(
        `/api/raid-logs${entry?.id ? `/${entry.id}` : ""}`,
        {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newEntry),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit log entry");
      }

      return response.json();
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["raidLogs"] });
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.6 },
      });
      setIsSubmitted(true);

      // Create alert if requested
      if (createAlert && selectedBeach && forecastData) {
        try {
          // Use the alertConfig instead of building a new object
          const alertToCreate = {
            ...alertConfig,
            name: alertConfig.name || `Alert for ${selectedBeach.name}`,
            region: selectedBeach.region,
            forecastDate: new Date(selectedDate),
            logEntryId: data.id,
          };

          const alertResponse = await fetch("/api/alerts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(alertToCreate),
          });

          if (!alertResponse.ok) {
            throw new Error("Failed to create alert");
          }

          toast({
            title: "Alert Created",
            description:
              "You'll be notified when forecast conditions match this session.",
          });

          queryClient.invalidateQueries({ queryKey: ["alerts"] });
        } catch (error) {
          console.error("Error creating alert:", error);
          toast({
            title: "Alert Creation Failed",
            description: "Could not create alert. Please try again.",
            variant: "destructive",
          });
        }
      }

      // Close the modal and redirect after everything is done
      router.push("/raidlogs");
      if (onClose) {
        onClose();
      }
    },
  });

  const handleImageUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Upload failed");

    const data = await response.json();
    return data.imageUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBeach || !selectedDate) {
      alert("Please select a beach and date");
      return;
    }

    setIsSubmitting(true);

    try {
      // First, ensure we have the forecast data
      if (!forecastData) {
        console.log("Fetching forecast before submission...");
        await fetchForecastData(selectedBeach);
        // Add a small delay to ensure forecast is set
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      if (!forecastData) {
        throw new Error("Failed to fetch forecast data");
      }

      // Create the log entry data with the forecast object properly structured
      const newEntry = {
        beachName: selectedBeach.name,
        date: new Date(selectedDate),
        surferEmail: userEmail,
        surferName: isAnonymous
          ? "Anonymous"
          : (session?.user as { name?: string })?.name ||
            userEmail?.split("@")[0] ||
            "Anonymous Surfer",
        userId: session!.user.id,
        surferRating: surferRating,
        comments,
        continent: selectedBeach.continent,
        country: selectedBeach.country,
        region: selectedBeach.region,
        waveType: selectedBeach.waveType,
        isAnonymous,
        isPrivate,
        forecast: forecastData,
        createAlert,
        alertConfig: createAlert ? alertConfig : undefined,
      };

      const logEntryResponse = await createLogEntry.mutateAsync(newEntry);

      // No need for separate alert creation here as it's handled in the mutation's onSuccess
    } catch (error) {
      console.error("Form submission error:", error);
      alert("Failed to submit log entry: " + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBeaches =
    beaches?.filter((beach) =>
      beach.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handleBeachSelect = async (beach: Beach) => {
    setSelectedBeach(beach);
    if (!selectedDate) {
      alert("Please select a date first");
      return;
    }
    await fetchForecastData(beach);
  };

  const fetchForecastData = async (beach: Beach) => {
    try {
      const fetchWithRetry = async (retryAttempt = 0, maxRetries = 3) => {
        if (retryAttempt >= maxRetries) {
          throw new Error("Maximum retry attempts reached");
        }

        const response = await fetch(
          `/api/surf-conditions?` +
            new URLSearchParams({
              date: selectedDate,
              region: beach.region,
              retry: retryAttempt.toString(),
            })
        );

        const data = await response.json();

        if (response.status === 202) {
          // Server requested retry
          console.log(`Attempt ${retryAttempt + 1}: Retrying in 5 seconds...`);
          await new Promise((resolve) => setTimeout(resolve, 5000));
          return fetchWithRetry(retryAttempt + 1, maxRetries);
        }

        if (!response.ok) {
          console.error("Forecast fetch error:", data);
          if (data.error) {
            throw new Error(data.error);
          }
          throw new Error(`Failed to fetch forecast: ${response.statusText}`);
        }

        console.log("Received forecast data:", data);

        // Ensure data is properly formatted according to ForecastA schema
        const formattedData = {
          date: new Date(selectedDate),
          region: beach.region,
          windSpeed: parseInt(data.windSpeed) || 0,
          windDirection: parseFloat(data.windDirection) || 0,
          swellHeight: parseFloat(data.swellHeight) || 0,
          swellPeriod: parseInt(data.swellPeriod) || 0,
          swellDirection: parseFloat(data.swellDirection) || 0,
        };

        console.log("Formatted forecast data:", formattedData);
        setForecast(formattedData);
        return formattedData;
      };

      return fetchWithRetry();
    } catch (error) {
      console.error("Error loading forecast:", error);
      setForecast(null);
      // Optionally show user-friendly error message
      alert(
        `Unable to load forecast data: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      return null;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    try {
      // Compress if needed
      const processedFile = await compressImageIfNeeded(file);
      setSelectedImage(processedFile);
      setImagePreview(URL.createObjectURL(processedFile));
    } catch (error) {
      console.error("Error processing image:", error);
      alert("Failed to process image");
    }
  };

  // Initialize selected beach when entry changes
  useEffect(() => {
    if (!beaches || !entry?.beachName) return;

    const initialBeach = beaches.find((b) => b.name === entry.beachName);
    setSelectedBeach(initialBeach || null);
  }, [entry, beaches]);

  // Update useEffect to use this function
  useEffect(() => {
    if (selectedBeach && selectedDate) {
      fetchForecastData(selectedBeach);
    }
  }, [selectedBeach, selectedDate]);

  // Update useEffect to set the region in alertConfig when selectedBeach changes
  useEffect(() => {
    if (selectedBeach) {
      setAlertConfig((prev) => ({
        ...prev,
        region: selectedBeach.region,
        name: `Alert for ${selectedBeach.name}`,
      }));
    }
  }, [selectedBeach]);

  // Update the initial state setup
  useEffect(() => {
    if (existingAlert) {
      setCreateAlert(true);
      setAlertConfig(existingAlert);
    }
  }, [existingAlert]);

  // Improve the safeParseFloat function to handle more edge cases
  const safeParseFloat = (value: any): number => {
    if (value === undefined || value === null) return 0;
    // Handle string numbers with commas
    if (typeof value === "string") {
      value = value.replace(",", ".");
    }
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Add a debug function to help identify issues
  const debugForecastData = (data: any) => {
    if (!data) return;
    console.log("Forecast data for alert:", {
      windSpeed: safeParseFloat(data.windSpeed),
      windDirection: safeParseFloat(data.windDirection),
      swellHeight: safeParseFloat(data.swellHeight),
      swellPeriod: safeParseFloat(data.swellPeriod),
      swellDirection: safeParseFloat(data.swellDirection),
    });
  };

  // Add this useEffect to log forecast data when it changes
  useEffect(() => {
    if (forecastData) {
      debugForecastData(forecastData);
    }
  }, [forecastData]);

  const handleSubscriptionAction = () => {
    if (!session?.user) {
      signIn("google");
      return;
    }

    if (!hasActiveTrial) {
      handleTrial({});
    } else {
      router.push("/pricing");
    }
  };

  // Only render if isOpen is true
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white max-h-[90vh] overflow-y-auto p-6 rounded-lg w-full max-w-md">
        {!isSubscribed && !hasActiveTrial && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 rounded-lg" />
        )}

        {!isSubscribed && !hasActiveTrial && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 gap-4 bg-white/50">
            <Lock className="h-16 w-16 text-gray-400" />
            <div className="text-center px-4">
              <h3 className="text-lg font-semibold mb-2 font-primary">
                Start Logging Your Sessions
              </h3>
              <p className="text-gray-600 mb-4 font-primary">
                Track your surf journey with detailed logs and insights
              </p>
              <Button
                variant="secondary"
                onClick={handleSubscriptionAction}
                className="font-primary bg-[var(--color-tertiary)] text-white hover:bg-[var(--color-tertiary)]/90"
              >
                {!session?.user
                  ? "Sign in to Start"
                  : hasActiveTrial
                    ? "Subscribe Now"
                    : "Start Free Trial"}
              </Button>
            </div>
          </div>
        )}

        <div className="relative">
          <button
            onClick={() => {
              console.log("Close button clicked"); // Add this for debugging
              onClose();
            }}
            className="absolute top-0 right-0 text-gray-400 hover:text-gray-500 z-[102]"
            type="button"
          >
            <X className="h-6 w-6" />
          </button>

          <h2 className="text-xl font-semibold mb-4 font-primary">
            Log Session
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="steps-container space-y-6">
              {/* Step 1: Date Selection */}
              <div className="step">
                <h4 className="text-[12px] font-semibold mb-2 font-primary">
                  1. Select Date
                </h4>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) =>
                    setSelectedDate(e.target.value.split("T")[0])
                  }
                  max={new Date().toISOString().split("T")[0]}
                  required
                  className="p-2 border rounded"
                />
              </div>

              {/* Step 2: Beach Selection */}
              <div className="step">
                <h4 className="text-[12px] font-semibold mb-2 font-primary">
                  2. Select Beach
                </h4>
                <div className="relative">
                  <div className="flex items-center border rounded-md mb-2">
                    <Search className="h-4 w-4 ml-2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search beaches..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="p-2 w-full font-primary text-sm focus:outline-none"
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm("")}
                        className="mr-2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {searchTerm && filteredBeaches.length > 0 && (
                    <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredBeaches.slice(0, 5).map((beach) => (
                        <div
                          key={beach.id}
                          className="p-2 hover:bg-gray-100 cursor-pointer font-primary"
                          onClick={() => {
                            handleBeachSelect(beach);
                            setSearchTerm("");
                          }}
                        >
                          {beach.name}
                        </div>
                      ))}
                      {filteredBeaches.length > 5 && (
                        <div className="p-2 text-sm text-gray-500 font-primary text-center border-t">
                          {filteredBeaches.length - 5} more results...
                        </div>
                      )}
                    </div>
                  )}

                  <Select
                    value={selectedBeach?.name || ""}
                    onValueChange={(value) => {
                      const beach = beaches?.find((b) => b.name === value);
                      if (beach) handleBeachSelect(beach);
                    }}
                  >
                    <SelectItem value="" disabled>
                      {selectedBeach ? selectedBeach.name : "Choose a beach..."}
                    </SelectItem>
                    {Array.isArray(beaches) && beaches.length > 0 ? (
                      beaches.slice(0, 5).map((beach) => (
                        <SelectItem key={beach.id} value={beach.name}>
                          {beach.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No beaches available ({beaches?.length || 0} beaches)
                      </SelectItem>
                    )}
                  </Select>
                </div>
              </div>

              {/* Step 3: Forecast Display */}
              {selectedBeach && selectedDate && (
                <div className="step">
                  <h4 className="text-[12px] font-semibold mb-2 font-primary">
                    3. Surf Conditions
                  </h4>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    {forecast === null ? (
                      <div className="text-black font-primary">Loading...</div>
                    ) : !forecast ? (
                      <div className="text-gray-600 font-primary">
                        Loading forecast data...
                      </div>
                    ) : (
                      <SurfForecastWidget
                        beachId={selectedBeach.id}
                        selectedDate={selectedDate}
                        forecast={forecast}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Rating */}
              {forecastData && (
                <div className="step">
                  <h3 className="text-lg font-semibold mb-2 font-primary">
                    4. Rate Your Session
                  </h3>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setSurferRating(rating)}
                        className={cn(
                          "p-1",
                          rating <= surferRating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        )}
                      >
                        <Star className="w-6 h-6 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 5: Comments */}
              {surferRating > 0 && (
                <div className="step">
                  <h3 className="text-lg font-semibold mb-2 font-primary">
                    5. Add Comments
                  </h3>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value.slice(0, 140))}
                    className="w-full p-2 border rounded-lg"
                    rows={4}
                    placeholder="How was your session?"
                    maxLength={140}
                  />
                  <div className="text-sm text-gray-500 mt-1 font-primary">
                    Characters remaining: {250 - comments.length}
                  </div>
                </div>
              )}

              {/* Optional Steps */}
              <div className="step">
                <h3 className="text-lg font-semibold mb-2 font-primary">
                  Additional Options
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                    />
                    <label htmlFor="anonymous" className="font-primary">
                      Post Anonymously
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="private"
                      checked={isPrivate}
                      onChange={(e) => setIsPrivate(e.target.checked)}
                    />
                    <label htmlFor="private" className="font-primary">
                      Keep Private
                    </label>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <input
                        type="checkbox"
                        id="create-alert"
                        checked={createAlert}
                        onChange={(e) => {
                          setCreateAlert(e.target.checked);
                          // Initialize alert config with forecast data when checkbox is checked
                          if (e.target.checked && forecastData) {
                            setAlertConfig((prev) => ({
                              ...prev,
                              name: `Alert for ${selectedBeach?.name || "session"}`,
                              region: selectedBeach?.region || "",
                              // Set alert type to rating by default since we're creating from a rated session
                              alertType: "rating",
                              // Use the user's rating for this session as the minimum star rating
                              starRating: surferRating >= 5 ? "5" : "4+",
                              properties: [
                                {
                                  property: "windSpeed" as ForecastProperty,
                                  range: 5,
                                },
                                {
                                  property: "windDirection" as ForecastProperty,
                                  range: 15,
                                },
                                {
                                  property: "swellHeight" as ForecastProperty,
                                  range: 0.5,
                                },
                                {
                                  property: "swellPeriod" as ForecastProperty,
                                  range: 2,
                                },
                              ],
                              forecast: forecastData || null,
                            }));
                          }
                        }}
                      />
                      <label
                        htmlFor="create-alert"
                        className="font-primary flex items-center"
                      >
                        <Bell className="h-4 w-4 mr-1" />
                        {existingAlert
                          ? "Edit Alert"
                          : "Create Alert for Similar Conditions"}
                      </label>
                    </div>

                    {createAlert && (
                      <div className="pl-6 mt-2">
                        <AlertConfiguration
                          onSave={(config) => setAlertConfig(config)}
                          existingConfig={{
                            ...alertConfig,
                            region: selectedBeach?.region || "",
                            forecast: null, // Don't pass forecast here to avoid conflicts
                            notificationMethod: alertConfig.notificationMethod,
                            // Make sure we pass the alert type and star rating
                            alertType: alertConfig.alertType,
                            starRating: alertConfig.starRating,
                          }}
                          selectedLogEntry={
                            forecastData
                              ? {
                                  forecast: {
                                    // Explicitly convert each value to a number and provide fallbacks
                                    windSpeed: Number(
                                      forecastData.windSpeed || 0
                                    ),
                                    windDirection: Number(
                                      forecastData.windDirection || 0
                                    ),
                                    waveHeight: Number(
                                      forecastData.swellHeight || 0
                                    ),
                                    wavePeriod: Number(
                                      forecastData.swellPeriod || 0
                                    ),
                                    swellDirection: Number(
                                      forecastData.swellDirection || 0
                                    ),
                                    temperature: 0,
                                  },
                                  region: selectedBeach?.region || "",
                                }
                              : undefined
                          }
                          isEmbedded={true}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <Button
                type="submit"
                disabled={
                  !forecastData ||
                  !selectedBeach ||
                  !selectedDate ||
                  isSubmitting
                }
                variant="outline"
                className="w-full font-primary"
              >
                {isSubmitting
                  ? "Submitting..."
                  : createAlert
                    ? "Save Log & Alert"
                    : "Log Session"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
