import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const region = searchParams.get("region");
  const source = searchParams.get("source") || "A";

  if (!date || !region) {
    return NextResponse.json(
      { error: "Date and region are required" },
      { status: 400 }
    );
  }

  try {
    const queryDate = new Date(date);
    queryDate.setUTCHours(0, 0, 0, 0);

    // Explicitly type the model variable
    const model = source === "A" ? prisma.forecastA : prisma.forecastB;
    const conditions = await (model as any).findFirst({
      where: {
        date: queryDate,
        region: region,
      },
      select: {
        forecast: true,
      },
    });

    if (!conditions && source === "A") {
      // Try source B as fallback
      const backupConditions = await prisma.forecastB.findFirst({
        where: {
          date: queryDate,
          region: region,
        },
        select: {
          forecast: true,
        },
      });

      if (backupConditions) {
        return NextResponse.json(backupConditions.forecast);
      }
    }

    if (!conditions) {
      return NextResponse.json(
        { error: "No forecast found for the specified date and region" },
        { status: 404 }
      );
    }

    return NextResponse.json(conditions.forecast);
  } catch (error) {
    console.error("Error fetching surf conditions:", error);
    return NextResponse.json(
      { error: "Failed to fetch surf conditions" },
      { status: 500 }
    );
  }
}
