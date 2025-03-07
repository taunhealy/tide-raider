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

    console.log(
      `Searching for forecast on ${queryDate.toISOString()} in ${region}`
    );

    if (source === "A") {
      const forecastA = await prisma.forecastA.findFirst({
        where: {
          date: queryDate,
          region: region,
        },
      });

      if (forecastA) {
        console.log("Found ForecastA data:", forecastA);
        return NextResponse.json({
          windSpeed: forecastA.windSpeed,
          windDirection: forecastA.windDirection,
          swellHeight: forecastA.swellHeight,
          swellPeriod: forecastA.swellPeriod,
          swellDirection: forecastA.swellDirection,
        });
      }
    }

    // Try source B as fallback
    const forecastB = await prisma.forecastB.findFirst({
      where: {
        date: queryDate,
        region: region,
      },
    });

    if (forecastB) {
      console.log("Found ForecastB data:", forecastB);
      return NextResponse.json(forecastB.forecast);
    }

    console.log("No forecast found for the specified date and region");
    return NextResponse.json(
      { error: "No forecast found for the specified date and region" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error fetching surf conditions:", error);
    return NextResponse.json(
      { error: "Failed to fetch surf conditions" },
      { status: 500 }
    );
  }
}
