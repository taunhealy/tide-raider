import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const regions = await prisma.region.findMany({
      where: { date: new Date().toISOString().split("T")[0] },
      include: { beaches: true },
    });

    const beaches = regions.flatMap((region) =>
      region.beaches.map((beach) => ({
        id: beach.id,
        name: beach.name,
        region: region.name,
        forecast: region.forecast,
        latitude: beach.latitude,
        longitude: beach.longitude,
        continent: region.continent,
        country: region.country,
        waveType: beach.waveType,
      }))
    );

    return NextResponse.json(beaches);
  } catch (error) {
    console.error("Failed to fetch beaches:", error);
    return NextResponse.json(
      { error: "Failed to fetch beaches" },
      { status: 500 }
    );
  }
}
