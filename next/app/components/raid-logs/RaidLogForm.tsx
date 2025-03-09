"use client";
import { useState, useEffect } from "react";
import { Star, Search, X, Upload, Lock, Bell } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/app/lib/utils";
import type { Beach } from "@/app/types/beaches";
import type { CreateLogEntryInput, LogEntry } from "@/app/types/questlogs";
import SurfForecastWidget from "../SurfForecastWidget";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { validateFile, compressImageIfNeeded } from "@/app/lib/file";
import { useSubscription } from "@/app/context/SubscriptionContext";
import { useSession } from "next-auth/react";
import { Select, SelectItem } from "@/components/ui/select";
import { useHandleTrial } from "@/app/hooks/useHandleTrial";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { format } from "date-fns";
import { getCardinalDirection } from "@/lib/forecastUtils";
import { AlertConfig } from "@/app/components/alerts/AlertConfiguration";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/app/components/ui/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useForecast } from "@/app/hooks/useForecast";

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
  isOpen,
  onClose,
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
  const [createAlert, setCreateAlert] = useState<boolean>(false);
  const [alertRange, setAlertRange] = useState<number>(10); // Default 10% range
  const [alertNotificationMethod, setAlertNotificationMethod] = useState<
    "email" | "whatsapp" | "both"
  >("email");
  const [alertContactInfo, setAlertContactInfo] = useState<string>("");
  const { toast } = useToast();

  // Initialize contact info with user email if available
  useEffect(() => {
    if (userEmail) {
      setAlertContactInfo(userEmail);
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
      router.push("/raidlogs");

      // Create alert if requested
      if (createAlert && selectedBeach && forecastData) {
        try {
          const alertConfig = {
            name: `Alert for ${selectedBeach.name}`,
            region: selectedBeach.region,
            date: selectedDate,
            properties: [
              { property: "windSpeed", range: alertRange },
              { property: "windDirection", range: alertRange },
              { property: "swellHeight", range: alertRange },
              { property: "swellPeriod", range: alertRange },
            ],
            notificationMethod: alertNotificationMethod,
            contactInfo: alertContactInfo,
            active: true,
            logEntryId: data.id,
            alertType: "variables",
          };

          const alertResponse = await fetch("/api/alerts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(alertConfig),
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
        forecast: forecastData,
        continent: selectedBeach.continent,
        country: selectedBeach.country,
        region: selectedBeach.region,
        waveType: selectedBeach.waveType,
        isAnonymous,
        isPrivate,
        id: entry?.id,
      };

      await createLogEntry.mutateAsync(newEntry);
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

        setForecast(data);
        return data;
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white max-h-[90vh] overflow-y-auto">
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
            onClick={onClose}
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
                  <Select
                    value={selectedBeach?.name || ""}
                    onValueChange={(value) => {
                      const beach = beaches?.find((b) => b.name === value);
                      if (beach) handleBeachSelect(beach);
                    }}
                  >
                    <SelectItem value="" disabled>
                      Choose a beach...
                    </SelectItem>
                    {Array.isArray(beaches) && beaches.length > 0 ? (
                      beaches.map((beach) => (
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
                    {forecastData === null ? (
                      <div className="text-black font-primary">Loading...</div>
                    ) : !forecastData ? (
                      <div className="text-gray-600 font-primary">
                        Loading forecast data...
                      </div>
                    ) : (
                      <SurfForecastWidget
                        beachId={selectedBeach.id}
                        selectedDate={selectedDate}
                        forecast={forecastData}
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
                        onChange={(e) => setCreateAlert(e.target.checked)}
                      />
                      <label
                        htmlFor="create-alert"
                        className="font-primary flex items-center"
                      >
                        <Bell className="h-4 w-4 mr-1" />
                        Create Alert for Similar Conditions
                      </label>
                    </div>

                    {createAlert && (
                      <div className="pl-6 space-y-3 mt-2">
                        <div>
                          <label className="text-sm font-primary block mb-1">
                            Accuracy Range (±%)
                          </label>
                          <div className="flex items-center">
                            <input
                              type="range"
                              min="5"
                              max="30"
                              step="5"
                              value={alertRange}
                              onChange={(e) =>
                                setAlertRange(parseInt(e.target.value))
                              }
                              className="w-full mr-2"
                            />
                            <span className="text-sm font-primary w-10">
                              ±{alertRange}%
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-primary block mb-1">
                            Notification Method
                          </label>
                          <select
                            value={alertNotificationMethod}
                            onChange={(e) =>
                              setAlertNotificationMethod(e.target.value as any)
                            }
                            className="w-full p-2 border rounded-md font-primary"
                          >
                            <option value="email">Email</option>
                            <option value="whatsapp">WhatsApp</option>
                            <option value="both">Both</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-primary block mb-1">
                            {alertNotificationMethod === "email"
                              ? "Email Address"
                              : alertNotificationMethod === "whatsapp"
                                ? "WhatsApp Number"
                                : "Email & WhatsApp"}
                          </label>
                          <input
                            type="text"
                            value={alertContactInfo}
                            onChange={(e) =>
                              setAlertContactInfo(e.target.value)
                            }
                            placeholder={
                              alertNotificationMethod === "email"
                                ? "you@example.com"
                                : alertNotificationMethod === "whatsapp"
                                  ? "+1234567890"
                                  : "email@example.com, +1234567890"
                            }
                            className="w-full p-2 border rounded-md font-primary"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={
                  !forecastData ||
                  !selectedBeach ||
                  !selectedDate ||
                  isSubmitting
                }
                className="w-full bg-[var(--color-tertiary)] text-white font-primary"
              >
                {isSubmitting ? "Submitting..." : "Log Session"}
              </Button>
            </div>
          </form>

          {forecastData && (
            <div className="p-4 bg-gray-100 rounded-lg mt-4">
              <h4 className="font-semibold mb-2 font-primary">
                Debug Forecast Data
              </h4>
              <pre className="text-xs">
                {JSON.stringify(forecastData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
