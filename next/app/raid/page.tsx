import BeachContainer from "@/app/components/BeachContainer";
import { beachData } from "@/app/types/beaches";
import { client } from "@/app/lib/sanity";
import { prisma } from "@/app/lib/prisma";
import { blogListingQuery } from "@/app/lib/queries";
import { Suspense } from "react";
import RaidSkeleton from "@/app/components/skeletons/RaidSkeleton";

async function QuestContent() {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ||
      "https://www.tideraider.com";
    const date = new Date().toISOString().split("T")[0];

    const [windResponse, blogData, activeAds] = await Promise.all([
      fetch(`${baseUrl}/api/surf-conditions?region=Western Cape&date=${date}`, {
        headers: {
          "Content-Type": "application/json",
        },
      }).then(async (res) => {
        if (!res.ok) {
          console.error(`Wind API error: ${res.status} ${res.statusText}`);
          return null;
        }
        const data = await res.json();
        return data;
      }),
      client.fetch(blogListingQuery).catch((error) => {
        console.error("Blog fetch error:", error);
        return []; // Fallback data
      }),
      prisma.adRequest
        .findMany({
          where: {
            status: "active",
            endDate: {
              gte: new Date(),
            },
          },
          select: {
            id: true,
            category: true,
            companyName: true,
            imageUrl: true,
            linkUrl: true,
            title: true,
            region: true,
            startDate: true,
            endDate: true,
            status: true,
            categoryData: true,
            yearlyPrice: true,
            googleAdsContribution: true,
          },
        })
        .then((ads) => ads.map((ad) => ({ ...ad, isAd: true as const })))
        .catch((error) => {
          console.error("Ads fetch error:", error);
          return [];
        }),
    ]);

    if (!windResponse || !blogData || !activeAds) {
      throw new Error("Failed to fetch required data");
    }

    const windData = windResponse;

    return (
      <div className="min-h-screen bg-[var(--color-bg-secondary)]">
        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
            <div className="flex-1">
              <BeachContainer
                initialBeaches={beachData}
                windData={windData}
                blogPosts={blogData.posts}
                availableAds={activeAds}
              />
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in RaidPage:", error);
    return (
      <div className="min-h-screen bg-[var(--color-bg-secondary)] flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p>Please try refreshing the page</p>
        </div>
      </div>
    );
  }
}

export default function QuestPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)]">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <div className="flex-1">
            <Suspense fallback={<RaidSkeleton />}>
              <QuestContent />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
