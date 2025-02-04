import Amadeus, { ResponseError } from "amadeus-ts";

const amadeus = new Amadeus({
  clientId: process.env.AMADUS_API_KEY as string,
  clientSecret: process.env.AMADEUS_API_SECRET as string,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const destinationCode = searchParams.get("destination");
  const departureCode = searchParams.get("departure");

  if (!destinationCode || !departureCode) {
    return Response.json(
      { error: "Both departure and destination codes are required" },
      { status: 400 }
    );
  }

  try {
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: departureCode,
      destinationLocationCode: destinationCode,
      departureDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      adults: 1,
      max: 3,
    });

    return Response.json(response);
  } catch (error) {
    if (error instanceof ResponseError) {
      console.error("Amadeus API error:", error.code);
    }
    return Response.json(
      { error: "Failed to fetch flight offers" },
      { status: 500 }
    );
  }
}
