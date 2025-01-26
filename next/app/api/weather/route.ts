import { NextResponse } from "next/server";

const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");

  if (!city) {
    return NextResponse.json(
      { error: "City parameter is required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${BASE_URL}?q=${city}&units=metric&appid=${API_KEY}`
    );
    const data = await response.json();

    if (data.cod !== 200) {
      throw new Error(data.message);
    }

    return NextResponse.json({
      temp: Math.round(data.main.temp),
      condition: data.weather[0].main,
      icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
      location: data.name,
    });
  } catch (error) {
    console.error("Weather API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}
