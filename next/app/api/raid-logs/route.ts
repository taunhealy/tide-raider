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

// Add this function to handle forecast fetching
async function getForecast(date: string, region: string) {
  console.log("Fetching forecast for:", { date, region });

  // Convert the date string to start of day UTC
  const queryDate = new Date(date);
  queryDate.setUTCHours(0, 0, 0, 0);

  const conditions = await prisma.surfCondition.findFirst({
    where: {
      date: {
        gte: queryDate,
        lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000), // next day
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

  console.log("Query date:", queryDate);
  console.log("Found conditions:", conditions);

  if (!conditions?.forecast) {
    console.log("No forecast found for:", { date, region });
    return null;
  }

  return conditions.forecast;
}

// Update the GET endpoint to handle forecast requests
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const region = searchParams.get("region");

  // If date and region are provided, return forecast
  if (date && region) {
    try {
      const forecast = await getForecast(date, region);
      if (!forecast) {
        return NextResponse.json(
          { error: "No forecast data available" },
          { status: 404 }
        );
      }
      return NextResponse.json(forecast);
    } catch (error) {
      console.error("Error fetching forecast:", error);
      return NextResponse.json(
        { error: "Failed to fetch forecast" },
        { status: 500 }
      );
    }
  }

  console.log("[API] Received forecast request with params:", {
    url: request.url,
    searchParams: Object.fromEntries(new URL(request.url).searchParams),
  });

  try {
    // Get filter parameters
    const regions = searchParams.get("regions")?.split(",") || [];
    const beaches = searchParams.get("beaches")?.split(",") || [];
    const countries = searchParams.get("countries")?.split(",") || [];
    const waveTypes = searchParams.get("waveTypes")?.split(",") || [];
    const minRating = Number(searchParams.get("minRating")) || 0;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const entries = await prisma.logEntry.findMany({
      where: {
        isPrivate: false,
        ...(regions.length && { region: { in: regions } }),
        ...(beaches.length && { beachName: { in: beaches } }),
        ...(countries.length && { country: { in: countries } }),
        ...(waveTypes.length && { waveType: { in: waveTypes } }),
        ...(minRating > 0 && { surferRating: { gte: minRating } }),
        ...(startDate &&
          endDate && {
            date: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          }),
      },
      select: {
        id: true,
        date: true,
        beachName: true,
        surferRating: true,
        comments: true,
        imageUrl: true,
        region: true,
        country: true,
        waveType: true,
        createdAt: true,
        forecast: true,
      },
      orderBy: { date: "desc" },
      take: 50,
    });

    // Add forecast transformation
    const transformedEntries = entries.map((entry) => ({
      ...entry,
      forecast:
        entry.forecast && typeof entry.forecast === "object"
          ? entry.forecast
          : null,
    }));

    console.log("[API] Returning forecast data:", transformedEntries);
    return NextResponse.json({ entries: transformedEntries });
  } catch (error) {
    console.error("Error fetching public logs:", error);
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
    const beach = beachData.find((b) => b.name === data.beachName);
    if (!beach) throw new Error("Beach not found");

    const entry = await prisma.logEntry.create({
      data: {
        date: new Date(data.date),
        beachName: data.beachName,
        region: beach.region,
        country: data.country,
        continent: data.continent,
        waveType: data.waveType,
        surferName: data.surferName,
        surferRating: data.surferRating,
        comments: data.comments,
        imageUrl: data.imageUrl || "",
        isPrivate: data.isPrivate || false,
        isAnonymous: data.isAnonymous || false,
        userId: session.user.id,
        forecast: data.forecast, // Store the forecast data directly
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
