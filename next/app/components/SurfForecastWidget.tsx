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
        <div className="space-y-2">
          <p>Wave Height: {forecast.swell.height.toFixed(1)}m</p>
          <p>Wind Direction: {forecast.wind.direction}</p>
          <p>Wind Speed: {forecast.wind.speed} km/h</p>
          <p>Swell Direction: {forecast.swell.direction}°</p>
          <p>Swell Period: {forecast.swell.period}s</p>
          <p className="text-sm text-gray-500">
            Last updated: {new Date(forecast.timestamp).toLocaleString()}
          </p>
        </div>
      ) : (
        <p>No forecast available for this date</p>
      )}
    </div>
  );
};

export default SurfForecastWidget;
