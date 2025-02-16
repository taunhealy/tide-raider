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

    console.log(
      `📊 Found ${ratingsToStore.length} suitable beaches in ${region}`
    );

    if (ratingsToStore.length > 0) {
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
    }

    return 0;
  } catch (error) {
    console.error("💥 Critical rating storage error:", error);
    throw error;
  }
}

export function getGoodBeachCount(
  region: string,
  conditions: WindData
): number {
  return beachData.filter(
    (beach) =>
      beach.region === region && isBeachSuitable(beach, conditions).suitable
  ).length;
}

export function getRegionScores(conditions: WindData, region: string) {
  const scores: Record<string, number> = {};

  beachData
    .filter((beach) => beach.region === region)
    .forEach((beach) => {
      const { suitable } = isBeachSuitable(beach, conditions);
      if (suitable) {
        scores[beach.region] = (scores[beach.region] || 0) + 1;
        scores[beach.country] = (scores[beach.country] || 0) + 1;
        scores[beach.continent] = (scores[beach.continent] || 0) + 1;
      }
    });

  return scores;
}
