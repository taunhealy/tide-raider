import { NextResponse } from "next/server";

const TRAVEL_PAYOUTS_TOKEN = process.env.TRAVEL_PAYOUTS_TOKEN;
const TRAVEL_PAYOUTS_MARKER = process.env.TRAVEL_PAYOUTS_MARKER;

export async function POST(request: Request) {
  try {
    const { from, to } = await request.json();

    const response = await fetch(
      `https://api.travelpayouts.com/v1/prices/cheap?origin=${from}&destination=${to}&token=${TRAVEL_PAYOUTS_TOKEN}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch flight estimate");
    const data = await response.json();

    // Get the cheapest flight option
    const flights = data?.data?.[to];
    const cheapestFlight = flights
      ? (Object.values(flights)[0] as { price: number })
      : null;

    return NextResponse.json({
      estimatedCost: cheapestFlight?.price || 0,
      deepLink: cheapestFlight
        ? `https://www.aviasales.com/${from}/${to}?marker=${TRAVEL_PAYOUTS_MARKER}`
        : null,
    });
  } catch (error) {
    console.error("Flight estimate error:", error);
    return NextResponse.json(
      { error: "Failed to fetch flight estimate" },
      { status: 500 }
    );
  }
}
