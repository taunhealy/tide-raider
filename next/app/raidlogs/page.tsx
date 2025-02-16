"use client";

import { RaidLogsComponent } from "@/app/components/raid-logs/RaidLogsComponent";
import { useSession } from "next-auth/react";
import { beachData } from "@/app/types/beaches"; // Import beach data
import { RandomLoader } from "@/components/ui/RandomLoader";

export default function RaidLogsPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <RandomLoader isLoading={true} />;
  }

  // Allow access even without session
  return (
    <RaidLogsComponent
      beaches={beachData} // Pass the beach data from our types
      userId={session?.user?.id} // Pass undefined if no session
      initialFilters={{ isPrivate: false }}
    />
  );
}
