import { ForecastData } from "@/app/types/forecast";

export async function fetchForecastData(
  region: string
): Promise<ForecastData | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/surf-conditions?region=${region}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch forecast: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching forecast data:", error);
    return null;
  }
}

export function calculateStarRating(forecast: ForecastData): number {
  // Implement your star rating logic here
  // This is a placeholder implementation
  let rating = 3; // Default rating

  // Example logic - adjust based on your actual requirements
  if (forecast.swellHeight > 1.5 && forecast.swellPeriod > 10) {
    rating += 1;
  }

  if (forecast.windSpeed < 10) {
    rating += 1;
  }

  return Math.min(5, Math.max(1, rating));
}

// Helper function to get cardinal direction from degrees
export function degreesToCardinal(degrees: number): string {
  const directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  const index = Math.round((degrees % 360) / 22.5);
  return directions[index % 16];
}
