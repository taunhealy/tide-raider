import { prisma } from "@/lib/prisma";

export async function updateBoardAvailability(
  boardId: string,
  startDate: Date,
  endDate: Date
) {
  try {
    // Check if dates are already booked
    const isAvailable = await checkBoardAvailability(
      boardId,
      startDate,
      endDate
    );
    if (!isAvailable) {
      throw new Error("Board is not available for these dates");
    }

    // Add booking to availability calendar
    const booking = await prisma.boardAvailability.create({
      data: {
        boardId,
        startDate,
        endDate,
      },
    });

    return booking;
  } catch (error) {
    console.error("Failed to update board availability:", error);
    throw error;
  }
}

export async function checkBoardAvailability(
  boardId: string,
  startDate: Date,
  endDate: Date
): Promise<boolean> {
  try {
    // Find any overlapping bookings
    const existingBooking = await prisma.boardAvailability.findFirst({
      where: {
        boardId,
        OR: [
          {
            // New booking starts during existing booking
            AND: [
              { startDate: { lte: startDate } },
              { endDate: { gte: startDate } },
            ],
          },
          {
            // New booking ends during existing booking
            AND: [
              { startDate: { lte: endDate } },
              { endDate: { gte: endDate } },
            ],
          },
          {
            // New booking encompasses existing booking
            AND: [
              { startDate: { gte: startDate } },
              { endDate: { lte: endDate } },
            ],
          },
        ],
      },
    });

    return !existingBooking;
  } catch (error) {
    console.error("Failed to check board availability:", error);
    throw error;
  }
}
