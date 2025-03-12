import { Suspense } from "react";
import { beachData } from "@/app/types/beaches";
import WildStoriesContainer from "@/app/components/StoriesContainer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import RandomLoader from "@/app/components/ui/RippleLoader";
import dynamic from "next/dynamic";

export default async function StoriesPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

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
    <main className="px-[21px] min-h-screen bg-[var(--color-bg-secondary)] pb-12 md:px-[360px] relative">
      <Suspense fallback={<RandomLoader isLoading={true} />}>
        <WildStoriesContainer beaches={beaches} userId={userId ?? ""} />
      </Suspense>
    </main>
  );
}
