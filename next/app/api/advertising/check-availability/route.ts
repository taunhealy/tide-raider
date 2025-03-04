import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const beachId = url.searchParams.get("beachId");
  const category = url.searchParams.get("category");

  if (!beachId || !category) {
    return NextResponse.json(
      { error: "Beach ID and category are required" },
      { status: 400 }
    );
  }

  try {
    // Check if the Ad table exists by trying a simple query
    try {
      // If the table doesn't exist, this will throw an error
      // but we'll catch it and return "available: true"
      const existingAd = await prisma.ad.findFirst({
        where: {
          targetedBeaches: {
            has: beachId,
          },
          category: category,
          status: "active",
          endDate: {
            gt: new Date(),
          },
        },
      });

      return NextResponse.json({ available: !existingAd });
    } catch (error) {
      // If the table doesn't exist, assume no ads exist yet
      console.error("Error checking availability:", error);
      return NextResponse.json({ available: true });
    }
  } catch (error) {
    console.error("Error checking availability:", error);
    return NextResponse.json(
      { error: "Failed to check availability" },
      { status: 500 }
    );
  }
}
