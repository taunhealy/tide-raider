import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/authOptions";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestId = params.id;

    // Fetch the rental request with related data
    const request = await prisma.rentalRequest.findUnique({
      where: { id: requestId },
      include: {
        board: {
          select: {
            id: true,
            name: true,
            type: true,
            images: true,
            thumbnail: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        renter: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "asc",
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Check if user is authorized to view this request
    const userId = session.user.id;
    if (userId !== request.ownerId && userId !== request.renterId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // If this is the first time the owner is viewing the request, mark it as viewed
    if (userId === request.ownerId && !request.hasBeenViewed) {
      await prisma.rentalRequest.update({
        where: { id: requestId },
        data: {
          hasBeenViewed: true,
          viewedAt: new Date(),
        },
      });
    }

    // Create a new object without the messages property
    const { messages, ...requestData } = request;

    return NextResponse.json({ request: requestData, messages });
  } catch (error) {
    console.error("Error fetching rental request:", error);
    return NextResponse.json(
      { error: "Failed to fetch rental request" },
      { status: 500 }
    );
  }
}
