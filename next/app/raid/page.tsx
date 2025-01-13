import BeachContainer from "@/app/components/BeachContainer";
import { beachData } from "@/app/types/beaches";
import { client } from "@/app/lib/sanity";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";

// Mark the component as async
export default async function RaidPage() {
  try {
    // Get user session and saved filters
    const session = await getServerSession(authOptions);
    let userPreferences = null;
    let isPro = false;

    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          savedFilters: true,
          membership: true,
        },
      });
      userPreferences = user?.savedFilters;
      isPro = !!user?.membership;
    }

    // Get initial wind data and blog posts
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // Fetch data with error handling
    const windResponse = await fetch(`${baseUrl}/api/surf-conditions`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!windResponse.ok) {
      throw new Error("Failed to fetch wind data");
    }

    const blogPosts = await client.fetch(`
      *[_type == "post"] | order(publishedAt desc) {
        title,
        slug,
        mainImage,
        publishedAt,
        description,
        categories[]-> {
          title,
          slug
        }
      }
    `);

    const { data: windData } = await windResponse.json();

    return (
      <div className="min-h-screen bg-[var(--color-bg-secondary)]">
        <div className="container mx-auto px-4 py-8">
          <BeachContainer
            initialBeaches={beachData}
            windData={windData}
            blogPosts={blogPosts}
            userPreferences={userPreferences}
            isPro={isPro}
          />
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
