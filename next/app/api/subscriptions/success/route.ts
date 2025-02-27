import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/authOptions";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login`);
  }

  const { searchParams } = new URL(request.url);
  const subscriptionId = searchParams.get("subscription_id");

  if (!subscriptionId) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/subscription/error`
    );
  }

  try {
    // Update user with subscription ID
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        paypalSubscriptionId: subscriptionId,
        subscriptionStatus: "active",
        hasActiveTrial: false,
        trialEndDate: null,
      },
    });

    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/subscription/thank-you`
    );
  } catch (error) {
    console.error("Subscription success error:", error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/subscription/error`
    );
  }
}
