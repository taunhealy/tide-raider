import { prisma } from "@/app/lib/prisma";
import { beachData } from "@/app/types/beaches";
import { isBeachSuitable } from "./surfUtils";
import { randomUUID } from "crypto";
import type { WindData } from "@/app/types/wind";

export async function storeGoodBeachRatings(
  conditions: WindData,
  region: string,
  date: Date
) {
  try {
    console.log(
      `🏖️ Rating storage started for ${region} at ${new Date().toISOString()}`
    );

    const regionBeaches = beachData.filter((b) => b.region === region);
    if (regionBeaches.length === 0) {
      console.error(`❌ No beaches found for region: ${region}`);
      return 0;
    }

    const ratingsToStore = regionBeaches
      .map((beach) => ({
        beach,
        ...isBeachSuitable(beach, conditions),
      }))
      .filter(({ suitable }) => suitable);

    if (ratingsToStore.length === 0) {
      console.log(`📊 No suitable beaches found in ${region}`);
      return 0;
    }

    const result = await prisma.beachGoodRating.createMany({
      data: ratingsToStore.map(({ beach, score }) => ({
        id: randomUUID(),
        date,
        beachId: beach.id,
        region: beach.region,
        score,
        conditions,
      })),
      skipDuplicates: true,
    });

    console.log(`✅ Stored ${result.count} ratings for ${region}`);
    return result.count;
  } catch (error) {
    console.error("💥 Critical rating storage error:", error);
    throw error;
  }
}

// Use existing ratings from database when possible
export async function getGoodBeachCount(
  region: string,
  date: Date,
  conditions?: WindData
): Promise<number> {
  // Try to get from existing ratings first
  const existingCount = await prisma.beachGoodRating.count({
    where: {
      region,
      date,
    },
  });

  if (existingCount > 0) {
    return existingCount;
  }

  // Fall back to calculation if conditions provided
  if (conditions) {
    return beachData.filter(
      (beach) =>
        beach.region === region && isBeachSuitable(beach, conditions).suitable
    ).length;
  }

  return 0;
}

// Optimized to use existing ratings and reduce calculations
export async function getRegionScores(
  date: Date,
  region: string,
  conditions?: WindData
) {
  const scores: Record<string, number> = {};

  // Try to get from existing ratings first
  const existingRatings = await prisma.beachGoodRating.findMany({
    where: {
      date,
      region,
    },
  });

  if (existingRatings.length > 0) {
    // Count ratings per region
    existingRatings.forEach((rating) => {
      scores[rating.region] = (scores[rating.region] || 0) + 1;
    });
    return scores;
  }

  // Fall back to calculation if conditions provided
  if (conditions) {
    const suitableBeaches = beachData
      .filter((beach) => beach.region === region)
      .filter((beach) => isBeachSuitable(beach, conditions).suitable);

    suitableBeaches.forEach((beach) => {
      scores[beach.region] = (scores[beach.region] || 0) + 1;
    });
  }

  return scores;
}
