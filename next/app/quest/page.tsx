import BeachContainer from "@/app/components/BeachContainer";
import { beachData } from "@/app/types/beaches";
import { client } from "@/app/lib/sanity";
import { prisma } from "@/app/lib/prisma";
import { blogListingQuery } from "@/app/lib/queries";

export default async function QuestPage() {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "https://www.tideraider.com/";

    // Fetch wind data, blog posts, and active ads
    const [windResponse, blogData, activeAds] = await Promise.all([
      fetch(
        `${baseUrl}/api/surf-conditions?region=Western Cape&date=${new Date().toISOString().split("T")[0]}`,
        {
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
        }
      ),
      client.fetch(blogListingQuery),
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
        .then((ads) => ads.map((ad) => ({ ...ad, isAd: true as const }))),
    ]);

    if (!windResponse.ok) {
      throw new Error("Failed to fetch wind data");
    }

    const { data: windData } = await windResponse.json();

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
