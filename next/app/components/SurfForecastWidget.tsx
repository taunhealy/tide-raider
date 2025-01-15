import { useEffect, useState } from "react";

interface SurfForecastWidgetProps {
  date: string;
}

interface SurfCondition {
  wind: {
    direction: string;
    speed: number;
  };
  swell: {
    height: number;
    direction: string;
    period: number;
    cardinalDirection: string;
  };
  timestamp: number;
}

const SurfForecastWidget = ({ date }: SurfForecastWidgetProps) => {
  const [forecast, setForecast] = useState<SurfCondition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchForecast = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/surf-conditions?date=${date}`);
        if (!response.ok) {
          throw new Error("Failed to fetch forecast");
        }
        const { data } = await response.json();

        if (data) {
          setForecast(data);
        } else {
          setForecast(null);
        }
      } catch (error) {
        console.error("Forecast error:", error);
        setError("Failed to load forecast");
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, [date]);

  if (loading) return <div>Loading forecast...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="font-semibold">Surf Forecast for {date}</h3>
      {forecast ? (
        <div className="space-y-2 text-base">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Wave Height:</span>
            <span className="font-medium">
              {forecast.swell.height.toFixed(1)}m
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Wind Direction:</span>
            <span className="font-medium">{forecast.wind.direction}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Wind Speed:</span>
            <span className="font-medium">{forecast.wind.speed} km/h</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Swell Direction:</span>
            <span className="font-medium">{forecast.swell.direction}°</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Swell Period:</span>
            <span className="font-medium">{forecast.swell.period}s</span>
          </div>

          <div className="text-xs text-gray-500 mt-4">
            Last updated: {new Date(forecast.timestamp).toLocaleString()}
          </div>
        </div>
      ) : (
        <p>No forecast available for this date</p>
      )}
    </div>
  );
};

export default SurfForecastWidget;
