import Amadeus from "amadeus";

// Verify API keys are present
const API_KEY = process.env.AMADEUS_API_KEY;
const API_SECRET = process.env.AMADEUS_API_SECRET;

if (!API_KEY || !API_SECRET) {
  console.error("Missing Amadeus credentials:", { API_KEY, API_SECRET });
  throw new Error("Amadeus credentials not configured");
}

const amadeus = new Amadeus({
  clientId: API_KEY,
  clientSecret: API_SECRET,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword");

  console.log("Searching airports with keyword:", keyword); // Debug log

  if (!keyword || keyword.trim().length < 2) {
    return Response.json(
      { error: "Keyword must be at least 2 characters" },
      { status: 400 }
    );
  }

  try {
    const response = await amadeus.referenceData.locations.get({
      keyword: keyword.trim(),
      subType: "AIRPORT",
      page: { limit: 10 },
    });

    console.log("Amadeus response:", response.data); // Debug log
    return Response.json(response.data);
  } catch (error) {
    console.error("Amadeus API error:", error);
    return Response.json(
      { error: "Failed to search airports", details: error },
      { status: 500 }
    );
  }
}
