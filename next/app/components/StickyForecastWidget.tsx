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
  windData: WindData | null;
}

export default function StickyForecastWidget({
  windData,
}: StickyForecastWidgetProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Get the main forecast widget element
      const mainForecast = document.querySelector("[data-forecast-widget]");
      if (!mainForecast) return;

      // Check if the main forecast is out of view
      const rect = mainForecast.getBoundingClientRect();
      setIsVisible(rect.bottom < 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!windData) return null;

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
      <div className="flex items-center gap-4 text-sm">
        <div>
          <span className="text-gray-600 block mb-1">Wind</span>
          <div className="font-medium">
            {getWindEmoji(windData.wind.speed)} {windData.wind.direction} @{" "}
            {windData.wind.speed}km/h
          </div>
        </div>
        <div className="w-px h-8 bg-gray-200" />
        <div>
          <span className="text-gray-600 block mb-1">Swell</span>
          <div className="font-medium">
            {getSwellEmoji(windData.swell.height)} {windData.swell.height}m @{" "}
            {windData.swell.period}s{" "}
            {getDirectionEmoji(
              (parseInt(windData.swell.direction) + 180) % 360
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
