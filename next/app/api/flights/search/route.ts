import { NextResponse } from "next/server";

const TRAVEL_PAYOUTS_TOKEN = process.env.TRAVEL_PAYOUTS_TOKEN;
const TRAVEL_PAYOUTS_MARKER = process.env.TRAVEL_PAYOUTS_MARKER;

if (!TRAVEL_PAYOUTS_TOKEN || !TRAVEL_PAYOUTS_MARKER) {
  throw new Error("TravelPayouts credentials not configured");
}

export async function POST(request: Request) {
  try {
    const { originCode, destinationCode, date } = await request.json();

    // Use the simpler prices/cheap endpoint
    const response = await fetch(
      `https://api.travelpayouts.com/v1/prices/cheap?` +
        `origin=${originCode}&destination=${destinationCode}&` +
        `depart_date=${date}&token=${TRAVEL_PAYOUTS_TOKEN}`,
      {
        headers: { Accept: "application/json" },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch flight data");
    const data = await response.json();

    // Get the cheapest flight option
    const flights = data?.data?.[destinationCode];
    const cheapestFlight = flights ? Object.values(flights)[0] : null;

    return NextResponse.json({
      flights: cheapestFlight ? [cheapestFlight] : [],
      searchUrl: `https://www.aviasales.com/${originCode}/${destinationCode}?marker=${TRAVEL_PAYOUTS_MARKER}&departure=${date}`,
    });
  } catch (error) {
    console.error("Flight search error:", error);
    return NextResponse.json(
      { error: "Failed to fetch flight data" },
      { status: 500 }
    );
  }
}
