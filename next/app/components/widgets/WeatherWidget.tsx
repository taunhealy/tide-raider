"use client";

import { useEffect, useState } from "react";
import { Cloud, Loader2 } from "lucide-react";

interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
  location: string;
  timestamp: number; // Add timestamp to track data freshness
}

interface WeatherWidgetProps {
  location: {
    beachName?: string;
    region?: string;
    country?: string;
  };
}

// Constants for caching and rate limiting
const CACHE_DURATION = 1000 * 60 * 15; // 15 minutes
const RATE_LIMIT_DURATION = 1000 * 60; // 1 minute
const MAX_RETRIES = 3;

export default function WeatherWidget({ location }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add detailed location logging
  console.log("🏖️ WeatherWidget: Location details:", {
    beachName: location.beachName,
    region: location.region,
    country: location.country,
    raw: location,
  });

  useEffect(() => {
    const fetchWeather = async () => {
      console.log("🌤️ WeatherWidget: Starting weather fetch");
      try {
        setLoading(true);
        const params = new URLSearchParams({
          beachName: location.beachName || "",
          region: location.region || "",
          country: location.country || "",
        });

        const url = `/api/weather?${params}`;
        console.log("📡 WeatherWidget: Fetching from:", url);

        const response = await fetch(url);
        console.log(
          "📥 WeatherWidget: Got response:",
          response.status,
          response.statusText
        );

        if (!response.ok) {
          console.error("❌ WeatherWidget: Response not OK:", response.status);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ WeatherWidget: Received data:", data);

        setWeather(data);
        setError(null);
      } catch (err) {
        console.error("❌ WeatherWidget: Error:", err);
        setError("Unable to load weather data");
      } finally {
        setLoading(false);
      }
    };

    if (location?.region || location?.beachName || location?.country) {
      console.log("🌍 WeatherWidget: Valid location, fetching weather");
      fetchWeather();
    } else {
      console.log("⚠️ WeatherWidget: No valid location data");
      setLoading(false);
    }
  }, [location]);

  console.log("🎨 WeatherWidget: Rendering with state:", {
    weather,
    loading,
    error,
  });

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">
          Weather in {location?.beachName || location?.region}
        </h3>
        {weather && (
          <span className="text-xs text-gray-400">
            Updated {new Date(weather.timestamp).toLocaleTimeString()}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : error ? (
        <div className="text-red-500 p-4 text-sm">{error}</div>
      ) : weather ? (
        <div className="flex items-center gap-4">
          <img
            src={weather.icon}
            alt={weather.condition}
            className="w-16 h-16"
          />
          <div>
            <p className="text-2xl font-bold">{weather.temp}°C</p>
            <p className="text-sm text-gray-600">{weather.location}</p>
            <p className="text-sm text-gray-500">{weather.condition}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center p-4">
          <Cloud className="w-6 h-6 text-gray-400" />
          <p className="ml-2 text-gray-500">No weather data available</p>
        </div>
      )}
    </div>
  );
}
