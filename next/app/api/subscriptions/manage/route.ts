import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/authOptions";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, subscriptionId } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { lemonSubscriptionId: true },
    });

    if (!user?.lemonSubscriptionId) {
      return NextResponse.json(
        { error: "No active subscription" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.lemonsqueezy.com/v1/subscriptions/${subscriptionId}`,
      {
        method: "PATCH",
        headers: {
          Accept: "application/vnd.api+json",
          "Content-Type": "application/vnd.api+json",
          Authorization: `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
        },
        body: JSON.stringify({
          data: {
            type: "subscriptions",
            id: subscriptionId,
            attributes: {
              ...(action === "pause" && {
                pause: { mode: "void", resumes_at: null },
              }),
              ...(action === "unpause" && {
                pause: null,
              }),
              ...(action === "resume" && {
                cancelled: false,
              }),
            },
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to manage subscription");
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Subscription management error:", error);
    return NextResponse.json(
      { error: "Failed to manage subscription" },
      { status: 500 }
    );
  }
}
