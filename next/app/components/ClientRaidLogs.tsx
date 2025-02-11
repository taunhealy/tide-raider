"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Beach } from "@/app/types/beaches";
import QuestLogs from "./QuestLogs";

interface ClientRaidLogsProps {
  beaches: Beach[];
}

export function ClientRaidLogs({ beaches }: ClientRaidLogsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // Ensure client-side only code
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const handleVisibilityChange = (isPrivate: boolean) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (isPrivate) {
      newParams.set("visibility", "private");
    } else {
      newParams.delete("visibility");
    }
    router.replace(`?${newParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)]">
      <div className="container mx-auto p-6">
        <QuestLogs beaches={beaches} />
      </div>
    </div>
  );
}
