import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { prisma } from "@/app/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch user's log entries
    const logEntries = await prisma.logEntry.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    });

    // For each log entry, fetch its forecast data
    const enhancedLogEntries = await Promise.all(
      logEntries.map(async (entry) => {
        const forecastData = await prisma.forecastA.findFirst({
          where: {
            region: entry.region || "",
            date: entry.date,
          },
        });

        return {
          ...entry,
          forecast: forecastData || null,
        };
      })
    );

    return NextResponse.json(enhancedLogEntries);
  } catch (error) {
    console.error("Error fetching log entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch log entries" },
      { status: 500 }
    );
  }
}
