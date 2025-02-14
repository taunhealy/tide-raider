"use client";

import { useSearchParams } from "next/navigation";
import type { Beach } from "@/app/types/beaches";
import QuestLogs from "./QuestLogs";
import { useSession } from "next-auth/react";

interface ClientRaidLogsProps {
  beaches: Beach[];
}

export function ClientRaidLogs({ beaches }: ClientRaidLogsProps) {
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  // Early return if no session
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-secondary)] flex items-center justify-center">
        <p>Please sign in to view raid logs</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)]">
      <div className="container mx-auto p-6">
        <QuestLogs
          beaches={beaches}
          userId={session.user.id}
          initialFilters={{ isPrivate: false }}
        />
      </div>
    </div>
  );
}
