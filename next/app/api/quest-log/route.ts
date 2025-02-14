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

// Public logs endpoint with filters
export async function GET(request: Request) {
  console.log("[API] Received forecast request with params:", {
    url: request.url,
    searchParams: Object.fromEntries(new URL(request.url).searchParams),
  });

  try {
    const { searchParams } = new URL(request.url);

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
  console.log("[API] Received log submission");
  const rawData = await request.json();
  console.log("[API] Raw forecast data:", rawData.forecast);

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new Response("Unauthorized", { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { lemonSubscriptionId: true, hasActiveTrial: true },
    });

    if (!user?.lemonSubscriptionId && !user?.hasActiveTrial) {
      return new Response("Subscription required", { status: 403 });
    }

    const data = logEntrySchema.parse(rawData);
    console.log("[API] Parsed forecast data:", data.forecast);
    const beach = beachData.find((b) => b.name === data.beachName);

    if (!beach) throw new Error("Beach not found");

    // Validate forecast structure
    if (
      data.forecast &&
      (!data.forecast.swell ||
        !data.forecast.wind ||
        typeof data.forecast.swell.height !== "number" ||
        typeof data.forecast.wind.speed !== "number")
    ) {
      return NextResponse.json(
        { error: "Invalid forecast data structure" },
        { status: 400 }
      );
    }

    const entry = await prisma.logEntry.create({
      data: {
        ...data,
        date: new Date(data.date),
        region: beach.region,
        userId: session.user.id,
        imageUrl: data.imageUrl || "",
        forecast: data.forecast
          ? { entries: [data.forecast] } // Store in entries array format
          : Prisma.JsonNull,
      },
    });

    console.log("[API] Saved forecast data:", entry.forecast);
    return NextResponse.json(entry);
  } catch (error) {
    console.error("[API] Error saving forecast:", error);
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
