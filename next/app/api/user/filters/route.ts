import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { continents, countries, regions } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: req.nextauth.token.sub },
      data: {
        savedFilters: {
          continents,
          countries,
          regions,
        },
      },
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("Error saving filters:", error);
    return NextResponse.json(
      { error: "Failed to save filters" },
      { status: 500 }
    );
  }
}
