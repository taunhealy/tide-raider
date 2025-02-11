import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/lib/authOptions";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userLogs = await prisma.logEntry.findMany({
      where: {
        surferEmail: params.userId,
      },
      select: {
        id: true,
        date: true,
        beachName: true,
        surferRating: true,
        comments: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(userLogs);
  } catch (error) {
    console.error("Failed to fetch user logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch user logs" },
      { status: 500 }
    );
  }
}
