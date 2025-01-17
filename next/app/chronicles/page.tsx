import { Suspense } from "react";
import { beachData } from "@/app/types/beaches";
import WildStoriesContainer from "@/app/components/StoriesContainer";

export default async function StoriesPage() {
  const beaches = beachData.map((beach) => ({
    id: beach.id,
    name: beach.name,
    location: beach.location,
    region: beach.region,
    country: beach.country,
    continent: beach.continent,
    isCustom: false,
  }));

  return (
    <main className="px-[21px] min-h-screen bg-[var(--color-bg-secondary)] pb-12 md:px-[360px]">
      <Suspense fallback={<div>Loading stories...</div>}>
        <WildStoriesContainer beaches={beaches} />
      </Suspense>
    </main>
  );
}
