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
});

// GET - Fetch alerts, regions, or dates based on query parameters
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const region = searchParams.get("region");

  try {
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

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("Creating alert with body:", body);

    // Validate request body
    const validationResult = AlertSchema.safeParse(body);
    if (!validationResult.success) {
      console.error("Validation error:", validationResult.error.format());
      return NextResponse.json(
        {
          error: "Invalid alert data",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const {
      id,
      name,
      region,
      forecastDate,
      properties,
      notificationMethod,
      contactInfo,
      active,
      logEntryId,
    } = validationResult.data;

    // Format the forecastDate if it exists
    let formattedDate = null;
    if (forecastDate) {
      try {
        formattedDate = new Date(forecastDate);
        if (isNaN(formattedDate.getTime())) {
          formattedDate = null;
        }
      } catch (e) {
        console.error("Error parsing date:", e);
        formattedDate = null;
      }
    }

    const alert = await prisma.alert.create({
      data: {
        id: id,
        name,
        region,
        properties,
        notificationMethod,
        contactInfo,
        active: active ?? true,
        userId: session.user.id,
        logEntryId: logEntryId || null,
      },
    });

    console.log("Created alert:", alert);
    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    console.error("Error creating alert:", error);
    return NextResponse.json(
      { error: "Failed to create alert" },
      { status: 500 }
    );
  }
}
