import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { beachData } from "@/app/types/beaches";
import WildStoriesContainer from "@/app/components/WildStoriesContainer";

export default async function StoriesPage() {
  const session = await getServerSession(authOptions);

  // Map beachData to match the StoryBeach type
  const beaches = beachData.map((beach) => ({
    id: beach.id,
    name: beach.name,
    location: beach.location,
    region: beach.region,
    isCustom: false,
  }));

  return (
    <main className="min-h-screen bg-[var(--color-bg-secondary)] pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
            Wild Stories
          </h1>
          <p className="mt-2 text-[var(--color-text-secondary)]">
            Share your most memorable surfing experiences, from epic wipeouts to
            wildlife encounters.
          </p>
        </div>

        <Suspense fallback={<div>Loading stories...</div>}>
          <WildStoriesContainer beaches={beaches} />
        </Suspense>
      </div>
    </main>
  );
}
