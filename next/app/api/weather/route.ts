import { NextResponse } from "next/server";

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const CACHE_DURATION = 1800000; // 30 minutes in milliseconds

if (!OPENWEATHER_API_KEY) {
  console.error("❌ Weather API: Missing API key");
  throw new Error("Weather API key not configured");
}

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();

function formatLocation(location: string) {
  // Remove any special characters and extra spaces
  const cleanLocation = location.trim().replace(/[^\w\s,]/g, "");

  // Split into parts (e.g., "Befasy, Madagascar" -> ["Befasy", "Madagascar"])
  const parts = cleanLocation.split(",").map((part) => part.trim());

  // If we have both city and country, format as "city,country"
  // If we only have one part, use it as is
  return parts.length > 1 ? `${parts[0]},${parts[parts.length - 1]}` : parts[0];
}

export async function GET(request: Request) {
  // For testing, let's return hardcoded data
  console.log("📍 Weather API: Returning hardcoded Madagascar data");

  return NextResponse.json({
    temp: 28, // Hardcoded temperature in Celsius
    condition: "sunny with light clouds",
    icon: "https://openweathermap.org/img/wn/02d@2x.png", // partly cloudy icon
    location: "Befasy, Madagascar",
    timestamp: Date.now(),
  });

  // Comment out the real implementation for now
  /*
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region");
  const country = searchParams.get("country");
  const beachName = searchParams.get("beachName");

  // For Madagascar, let's try using just the region and country
  const locationParts = [];
  if (country === "Madagascar") {
    if (region) locationParts.push(region);
    locationParts.push(country);
  } else {
    if (beachName) locationParts.push(beachName);
    if (region) locationParts.push(region);
    if (country) locationParts.push(country);
  }

  const location = locationParts.join(", ");
  console.log("📍 Weather API: Using location string:", location);

  try {
    // First get coordinates for Befasy, Madagascar specifically
    const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
      location
    )}&limit=1&appid=${OPENWEATHER_API_KEY}`;

    console.log("🔍 Weather API: Geocoding URL:", geoUrl);
    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json();

    if (!geoData.length) {
      // Fallback to hardcoded coordinates for Befasy, Madagascar
      console.log("⚠️ Weather API: Using fallback coordinates for Befasy");
      geoData.push({
        lat: -20.9, // Approximate coordinates for Befasy
        lon: 44.4,
      });
    }

    // Get weather using coordinates
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${geoData[0].lat}&lon=${geoData[0].lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();

    return NextResponse.json({
      temp: Math.round(weatherData.main.temp),
      condition: weatherData.weather[0].description,
      icon: `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`,
      location: location,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("❌ Weather API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
  */
}
