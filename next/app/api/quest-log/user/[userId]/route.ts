import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Authorization check
    if (session.user.id !== params.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const showPrivate = searchParams.get("showPrivate") === "true";
    const regions = searchParams.get("regions")?.split(",") || [];
    const beaches = searchParams.get("beaches")?.split(",") || [];
    const countries = searchParams.get("countries")?.split(",") || [];
    const waveTypes = searchParams.get("waveTypes")?.split(",") || [];
    const minRating = Number(searchParams.get("minRating")) || 0;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {
      userId: params.userId,
      OR: showPrivate
        ? [{ isPrivate: true, userId: session.user.id }]
        : [{ isPrivate: false }, { userId: session.user.id }],
    };

    console.log("[API] Query params:", { showPrivate, where });

    if (regions.length) where.region = { in: regions };
    if (beaches.length) where.beachName = { in: beaches };
    if (countries.length) where.country = { in: countries };
    if (waveTypes.length) where.waveType = { in: waveTypes };
    if (minRating > 0) where.surferRating = { gte: minRating };
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const entries = await prisma.logEntry.findMany({
      where,
      select: {
        id: true,
        date: true,
        beachName: true,
        surferName: true,
        surferEmail: true,
        surferRating: true,
        comments: true,
        imageUrl: true,
        isPrivate: true,
        forecast: true,
        continent: true,
        country: true,
        region: true,
        waveType: true,
        isAnonymous: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { date: "desc" },
    });

    console.log("[API] Found entries:", entries.length);

    // Debug the forecast data
    console.log(
      "[API] Raw entries:",
      entries.map((e) => ({
        id: e.id,
        forecast: e.forecast,
      }))
    );

    const transformedEntries = entries.map((entry) => {
      const forecast = entry.forecast;
      console.log("[API] Processing forecast:", { id: entry.id, forecast });

      return {
        ...entry,
        forecast:
          forecast && typeof forecast === "object" && "entries" in forecast
            ? {
                wind: (forecast as any).entries[0].wind,
                swell: (forecast as any).entries[0].swell,
                timestamp: (forecast as any).entries[0].timestamp,
              }
            : null,
      };
    });

    console.log(
      "[API] Transformed entries:",
      transformedEntries.map((e) => ({
        id: e.id,
        forecast: e.forecast,
      }))
    );

    return NextResponse.json({ entries: transformedEntries });
  } catch (error) {
    console.error("Error fetching user logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 }
    );
  }
}
