import { redis } from "@/app/lib/redis";
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { formatConditionsResponse } from "@/app/lib/surfUtils";

const CACHE_TTL = 300; // 5 minutes

export async function GET() {
  try {
    // 1. Check Redis cache first
    const cachedData = await redis.get("all_regions_conditions");
    if (cachedData) {
      // Handle both string and object responses from Redis
      const parsedData =
        typeof cachedData === "string" ? JSON.parse(cachedData) : cachedData;
      return NextResponse.json(parsedData);
    }

    // 2. If not in cache, check database for today's data
    const today = new Date().toISOString().split("T")[0];
    const allRegionsData = await prisma.surfCondition.findMany({
      where: {
        date: today,
      },
      orderBy: { timestamp: "desc" },
      distinct: ["region"],
    });

    if (allRegionsData.length > 0) {
      // Format and cache the results
      const regionScores: Record<string, any> = {};
      allRegionsData.forEach((data) => {
        regionScores[data.region] = formatConditionsResponse(data);
      });

      // Cache the results
      await redis.setex(
        "all_regions_conditions",
        CACHE_TTL,
        JSON.stringify(regionScores)
      );

      return NextResponse.json(regionScores);
    }

    // 3. If no data in DB, return a valid response with empty data
    return NextResponse.json({}, { status: 200 }); // Return empty object instead of 404
  } catch (error) {
    console.error("Error fetching all regions data:", error);
    // Return empty data instead of error
    return NextResponse.json({}, { status: 200 });
  }
}
