import { degreesToCardinal } from "@/app/lib/surfUtils";
import { WindData, WeeklyForecast } from "@/app/types/wind";
import { useState } from "react";

interface SurfForecastWidgetProps {
  beachId: string;
  forecast: WeeklyForecast;
  selectedDate?: string;
}

export default function SurfForecastWidget({
  forecast,
  selectedDate,
}: SurfForecastWidgetProps) {
  const [activeDate, setActiveDate] = useState(
    selectedDate || Object.keys(forecast)[0]
  );

  const dateOptions = Object.keys(forecast).sort();
  const currentDateIndex = dateOptions.indexOf(activeDate);

  const handlePrevDate = () => {
    if (currentDateIndex > 0) {
      setActiveDate(dateOptions[currentDateIndex - 1]);
    }
  };

  const handleNextDate = () => {
    if (currentDateIndex < dateOptions.length - 1) {
      setActiveDate(dateOptions[currentDateIndex + 1]);
    }
  };

  if (!forecast) {
    return <div>Sorry, no forecast data rendered. Please refresh.</div>;
  }

  const formatDate = (dateStr: string) => {
    // Split ISO string to remove time portion
    const [datePart] = dateStr.split("T");
    const date = new Date(datePart);

    if (isNaN(date.getTime())) {
      console.error("Invalid date value:", dateStr);
      return "Invalid date";
    }

    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={handlePrevDate}
          disabled={currentDateIndex === 0}
          className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 font-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ←
        </button>
        <h3 className="text-lg font-semibold font-primary text-gray-800">
          {formatDate(activeDate)}
        </h3>
        <button
          onClick={handleNextDate}
          disabled={currentDateIndex === dateOptions.length - 1}
          className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 font-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          →
        </button>
      </div>
      <div className="grid gap-4">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-primary">Wind</span>
            <div className="text-right">
              <span className="font-primary text-gray-900">
                {forecast.windDirection
                  ? degreesToCardinal(forecast.windDirection)
                  : "N/A"}
              </span>
              <div className="text-sm font-primary text-gray-700">
                {forecast.windSpeed} kts
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-primary">Swell</span>
            <div className="text-right">
              <span className="font-primary text-gray-900">
                {forecast.swellHeight}m
              </span>
              <div className="text-sm font-primary text-gray-700">
                {forecast.swellPeriod
                  ? `${forecast.swellPeriod}s period`
                  : "N/A"}
              </div>
              <div className="text-sm font-primary text-gray-700">
                {forecast.swellDirection
                  ? degreesToCardinal(forecast.swellDirection)
                  : "N/A"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
