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
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const beachName = searchParams.get("beach");

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // If date and beach are provided, return forecast data
    if (date && beachName) {
      const beach = beachData.find((b) => b.name === beachName);
      if (!beach) {
        return NextResponse.json({ error: "Beach not found" }, { status: 404 });
      }

      // First try to get conditions for the specific date
      let conditions = await prisma.surfCondition.findFirst({
        where: {
          date: date,
          region: beach.region,
        },
        orderBy: {
          timestamp: "desc",
        },
      });

      // If no conditions found, get the most recent conditions
      if (!conditions) {
        conditions = await prisma.surfCondition.findFirst({
          where: {
            region: beach.region,
          },
          orderBy: {
            timestamp: "desc",
          },
        });
      }

      // If still no conditions, return a default structure
      if (!conditions) {
        return NextResponse.json({
          wind: {
            direction: "N/A",
            speed: 0,
          },
          swell: {
            height: 0,
            direction: "N/A",
            period: 0,
          },
          timestamp: Date.now(),
          region: beach.region,
          note: "No forecast data available - using default values",
        });
      }

      return NextResponse.json({
        wind: {
          direction: conditions.windDirection,
          speed: conditions.windSpeed,
        },
        swell: {
          height: conditions.swellHeight,
          direction: conditions.swellDirection,
          period: conditions.swellPeriod,
        },
        timestamp: conditions.timestamp,
        region: conditions.region,
      });
    }

    // Return quest log entries if no date/beach params
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
    const data = await request.json();

    // Get forecast data from our own endpoint
    const forecastResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/quest-log?date=${data.date}&beach=${encodeURIComponent(data.beachName)}`
    );

    const forecast = await forecastResponse.json();

    const entry = await prisma.logEntry.create({
      data: {
        date: new Date(data.date),
        surferName: data.surferName,
        surferEmail: session?.user?.email ?? "",
        beachName: data.beachName,
        forecast: forecast,
        surferRating: data.surferRating,
        comments: data.comments,
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
