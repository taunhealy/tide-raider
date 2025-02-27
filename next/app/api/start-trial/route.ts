import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/lib/authOptions";
import { sendTrialStartEmail } from "@/app/lib/email";

// Add proper Next.js route config
export const dynamic = "force-dynamic"; // Add this if using static optimization

// Add OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        hasActiveTrial: true,
        subscriptionStatus: true,
      },
    });

    if (user?.hasActiveTrial || user?.subscriptionStatus === "ACTIVE") {
      return NextResponse.json(
        { error: "Trial or subscription already active" },
        { status: 400 }
      );
    }

    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7);

    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        hasActiveTrial: true,
        trialEndDate: trialEndDate,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Start trial error:", error);
    return NextResponse.json(
      { error: "Failed to start trial" },
      { status: 500 }
    );
  }
}
