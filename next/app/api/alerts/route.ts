import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { prisma } from "@/app/lib/prisma";
import { z } from "zod";

// Schema for alert properties validation
const AlertPropertySchema = z.object({
  property: z.string(),
  range: z.number().min(1).max(100),
});

// Schema for alert validation
const AlertSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Name is required"),
  region: z.string().min(1, "Region is required"),
  forecastDate: z.union([z.string(), z.date()]).optional(),
  properties: z
    .array(AlertPropertySchema)
    .min(1, "At least one property is required"),
  notificationMethod: z.enum(["email", "whatsapp", "both"]),
  contactInfo: z.string().min(1, "Contact information is required"),
  active: z.boolean().default(true),
  logEntryId: z.string().nullable().optional(),
  alertType: z.enum(["variables", "rating"]).default("variables"),
  starRating: z.enum(["4+", "5"]).nullable().optional(),
});

// GET - Fetch alerts, regions, or dates based on query parameters
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const region = searchParams.get("region");
  const logEntryId = searchParams.get("logEntryId");

  try {
    // Case 0: If logEntryId is provided, return the forecast data from that log entry
    // and check if an alert already exists for this log entry
    if (logEntryId) {
      const session = await getServerSession(authOptions);

      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const logEntry = await prisma.logEntry.findUnique({
        where: { id: logEntryId },
        select: {
          forecast: true,
          region: true,
          date: true,
        },
      });

      if (!logEntry) {
        return NextResponse.json(
          { error: "Log entry not found" },
          { status: 404 }
        );
      }

      // Check if an alert already exists for this log entry
      const existingAlert = await prisma.alert.findFirst({
        where: {
          logEntryId: logEntryId,
          userId: session.user.id,
        },
      });

      return NextResponse.json({
        forecast: logEntry.forecast,
        region: logEntry.region,
        date: logEntry.date,
        ...(existingAlert && { id: existingAlert.id }),
      });
    }

    // Case 1: If "region" parameter exists but has no value, return all regions
    if (searchParams.has("region") && !region) {
      const forecasts = await prisma.forecastA.findMany({
        select: {
          region: true,
        },
        distinct: ["region"],
      });

      const regions = forecasts.map((forecast) => forecast.region);
      return NextResponse.json(regions);
    }

    // Case 2: If region parameter has a value, return available dates for that region
    if (region) {
      const forecasts = await prisma.forecastA.findMany({
        where: {
          region: region,
        },
        select: {
          date: true,
        },
        orderBy: {
          date: "asc",
        },
        distinct: ["date"],
      });

      const dates = forecasts.map(
        (forecast) => forecast.date.toISOString().split("T")[0]
      );
      return NextResponse.json(dates);
    }

    // Case 3: No query parameters - return all alerts for the current user
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const alerts = await prisma.alert.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        logEntry: {
          select: {
            beachName: true,
            date: true,
            forecast: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

// POST - Create a new alert
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    console.log("Received alert data:", data); // Debug

    // Clean date handling - ensure we only use YYYY-MM-DD
    const cleanDate = new Date(data.date || data.forecastDate);
    const dateOnly = cleanDate.toISOString().split("T")[0];

    const alert = await prisma.alert.create({
      data: {
        name: data.name,
        region: data.region,
        properties: data.properties,
        notificationMethod: data.notificationMethod,
        contactInfo: data.contactInfo,
        active: data.active ?? true,
        userId: session.user.id,
        logEntryId: data.logEntryId,
        forecastDate: new Date(dateOnly), // Use clean date
        alertType: data.alertType || "variables",
        starRating: data.starRating || null,
      },
      include: {
        forecast: true,
        logEntry: true,
      },
    });

    return NextResponse.json(alert);
  } catch (error) {
    console.error("Alert creation error details:", error);
    return NextResponse.json(
      { error: "Failed to create alert" },
      { status: 500 }
    );
  }
}
