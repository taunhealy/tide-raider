import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/authOptions";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        lemonSubscriptionId: true,
        hasActiveTrial: true,
        subscriptionStatus: true,
        subscriptionEndsAt: true,
        trialEndDate: true,
      },
    });

    // Handle trial expiration more rigorously
    const now = new Date();
    if (user?.trialEndDate && new Date(user.trialEndDate) < now) {
      await prisma.user.update({
        where: { email: session.user.email },
        data: {
          hasActiveTrial: false,
          trialEndDate: null,
          trialStartDate: null,
        },
      });
      return NextResponse.json({
        data: {
          attributes: {
            status: "expired",
            trial_ends_at: user.trialEndDate,
          },
        },
      });
    }

    // Return null data if no subscription
    if (!user?.lemonSubscriptionId && !user?.hasActiveTrial) {
      return NextResponse.json({ data: null });
    }

    // If user has an active trial, return trial information
    if (user?.hasActiveTrial) {
      console.log("Trial data:", {
        hasActiveTrial: user.hasActiveTrial,
        trialEndDate: user.trialEndDate,
      });
      return NextResponse.json({
        data: {
          attributes: {
            status: "trialing",
            trial_ends_at: user.trialEndDate,
          },
        },
      });
    }

    // If no subscription ID, return early
    if (!user?.lemonSubscriptionId) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 404 }
      );
    }

    // Fetch remote subscription details
    const response = await fetch(
      `https://api.lemonsqueezy.com/v1/subscriptions/${user.lemonSubscriptionId}`,
      {
        headers: {
          Accept: "application/vnd.api+json",
          Authorization: `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch subscription details");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Subscription details error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription details" },
      { status: 500 }
    );
  }
}
