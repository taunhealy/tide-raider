import { NextResponse } from "next/server";

const TRAVEL_PAYOUTS_TOKEN = process.env.TRAVEL_PAYOUTS_TOKEN;
const TRAVEL_PAYOUTS_MARKER = process.env.TRAVEL_PAYOUTS_MARKER;

if (!TRAVEL_PAYOUTS_MARKER) {
  throw new Error("TRAVEL_PAYOUTS_MARKER is not defined");
}

function convertToTravelPayoutsUrl(bookingUrl: string, marker: string): string {
  // Extract hotel ID from Booking.com URL
  const hotelId = bookingUrl.match(/hotel\/([^/]+)/)?.[1];

  return (
    `https://www.travelpayouts.com/hotels/redirect/` +
    `${hotelId}?marker=${marker}&locale=en&currency=usd`
  );
}

export async function POST(request: Request) {
  try {
    const { type, params } = await request.json();

    switch (type) {
      case "flights": {
        const { origin, destination, departureDate, returnDate } = params;
        const response = await fetch(
          `https://api.travelpayouts.com/v1/prices/cheap?` +
            `origin=${origin}&destination=${destination}&` +
            `depart_date=${departureDate}&return_date=${returnDate}&` +
            `token=${TRAVEL_PAYOUTS_TOKEN}`,
          {
            headers: { Accept: "application/json" },
          }
        );

        const data = await response.json();
        return NextResponse.json({
          flights: data?.data?.[destination] || [],
          searchUrl:
            `https://www.aviasales.com/${origin}/${destination}?` +
            `marker=${TRAVEL_PAYOUTS_MARKER}&` +
            `departure=${departureDate}` +
            (returnDate ? `&return=${returnDate}` : ""),
        });
      }

      case "hotels": {
        const { bookingUrl } = params;
        const affiliateUrl = convertToTravelPayoutsUrl(
          bookingUrl,
          TRAVEL_PAYOUTS_MARKER!
        );

        return NextResponse.json({
          searchUrl: affiliateUrl,
        });
      }

      case "initial": {
        const { cityCode } = params;
        // Return dummy data for now
        return NextResponse.json({
          airports: [
            {
              iata: "CPT",
              name: "Cape Town International",
              city: cityCode,
              country: "South Africa",
            },
          ],
          accommodation: {
            costPerNight: 150,
            hotelName: "Beach Resort",
            bookingLink: "https://example.com",
          },
          dailyExpenses: {
            food: 30,
            transport: 20,
            activities: 40,
            medical: 10,
          },
        });
      }

      default:
        throw new Error("Invalid request type");
    }
  } catch (error) {
    console.error("TravelPayouts API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch travel data" },
      { status: 500 }
    );
  }
}
