"use client";
import { useState, useEffect } from "react";
import { Star, Search, X, Upload } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/app/lib/utils";
import { beachData } from "@/app/types/beaches";
import type { Beach } from "@/app/types/beaches";
import type { CreateLogEntryInput } from "@/app/types/questlogs";
import SurfForecastWidget from "./SurfForecastWidget";
import confetti from "canvas-confetti";
import { Button } from "@/app/components/ui/Button";
import { validateFile, compressImageIfNeeded } from "@/app/lib/file";

interface QuestLogFormProps {
  userEmail: string;
  isOpen: boolean;
  onClose: () => void;
  beaches: Beach[];
}

export function QuestLogForm({
  userEmail,
  isOpen,
  onClose,
  beaches,
}: QuestLogFormProps) {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedBeach, setSelectedBeach] = useState<Beach | null>(null);
  const [surferRating, setSurferRating] = useState<number>(0);
  const [comments, setComments] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const createLogEntry = useMutation({
    mutationFn: async (newEntry: CreateLogEntryInput) => {
      const response = await fetch("/api/logbook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEntry),
      });

      if (!response.ok) {
        throw new Error("Failed to create log entry");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logEntries"] });
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      // Reset form
      setSelectedDate(new Date().toISOString().split("T")[0]);
      setSelectedBeach(null);
      setSurferRating(0);
      setComments("");
      // Close modal after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);
    },
  });

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const { imageUrl } = await response.json();
    return imageUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBeach || !selectedDate || !userEmail) return;

    setIsSubmitting(true);
    try {
      let imageUrl;
      if (selectedImage) {
        console.log("Starting image upload process...");
        try {
          imageUrl = await handleImageUpload(selectedImage);
          console.log("Image upload successful:", imageUrl);
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          alert("Failed to upload image");
          setIsSubmitting(false);
          return;
        }
      }

      console.log("Creating log entry with image:", imageUrl);
      const newEntry = {
        beachName: selectedBeach.name,
        date: selectedDate,
        surferEmail: userEmail,
        surferName: isAnonymous ? "Anonymous" : userEmail.split("@")[0],
        surferRating: surferRating,
        comments,
        imageUrl,
        beach: {
          continent: selectedBeach.continent,
          country: selectedBeach.country,
          region: selectedBeach.region,
          waveType: selectedBeach.waveType,
        },
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
        onClose();
        setIsSubmitting(false);
        setIsSubmitted(false);
      }, 2000);
    } catch (error) {
      console.error("Form submission error:", error);
      alert("Failed to submit log entry");
      setIsSubmitting(false);
    }
  };

  const filteredBeaches = beachData.filter((beach) =>
    beach.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBeachSelect = (beach: Beach) => {
    setSelectedBeach(beach);
    setSearchTerm(beach.name);
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

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <div className="relative bg-white rounded-lg shadow-xl max-w-[1200px] w-full m-4 p-6 overflow-y-auto max-h-[90vh]">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>

            <h2 className="text-xl font-semibold mb-4">Log a Side Quest</h2>

            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-6">
              {/* Left Column - Beach Selection */}
              <div className="w-full lg:flex-1 lg:min-w-[400px]">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Select a Beach
                  </label>
                  <input
                    type="text"
                    placeholder="Search beaches..."
                    className="w-full p-2 border rounded-lg text-sm sm:text-base"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <div className="border rounded-lg mt-2 max-h-48 sm:max-h-60 overflow-y-auto">
                      {filteredBeaches.map((beach) => (
                        <button
                          key={beach.name}
                          onClick={() => handleBeachSelect(beach)}
                          className={cn(
                            "w-full text-left px-4 py-3 hover:bg-gray-50",
                            selectedBeach?.name === beach.name && "bg-blue-50"
                          )}
                        >
                          <h3 className="font-medium">{beach.name}</h3>
                          <p className="text-sm text-gray-600">
                            {beach.region}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Form */}
              <div className="w-full lg:flex-1">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full p-2 border rounded-lg"
                      max={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>

                  {selectedBeach && (
                    <div className="border rounded-lg p-4 bg-gray-50 min-w-[540px]">
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

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Session Image
                    </label>
                    <div className="mt-1 flex items-center">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
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
                    className="w-full lg:bg-[#1cd9ff] lg:text-white lg:hover:bg-[#1cd9ff]/90"
                    disabled={!selectedBeach || !selectedDate || isSubmitting}
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
