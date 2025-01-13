import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const entries = await prisma.logEntry.findMany({
      where: {
        surferEmail: session.user.email,
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error("Error fetching log entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch log entries" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
        surferEmail: session.user.email,
        beachName: data.beachName,
        forecast: forecast.data,
        surferRating: data.surferRating,
        comments: data.comments,
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