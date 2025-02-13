import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/lib/authOptions";
import { prisma } from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

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
      },
    });

    console.log("User subscription check:", {
      email: session.user.email,
      lemonSubscriptionId: user?.lemonSubscriptionId,
      isSubscribed: !!user?.lemonSubscriptionId,
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      isSubscribed: !!user.lemonSubscriptionId,
      hasActiveTrial: user?.hasActiveTrial || false,
      lemonSubscriptionId: user.lemonSubscriptionId,
    });
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return NextResponse.json(
      { error: "Failed to check subscription status" },
      { status: 500 }
    );
  }
}
