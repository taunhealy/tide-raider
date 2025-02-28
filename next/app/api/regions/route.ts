import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Query the Region model directly
    const regions = await prisma.region.findMany({
      select: {
        id: true,
        name: true,
        country: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(regions);
  } catch (error) {
    console.error("Error fetching regions:", error);
    return NextResponse.json(
      { error: "Failed to fetch regions" },
      { status: 500 }
    );
  }
}
