// src/pages/api/subscription-status.ts
import type { APIRoute } from "astro";
import { getSession } from "auth-astro/server";
import { isUserSubscribed } from "../../lib/subscription";

export const GET: APIRoute = async ({ request }) => {
  try {
    const session = await getSession(request);
    
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ isSubscribed: false }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const isSubscribed = await isUserSubscribed(session.user.id);
    
    return new Response(JSON.stringify({ isSubscribed }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return new Response(JSON.stringify({ error: "Failed to check subscription" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};