import QuestLogs from "@/app/components/QuestLogs";
import { getBeaches } from "@/app/lib/data";

export default async function RaidLogsPage() {
  const beaches = await getBeaches();

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)]">
      <QuestLogs beaches={beaches} />
    </div>
  );
}
  