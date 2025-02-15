import { degreesToCardinal } from "@/app/lib/surfUtils";
import { WindData } from "@/app/types/wind";

interface SurfForecastWidgetProps {
  beachId: string;
  date: string;
  forecast: WindData;
}

export default function SurfForecastWidget({
  forecast,
}: SurfForecastWidgetProps) {
  if (!forecast) {
    return <div>Sorry, no forecast data rendered. Please refresh.</div>;
  }

  const {
    wind: { speed: windSpeed, direction: windDirection },
    swell: {
      height: swellHeight,
      direction: swellDirection,
      period: swellPeriod,
    },
  } = forecast;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="font-semibold">Today's Forecast</h3>
      <div className="space-y-2 text-base">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Wind</span>
          <span className="font-medium">
            {windDirection}
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
