import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { beachData } from "@/app/types/beaches";

function getTodayDate() {
  const date = new Date();
  return date.toISOString().split("T")[0];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const beachName = searchParams.get("beach");

    // If date and beach are provided, return forecast data without auth check
    if (date && beachName) {
      const beach = beachData.find((b) => b.name === beachName);
      if (!beach) {
        return NextResponse.json({
          wind: { speed: 0, direction: "N/A" },
          swell: {
            height: 0,
            period: 0,
            direction: "0",
            cardinalDirection: "N/A",
          },
        });
      }

      const conditions = await prisma.surfCondition.findFirst({
        where: {
          date: date,
          region: beach.region,
        },
        orderBy: {
          timestamp: "desc",
        },
      });

      const forecast = conditions
        ? {
            wind: {
              speed: conditions.windSpeed,
              direction: conditions.windDirection,
            },
            swell: {
              height: conditions.swellHeight,
              period: conditions.swellPeriod,
              direction: conditions.swellDirection,
              cardinalDirection: conditions.swellDirection,
            },
            timestamp: conditions.timestamp,
          }
        : {
            wind: { speed: 0, direction: "N/A" },
            swell: {
              height: 0,
              period: 0,
              direction: "0",
              cardinalDirection: "N/A",
            },
            timestamp: Date.now(),
          };

      return NextResponse.json(forecast);
    }

    // For entry listing, require authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const entries = await prisma.logEntry.findMany({
      where: {
        surferEmail: session.user.email,
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Error in quest-log route:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Get forecast data from surf-conditions endpoint instead
    const forecastResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/surf-conditions?date=${data.date}&region=${encodeURIComponent(data.beach.region)}`
    );

    const forecastData = await forecastResponse.json();

    const entry = await prisma.logEntry.create({
      data: {
        date: new Date(data.date),
        surferName: data.surferName,
        surferEmail: session.user.email,
        beachName: data.beachName,
        forecast: forecastData,
        surferRating: data.surferRating,
        comments: data.comments || "",
        imageUrl: data.imageUrl,
      },
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Error creating quest entry:", error);
    return NextResponse.json(
      { error: "Failed to create quest entry" },
      { status: 500 }
    );
  }
}
