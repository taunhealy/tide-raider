import { prisma } from "./prisma";

export async function checkBoardAvailability(
  boardId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  isAvailable: boolean;
  conflictingDates?: {
    startDate: Date;
    endDate: Date;
  }[];
  suggestedDates?: {
    startDate: Date;
    endDate: Date;
  }[];
}> {
  try {
    // Check existing bookings
    const conflicts = await prisma.boardAvailability.findMany({
      where: {
        boardId,
        OR: [
          {
            AND: [
              { startDate: { lte: startDate } },
              { endDate: { gte: startDate } },
            ],
          },
          {
            AND: [
              { startDate: { lte: endDate } },
              { endDate: { gte: endDate } },
            ],
          },
        ],
      },
    });

    if (conflicts.length === 0) {
      return { isAvailable: true };
    }

    // Find next available dates
    const suggestedDates = await findNextAvailableDates(
      boardId,
      startDate,
      endDate
    );

    return {
      isAvailable: false,
      conflictingDates: conflicts,
      suggestedDates,
    };
  } catch (error) {
    console.error("Failed to check availability:", error);
    throw error;
  }
}

async function findNextAvailableDates(
  boardId: string,
  startDate: Date,
  endDate: Date
): Promise<{ startDate: Date; endDate: Date }[]> {
  // Get all existing bookings for this board
  const bookings = await prisma.boardAvailability.findMany({
    where: { boardId },
    orderBy: { startDate: "asc" },
  });

  // Find the next available 2-week slot after the requested end date
  const suggestedStart = new Date(endDate);
  suggestedStart.setDate(suggestedStart.getDate() + 1); // Start day after requested end date

  // Check if this new slot conflicts with any existing booking
  const isAvailable = !bookings.some(
    (booking) =>
      (suggestedStart >= booking.startDate &&
        suggestedStart <= booking.endDate) ||
      (new Date(suggestedStart.getTime() + 13 * 24 * 60 * 60 * 1000) >=
        booking.startDate &&
        new Date(suggestedStart.getTime() + 13 * 24 * 60 * 60 * 1000) <=
          booking.endDate)
  );

  if (isAvailable) {
    const suggestedEnd = new Date(suggestedStart);
    suggestedEnd.setDate(suggestedEnd.getDate() + 13); // 2 weeks (14 days including start date)
    return [{ startDate: suggestedStart, endDate: suggestedEnd }];
  }

  // If no immediate slot is available, return empty array
  // In a real app, you might want to search further ahead
  return [];
}
