import { Beach } from "./beaches";

export type WindData = {
  region: string;
  wind: {
    speed: number; // Wind speed in km/h (e.g., 35)
    direction: string; // Cardinal direction (e.g., "SSE", "NW")
  };
  swell: {
    height: number; // Swell height in meters (e.g., 3.0)
    period: number; // Swell period in seconds (e.g., 13)
    direction: number; // Swell direction in degrees (e.g., 219)
  };
};

export interface BeachContainerProps {
  initialBeaches: Beach[];
  windData: WindData | null | undefined;
}

// Also add a reusable type for components that use windData
export type WindDataProp = WindData | null | undefined;
