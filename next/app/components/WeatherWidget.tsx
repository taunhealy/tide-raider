"use client";

import { useEffect, useState } from "react";

interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
  location: string;
}

export default function WeatherWidget({ slug }: { slug: string }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const response = await fetch(`/api/weather?slug=${slug}`);
        const data = await response.json();
        setWeather(data);
      } catch (error) {
        console.error("Error fetching weather:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, [slug]);

  if (loading) return <div>Loading weather...</div>;
  if (!weather) return null;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Local Weather</h3>
      <div className="flex items-center gap-4">
        <img src={weather.icon} alt={weather.condition} className="w-12 h-12" />
        <div>
          <p className="text-2xl font-bold">{weather.temp}°C</p>
          <p className="text-sm text-gray-600">{weather.location}</p>
          <p className="text-sm text-gray-500">{weather.condition}</p>
        </div>
      </div>
    </div>
  );
}
