import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const beachId = url.searchParams.get("beachId");
  const region = url.searchParams.get("region");

  try {
    let ads;

    if (beachId) {
      // Fetch ads for a specific beach
      ads = await prisma.ad.findMany({
        where: {
          targetedBeaches: {
            has: beachId,
          },
          status: "active",
          endDate: {
            gt: new Date(),
          },
        },
      });
    } else if (region) {
      // Fetch ads for a specific region
      ads = await prisma.ad.findMany({
        where: {
          region: {
            name: region,
          },
          status: "active",
          endDate: {
            gt: new Date(),
          },
        },
      });
    } else {
      // Fetch all active ads
      ads = await prisma.ad.findMany({
        where: {
          status: "active",
          endDate: {
            gt: new Date(),
          },
        },
      });
    }

    return NextResponse.json(ads);
  } catch (error) {
    console.error("Error fetching ads:", error);
    return NextResponse.json({ error: "Failed to fetch ads" }, { status: 500 });
  }
}
