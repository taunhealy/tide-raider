import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { prisma } from "@/app/lib/prisma";
import { z } from "zod";

// GET - Fetch a specific alert with its log entry
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const alertId = params.id;
  console.log("Fetching alert with ID:", alertId);

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      console.log("Unauthorized: No session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true },
    });

    if (!user) {
      console.log("User not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("Looking for alert with ID:", alertId, "for user:", user.id);

    // Fetch the alert
    const alert = await prisma.alert.findUnique({
      where: {
        id: alertId,
        // userId: user.id // Temporarily comment this out for debugging
      },
    });

    console.log("Alert found:", alert);

    if (!alert) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    // Check if the alert belongs to the user
    if (alert.userId !== user.id) {
      console.log(
        "Alert belongs to different user:",
        alert.userId,
        "vs",
        user.id
      );
      return NextResponse.json(
        { error: "You don't have permission to access this alert" },
        { status: 403 }
      );
    }

    return NextResponse.json(alert);
  } catch (error) {
    console.error("Error fetching alert:", error);
    return NextResponse.json(
      { error: "Failed to fetch alert" },
      { status: 500 }
    );
  }
}

// PUT - Update an existing alert
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Existing PUT implementation...
  // Make sure to include logEntryId in the update operation
}
