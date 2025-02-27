import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/authOptions";
import { prisma } from "@/app/lib/prisma";
import { SubscriptionStatus } from "@/app/types/subscription";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        paypalSubscriptionId: true,
        subscriptionStatus: true,
        hasActiveTrial: true,
        trialEndDate: true,
      },
    });

    console.log("Subscription API response:", {
      subscriptionStatus: user?.subscriptionStatus,
      raw: user,
    });

    return NextResponse.json({
      data: {
        status: user?.subscriptionStatus,
        subscription: {
          status: user?.subscriptionStatus,
          id: user?.paypalSubscriptionId || undefined,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching subscription details:", error);
    return NextResponse.json(
      { error: "Failed to fetch details" },
      { status: 500 }
    );
  }
}
