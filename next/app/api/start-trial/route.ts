import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/lib/authOptions";
import { sendTrialStartEmail } from "@/app/lib/email";

export async function POST() {
  const session = await getServerSession(authOptions);
  try {
    // Validate session and user ID
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // First check if user exists using their ID
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const trialStartDate = new Date();
    const trialEndDate = new Date(trialStartDate);
    trialEndDate.setDate(trialEndDate.getDate() + 14); // 14 days trial

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        trialStartDate,
        trialEndDate,
        hasActiveTrial: true,
      },
    });

    // Send welcome email
    await sendTrialStartEmail(user.email, trialEndDate);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error starting trial:", {
      error,
      userEmail: session?.user?.email,
      sessionUserId: session?.user?.id,
    });
    return NextResponse.json(
      { error: "Failed to start trial" },
      { status: 500 }
    );
  }
}
