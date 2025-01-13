import Map from '@/app/components/Map';
import { getBeaches } from '@/app/lib/data';
import { getWindData } from '@/app/lib/wind';

export default async function MapPage() {
  const beaches = await getBeaches();
  const windData = await getWindData();

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)]">
      <Map beaches={beaches} windData={windData} />
    </div>
  );
}