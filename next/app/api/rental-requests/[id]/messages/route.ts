import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/authOptions";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestId = params.id;
    const { content } = await req.json();

    // Verify the request exists and user is authorized
    const rentalRequest = await prisma.rentalRequest.findUnique({
      where: { id: requestId },
      select: {
        ownerId: true,
        renterId: true,
      },
    });

    if (!rentalRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const userId = session.user.id;

    // Check if user is part of this conversation
    if (userId !== rentalRequest.ownerId && userId !== rentalRequest.renterId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Create the message
    const message = await prisma.chatMessage.create({
      data: {
        requestId,
        senderId: userId,
        content,
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
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
