import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/lib/authOptions";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const entry = await prisma.logEntry.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        date: true,
        beachName: true,
        surferRating: true,
        comments: true,
        imageUrl: true,
        isPrivate: true,
        surferEmail: true,
      },
    });

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Failed to fetch log entry:", error);
    return NextResponse.json(
      { error: "Failed to fetch log entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email)
      return new Response("Unauthorized", { status: 401 });

    const entry = await prisma.logEntry.findUnique({
      where: { id: params.id },
      select: {
        userId: true,
        surferEmail: true,
      },
    });

    if (entry?.userId !== session.user.id) {
      return new Response("Forbidden", { status: 403 });
    }

    await prisma.logEntry.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete failed:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email)
      return new Response("Unauthorized", { status: 401 });

    const data = await request.json();

    const entry = await prisma.logEntry.findUnique({
      where: { id: params.id },
      select: {
        userId: true,
        surferEmail: true,
      },
    });

    if (entry?.userId !== session.user.id) {
      console.error("Authorization failed - ID mismatch");
      return new Response("Forbidden", { status: 403 });
    }

    const updatedEntry = await prisma.logEntry.update({
      where: { id: params.id },
      data: {
        beachName: data.beachName,
        continent: data.continent,
        country: data.country,
        region: data.region,
        waveType: data.waveType,
        date: new Date(data.date),
        surferName: data.surferName,
        surferRating: data.surferRating,
        comments: data.comments,
        imageUrl: data.imageUrl,
        forecast: data.forecast,
        isPrivate: data.isPrivate || false,
      },
    });

    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error("Update failed:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
