import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const membership = await prisma.membership.findUnique({
      where: {
        userId: req.nextauth.token.sub,
      },
    });

    return NextResponse.json({
      isSubscribed: !!membership,
    });
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return NextResponse.json(
      { error: "Failed to check subscription" },
      { status: 500 }
    );
  }
}
