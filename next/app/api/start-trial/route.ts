import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/lib/authOptions";
import { sendTrialStartEmail } from "@/app/lib/email";

// Add proper Next.js route config
export const dynamic = "force-dynamic"; // Add this if using static optimization

// Add OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  try {
    // Validate session and user ID
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401 }
      );
    }

    // First check if user exists using their ID
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true }, // Only get necessary fields
    });

    if (!existingUser) {
      // Session exists but user not found - invalidate session
      return NextResponse.json(
        { error: "Session invalid - please sign in again" },
        {
          status: 401,
          headers: {
            "Set-Cookie": `next-auth.session-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
          },
        }
      );
    }

    const trialStartDate = new Date();
    // Explicitly set time to start of day to avoid time zone issues
    trialStartDate.setHours(0, 0, 0, 0);

    const trialEndDate = new Date(trialStartDate);
    trialEndDate.setDate(trialStartDate.getDate() + 7); // 7 days trial
    // Set end time to end of day
    trialEndDate.setHours(23, 59, 59, 999);

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        trialStartDate,
        trialEndDate,
        hasActiveTrial: true,
      },
    });

    // Send welcome email
    await sendTrialStartEmail(user.email, trialEndDate);

    // Add proper response headers
    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error starting trial:", {
      error,
      userEmail: session?.user?.email,
      sessionUserId: session?.user?.id,
    });
    return new NextResponse(
      JSON.stringify({ error: "Failed to start trial" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
