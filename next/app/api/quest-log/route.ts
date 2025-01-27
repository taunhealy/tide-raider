import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";

function getTodayDate() {
  const date = new Date();
  return date.toISOString().split("T")[0];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "10");
  const page = parseInt(searchParams.get("page") || "1");
  const beach = searchParams.get("beach");

  const where = beach ? { beachName: beach } : {};

  const entries = await prisma.logEntry.findMany({
    where,
    orderBy: { date: "desc" },
    take: limit,
    skip: (page - 1) * limit,
    select: {
      id: true,
      date: true,
      surferName: true,
      beachName: true,
      surferRating: true,
      comments: true,
      forecast: true,
    },
  });

  const total = await prisma.logEntry.count({ where });

  return Response.json({
    entries,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    },
  });
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
