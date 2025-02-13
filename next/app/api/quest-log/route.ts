import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { beachData } from "@/app/types/beaches";
import { Prisma } from "@prisma/client";

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
    const showPrivate = searchParams.get("showPrivate") === "true";
    const session = await getServerSession(authOptions);

    // Add filter parameters
    const regions = searchParams.get("regions")?.split(",") || [];
    const beaches = searchParams.get("beaches")?.split(",") || [];
    const countries = searchParams.get("countries")?.split(",") || [];
    const waveTypes = searchParams.get("waveTypes")?.split(",") || [];
    const minRating = Number(searchParams.get("minRating")) || 0;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    console.log("Session user:", session?.user);
    console.log("Filter parameters:", {
      regions,
      beaches,
      countries,
      waveTypes,
      minRating,
      startDate,
      endDate,
      userId,
      showPrivate,
    });

    if (date && beachName) {
      // Find beach from beachData instead of database
      const beach = beachData.find((b) => b.name === beachName);

      if (!beach) {
        return NextResponse.json(
          {
            error: "Beach not found",
          },
          { status: 404 }
        );
      }

      // Get conditions for the beach's region
      const conditions = await prisma.surfCondition.findFirst({
        where: {
          date: date,
          region: beach.region,
          windSpeed: { gt: 0 },
          swellHeight: { gt: 0 },
        },
        orderBy: { timestamp: "desc" },
      });

      const forecast = conditions
        ? {
            wind: {
              speed: conditions.windSpeed ? Number(conditions.windSpeed) : null,
              direction: conditions.windDirection || "N/A",
            },
            swell: {
              height: conditions.swellHeight
                ? Number(conditions.swellHeight)
                : null,
              period: conditions.swellPeriod
                ? Number(conditions.swellPeriod)
                : null,
              direction: conditions.swellDirection || "N/A",
              cardinalDirection: conditions.swellDirection || "N/A",
            },
            timestamp: conditions.timestamp,
          }
        : null;

      // Add validation before returning forecast
      if (forecast && (!forecast.wind.speed || !forecast.swell.height)) {
        return NextResponse.json(
          { error: "Incomplete forecast data from provider" },
          { status: 500 }
        );
      }

      console.log("Surf conditions query results:", {
        dateUsed: date,
        regionUsed: beach.region,
        conditionsFound: conditions,
      });

      return NextResponse.json(
        forecast || {
          error: `No forecast data available for ${beach.region} on ${date}`,
        }
      );
    }

    // Modified authentication check
    if (!session?.user?.email && !userId) {
      console.log("No session and no userId provided");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Revised WHERE clause construction
    const where: Prisma.LogEntryWhereInput = {
      // Only apply email filter if we're not specifically querying a user's public logs
      ...(userId
        ? { surferEmail: userId }
        : { surferEmail: session?.user?.email }),
      isPrivate: userId ? false : showPrivate, // Force public when viewing others
    };

    // Add filters only if they have values
    if (regions.length) where.region = { in: regions };
    if (beaches.length) where.beachName = { in: beaches };
    if (countries.length) where.country = { in: countries };
    if (waveTypes.length) where.waveType = { in: waveTypes };
    if (minRating > 0) where.surferRating = { gte: minRating };
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    console.log("Final WHERE clause:", JSON.stringify(where, null, 2));

    const entries = await prisma.logEntry.findMany({
      where,
      orderBy: { date: "desc" },
    });

    console.log("Found entries:", entries.length);
    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch logs" },
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
      select: {
        lemonSubscriptionId: true,
        hasActiveTrial: true,
      },
    });

    const isAllowed = !!user?.lemonSubscriptionId || user?.hasActiveTrial;

    if (!isAllowed) {
      return new Response("Subscription required to create logs", {
        status: 403,
      });
    }

    const data = await request.json();

    const entry = await prisma.logEntry.create({
      data: {
        beachName: data.beachName,
        continent: data.continent,
        country: data.country,
        region: data.region,
        waveType: data.waveType,
        date: new Date(data.date),
        surferEmail: session.user.email!,
        surferName: data.surferName,
        surferRating: data.surferRating,
        comments: data.comments,
        imageUrl: data.imageUrl,
        forecast: data.forecast,
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
