import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/lib/authOptions";
import { getCachedSession, cacheUserSession } from "@/app/lib/auth-cache";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json(null);
    }

    // Try to get cached session first
    const cachedSession = await getCachedSession(session.user.id);
    if (cachedSession) {
      console.log("Cache hit - returning cached session");
      return Response.json(cachedSession);
    }

    // If no cache, fetch subscription status
    const subscriptionResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/subscription-status`,
      { headers: { cookie: headers().get("cookie") || "" } }
    );

    const { isSubscribed } = await subscriptionResponse.json();

    const sessionData = {
      ...session,
      user: {
        ...session.user,
        isSubscribed,
      },
    };

    // Cache the complete session data
    await cacheUserSession(session.user.id, sessionData);

    return Response.json(sessionData);
  } catch (error) {
    console.error("Session error:", error);
    return Response.json({ error: "Failed to get session" }, { status: 500 });
  }
}
