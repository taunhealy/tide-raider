import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { sendTrialEndingSoonEmail } from "@/app/lib/email";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // Verify cron secret to ensure this is called by the scheduler
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    // Find users whose trial is ending soon
    const usersEndingSoon = await prisma.user.findMany({
      where: {
        hasActiveTrial: true,
        trialEndDate: {
          gte: now,
          lte: threeDaysFromNow,
        },
      },
    });

    // Find users whose trial has expired
    const expiredTrials = await prisma.user.findMany({
      where: {
        hasActiveTrial: true,
        trialEndDate: {
          lt: now,
        },
      },
    });

    // Send notifications and update expired trials
    await Promise.all([
      // Send "ending soon" emails
      ...usersEndingSoon.map((user) => {
        const daysLeft = Math.ceil(
          (user.trialEndDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        return sendTrialEndingSoonEmail(user.email, daysLeft);
      }),

      // Update expired trials
      prisma.user.updateMany({
        where: {
          id: {
            in: expiredTrials.map((user) => user.id),
          },
        },
        data: {
          hasActiveTrial: false,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      notified: usersEndingSoon.length,
      expired: expiredTrials.length,
    });
  } catch (error) {
    console.error("Error checking trials:", error);
    return NextResponse.json(
      { error: "Failed to check trials" },
      { status: 500 }
    );
  }
}
