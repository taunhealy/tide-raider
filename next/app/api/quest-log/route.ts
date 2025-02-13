import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { beachData } from "@/app/types/beaches";
import { z } from "zod";
import { Prisma } from "@prisma/client";

function getTodayDate() {
  const date = new Date();
  return date.toISOString().split("T")[0];
}

// Add Zod validation for input types
const logEntrySchema = z.object({
  beachName: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  surferName: z.string(),
  surferRating: z.number().min(0).max(5),
  comments: z.string().optional(),
  imageUrl: z.string().optional(),
  isPrivate: z.boolean().optional(),
  forecast: z.any().optional(),
  continent: z.string(),
  country: z.string(),
  region: z.string(),
  waveType: z.string(),
  isAnonymous: z.boolean().optional(),
  userId: z.string().optional(),
});

interface Forecast {
  wind?: { speed: number; direction: string };
  swell?: {
    height: number;
    period: number;
    direction: string;
    cardinalDirection: string;
  };
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
    const where: any = {
      ...(showPrivate && {
        isPrivate: true,
        userId: userId || session?.user?.id,
      }),
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
      select: {
        id: true,
        date: true,
        beachName: true,
        surferName: true,
        surferEmail: true,
        surferRating: true,
        comments: true,
        imageUrl: true,
        isPrivate: true,
        forecast: true,
        // Add missing top-level fields
        continent: true,
        country: true,
        region: true,
        waveType: true,
        isAnonymous: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { date: "desc" },
    });

    const formattedEntries = entries.map((entry) => ({
      ...entry,
      forecast: entry.forecast,
    }));

    console.log("Found entries:", entries.length);
    return NextResponse.json({ entries: formattedEntries });
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

    const rawData = await request.json();
    const data = logEntrySchema.parse(rawData);

    // Get the beach data to find region
    const beach = beachData.find((b) => b.name === data.beachName);
    if (!beach) throw new Error("Beach not found");

    // Fetch latest conditions for the beach's region on the log date
    const conditions = await prisma.surfCondition.findFirst({
      where: {
        date: data.date,
        region: beach.region,
      },
      orderBy: { timestamp: "desc" },
    });

    // Add this before creating the entry
    if (conditions) {
      if (!conditions.windSpeed || !conditions.swellHeight) {
        return NextResponse.json(
          { error: "Incomplete forecast data for this date/region" },
          { status: 400 }
        );
      }
    }

    // Create entry with verified forecast
    const entry = await prisma.logEntry.create({
      data: {
        ...data,
        date: new Date(data.date),
        region: beach.region, // Ensure region is set from beach data
        forecast: conditions
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
            }
          : Prisma.JsonNull,
        imageUrl: data.imageUrl || "",
        userId: session.user.id,
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

// Add conversion helper
function convertDegreesToCardinal(degrees: number) {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index] || "N/A";
}
