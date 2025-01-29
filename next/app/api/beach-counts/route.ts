import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region");
  const date = searchParams.get("date");

  if (!region || !date) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  try {
    // Simply count the entries for the given date and region
    const count = await prisma.beachGoodRating.count({
      where: {
        date,
        region,
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching beach counts:", error);
    return NextResponse.json(
      { error: "Failed to fetch beach counts" },
      { status: 500 }
    );
  }
}

function isBeachSuitable(beach: any, conditions: any) {
  let score = 0;

  // Check wind direction compatibility with penalty
  if (beach.optimalWindDirections.includes(conditions.windDirection)) {
    score += 2;
  } else {
    score = Math.max(0, score - 0.5);
  }

  // Add penalty for strong winds unless beach is sheltered
  if (
    conditions.windSpeed >= 15 &&
    conditions.windSpeed > 25 &&
    !beach.sheltered
  ) {
    score = Math.max(0, score - 0.5);
  }

  // Check swell direction with graduated penalties
  const swellDeg = parseInt(conditions.swellDirection);
  const minSwellDiff = Math.abs(swellDeg - beach.optimalSwellDirections.min);
  const maxSwellDiff = Math.abs(swellDeg - beach.optimalSwellDirections.max);
  const swellDirDiff = Math.min(minSwellDiff, maxSwellDiff);

  if (
    swellDeg >= beach.optimalSwellDirections.min &&
    swellDeg <= beach.optimalSwellDirections.max
  ) {
    score += 2;
  } else if (swellDirDiff <= 10) {
    score = Math.max(0, score - 1);
  } else if (swellDirDiff <= 20) {
    score = Math.max(0, score - 2);
  } else if (swellDirDiff <= 30) {
    score = Math.max(0, score - 3);
  } else {
    score = Math.max(0, score - 4);
  }

  // Check swell height
  const hasGoodSwellHeight =
    conditions.swellHeight >= beach.swellSize.min &&
    conditions.swellHeight <= beach.swellSize.max;
  if (hasGoodSwellHeight) {
    score += 1;
  } else {
    score = Math.max(0, score - 3);
  }

  return {
    suitable: score > 2,
    score: score,
  };
}
