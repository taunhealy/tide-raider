import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;

    // Fetch the user's boards
    const boards = await prisma.board.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        name: true,
        type: true,
        length: true,
        finSetup: true,
        thumbnail: true,
        isForRent: true,
        rentPrice: true,
        isForSale: true,
        salePrice: true,
        rentalRequests: {
          select: {
            status: true,
            endDate: true,
          },
          where: {
            status: "ACCEPTED",
            endDate: {
              gt: new Date(),
            },
          },
        },
        // You would need to add a relation for sales in your schema
        // This is a placeholder for the sales status
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Process boards to add isRented and isSold flags
    const processedBoards = boards.map((board) => {
      // A board is considered rented if it has active rental requests
      const isRented = board.rentalRequests.length > 0;

      // For isSold, you would need to implement the actual logic based on your sales model
      // This is a placeholder - replace with actual implementation
      const isSold = false;

      return {
        ...board,
        isRented,
        isSold,
        rentalRequests: undefined, // Remove the detailed rental data from the response
      };
    });

    return NextResponse.json(processedBoards);
  } catch (error) {
    console.error("Error fetching user boards:", error);
    return NextResponse.json(
      { error: "Failed to fetch user boards" },
      { status: 500 }
    );
  }
}
