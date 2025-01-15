import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: Request) {
  try {
    const { safariId, date, skillLevel, bringingBoard, requiresRental, notes } =
      await request.json();

    const booking = await prisma.safariBooking.create({
      data: {
        safariId,
        userId: req.nextauth.token.sub,
        date: new Date(date),
        skillLevel,
        bringingBoard,
        requiresRental,
        notes,
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Failed to create safari booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
