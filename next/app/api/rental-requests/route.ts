import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendRentalRequestEmail } from "@/lib/email";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/authOptions";
import type { Session } from "next-auth";

// Helper function to check board availability
async function checkBoardAvailability(
  boardId: string,
  startDate: Date,
  endDate: Date
): Promise<boolean> {
  // Check if there are any overlapping rental requests
  const existingRequests = await prisma.rentalRequest.findMany({
    where: {
      boardId,
      status: { in: ["PENDING", "ACCEPTED"] },
      OR: [
        {
          // Request starts during existing rental
          startDate: { lte: endDate },
          endDate: { gte: startDate },
        },
      ],
    },
  });

  return existingRequests.length === 0;
}

export async function POST(req: Request) {
  try {
    const session = (await getServerSession(authOptions)) as Session & {
      user?: {
        id?: string;
      };
    };

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { boardId, startDate, endDate, beachId, totalCost } =
      await req.json();

    // Validate dates
    const isAvailable = await checkBoardAvailability(
      boardId,
      new Date(startDate),
      new Date(endDate)
    );

    if (!isAvailable) {
      return NextResponse.json(
        { error: "Board is not available for these dates" },
        { status: 400 }
      );
    }

    // Get board owner
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      select: { userId: true, name: true },
    });

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    // Create rental request
    const request = await prisma.rentalRequest.create({
      data: {
        boardId,
        renterId: userId,
        ownerId: board.userId,
        status: "PENDING",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        beachId,
        totalCost,
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
      },
      include: {
        owner: true,
        board: true,
      },
    });

    // Send email notification
    await sendRentalRequestEmail(request);

    return NextResponse.json(request);
  } catch (error) {
    console.error("Failed to create rental request:", error);
    return NextResponse.json(
      { error: "Failed to create rental request" },
      { status: 500 }
    );
  }
}
