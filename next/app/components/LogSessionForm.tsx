"use client";
import { useState, useEffect } from "react";
import { Star, Search, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/app/lib/utils";
import { beachData } from "@/app/types/beaches";
import type { Beach } from "@/app/types/beaches";
import type { CreateLogEntryInput } from "@/app/types/logbook";
import SurfForecastWidget from "./SurfForecastWidget";
import confetti from "canvas-confetti";

interface LogSessionFormProps {
  userEmail: string;
  isOpen: boolean;
  onClose: () => void;
}

export function LogSessionForm({
  userEmail,
  isOpen,
  onClose,
}: LogSessionFormProps) {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedBeach, setSelectedBeach] = useState<Beach | null>(null);
  const [surferRating, setSurferRating] = useState<number>(0);
  const [comments, setComments] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBeach || !selectedDate || !userEmail) return;

    const newEntry = {
      beachName: selectedBeach.name,
      date: selectedDate,
      surferEmail: userEmail,
      surferName: userEmail.split("@")[0],
      surferRating: surferRating,
      comments,
      beach: {
        continent: selectedBeach.continent,
        country: selectedBeach.country,
        region: selectedBeach.region,
        waveType: selectedBeach.waveType,
      },
    };

    createLogEntry.mutate(newEntry);
  };

  const filteredBeaches = beachData.filter((beach) =>
    beach.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBeachSelect = (beach: Beach) => {
    setSelectedBeach(beach);
    setSearchTerm(beach.name);
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

            <h2 className="text-xl font-semibold mb-4">Log a Session</h2>

            <div className="flex gap-6">
              {/* Left Column - Beach Selection */}
              <div className="flex-1 min-w-500px">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Select a Beach
                  </label>
                  <input
                    type="text"
                    placeholder="Search beaches..."
                    className="w-full p-2 border rounded-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <div className="border rounded-lg mt-2 max-h-60 overflow-y-auto">
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
              <div className="flex-1 w-full">
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
                      onChange={(e) => setComments(e.target.value)}
                      className="w-full p-2 border rounded-lg"
                      rows={4}
                      placeholder="How was your session?"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!selectedBeach || !selectedDate}
                  >
                    Log Session
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
