import { degreesToCardinal } from "@/app/lib/surfUtils";
import { WindData } from "@/app/types/wind";

interface SurfForecastWidgetProps {
  beachId: string;
  date: string;
  forecast: {
    wind: {
      speed: number;
      direction: string;
    };
    swell: {
      height: number;
      period: number;
      direction: string;
    };
  };
}

export default function SurfForecastWidget({
  forecast,
}: SurfForecastWidgetProps) {
  if (!forecast?.wind || !forecast?.swell) {
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
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
      <h3 className="text-lg font-semibold mb-4 font-primary text-gray-800">
        Today's Forecast
      </h3>
      <div className="grid gap-4">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-primary">Wind</span>
            <div className="text-right">
              <span className="font-primary text-gray-900">
                {windDirection}
              </span>
              <div className="text-sm font-primary text-gray-700">
                {windSpeed ? `${windSpeed} km/h` : "N/A"}
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-primary">Swell</span>
            <div className="text-right">
              <span className="font-primary text-gray-900">
                {swellHeight ? `${swellHeight}m` : "N/A"}
              </span>
              <div className="text-sm font-primary text-gray-700">
                {swellPeriod ? `${swellPeriod}s period` : "N/A"}
              </div>
              <div className="text-sm font-primary text-gray-700">
                {swellDirection ? `${swellDirection}°` : "N/A"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
