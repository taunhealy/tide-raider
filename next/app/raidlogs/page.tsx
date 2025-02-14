"use client";

import { RaidLogsComponent } from "@/app/components/raid-logs/RaidLogsComponent";
import { useSession } from "next-auth/react";

export default function RaidLogsPage() {
  const { data: session } = useSession();

  return session?.user?.id ? (
    <RaidLogsComponent
      beaches={[]} // Pass actual beaches data here
      userId={session.user.id} // Now guaranteed to be string
      initialFilters={{ isPrivate: false }}
    />
  ) : (
    <div>Loading or unauthorized message</div>
  );
}
