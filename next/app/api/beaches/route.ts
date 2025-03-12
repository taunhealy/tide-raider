import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const region = url.searchParams.get("region");

  if (!region) {
    return NextResponse.json(
      { error: "Region parameter is required" },
      { status: 400 }
    );
  }

  try {
    const beaches = await prisma.beach.findMany({
      where: {
        regionId: region,
      },
      select: {
        id: true,
        name: true,
        regionId: true,
      },
    });

    return NextResponse.json(beaches);
  } catch (error) {
    console.error("Error fetching beaches:", error);
    return NextResponse.json(
      { error: "Failed to fetch beaches" },
      { status: 500 }
    );
  }
}
