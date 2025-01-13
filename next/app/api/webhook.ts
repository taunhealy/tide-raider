import type { APIRoute } from "astro";
import { createHmac } from "crypto";
import { db } from "../../db";
import { subscriptions } from "../../db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

function verifySignature(payload: string, signature: string, secret: string) {
  const hmac = createHmac("sha256", secret);
  const digest = hmac.update(payload).digest("hex");
  return signature === digest;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const signature = request.headers.get("x-signature");
    const rawBody = await request.text();

    if (!signature || !process.env.LEMON_SQUEEZY_WEBHOOK_SECRET) {
      console.error('Missing signature or webhook secret');
      return new Response("Invalid configuration", { status: 500 });
    }

    if (!verifySignature(rawBody, signature, process.env.LEMON_SQUEEZY_WEBHOOK_SECRET)) {
      console.error('Invalid webhook signature');
      return new Response("Invalid signature", { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload.meta.event_name;
    const customData = payload.meta.custom_data?.[0]; // Access first element of custom array
    
    console.log('Webhook received:', { eventName, customData });

    if (!customData) {
      console.error('Missing user ID in custom data');
      return new Response("Missing user ID", { status: 400 });
    }

    switch (eventName) {
      case "order_created":
      case "subscription_created":
      case "subscription_resumed":
        await db.insert(subscriptions).values({
          id: nanoid(),
          userId: customData,
          status: "active",
          variantId: payload.data.attributes.variant_id,
          lemonSqueezyId: payload.data.id,
        }).onConflictDoUpdate({
          target: subscriptions.userId,
          set: {
            status: "active",
            lemonSqueezyId: payload.data.id,
          },
        });
        break;

      case "subscription_cancelled":
      case "subscription_paused":
      case "subscription_expired":
        await db.update(subscriptions)
          .set({ status: "inactive" })
          .where(eq(subscriptions.userId, customData));
        break;
    }

    return new Response("Webhook processed", { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ error: "Error processing webhook" }), 
      { status: 500 }
    );
  }
};
