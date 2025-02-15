import { Beach } from "./beaches";

export interface WindData {
  wind: {
    speed: number; // Wind speed in km/h (e.g., 35)
    direction: string; // Cardinal direction (e.g., "SSE", "NW")
  };
  swell: {
    height: number; // Swell height in meters (e.g., 3.0)
    period: number; // Swell period in seconds (e.g., 13)
    direction: number; // Swell direction in degrees (e.g., 219)
  };
  timestamp: number; // Unix timestamp in milliseconds
}

// Helper type guard to validate WindData
export function isValidWindData(data: any): data is WindData {
  return (
    data &&
    typeof data.wind?.speed === "number" &&
    typeof data.wind?.direction === "string" &&
    typeof data.swell?.height === "number" &&
    typeof data.swell?.period === "number" &&
    typeof data.swell?.direction === "number" &&
    typeof data.timestamp === "number"
  );
}

export interface BeachContainerProps {
  initialBeaches: Beach[];
  windData: WindData | null;
}
