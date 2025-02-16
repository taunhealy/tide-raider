import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const region = searchParams.get("region");

  if (!date || !region) {
    return NextResponse.json(
      { error: "Date and region are required" },
      { status: 400 }
    );
  }

  try {
    const queryDate = new Date(date);
    queryDate.setUTCHours(0, 0, 0, 0);

    const conditions = await prisma.surfCondition.findFirst({
      where: {
        date: queryDate,
        region: region,
      },
      select: {
        forecast: true,
      },
    });

    if (!conditions) {
      return NextResponse.json(
        { error: "No forecast found for the specified date and region" },
        { status: 404 }
      );
    }

    return NextResponse.json(conditions.forecast);
  } catch (error) {
    console.error("Error fetching surf conditions:", error);
    return NextResponse.json(
      { error: "Failed to fetch surf conditions" },
      { status: 500 }
    );
  }
}
