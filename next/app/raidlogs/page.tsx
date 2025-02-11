import { getBeaches } from "@/app/lib/data";
import { ClientRaidLogs } from "@/app/components/ClientRaidLogs";
import type { Beach } from "@/types/beaches";

// Server component (can be async)
export default async function RaidLogsPage() {
  const beaches = await getBeaches();
  return <ClientRaidLogs beaches={beaches} />;
}
