import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const regionId = url.searchParams.get("regionId");

  if (!regionId) {
    return NextResponse.json(
      { error: "regionId parameter is required" },
      { status: 400 }
    );
  }

  try {
    const beaches = await prisma.beach.findMany({
      where: {
        regionId: regionId,
      },
      select: {
        id: true,
        name: true,
        regionId: true,
        region: {
          select: {
            name: true,
          },
        },
      },
    });

    // Format the response to include region name
    const formattedBeaches = beaches.map((beach) => ({
      id: beach.id,
      name: beach.name,
      region: beach.region.name,
      regionId: beach.regionId,
    }));

    return NextResponse.json({ beaches: formattedBeaches });
  } catch (error) {
    console.error("Error fetching beaches:", error);
    return NextResponse.json(
      { error: "Failed to fetch beaches" },
      { status: 500 }
    );
  }
}
