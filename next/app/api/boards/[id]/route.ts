import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/authOptions";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Verify board ownership
  const existingBoard = await prisma.board.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
  });

  if (!existingBoard) {
    return new Response("Not found or unauthorized", { status: 404 });
  }

  const {
    name,
    type,
    length,
    finSetup,
    images,
    availableBeaches,
    isForRent,
    rentPrice,
  } = await req.json();

  // Update board
  const updatedBoard = await prisma.board.update({
    where: { id: params.id },
    data: {
      name,
      type,
      length,
      finSetup,
      isForRent,
      rentPrice,
      images,
      thumbnail: images[0],
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

  return Response.json(updatedBoard);
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Verify board ownership
  const existingBoard = await prisma.board.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
  });

  if (!existingBoard) {
    return new Response("Not found or unauthorized", { status: 404 });
  }

  // Delete board
  await prisma.board.delete({
    where: { id: params.id },
  });

  return new Response(null, { status: 204 });
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const board = await prisma.board.findUnique({
    where: { id: params.id },
    include: {
      availableBeaches: {
        include: {
          beach: true,
        },
      },
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });

  if (!board) {
    return new Response("Board not found", { status: 404 });
  }

  return Response.json(board);
}
