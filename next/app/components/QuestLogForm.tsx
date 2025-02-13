"use client";
import { useState, useEffect } from "react";
import { Star, Search, X, Upload, Lock } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/app/lib/utils";
import type { Beach } from "@/app/types/beaches";
import type { CreateLogEntryInput, LogEntry } from "@/app/types/questlogs";
import SurfForecastWidget from "./SurfForecastWidget";
import confetti from "canvas-confetti";
import { Button } from "@/app/components/ui/Button";
import { validateFile, compressImageIfNeeded } from "@/app/lib/file";
import { useSubscription } from "@/app/context/SubscriptionContext";
import { useSession } from "next-auth/react";
import { Select, SelectItem } from "@/app/components/ui/Select";
import { useHandleTrial } from "@/app/hooks/useHandleTrial";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

interface QuestLogFormProps {
  userEmail?: string;
  isOpen?: boolean;
  onClose?: () => void;
  beaches?: Beach[];
  entry?: LogEntry;
  isEditing?: boolean;
}

export function QuestLogForm({
  userEmail,
  isOpen,
  onClose,
  beaches,
  entry,
  isEditing,
}: QuestLogFormProps) {
  const queryClient = useQueryClient();
  const { isSubscribed, hasActiveTrial } = useSubscription();
  const { data: session } = useSession();
  const router = useRouter();
  const { mutate: handleTrial } = useHandleTrial();
  const [selectedDate, setSelectedDate] = useState(
    entry?.date ? new Date(entry.date).toISOString().split("T")[0] : ""
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
        `/api/quest-log${entry?.id ? `/${entry.id}` : ""}`,
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
      queryClient.invalidateQueries({ queryKey: ["questLogs"] });
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
    if (!selectedBeach || !selectedDate || !userEmail) return;

    // Debug: Log full forecast state
    console.log("Form submission forecast data:", {
      wind: forecast?.wind,
      swell: forecast?.swell,
      rawForecast: forecast,
    });

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

      // Use the forecast data we already have in state
      const newEntry = {
        beachName: selectedBeach.name,
        date: selectedDate,
        surferEmail: userEmail,
        surferName: isAnonymous
          ? "Anonymous"
          : (session?.user as { name?: string })?.name ||
            userEmail.split("@")[0],
        userId: session!.user.id,
        surferRating: surferRating,
        comments,
        imageUrl,
        forecast: forecast, // Use the forecast data from state
        continent: selectedBeach.continent,
        country: selectedBeach.country,
        region: selectedBeach.region,
        waveType: selectedBeach.waveType,
        isAnonymous,
        isPrivate,
        id: entry?.id,
      };

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
    try {
      // Ensure we're using today's date if the selected date is in the future
      const now = new Date();
      const selected = new Date(selectedDate);
      const formattedDate =
        selected > now ? now.toISOString().split("T")[0] : selectedDate;

      console.log("Form - Attempting to fetch forecast for:", {
        date: formattedDate,
        beach: beach.name,
        region: beach.region,
      });

      const response = await fetch(
        `/api/quest-log?date=${formattedDate}&beach=${encodeURIComponent(beach.name)}`
      );

      console.log("Form - Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.log("Form - Error data:", errorData);
        throw new Error(errorData.message || "Failed to fetch forecast data");
      }

      const forecastData = await response.json();
      console.log("Form - Received forecast data:", forecastData);
      setForecast(forecastData);
    } catch (error) {
      console.error("Form - Error fetching forecast:", error);
      setForecast(null);
      alert(
        error instanceof Error ? error.message : "Unable to load forecast data"
      );
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

            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-6">
              {/* Left Column - Beach Selection */}
              <div className="w-full lg:flex-1 mb-4 lg:mb-0">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Select a Beach
                  </label>
                  <Select
                    value={selectedBeach?.name || ""}
                    onValueChange={(value) => {
                      const beach = beaches?.find((b) => b.name === value);
                      if (beach) {
                        handleBeachSelect(beach);
                      }
                    }}
                  >
                    {beaches?.map((beach) => (
                      <SelectItem key={beach.id} value={beach.name}>
                        {beach.name}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Right Column - Form */}
              <div className="w-full lg:flex-1">
                <form
                  onSubmit={handleSubmit}
                  className="space-y-2 sm:space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        // Prevent selecting future dates
                        if (new Date(newDate) > new Date()) {
                          alert("Cannot select future dates");
                          return;
                        }
                        setSelectedDate(newDate);
                      }}
                      className="w-full p-2 border rounded-lg"
                      max={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>

                  {selectedBeach && (
                    <div className="border rounded-lg p-2 sm:p-4 bg-gray-50 min-w-[540px]">
                      <SurfForecastWidget
                        beachId={selectedBeach.id}
                        date={selectedDate}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Rating
                    </label>
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

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Comments
                    </label>
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

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="rounded border-gray-300 text-[#1cd9ff] focus:ring-[#1cd9ff]"
                    />
                    <label
                      htmlFor="anonymous"
                      className="text-sm text-gray-600"
                    >
                      Post Anonymously
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="private"
                      checked={isPrivate}
                      onChange={(e) => setIsPrivate(e.target.checked)}
                      className="rounded border-gray-300 text-[#1cd9ff] focus:ring-[#1cd9ff]"
                    />
                    <label htmlFor="private" className="text-sm text-gray-600">
                      Keep Private
                    </label>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Session Image
                    </label>
                    <div className="mt-1 flex items-center">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-[var(--color-tertiary)] hover:text-[var(--color-tertiary)] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[var(--color-tertiary)]">
                        <span className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-tertiary)]">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Image
                        </span>
                        <input
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                    {imagePreview && (
                      <div className="mt-2">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-32 w-32 object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="secondary"
                    className={cn(
                      "w-full lg:bg-[var(--color-tertiary)] lg:text-white lg:hover:bg-[var(--color-tertiary)]/90",
                      !isSubscribed &&
                        !hasActiveTrial &&
                        "opacity-50 cursor-not-allowed"
                    )}
                    disabled={
                      (!isSubscribed && !hasActiveTrial) ||
                      !selectedBeach ||
                      !selectedDate ||
                      isSubmitting
                    }
                  >
                    {isSubmitting
                      ? "Submitting..."
                      : isSubmitted
                        ? "Submitted!"
                        : "Log Session"}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
