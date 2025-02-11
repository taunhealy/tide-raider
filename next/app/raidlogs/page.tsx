import { getBeaches } from "@/app/lib/data";
import { ClientRaidLogs } from "@/app/components/ClientRaidLogs";
import { Suspense } from "react";
import { RaidLogsSkeleton } from "@/components/skeletons/RaidLogsSkeleton";

// Server component (can be async)
export default async function RaidLogsPage() {
  const beaches = await getBeaches();

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)]">
      <Suspense fallback={<RaidLogsSkeleton />}>
        <ClientRaidLogs beaches={beaches} />
      </Suspense>
    </div>
  );
}
