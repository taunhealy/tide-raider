// app/components/StickyForecastWidget.tsx
import { useEffect, useState } from "react";
import { WindData } from "@/app/types/wind";
import {
  getWindEmoji,
  getSwellEmoji,
  getDirectionEmoji,
  degreesToCardinal,
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  // Only render the widget on the client side
  if (!isMounted) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed z-50 shadow-lg rounded-lg bg-white",
        "transition-all duration-300 ease-in-out transform",
        // Responsive positioning and sizing
        "bottom-4 left-4 sm:bottom-6 sm:left-6 md:bottom-9 md:left-9",
        // Responsive padding
        "p-3 sm:p-4",
        // Visibility states
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8 pointer-events-none"
      )}
    >
      <div className="flex flex-col xs:flex-row items-start xs:items-center gap-3 xs:gap-6 font-primary">
        {/* Wind info - stack on smallest screens */}
        <div>
          <span className="text-gray-600 text-xs block mb-1">Wind</span>
          <div className="font-medium text-sm sm:text-base whitespace-nowrap">
            {getWindEmoji(forecast.windSpeed)}{" "}
            {degreesToCardinal(forecast.windDirection)} @ {forecast.windSpeed}
            kts
          </div>
        </div>

        {/* Divider - hidden on smallest screens */}
        <div className="hidden xs:block w-px h-8 bg-gray-200" />

        {/* Swell info */}
        <div>
          <span className="text-gray-600 text-xs block mb-1">Swell</span>
          <div className="font-medium text-sm sm:text-base whitespace-nowrap">
            {getSwellEmoji(forecast.swellHeight)} {forecast.swellHeight}m @{" "}
            {forecast.swellPeriod}s {getDirectionEmoji(forecast.swellDirection)}
          </div>
        </div>
      </div>
    </div>
  );
}
