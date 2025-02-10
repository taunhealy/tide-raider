import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/lib/authOptions";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, subscriptionId } = await request.json();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { lemonSubscriptionId: true },
    });

    if (!user?.lemonSubscriptionId && action === "unsubscribe") {
      return NextResponse.json(
        { error: "No active subscription" },
        { status: 400 }
      );
    }

    // Handle Lemon Squeezy API calls
    const subId =
      action === "unsubscribe" ? user?.lemonSubscriptionId : subscriptionId;
    const lemonResponse = await fetch(
      `https://api.lemonsqueezy.com/v1/subscriptions/${subId}`,
      {
        method: action === "unsubscribe" ? "DELETE" : "GET",
        headers: {
          Authorization: `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
          Accept: "application/vnd.api+json",
        },
      }
    );

    if (!lemonResponse.ok) {
      throw new Error(`Lemon Squeezy API error: ${lemonResponse.statusText}`);
    }

    // Update user subscription status
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        lemonSubscriptionId: action === "unsubscribe" ? null : subId,
      },
    });

    return NextResponse.json({
      success: true,
      isSubscribed: action !== "unsubscribe",
    });
  } catch (error) {
    console.error("Subscription error:", error);
    return NextResponse.json(
      { error: "Subscription operation failed" },
      { status: 500 }
    );
  }
}
