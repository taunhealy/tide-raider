"use client";

import { useEffect, useState, useCallback } from "react";
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
    beachName: string;
    region: string;
    country: string;
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
  const [retryCount, setRetryCount] = useState(0);

  // Use localStorage to cache weather data and track API calls
  const getCachedWeather = useCallback((city: string) => {
    const cached = localStorage.getItem(`weather_${city}`);
    if (!cached) return null;

    const data = JSON.parse(cached);
    const isExpired = Date.now() - data.timestamp > CACHE_DURATION;

    return isExpired ? null : data;
  }, []);

  const getLastApiCall = useCallback(() => {
    const lastCall = localStorage.getItem("weather_last_api_call");
    return lastCall ? parseInt(lastCall) : 0;
  }, []);

  const setLastApiCall = useCallback(() => {
    localStorage.setItem("weather_last_api_call", Date.now().toString());
  }, []);

  const fetchWeather = useCallback(
    async (city: string) => {
      // Check rate limiting
      const lastApiCall = getLastApiCall();
      const timeSinceLastCall = Date.now() - lastApiCall;

      if (timeSinceLastCall < RATE_LIMIT_DURATION) {
        throw new Error("Rate limit reached. Please try again later.");
      }

      const response = await fetch(
        `/api/weather?city=${encodeURIComponent(city)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch weather data");
      }

      const data = await response.json();
      const weatherData = {
        ...data,
        timestamp: Date.now(),
      };

      // Cache the result
      localStorage.setItem(`weather_${city}`, JSON.stringify(weatherData));
      setLastApiCall();

      return weatherData;
    },
    [getLastApiCall, setLastApiCall]
  );

  useEffect(() => {
    async function getWeather() {
      if (!location?.region) return;

      try {
        setLoading(true);
        setError(null);

        // Check cache first
        const cached = getCachedWeather(location.region);
        if (cached) {
          setWeather(cached);
          setLoading(false);
          return;
        }

        // If no cache, make API call
        const data = await fetchWeather(location.region);
        setWeather(data);
        setRetryCount(0); // Reset retry count on successful fetch
      } catch (error) {
        console.error("Error fetching weather:", error);

        // Handle retries
        if (retryCount < MAX_RETRIES) {
          setRetryCount((prev) => prev + 1);
          setTimeout(() => getWeather(), 1000 * Math.pow(2, retryCount)); // Exponential backoff
        } else {
          setError(
            error instanceof Error
              ? error.message
              : "Unable to load weather data"
          );
        }
      } finally {
        setLoading(false);
      }
    }

    getWeather();
  }, [location?.region, fetchWeather, getCachedWeather, retryCount]);

  if (error) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Weather</h3>
        </div>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Local Weather</h3>
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
