import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/lib/authOptions";
import { SubscriptionStatus } from "@/app/types/subscription";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  // Get the base URL from environment variable, fallback to a default
  const baseUrl =
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:3000";

  // If no session, redirect to login
  if (!session?.user?.email) {
    return NextResponse.redirect(`${baseUrl}/login`);
  }

  // Add status parameter to indicate cancelled payment
  const redirectUrl = new URL(`${baseUrl}/pricing`);
  redirectUrl.searchParams.set("status", "payment-cancelled");

  // Redirect to pricing page with status
  return NextResponse.redirect(redirectUrl.toString());
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { action } = await request.json();

    // Handle trial start
    if (action === "start-trial") {
      // First check if the user exists in the database
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      // If user doesn't exist in the database, return an error
      if (!user) {
        return NextResponse.json(
          { error: "User not found in database" },
          { status: 404 }
        );
      }

      // Check if trial has been used before
      if (user.hasActiveTrial || user.hasTrialEnded) {
        return NextResponse.json(
          { error: "Trial already used" },
          { status: 400 }
        );
      }

      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 14);

      await prisma.user.update({
        where: { email: session.user.email },
        data: {
          hasActiveTrial: true,
          trialEndDate: trialEndDate,
          subscriptionStatus: SubscriptionStatus.ACTIVE,
        },
      });

      return NextResponse.json({ success: true });
    }

    // Validate PayPal credentials before proceeding
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      console.error("Missing PayPal credentials");
      return NextResponse.json(
        { error: "PayPal configuration missing" },
        { status: 500 }
      );
    }

    const baseUrl =
      process.env.NODE_ENV === "production"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";

    // Get PayPal access token
    const tokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: "grant_type=client_credentials",
    });

    if (!tokenResponse.ok) {
      console.error("PayPal token error:", await tokenResponse.text());
      throw new Error("Failed to get PayPal access token");
    }

    const { access_token } = await tokenResponse.json();

    switch (action) {
      case "create":
        return handleCreate(session.user.email, access_token, baseUrl);
      case "unsubscribe":
      case "cancel":
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { paypalSubscriptionId: true },
        });
        return handleCancel(
          session.user.email,
          user?.paypalSubscriptionId || "",
          access_token,
          baseUrl
        );
      case "suspend":
        return handleSuspend(session.user.email, access_token, baseUrl);
      case "activate":
        return handleActivate(session.user.email, access_token, baseUrl);
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Subscription error:", error);
    return NextResponse.json(
      { error: "Subscription operation failed" },
      { status: 500 }
    );
  }
}

async function handleCreate(
  userEmail: string,
  accessToken: string,
  baseUrl: string
) {
  const response = await fetch(`${baseUrl}/v1/billing/subscriptions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      plan_id: process.env.PAYPAL_PLAN_ID,
      subscriber: { email_address: userEmail },
      application_context: {
        brand_name: "Tide Raider",
        user_action: "SUBSCRIBE_NOW",
        return_url: `${process.env.NEXTAUTH_URL}/subscription/success`,
        cancel_url: `${process.env.NEXTAUTH_URL}/subscription/cancel`,
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create PayPal subscription");
  }

  const subscription = await response.json();
  const approvalUrl = subscription.links.find(
    (link: any) => link.rel === "approve"
  ).href;

  return NextResponse.json({ url: approvalUrl });
}

async function handleCancel(
  userEmail: string,
  subscriptionId: string,
  accessToken: string,
  baseUrl: string
) {
  if (subscriptionId) {
    const response = await fetch(
      `${baseUrl}/v1/billing/subscriptions/${subscriptionId}/cancel`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ reason: "Customer requested cancellation" }),
      }
    );

    if (!response.ok) {
      console.error("PayPal cancellation failed:", await response.text());
    }
  }

  await prisma.user.update({
    where: { email: userEmail },
    data: {
      paypalSubscriptionId: null,
      subscriptionStatus: SubscriptionStatus.CANCELLED,
    },
  });

  return NextResponse.json({ success: true });
}

async function handleSuspend(
  userEmail: string,
  accessToken: string,
  baseUrl: string
) {
  // Get the subscription ID from the database first
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: { paypalSubscriptionId: true },
  });

  if (!user || !user.paypalSubscriptionId) {
    throw new Error("No active subscription found");
  }

  const response = await fetch(
    `${baseUrl}/v1/billing/subscriptions/${user.paypalSubscriptionId}/suspend`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ reason: "Customer requested suspension" }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to suspend subscription");
  }

  return NextResponse.json({ success: true });
}

async function handleActivate(
  userEmail: string,
  accessToken: string,
  baseUrl: string
) {
  // Get the subscription ID from the database first
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: { paypalSubscriptionId: true },
  });

  if (!user || !user.paypalSubscriptionId) {
    throw new Error("No active subscription found");
  }

  const response = await fetch(
    `${baseUrl}/v1/billing/subscriptions/${user.paypalSubscriptionId}/activate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to activate subscription");
  }

  return NextResponse.json({ success: true });
}
