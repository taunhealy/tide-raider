import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/authOptions";
import { prisma } from "@/app/lib/prisma";
import { SubscriptionStatus } from "@/app/types/subscription";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { action, subscriptionId } = await request.json();

    // Get PayPal access token
    const tokenResponse = await fetch(
      "https://api-m.sandbox.paypal.com/v1/oauth2/token",
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

    // Handle different subscription actions
    let endpoint = `https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${subscriptionId}`;
    let method = "POST";
    let body = {};

    switch (action) {
      case "cancel":
        endpoint += "/cancel";
        body = { reason: "Customer requested cancellation" };
        break;
      case "suspend":
        endpoint += "/suspend";
        body = { reason: "Customer requested suspension" };
        break;
      case "activate":
        endpoint += "/activate";
        break;
    }

    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error("Failed to manage subscription");
    }

    // Update user subscription status in database
    if (action === "cancel") {
      await prisma.user.update({
        where: { email: session.user.email },
        data: {
          paypalSubscriptionId: null,
          subscriptionStatus: SubscriptionStatus.CANCELLED,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Subscription management error:", error);
    return NextResponse.json(
      { error: "Failed to manage subscription" },
      { status: 500 }
    );
  }
}
