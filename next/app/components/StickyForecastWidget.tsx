// app/components/StickyForecastWidget.tsx
import { useEffect, useState } from "react";
import { WindData } from "@/app/types/wind";
import {
  getWindEmoji,
  getSwellEmoji,
  getDirectionEmoji,
} from "@/app/lib/forecastUtils";
import { cn } from "@/app/lib/utils";

interface StickyForecastWidgetProps {
  forecasts: {
    [date: string]: WindData;
  };
  selectedDate?: string;
}

export default function StickyForecastWidget({
  forecasts,
  selectedDate,
}: StickyForecastWidgetProps) {
  // Early return if no forecasts
  if (!forecasts || typeof forecasts !== "object") {
    return null;
  }

  const dateOptions = Object.keys(forecasts);
  if (dateOptions.length === 0) {
    return null;
  }

  const [isVisible, setIsVisible] = useState(false);
  const [activeDate, setActiveDate] = useState(selectedDate || dateOptions[0]);

  useEffect(() => {
    const handleScroll = () => {
      const mainForecast = document.querySelector("[data-forecast-widget]");
      const footer = document.querySelector("footer");
      if (!mainForecast || !footer) return;

      const forecastRect = mainForecast.getBoundingClientRect();
      const footerRect = footer.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      setIsVisible(
        forecastRect.bottom < 0 && footerRect.top > windowHeight - 100
      );
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Update activeDate when selectedDate changes
  useEffect(() => {
    if (selectedDate && forecasts[selectedDate]) {
      setActiveDate(selectedDate);
    }
  }, [selectedDate]);

  const forecast = forecasts[activeDate];
  if (!forecast) return null;

  return (
    <div
      className={cn(
        "fixed bottom-9 left-4 bg-white rounded-lg shadow-lg p-4 z-50",
        "transition-all duration-300 ease-in-out",
        "transform",
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8 pointer-events-none"
      )}
    >
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="text-gray-600 block mb-1">Wind</span>
            <div className="font-medium">
              {getWindEmoji(forecast.windSpeed)} {forecast.windDirection} @{" "}
              {forecast.windSpeed}km/h
            </div>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div>
            <span className="text-gray-600 block mb-1">Swell</span>
            <div className="font-medium">
              {getSwellEmoji(forecast.swellHeight)} {forecast.swellHeight}m @{" "}
              {forecast.swellPeriod}s{" "}
              {getDirectionEmoji((forecast.swellDirection + 180) % 360)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
