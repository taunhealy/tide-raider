import { beachData } from "@/app/types/beaches";

interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

// Function to get nearest airport from coordinates
export async function getNearestAirport(
  region: string
): Promise<Airport | null> {
  // Find the first beach in the region to get coordinates
  const regionBeach = beachData.find((beach) => beach.region === region);

  if (!regionBeach) return null;

  try {
    // Use Amadeus API to find nearest airport
    const response = await fetch(
      `/api/airports/nearest?lat=${regionBeach.coordinates.lat}&lng=${regionBeach.coordinates.lng}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch airport data");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error finding nearest airport:", error);
    return null;
  }
}
