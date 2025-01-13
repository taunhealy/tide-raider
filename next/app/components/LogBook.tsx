"use client";

import { Inter } from "next/font/google";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Star } from "lucide-react";
import { cn } from "@/app/lib/utils";
import type { Beach } from "@/app/types/beaches";
import type { CreateLogEntryInput, LogEntry } from "@/app/types/logbook";

const inter = Inter({ subsets: ["latin"] });

interface LogBookProps {
  beaches: Beach[];
}

export default function LogBook({ beaches }: LogBookProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  // Form state
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedBeach, setSelectedBeach] = useState<string>("");
  const [surferRating, setSurferRating] = useState<number>(0);
  const [comments, setComments] = useState<string>("");

  // Fetch log entries
  const { data: logEntries = [], isLoading } = useQuery({
    queryKey: ["logEntries"],
    queryFn: async () => {
      const response = await fetch("/api/logbook");
      if (!response.ok) throw new Error("Failed to fetch log entries");
      return response.json();
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Create log entry mutation
  const { mutate: createLogEntry, isLoading: isSubmitting } = useMutation({
    mutationFn: async (data: CreateLogEntryInput) => {
      const response = await fetch("/api/logbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create log entry");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logEntries"] });
      setSelectedBeach("");
      setSurferRating(0);
      setComments("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.name) return;

    createLogEntry({
      date: selectedDate,
      surferName: session.user.name,
      beachName: selectedBeach,
      surferRating,
      comments,
    });
  };

  const [activeTab, setActiveTab] = useState<"logs" | "new">("logs");

  if (!session) {
    return <div>Please sign in to view your logbook.</div>;
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] p-9">
      <div className="max-w-[1600px] mx-auto">
        {/* Tabs */}
        <div className="flex gap-6 mb-9">
          <button
            onClick={() => setActiveTab("logs")}
            className={cn(
              "px-6 py-4 text-[18px] font-medium rounded-lg transition-colors",
              activeTab === "logs"
                ? "bg-[var(--color-bg-tertiary)] text-white"
                : "bg-white text-[var(--color-text-primary)] hover:bg-gray-50"
            )}
          >
            Logged Sessions
          </button>
          <button
            onClick={() => setActiveTab("new")}
            className={cn(
              "px-6 py-4 text-[18px] font-medium rounded-lg transition-colors",
              activeTab === "new"
                ? "bg-[var(--color-bg-tertiary)] text-white"
                : "bg-white text-[var(--color-text-primary)] hover:bg-gray-50"
            )}
          >
            Log A Session
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-9">
          {activeTab === "logs" ? (
            <>
              <h2
                className={cn(
                  "text-[21px] font-semibold mb-6",
                  inter.className
                )}
              >
                Previous Sessions
              </h2>
              {isLoading ? (
                <div>Loading...</div>
              ) : (
                <div className="space-y-6">
                  {logEntries?.map((entry: LogEntry) => (
                    <div
                      key={entry.id}
                      className="bg-[var(--color-bg-secondary)] rounded-lg p-6"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-[18px] font-medium">
                            {entry.beachName}
                          </h3>
                          <p className="text-[14px] text-gray-500">
                            {entry.surferName}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <Star
                              key={rating}
                              className={cn(
                                "w-5 h-5",
                                rating <= entry.surferRating
                                  ? "fill-yellow-400"
                                  : "fill-gray-200"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="mt-3 text-[16px] text-gray-700">
                        {entry.comments}
                      </p>
                      <div className="mt-3 text-[14px] text-gray-500">
                        <Calendar className="inline-block w-4 h-4 mr-1" />
                        {new Date(entry.date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-[800px] mx-auto">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Beach
                  </label>
                  <select
                    value={selectedBeach}
                    onChange={(e) => setSelectedBeach(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  >
                    <option value="">Select a beach</option>
                    {beaches.map((beach) => (
                      <option key={beach.id} value={beach.name}>
                        {beach.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Rating
                  </label>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Star
                        key={rating}
                        className={cn(
                          "w-6 h-6 cursor-pointer",
                          rating <= surferRating
                            ? "fill-yellow-400"
                            : "fill-gray-200"
                        )}
                        onClick={() => setSurferRating(rating)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Comments
                  </label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    rows={4}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Log Session"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
