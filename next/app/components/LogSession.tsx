"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Star } from "lucide-react";
import { cn } from "@/app/lib/utils";
import type { Beach } from "@/app/types/beaches";
import type { CreateLogEntryInput } from "@/app/types/logbook";

interface LogSessionProps {
  beaches: Beach[];
}

export default function LogSession({ beaches }: LogSessionProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedBeach, setSelectedBeach] = useState<string>("");
  const [surferRating, setSurferRating] = useState<number>(0);
  const [comments, setComments] = useState<string>("");

  // Fetch forecast data for selected date
  const { data: forecast } = useQuery({
    queryKey: ["forecast", selectedDate],
    queryFn: async () => {
      const response = await fetch(`/api/surf-conditions?date=${selectedDate}`);
      if (!response.ok) throw new Error("Failed to fetch forecast");
      const { data } = await response.json();
      return data;
    },
    enabled: !!selectedDate,
  });

  // Create log entry mutation
  const { mutate: createLogEntry } = useMutation({
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

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
      {/* Form content remains the same */}
    </form>
  );
}
