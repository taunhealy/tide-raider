import LogBook from "@/app/components/LogBook";
import { getBeaches } from "@/app/lib/data";

export default async function LogBookPage() {
  const beaches = await getBeaches();

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)]">
      <LogBook beaches={beaches} />
    </div>
  );
}
