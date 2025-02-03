import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/lib/authOptions";
import { sendTrialStartEmail } from "@/app/lib/email";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trialStartDate = new Date();
    const trialEndDate = new Date(trialStartDate);
    trialEndDate.setDate(trialEndDate.getDate() + 14); // 14 days trial

    const user = await prisma.user.update({
      where: { email: session.user.email },
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
    console.error("Error starting trial:", error);
    return NextResponse.json(
      { error: "Failed to start trial" },
      { status: 500 }
    );
  }
}
