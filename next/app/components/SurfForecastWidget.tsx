import { useEffect, useState } from "react";
import { degreesToCardinal } from "@/app/lib/surfUtils";

interface SurfForecastWidgetProps {
  beachId: string;
  date: string;
  forecast?: {
    entries: [
      {
        wind: {
          speed: number;
          direction: string;
        };
        swell: {
          height: number;
          direction: string;
          period: number;
        };
        timestamp: number;
      },
    ];
  };
}

export default function SurfForecastWidget({
  beachId,
  date,
  forecast,
}: SurfForecastWidgetProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (forecast) {
      setLoading(false);
    }
  }, [forecast]);

  if (loading) return <div>Loading forecast...</div>;
  if (error) return <div>Error: {error}</div>;

  if (!forecast?.entries?.[0]) {
    return (
      <div className="p-4 bg-yellow-50 rounded-lg text-sm text-yellow-700">
        <span className="font-medium">Forecast Unavailable:</span>
        <p>No surf conditions data for this location and date</p>
      </div>
    );
  }

  const currentForecast = forecast.entries[0];

  const {
    wind: { speed: windSpeed = 0, direction: windDirection = "" } = {},
    swell: {
      height: swellHeight = 0,
      direction: swellDirection = "",
      period: swellPeriod = 0,
    } = {},
    timestamp,
  } = currentForecast;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="font-semibold">Surf Forecast for {date}</h3>
      <div className="space-y-2 text-base">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Wave Height:</span>
          <span className="font-medium">
            {swellHeight ? `${swellHeight.toFixed(1)}m` : "N/A"}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Wind Direction:</span>
          <span className="font-medium">
            {windDirection
              ? `${degreesToCardinal(windDirection)} (${windDirection}°)`
              : "N/A"}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Wind Speed:</span>
          <span className="font-medium">
            {windSpeed ? `${windSpeed} km/h` : "N/A"}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Swell Direction:</span>
          <span className="font-medium">
            {swellDirection ? `${swellDirection}°` : "N/A"}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Swell Period:</span>
          <span className="font-medium">
            {swellPeriod ? `${swellPeriod}s` : "N/A"}
          </span>
        </div>

        <div className="text-xs text-gray-500 mt-4">
          Last updated:{" "}
          {timestamp ? new Date(timestamp).toLocaleString() : "N/A"}
        </div>
      </div>
    </div>
  );
}
