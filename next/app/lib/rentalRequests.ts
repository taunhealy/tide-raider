import { prisma } from "@/lib/prisma";
import { sendRequestExpiredNotification } from "@/app/lib/email";
import { RequestStatus } from "@prisma/client";

// Define the missing type
interface CreateRentalRequestData {
  boardId: string;
  renterId: string;
  ownerId: string;
  startDate: Date;
  endDate: Date;
  beachId: string;
  totalCost: any; // You can make this more specific if needed
}

export async function handleRequestExpiration() {
  const EXPIRATION_HOURS = 48;

  try {
    // Find expired requests
    const expiredRequests = await prisma.rentalRequest.findMany({
      where: {
        status: "PENDING",
        createdAt: {
          lt: new Date(Date.now() - EXPIRATION_HOURS * 60 * 60 * 1000),
        },
        isExpired: false, // Only process non-expired requests
      },
      include: {
        renter: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        board: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    // Update requests in bulk
    if (expiredRequests.length > 0) {
      await prisma.rentalRequest.updateMany({
        where: {
          id: {
            in: expiredRequests.map((req) => req.id),
          },
        },
        data: {
          status: "EXPIRED" as RequestStatus,
          isExpired: true,
        },
      });

      // Send notifications
      await Promise.all(
        expiredRequests.map((request) =>
          sendRequestExpiredNotification(request)
        )
      );
    }

    return expiredRequests.length;
  } catch (error) {
    console.error("Failed to handle request expiration:", error);
    throw error;
  }
}

// Add other request-related utility functions here
export async function createRentalRequest(data: CreateRentalRequestData) {
  return prisma.rentalRequest.create({
    data: {
      ...data,
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
      status: "PENDING",
    },
  });
}

export async function updateRequestStatus(
  requestId: string,
  status: RequestStatus,
  reason?: string
) {
  return prisma.rentalRequest.update({
    where: { id: requestId },
    data: {
      status,
      lastActionAt: new Date(),
      cancellationReason: reason,
    },
  });
}
