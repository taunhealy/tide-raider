"use client";

import { useQuery } from "@tanstack/react-query";
import type { Beach } from "@/app/types/beaches";
import QuestLogs from "./QuestLogs";

interface ClientProfileLogsProps {
  beaches: Beach[];
  userId: string;
}

export function ClientProfileLogs({ beaches, userId }: ClientProfileLogsProps) {
  const { data: userData } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const res = await fetch(`/api/user/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
  });

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)]">
      <div className="container mx-auto p-6">
        <QuestLogs beaches={beaches} userId={userId} />
      </div>
    </div>
  );
}
