import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/authOptions";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { Session } from "next-auth";

export async function POST(req: Request) {
  try {
    const session = (await getServerSession(authOptions)) as Session & {
      user?: {
        id?: string;
      };
    };

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { requestId, content } = await req.json();

    // Create message
    const message = await prisma.chatMessage.create({
      data: {
        requestId,
        senderId: userId,
        content,
      },
    });

    // Broadcast the message using Supabase Realtime
    await supabaseAdmin.from("messages_channel").insert([
      {
        type: "broadcast",
        event: "new-message",
        payload: {
          requestId,
          message,
        },
      },
    ]);

    return NextResponse.json(message);
  } catch (error) {
    console.error("Failed to send message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
