import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region");
  const dateStr = searchParams.get("date");

  if (!region || !dateStr) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  try {
    console.log(`Fetching good beach count for ${region} on ${dateStr}`);

    // Convert date string to timestamp format
    const date = new Date(dateStr);
    date.setUTCHours(0, 0, 0, 0);

    // Count beaches with good ratings for the region and date
    const goodBeachCount = await prisma.beachGoodRating.count({
      where: {
        date: date, // Use the Date object that matches our DB timestamp
        region: region,
        score: {
          gte: 4, // Matches our "good" threshold from isBeachSuitable
        },
      },
    });

    console.log(
      `Found ${goodBeachCount} good beaches for ${region} on ${dateStr}`
    );
    return NextResponse.json({ count: goodBeachCount });
  } catch (error) {
    console.error(`Error getting beach count:`, error);
    return NextResponse.json(
      { error: "Failed to get beach count" },
      { status: 500 }
    );
  }
}
