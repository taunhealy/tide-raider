import { NextResponse } from 'next/server';
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function POST(request: Request) {
  try {
    const { userId, action } = await request.json();
    
    if (!userId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (action === 'subscribe') {
      await db.insert(subscriptions).values({
        id: nanoid(),
        userId: userId,
        status: "active",
        variantId: parseInt(process.env.LEMON_SQUEEZY_VARIANT_ID || "0"),
      }).onConflictDoUpdate({
        target: subscriptions.userId,
        set: {
          status: "active",
        },
      });
    } else {
      await db.update(subscriptions)
        .set({ status: "inactive" })
        .where(eq(subscriptions.userId, userId));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Test webhook error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 