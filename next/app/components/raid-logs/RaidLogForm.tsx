"use client";
import { useState, useEffect } from "react";
import { Star, Search, X, Upload, Lock } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
        throw new Error("Failed to create log entry");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["raidLogs"] });
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.6 },
      });
      setIsSubmitted(true);
      router.push("/raidlogs");
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
    if (!selectedBeach || !selectedDate || !forecast) {
      console.error("Missing required data:", {
        selectedBeach,
        selectedDate,
        forecast,
      });
      alert("Please select a beach and date");
      return;
    }

    const formattedForecast = {
      wind: {
        speed: forecast.entries[0].wind.speed,
        direction: forecast.entries[0].wind.direction,
      },
      swell: {
        height: forecast.entries[0].swell.height,
        period: forecast.entries[0].swell.period,
        direction: forecast.entries[0].swell.direction,
        cardinalDirection: forecast.entries[0].swell.cardinalDirection,
      },
      timestamp: forecast.entries[0].timestamp,
    };

    const newEntry = {
      beachName: selectedBeach.name,
      date: selectedDate,
      surferEmail: userEmail,
      surferName: isAnonymous
        ? "Anonymous"
        : (session?.user as { name?: string })?.name ||
          userEmail?.split("@")[0] ||
          "Anonymous Surfer",
      userId: session!.user.id,
      surferRating: surferRating,
      comments,
      forecast: formattedForecast,
      continent: selectedBeach.continent,
      country: selectedBeach.country,
      region: selectedBeach.region,
      waveType: selectedBeach.waveType,
      isAnonymous,
      isPrivate,
      id: entry?.id,
    };

    console.log("[Submission] Forecast data:", formattedForecast);
    console.log("[Submission] Final Payload:", newEntry);

    setIsSubmitting(true);
    try {
      let imageUrl = uploadedImageUrl;
      if (!imageUrl) {
        if (selectedImage) {
          try {
            imageUrl = await handleImageUpload(selectedImage);
          } catch (uploadError) {
            console.error("Image upload failed:", uploadError);
            alert("Failed to upload image");
            setIsSubmitting(false);
            return;
          }
        }
      }

      await createLogEntry.mutateAsync(newEntry);
      console.log("Log entry created successfully");

      // Success handling
      setIsSubmitted(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Reset form
      setTimeout(() => {
        setSelectedDate(new Date().toISOString().split("T")[0]);
        setSelectedBeach(null);
        setSurferRating(0);
        setComments("");
        setSelectedImage(null);
        setImagePreview(null);
        setUploadedImageUrl("");
        setIsSubmitting(false);
        setIsSubmitted(false);
      }, 2000);
    } catch (error) {
      console.error("Form submission error:", error);
      alert("Failed to submit log entry");
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
    await fetchForecast(beach);
  };

  const fetchForecast = async (beach: Beach) => {
    try {
      console.log("Fetching forecast for:", {
        date: selectedDate,
        region: beach.region,
      });

      const response = await fetch(
        `/api/raid-logs?date=${selectedDate}&region=${encodeURIComponent(beach.region)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch forecast");
      }

      const data = await response.json();

      if (data && data.entries && data.entries.length > 0) {
        setForecast(data);
      } else {
        setForecast(null);
      }
    } catch (error) {
      console.error("Error loading forecast:", error);
      setForecast(null);
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
      fetchForecast(selectedBeach);
    }
  }, [selectedBeach, selectedDate]);

  const handleSubscriptionAction = () => {
    if (!session?.user) {
      signIn("google");
      return;
    }

    if (!hasActiveTrial) {
      handleTrial();
    } else {
      router.push("/pricing");
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <div className="relative bg-white rounded-lg shadow-xl max-w-[95%] lg:max-w-[1200px] w-full m-4 p-4 lg:p-6 overflow-y-auto max-h-[90vh]">
            {!isSubscribed && !hasActiveTrial && (
              <div className="absolute inset-0 bg-gray-100/50 backdrop-blur-[2px] z-10 rounded-lg" />
            )}

            {!isSubscribed && !hasActiveTrial && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20 gap-4">
                <Lock className="h-16 w-16 text-gray-400" />
                <div className="text-center px-4">
                  <h3 className="text-lg font-semibold mb-2">
                    Start Logging Your Sessions
                  </h3>
                  <p className="text-gray-600 mb-4">
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

            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>

            <h2 className="text-xl font-semibold mb-4">Log Session</h2>

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
                    onChange={(e) => setSelectedDate(e.target.value)}
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
                      {forecast ? (
                        <SurfForecastWidget
                          beachId={selectedBeach.id}
                          date={selectedDate}
                          forecast={forecast}
                        />
                      ) : (
                        <div>Loading forecast data...</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 4: Rating */}
                {forecast && (
                  <div className="step">
                    <h3 className="text-lg font-semibold mb-2">
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
                    <h3 className="text-lg font-semibold mb-2">
                      5. Add Comments
                    </h3>
                    <textarea
                      value={comments}
                      onChange={(e) =>
                        setComments(e.target.value.slice(0, 140))
                      }
                      className="w-full p-2 border rounded-lg"
                      rows={4}
                      placeholder="How was your session?"
                      maxLength={140}
                    />
                    <div className="text-sm text-gray-500 mt-1">
                      Characters remaining: {140 - comments.length}
                    </div>
                  </div>
                )}

                {/* Optional Steps */}
                <div className="step">
                  <h3 className="text-lg font-semibold mb-2">
                    Additional Options
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="anonymous"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                      />
                      <label htmlFor="anonymous">Post Anonymously</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="private"
                        checked={isPrivate}
                        onChange={(e) => setIsPrivate(e.target.checked)}
                      />
                      <label htmlFor="private">Keep Private</label>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={
                    !forecast || !selectedBeach || !selectedDate || isSubmitting
                  }
                  className="w-full bg-[var(--color-tertiary)] text-white"
                >
                  {isSubmitting ? "Submitting..." : "Log Session"}
                </Button>
              </div>
            </form>

            {forecast && (
              <div className="p-4 bg-gray-100 rounded-lg mt-4">
                <h4 className="font-semibold mb-2">Debug Forecast Data</h4>
                <pre className="text-xs">
                  {JSON.stringify(forecast, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
