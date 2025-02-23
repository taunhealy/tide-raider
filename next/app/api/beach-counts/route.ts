import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { beachData } from "@/app/types/beaches";
import { isBeachSuitable } from "@/app/lib/surfUtils";
import { WindData } from "@/app/types/beaches";

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
    // Try source A first
    let conditions = await prisma.forecastA.findFirst({
      where: {
        region: region,
        date: new Date(dateStr),
      },
      orderBy: { updatedAt: "desc" },
    });

    // If no data from source A, try source B
    if (!conditions) {
      conditions = await prisma.forecastB.findFirst({
        where: {
          region: region,
          date: new Date(dateStr),
        },
        orderBy: { updatedAt: "desc" },
      });
    }

    if (!conditions?.forecast) {
      console.log(`No conditions found for ${region} on ${dateStr}`);
      return NextResponse.json({ count: 0 });
    }

    // Use the same scoring logic as BeachContainer
    const regionBeaches = beachData.filter((beach) => beach.region === region);
    const goodBeachCount = regionBeaches.filter((beach) => {
      const { score } = isBeachSuitable(beach, conditions.forecast as WindData);

      return score >= 4;
    }).length;

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
