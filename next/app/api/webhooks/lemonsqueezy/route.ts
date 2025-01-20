import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const payload = JSON.parse(body);

    // Log only once at the start
    console.log("Processing webhook:", {
      event: payload.meta.event_name,
      adId: payload.meta.custom_data[0],
    });

    const adId = payload.meta.custom_data[0];
    const status = payload.data.attributes.status;
    const cancelled = payload.data.attributes.cancelled;

    const updatedAd = await prisma.adRequest.update({
      where: { id: adId },
      data: {
        status: cancelled
          ? "cancelled"
          : status === "active"
            ? "active"
            : "inactive",
        lemonSubscriptionId: payload.data.id,
        variantId: payload.data.attributes.variant_id,
      },
    });

    // Log success and return
    console.log("Webhook processed successfully for ad:", adId);
    return NextResponse.json({ success: true, updatedAd });
  } catch (error) {
    console.error(
      "Webhook error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
