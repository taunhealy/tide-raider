import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { createHmac } from "crypto";

// Add export config to mark this as dynamic route
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const payload = JSON.parse(body);

    // Add debug logging
    console.log("Webhook received:", {
      eventType: payload.meta.event_name,
      userEmail: payload.data.attributes.user_email,
      subscriptionId: payload.data.id,
      status: payload.data.attributes.status,
    });

    const signature = request.headers.get("X-Signature");

    // Verify webhook signature
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET!;
    const hmac = createHmac("sha256", secret);
    const digest = hmac.update(body).digest("hex");

    // Add debug logging for signature verification
    console.log("Signature verification:", {
      received: signature,
      calculated: digest,
      matches: signature === digest,
    });

    if (signature !== digest) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const eventType = payload.meta.event_name;
    const userEmail = payload.data.attributes.user_email;
    const subscriptionId = payload.data.id;
    const status = payload.data.attributes.status;
    const endsAt = payload.data.attributes.ends_at;

    // Handle different event types
    switch (eventType) {
      case "subscription_created":
      case "subscription_updated":
      case "subscription_resumed":
        await prisma.user.update({
          where: { email: userEmail },
          data: {
            lemonSubscriptionId: subscriptionId,
            hasActiveTrial: false,
          },
        });
        break;

      case "subscription_cancelled":
        // Don't remove subscription ID until grace period ends
        await prisma.user.update({
          where: { email: userEmail },
          data: {
            subscriptionEndsAt: new Date(endsAt),
            subscriptionStatus: status,
          },
        });
        break;

      case "subscription_expired":
        await prisma.user.update({
          where: { email: userEmail },
          data: {
            lemonSubscriptionId: null,
            subscriptionStatus: "expired",
            subscriptionEndsAt: null,
          },
        });
        break;

      default:
        console.warn(`Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
