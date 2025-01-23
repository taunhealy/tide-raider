import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";

function getTodayDate() {
  const date = new Date();
  return date.toISOString().split("T")[0];
}

export async function GET() {
  const entries = await prisma.logEntry.findMany({
    orderBy: { date: "desc" },
  });
  return Response.json(entries);
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const data = await request.json();

    // Fetch forecast data for the date
    const forecastResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/surf-conditions?date=${data.date}`
    );
    const forecast = await forecastResponse.json();

    const entry = await prisma.logEntry.create({
      data: {
        date: new Date(data.date),
        surferName: data.surferName,
        surferEmail: session?.user?.email ?? "",
        beachName: data.beachName,
        forecast: forecast.data,
        surferRating: data.surferRating,
        comments: data.comments,
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
