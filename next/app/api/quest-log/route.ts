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
    const userId = searchParams.get("userId");
    const session = await getServerSession(authOptions);

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
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const where: any = {};

    // If viewing specific user's logs
    if (userId) {
      where.surferEmail = userId;
      // Show private logs only if viewing own profile
      if (userId !== session.user.email) {
        where.isPrivate = false;
      }
    } else {
      // For general log listing
      where.OR = [{ isPrivate: false }, { surferEmail: session.user.email }];
    }

    const entries = await prisma.logEntry.findMany({
      where,
      orderBy: {
        date: "desc",
      },
      select: {
        id: true,
        date: true,
        surferName: true,
        surferEmail: true,
        beachName: true,
        forecast: true,
        surferRating: true,
        comments: true,
        imageUrl: true,
        isPrivate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ entries });
  } catch (error: any) {
    console.error("Database error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch log entries",
        details: error.message,
        prismaErrorCode: error.code,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new Response("Unauthorized", { status: 401 });

    // Direct subscription check
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { lemonSubscriptionId: true },
    });

    const isSubscribed = !!user?.lemonSubscriptionId;

    if (!isSubscribed) {
      return new Response("Subscription required to create logs", {
        status: 403,
      });
    }

    const data = await request.json();

    const entry = await prisma.logEntry.create({
      data: {
        ...data,
        date: new Date(data.date),
        surferEmail: session.user.email,
        isPrivate: data.isPrivate || false,
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
