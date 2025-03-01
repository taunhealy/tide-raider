import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rentalItem = await prisma.rentalItem.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
        availableBeaches: {
          include: {
            beach: {
              select: {
                id: true,
                name: true,
                region: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!rentalItem) {
      return NextResponse.json(
        { error: "Rental item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(rentalItem);
  } catch (error) {
    console.error("Error fetching rental item:", error);
    return NextResponse.json(
      { error: "Failed to fetch rental item" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const existingItem = await prisma.rentalItem.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Item not found or you do not have permission to edit it" },
        { status: 404 }
      );
    }

    const {
      name,
      description,
      rentPrice,
      images,
      thumbnail,
      itemType,
      specifications,
      availableBeaches,
      isActive,
    } = await req.json();

    // Update the rental item
    const updatedItem = await prisma.rentalItem.update({
      where: { id: params.id },
      data: {
        name,
        description,
        rentPrice,
        images: Array.isArray(images) ? images : existingItem.images,
        thumbnail,
        itemType,
        specifications,
        isActive: isActive ?? existingItem.isActive,
        availableBeaches: {
          deleteMany: {}, // Remove all existing connections
          create: availableBeaches.map((beachId: string) => ({
            beachId,
          })),
        },
      },
      include: {
        availableBeaches: {
          include: {
            beach: true,
          },
        },
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating rental item:", error);
    return NextResponse.json(
      { error: "Failed to update rental item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const existingItem = await prisma.rentalItem.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Item not found or you do not have permission to delete it" },
        { status: 404 }
      );
    }

    // Check if there are any active rental requests
    const activeRequests = await prisma.rentalItemRequest.findMany({
      where: {
        rentalItemId: params.id,
        status: {
          in: ["PENDING", "APPROVED"],
        },
      },
    });

    if (activeRequests.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete item with active rental requests" },
        { status: 400 }
      );
    }

    // Delete the rental item
    await prisma.rentalItem.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting rental item:", error);
    return NextResponse.json(
      { error: "Failed to delete rental item" },
      { status: 500 }
    );
  }
}
