import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/authOptions";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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

    // Create subscription
    const response = await fetch(
      "https://api-m.sandbox.paypal.com/v1/billing/subscriptions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          plan_id: process.env.PAYPAL_PLAN_ID,
          subscriber: {
            email_address: session.user.email,
          },
          application_context: {
            brand_name: "Tide Raider",
            return_url: `${process.env.NEXTAUTH_URL}/subscription/success`,
            cancel_url: `${process.env.NEXTAUTH_URL}/subscription/cancel`,
          },
        }),
      }
    );

    const subscription = await response.json();

    // Store subscription reference
    await prisma.user.update({
      where: { email: session.user.email },
      data: { paypalSubscriptionId: subscription.id },
    });

    return NextResponse.json({
      url: subscription.links.find((link: any) => link.rel === "approve").href,
    });
  } catch (error) {
    console.error("Create subscription error:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
