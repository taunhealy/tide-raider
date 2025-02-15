import { useEffect, useState } from "react";
import { degreesToCardinal } from "@/app/lib/surfUtils";
import { SurfForecast } from "@/app/types/wind";
import { useSurfConditions } from "@/app/hooks/useSurfConditions";

interface SurfForecastWidgetProps {
  beachId: string;
  date: string;
  forecast?: SurfForecast;
}

export default function SurfForecastWidget({
  beachId,
  date,
}: SurfForecastWidgetProps) {
  const { data: forecastData } = useSurfConditions(beachId);

  if (!forecastData) {
    return <div>No forecast data available</div>;
  }

  const {
    wind: { speed: windSpeed, direction: windDirection },
    swell: {
      height: swellHeight,
      direction: swellDirection,
      period: swellPeriod,
    },
    timestamp,
  } = forecastData;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="font-semibold">Today's Forecast</h3>
      <div className="space-y-2 text-base">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Wind</span>
          <span className="font-medium">
            {windDirection || "hi"}
            <br />
            {windSpeed ? `${windSpeed} km/h` : "N/A"}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Swell Height</span>
          <span className="font-medium">
            {swellHeight ? `${swellHeight}m` : "N/A"}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Swell Period</span>
          <span className="font-medium">
            {swellPeriod ? `${swellPeriod}s` : "N/A"}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Swell Direction</span>
          <span className="font-medium">
            {swellDirection ? `${swellDirection}°` : "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
}
