import { getBeaches } from "@/app/lib/data";
import { ClientRaidLogs } from "@/app/components/ClientRaidLogs";
import { Suspense } from "react";
import { RaidLogsSkeleton } from "@/app/components/skeletons/RaidLogsSkeleton";

// Server component (can be async)
export default async function RaidLogsPage() {
  const beaches = await getBeaches();

  return (
    <Suspense fallback={<RaidLogsSkeleton />}>
      <ClientRaidLogs beaches={beaches} />
    </Suspense>
  );
}
