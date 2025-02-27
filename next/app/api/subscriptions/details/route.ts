import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/authOptions";
import { prisma } from "@/app/lib/prisma";

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
        hasActiveTrial: true,
        trialEndDate: true,
        trialStartDate: true,
      },
    });

    // Handle trial expiration
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

    // Return trial information if active
    if (user?.hasActiveTrial) {
      return NextResponse.json({
        data: {
          attributes: {
            status: "trialing",
            trial_ends_at: user.trialEndDate,
          },
        },
      });
    }

    // Handle PayPal subscription if no active trial
    if (user?.paypalSubscriptionId) {
      // Get PayPal access token
      const tokenResponse = await fetch(
        "https://api-m.paypal.com/v1/oauth2/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(
              `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
            ).toString("base64")}`,
          },
          body: "grant_type=client_credentials",
        }
      );

      const { access_token } = await tokenResponse.json();

      // Get subscription details from PayPal
      const response = await fetch(
        `https://api-m.paypal.com/v1/billing/subscriptions/${user.paypalSubscriptionId}`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch subscription details");
      }

      const subscription = await response.json();
      return NextResponse.json({
        data: {
          attributes: {
            status: subscription.status.toLowerCase(),
            ends_at: subscription.billing_info?.next_billing_time,
            cancelled: subscription.status === "CANCELLED",
          },
        },
      });
    }

    // No subscription or trial
    return NextResponse.json({ data: null });
  } catch (error) {
    console.error("Fetch subscription error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription details" },
      { status: 500 }
    );
  }
}
