import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";

import { z } from "zod";

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
  forecast: z.object({
    wind: z.object({
      speed: z.number(),
      direction: z.string(),
    }),
    swell: z.object({
      height: z.number(),
      period: z.number(),
      direction: z.string(),
      cardinalDirection: z.string().optional(),
    }),
    timestamp: z.number(),
  }),
  continent: z.string(),
  country: z.string(),
  region: z.string(),
  waveType: z.string(),
  isAnonymous: z.boolean().optional(),
  userId: z.string().optional(),
});

const forecastSchema = z.object({
  wind: z.object({
    speed: z.number(),
    direction: z.string(),
  }),
  swell: z.object({
    height: z.number(),
    period: z.number(),
    direction: z.string(),
    cardinalDirection: z.string().optional(),
  }),
  timestamp: z.number(),
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

// Add this helper function at the top
async function getForecast(date: string, region: string) {
  const queryDate = new Date(date);
  queryDate.setUTCHours(0, 0, 0, 0);

  // Try source A first
  const forecastA = await prisma.forecastA.findFirst({
    where: {
      date: {
        gte: queryDate,
        lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000),
      },
      region: region,
    },
    select: {
      forecast: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  if (forecastA) return forecastA.forecast;

  // Try source B as fallback
  const forecastB = await prisma.forecastB.findFirst({
    where: {
      date: {
        gte: queryDate,
        lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000),
      },
      region: region,
    },
    select: {
      forecast: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return forecastB?.forecast || null;
}

// Update the GET endpoint to handle forecast requests
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  console.log("🔍 Fetching raid logs with params:", searchParams.toString());

  // Extract all filter parameters
  const beaches = searchParams.get("beaches")?.split(",").filter(Boolean) || [];
  const regions = searchParams.get("regions")?.split(",").filter(Boolean) || [];
  const countries =
    searchParams.get("countries")?.split(",").filter(Boolean) || [];
  const minRating = Number(searchParams.get("minRating")) || 0;
  const isPrivate = searchParams.get("isPrivate") === "true";

  const session = await getServerSession(authOptions);
  console.log("👤 Session state:", session ? "Authenticated" : "Public");

  // Check for private logs access
  if (isPrivate && !session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required for private logs" },
      { status: 401 }
    );
  }

  try {
    // Build dynamic where clause
    const whereClause: any = {
      // Handle private/public filtering
      ...(isPrivate
        ? {
            isPrivate: true,
            userId: session!.user.id,
          }
        : {
            OR: [
              { isPrivate: false }, // Show all public logs
              ...(session?.user?.id ? [{ userId: session.user.id }] : []), // Show user's private logs if logged in
            ],
          }),

      // Add filter conditions only if they exist
      ...(beaches.length > 0 && {
        beachName: { in: beaches },
      }),
      ...(regions.length > 0 && {
        region: { in: regions },
      }),
      ...(countries.length > 0 && {
        country: { in: countries },
      }),
      ...(minRating > 0 && {
        surferRating: { gte: minRating },
      }),
    };

    const entries = await prisma.logEntry.findMany({
      where: whereClause,
      select: {
        id: true,
        date: true,
        beachName: true,
        surferName: true,
        surferRating: true,
        comments: true,
        imageUrl: true,
        region: true,
        country: true,
        waveType: true,
        createdAt: true,
        forecast: true,
        isAnonymous: true,
        isPrivate: true,
        userId: true,
      },
      orderBy: { date: "desc" },
      take: 50,
    });

    console.log(`📊 Found ${entries.length} entries`);
    return NextResponse.json({ entries });
  } catch (error) {
    console.error("❌ Error in raid logs:", error);
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

    const data = await request.json();

    // Fetch user data from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    });

    // Fetch forecast data
    const forecast = await getForecast(data.date, data.region);

    const entry = await prisma.logEntry.create({
      data: {
        ...data,
        date: new Date(data.date),
        userId: session.user.id,
        surferName: user?.name || session.user.name || "Anonymous Surfer", // Use database name, fallback to session name
        forecast: forecast,
      },
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Error creating log entry:", error);
    return NextResponse.json(
      { error: "Failed to create log entry" },
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
