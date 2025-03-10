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
    if (!session?.user?.email) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Check if the entry belongs to the user
    const existingEntry = await prisma.logEntry.findUnique({
      where: { id: params.id },
      select: {
        userId: true,
      },
    });

    if (!existingEntry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    if (existingEntry.userId !== session.user.id) {
      return new Response("Forbidden", { status: 403 });
    }

    const data = await request.json();

    // Remove fields that aren't in the LogEntry schema
    const {
      createAlert,
      alertConfig,
      forecast,
      userId,
      user,
      id,
      ...logEntryData
    } = data;

    // Ensure date is in ISO format
    if (logEntryData.date) {
      logEntryData.date = new Date(logEntryData.date).toISOString();
    }

    // Update the log entry with cleaned data
    const updatedLogEntry = await prisma.logEntry.update({
      where: {
        id: params.id,
      },
      data: logEntryData,
      include: {
        forecast: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Handle alert update or creation
    if (alertConfig) {
      const {
        userId,
        id: alertId,
        logEntryId,
        forecast,
        date,
        ...cleanAlertConfig
      } = alertConfig;

      if (alertId) {
        await prisma.alert.update({
          where: { id: alertId },
          data: {
            ...cleanAlertConfig,
            forecastDate: new Date(data.date),
          },
        });
      } else if (createAlert) {
        await prisma.alert.create({
          data: {
            ...cleanAlertConfig,
            forecastDate: new Date(data.date),
            userId: session.user.id,
            logEntry: {
              connect: { id: updatedLogEntry.id },
            },
          },
        });
      }
    }

    return NextResponse.json(updatedLogEntry);
  } catch (error) {
    console.error("Error updating log entry:", error);
    return NextResponse.json(
      { error: "Failed to update log entry" },
      { status: 500 }
    );
  }
}
